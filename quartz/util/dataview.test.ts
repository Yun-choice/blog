import test, { describe } from "node:test"
import assert from "node:assert"
import { parseDataviewQuery, runDataviewQuery, DataviewRow } from "./dataview"
import { QuartzPluginData } from "../plugins/vfile"

const RECENT_NOTES_QUERY = `TABLE without ID
file.link as "Posts",
file.tags as "Tags",
file.cday as "Created at.",
file.mday as "Modified at."

FROM ""

WHERE publish AND length(tags)>0

SORT file.mday DESC

LIMIT 5`

const DATA_ANALYSIS_QUERY = `TABLE without ID
file.link as "Posts",
file.tags as "Tags",
file.cday as "Created at.",
file.mday as "Modified at."

FROM #데이터분석 OR #ML/DL

WHERE publish AND length(tags)>0

SORT file.mday DESC`

describe("parseDataviewQuery", () => {
  test("parses the index.md Recent Notes query", () => {
    const query = parseDataviewQuery(RECENT_NOTES_QUERY)
    assert(query !== null)
    assert.deepEqual(
      query!.fields.map((f) => f.path),
      ["file.link", "file.tags", "file.cday", "file.mday"],
    )
    assert.deepEqual(query!.fromTags, [])
    assert.equal(query!.requirePublish, true)
    assert.equal(query!.requireTagsNonEmpty, true)
    assert.equal(query!.sortBy, "file.mday")
    assert.equal(query!.sortDir, "DESC")
    assert.equal(query!.limit, 5)
  })

  test("parses the index.md Data Analysis Posts query (OR'd tags, no LIMIT)", () => {
    const query = parseDataviewQuery(DATA_ANALYSIS_QUERY)
    assert(query !== null)
    assert.deepEqual(query!.fromTags, ["데이터분석", "ML/DL"])
    assert.equal(query!.limit, null)
  })

  test("rejects an unknown field path", () => {
    const query = parseDataviewQuery(`TABLE file.size as "Size"\nFROM ""`)
    assert.equal(query, null)
  })

  test("rejects an unsupported WHERE predicate", () => {
    const query = parseDataviewQuery(
      `TABLE file.link as "Posts"\nFROM ""\nWHERE contains(file.name, "x")`,
    )
    assert.equal(query, null)
  })

  test("rejects FROM with AND combinator (unsupported)", () => {
    const query = parseDataviewQuery(`TABLE file.link as "Posts"\nFROM #a AND #b`)
    assert.equal(query, null)
  })

  test("returns null for empty input", () => {
    assert.equal(parseDataviewQuery(""), null)
  })
})

interface MockFileOverrides {
  slug?: string
  frontmatter?: { title: string; publish: boolean; tags?: string[] }
  dates?: { created: Date; modified: Date; published: Date }
}

function makeFile(overrides: MockFileOverrides = {}): QuartzPluginData {
  return {
    slug: "some-slug",
    frontmatter: { title: "Untitled", publish: true },
    dates: {
      created: new Date("2025-01-01"),
      modified: new Date("2025-01-02"),
      published: new Date("2025-01-01"),
    },
    ...overrides,
  } as QuartzPluginData
}

describe("runDataviewQuery", () => {
  test("filters out unpublished and untagged files when required", () => {
    const query = parseDataviewQuery(RECENT_NOTES_QUERY)!
    const files = [
      makeFile({ slug: "a", frontmatter: { title: "A", publish: true, tags: ["x"] } }),
      makeFile({ slug: "b", frontmatter: { title: "B", publish: false, tags: ["x"] } }),
      makeFile({ slug: "c", frontmatter: { title: "C", publish: true, tags: [] } }),
    ]
    const rows = runDataviewQuery(query, files)
    assert.deepEqual(
      rows.map((r) => r.slug),
      ["a"],
    )
  })

  test("OR-matches FROM tags", () => {
    const query = parseDataviewQuery(DATA_ANALYSIS_QUERY)!
    const files = [
      makeFile({ slug: "a", frontmatter: { title: "A", publish: true, tags: ["데이터분석"] } }),
      makeFile({ slug: "b", frontmatter: { title: "B", publish: true, tags: ["ML/DL"] } }),
      makeFile({ slug: "c", frontmatter: { title: "C", publish: true, tags: ["python"] } }),
    ]
    const rows = runDataviewQuery(query, files)
    assert.deepEqual(rows.map((r) => r.slug).sort(), ["a", "b"])
  })

  test("sorts DESC by modified date and applies limit", () => {
    const query = parseDataviewQuery(RECENT_NOTES_QUERY)!
    const files = [1, 2, 3, 4, 5, 6].map((n) =>
      makeFile({
        slug: `p${n}`,
        frontmatter: { title: `P${n}`, publish: true, tags: ["x"] },
        dates: {
          created: new Date(2025, 0, n),
          modified: new Date(2025, 0, n),
          published: new Date(2025, 0, n),
        },
      }),
    )
    const rows: DataviewRow[] = runDataviewQuery(query, files)
    assert.deepEqual(
      rows.map((r) => r.slug),
      ["p6", "p5", "p4", "p3", "p2"],
    )
  })
})
