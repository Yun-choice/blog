import { QuartzPluginData } from "../plugins/vfile"

// Supports the small subset of Obsidian's Dataview Query Language (DQL)
// actually used in this vault's `TABLE` blocks. Anything outside this
// subset fails to parse and the block is left unrendered rather than
// risk silently showing wrong data.

export type DataviewFieldPath = "file.link" | "file.tags" | "file.cday" | "file.mday"

export interface DataviewField {
  path: DataviewFieldPath
  label: string
}

export type SortDirection = "ASC" | "DESC"

export interface DataviewQuery {
  fields: DataviewField[]
  fromTags: string[]
  requirePublish: boolean
  requireTagsNonEmpty: boolean
  sortBy: "file.cday" | "file.mday" | null
  sortDir: SortDirection
  limit: number | null
}

export interface DataviewRow {
  slug: string
  title: string
  tags: string[]
  created: Date | null
  modified: Date | null
}

const FIELD_PATHS: DataviewFieldPath[] = ["file.link", "file.tags", "file.cday", "file.mday"]
const KEYWORDS = ["TABLE", "FROM", "WHERE", "SORT", "LIMIT"] as const

function tokenizeClauses(source: string): { keyword: string; body: string }[] {
  const clauses: { keyword: string; body: string }[] = []
  let current: { keyword: string; body: string } | null = null

  for (const rawLine of source.split("\n")) {
    const line = rawLine.trim()
    if (line === "") continue

    const upper = line.toUpperCase()
    const matchedKeyword = KEYWORDS.find(
      (k) => upper === k || upper.startsWith(k + " ") || upper.startsWith(k + "\t"),
    )

    if (matchedKeyword) {
      if (current) clauses.push(current)
      current = { keyword: matchedKeyword, body: line.slice(matchedKeyword.length).trim() }
    } else if (current) {
      current.body += (current.body ? "\n" : "") + line
    } else {
      return []
    }
  }
  if (current) clauses.push(current)
  return clauses
}

function parseFields(tableBody: string): DataviewField[] | null {
  const lines = tableBody.split("\n").map((l) => l.trim())
  const fieldLines = lines.filter((l) => !/^without\s+id$/i.test(l) && l.length > 0)

  const fields: DataviewField[] = []
  for (const rawLine of fieldLines) {
    const line = rawLine.replace(/,$/, "").trim()
    const match = line.match(/^(\S+)\s+as\s+"([^"]*)"$/i)
    if (!match) return null

    const path = match[1].toLowerCase() as DataviewFieldPath
    if (!FIELD_PATHS.includes(path)) return null

    fields.push({ path, label: match[2] })
  }
  return fields.length > 0 ? fields : null
}

function parseFrom(body: string): string[] | null {
  const trimmed = body.trim()
  if (trimmed === '""') return []
  if (/\bAND\b/i.test(trimmed)) return null // unsupported combinator

  const tokens = trimmed.split(/\s+OR\s+/i).map((t) => t.trim())
  const tags: string[] = []
  for (const token of tokens) {
    if (!token.startsWith("#")) return null
    tags.push(token.slice(1))
  }
  return tags
}

function parseWhere(
  body: string | undefined,
): { requirePublish: boolean; requireTagsNonEmpty: boolean } | null {
  if (body === undefined) return { requirePublish: false, requireTagsNonEmpty: false }

  const predicates = body.split(/\s+AND\s+/i).map((p) => p.trim())
  let requirePublish = false
  let requireTagsNonEmpty = false

  for (const predicate of predicates) {
    if (/^publish$/i.test(predicate)) {
      requirePublish = true
    } else if (/^length\(tags\)\s*>\s*0$/i.test(predicate)) {
      requireTagsNonEmpty = true
    } else {
      return null // unsupported predicate
    }
  }
  return { requirePublish, requireTagsNonEmpty }
}

function parseSort(
  body: string | undefined,
): { sortBy: "file.cday" | "file.mday"; sortDir: SortDirection } | null {
  if (body === undefined) return null

  const match = body.match(/^(file\.cday|file\.mday)(?:\s+(ASC|DESC))?$/i)
  if (!match) return null

  return {
    sortBy: match[1].toLowerCase() as "file.cday" | "file.mday",
    sortDir: (match[2]?.toUpperCase() as SortDirection) ?? "ASC",
  }
}

function parseLimit(body: string | undefined): number | null {
  if (body === undefined) return null
  const n = Number.parseInt(body.trim(), 10)
  return Number.isFinite(n) ? n : null
}

export function parseDataviewQuery(source: string): DataviewQuery | null {
  const clauses = tokenizeClauses(source)
  if (clauses.length === 0) return null

  const tableClause = clauses.find((c) => c.keyword === "TABLE")
  if (!tableClause) return null

  const fields = parseFields(tableClause.body)
  if (!fields) return null

  const fromClause = clauses.find((c) => c.keyword === "FROM")
  const fromTags = fromClause ? parseFrom(fromClause.body) : []
  if (fromTags === null) return null

  const whereClause = clauses.find((c) => c.keyword === "WHERE")
  const where = parseWhere(whereClause?.body)
  if (!where) return null

  const sortClause = clauses.find((c) => c.keyword === "SORT")
  let sortBy: DataviewQuery["sortBy"] = null
  let sortDir: SortDirection = "ASC"
  if (sortClause) {
    const sort = parseSort(sortClause.body)
    if (!sort) return null
    sortBy = sort.sortBy
    sortDir = sort.sortDir
  }

  const limitClause = clauses.find((c) => c.keyword === "LIMIT")
  let limit: number | null = null
  if (limitClause) {
    limit = parseLimit(limitClause.body)
    if (limit === null) return null
  }

  return {
    fields,
    fromTags,
    requirePublish: where.requirePublish,
    requireTagsNonEmpty: where.requireTagsNonEmpty,
    sortBy,
    sortDir,
    limit,
  }
}

function isPublished(file: QuartzPluginData): boolean {
  const publish = file.frontmatter?.publish
  return publish === true || publish === "true"
}

export function runDataviewQuery(
  query: DataviewQuery,
  allFiles: QuartzPluginData[],
): DataviewRow[] {
  let rows: DataviewRow[] = allFiles
    .filter((file) => {
      if (!file.slug) return false
      if (query.requirePublish && !isPublished(file)) return false

      const tags = file.frontmatter?.tags ?? []
      if (query.requireTagsNonEmpty && tags.length === 0) return false
      if (query.fromTags.length > 0 && !query.fromTags.some((t) => tags.includes(t))) return false

      return true
    })
    .map((file) => ({
      slug: file.slug!,
      title: (file.frontmatter?.title as string | undefined) ?? file.slug!,
      tags: file.frontmatter?.tags ?? [],
      created: file.dates?.created ?? null,
      modified: file.dates?.modified ?? null,
    }))

  if (query.sortBy) {
    const key = query.sortBy === "file.cday" ? "created" : "modified"
    rows = rows.slice().sort((a, b) => {
      const at = a[key]?.getTime() ?? 0
      const bt = b[key]?.getTime() ?? 0
      return query.sortDir === "DESC" ? bt - at : at - bt
    })
  }

  if (query.limit !== null) {
    rows = rows.slice(0, query.limit)
  }

  return rows
}
