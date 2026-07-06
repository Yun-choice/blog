import { render } from "preact-render-to-string"
import { QuartzComponent, QuartzComponentProps } from "./types"
import HeaderConstructor from "./Header"
import BodyConstructor from "./Body"
import { JSResourceToScriptElement, StaticResources } from "../util/resources"
import {
  FullSlug,
  RelativeURL,
  joinSegments,
  normalizeHastElement,
  resolveRelative,
} from "../util/path"
import { clone } from "../util/clone"
import { visit } from "unist-util-visit"
import { Root, Element, ElementContent } from "hast"
import { GlobalConfiguration } from "../cfg"
import { i18n } from "../i18n"
import { formatDate } from "./Date"
import {
  DataviewField,
  DataviewQuery,
  DataviewRow,
  parseDataviewQuery,
  runDataviewQuery,
} from "../util/dataview"
import { DATAVIEW_BLOCK_CLASS, DATAVIEW_QUERY_ATTR } from "../plugins/transformers/dataview"
import { styleText } from "util"

interface RenderComponents {
  head: QuartzComponent
  header: QuartzComponent[]
  beforeBody: QuartzComponent[]
  pageBody: QuartzComponent
  afterBody: QuartzComponent[]
  left: QuartzComponent[]
  right: QuartzComponent[]
  footer: QuartzComponent
}

const headerRegex = new RegExp(/h[1-6]/)
export function pageResources(
  baseDir: FullSlug | RelativeURL,
  staticResources: StaticResources,
): StaticResources {
  const contentIndexPath = joinSegments(baseDir, "static/contentIndex.json")
  const contentIndexScript = `const fetchData = fetch("${contentIndexPath}").then(data => data.json())`

  const resources: StaticResources = {
    css: [
      {
        content: joinSegments(baseDir, "index.css"),
      },
      ...staticResources.css,
    ],
    js: [
      {
        src: joinSegments(baseDir, "prescript.js"),
        loadTime: "beforeDOMReady",
        contentType: "external",
      },
      {
        loadTime: "beforeDOMReady",
        contentType: "inline",
        spaPreserve: true,
        script: contentIndexScript,
      },
      ...staticResources.js,
    ],
    additionalHead: staticResources.additionalHead,
  }

  resources.js.push({
    src: joinSegments(baseDir, "postscript.js"),
    loadTime: "afterDOMReady",
    moduleType: "module",
    contentType: "external",
  })

  return resources
}

function renderTranscludes(
  root: Root,
  cfg: GlobalConfiguration,
  slug: FullSlug,
  componentData: QuartzComponentProps,
) {
  // process transcludes in componentData
  visit(root, "element", (node, _index, _parent) => {
    if (node.tagName === "blockquote") {
      const classNames = (node.properties?.className ?? []) as string[]
      if (classNames.includes("transclude")) {
        const inner = node.children[0] as Element
        const transcludeTarget = (inner.properties["data-slug"] ?? slug) as FullSlug
        const page = componentData.allFiles.find((f) => f.slug === transcludeTarget)
        if (!page) {
          return
        }

        let blockRef = node.properties.dataBlock as string | undefined
        if (blockRef?.startsWith("#^")) {
          // block transclude
          blockRef = blockRef.slice("#^".length)
          let blockNode = page.blocks?.[blockRef]
          if (blockNode) {
            if (blockNode.tagName === "li") {
              blockNode = {
                type: "element",
                tagName: "ul",
                properties: {},
                children: [blockNode],
              }
            }

            node.children = [
              normalizeHastElement(blockNode, slug, transcludeTarget),
              {
                type: "element",
                tagName: "a",
                properties: { href: inner.properties?.href, class: ["internal", "transclude-src"] },
                children: [
                  { type: "text", value: i18n(cfg.locale).components.transcludes.linkToOriginal },
                ],
              },
            ]
          }
        } else if (blockRef?.startsWith("#") && page.htmlAst) {
          // header transclude
          blockRef = blockRef.slice(1)
          let startIdx = undefined
          let startDepth = undefined
          let endIdx = undefined
          for (const [i, el] of page.htmlAst.children.entries()) {
            // skip non-headers
            if (!(el.type === "element" && el.tagName.match(headerRegex))) continue
            const depth = Number(el.tagName.substring(1))

            // lookin for our blockref
            if (startIdx === undefined || startDepth === undefined) {
              // skip until we find the blockref that matches
              if (el.properties?.id === blockRef) {
                startIdx = i
                startDepth = depth
              }
            } else if (depth <= startDepth) {
              // looking for new header that is same level or higher
              endIdx = i
              break
            }
          }

          if (startIdx === undefined) {
            return
          }

          node.children = [
            ...(page.htmlAst.children.slice(startIdx, endIdx) as ElementContent[]).map((child) =>
              normalizeHastElement(child as Element, slug, transcludeTarget),
            ),
            {
              type: "element",
              tagName: "a",
              properties: { href: inner.properties?.href, class: ["internal", "transclude-src"] },
              children: [
                { type: "text", value: i18n(cfg.locale).components.transcludes.linkToOriginal },
              ],
            },
          ]
        } else if (page.htmlAst) {
          // page transclude
          node.children = [
            {
              type: "element",
              tagName: "h1",
              properties: {},
              children: [
                {
                  type: "text",
                  value:
                    page.frontmatter?.title ??
                    i18n(cfg.locale).components.transcludes.transcludeOf({
                      targetSlug: page.slug!,
                    }),
                },
              ],
            },
            ...(page.htmlAst.children as ElementContent[]).map((child) =>
              normalizeHastElement(child as Element, slug, transcludeTarget),
            ),
            {
              type: "element",
              tagName: "a",
              properties: { href: inner.properties?.href, class: ["internal", "transclude-src"] },
              children: [
                { type: "text", value: i18n(cfg.locale).components.transcludes.linkToOriginal },
              ],
            },
          ]
        }
      }
    }
  })
}

function buildDataviewCell(
  field: DataviewField,
  row: DataviewRow,
  slug: FullSlug,
  cfg: GlobalConfiguration,
): Element {
  switch (field.path) {
    case "file.link":
      return {
        type: "element",
        tagName: "td",
        properties: {},
        children: [
          {
            type: "element",
            tagName: "a",
            properties: { href: resolveRelative(slug, row.slug as FullSlug), class: ["internal"] },
            children: [{ type: "text", value: row.title }],
          },
        ],
      }
    case "file.tags":
      return {
        type: "element",
        tagName: "td",
        properties: {},
        children:
          row.tags.length === 0
            ? [{ type: "text", value: "" }]
            : [
                {
                  type: "element",
                  tagName: "ul",
                  properties: { className: ["dataview-tags"] },
                  children: row.tags.map((tag) => ({
                    type: "element",
                    tagName: "li",
                    properties: {},
                    children: [
                      {
                        type: "element",
                        tagName: "a",
                        properties: {
                          href: resolveRelative(slug, `tags/${tag}` as FullSlug),
                          class: ["internal", "tag-link"],
                        },
                        children: [{ type: "text", value: tag }],
                      },
                    ],
                  })),
                },
              ],
      }
    case "file.cday":
      return {
        type: "element",
        tagName: "td",
        properties: {},
        children: [{ type: "text", value: row.created ? formatDate(row.created, cfg.locale) : "" }],
      }
    case "file.mday":
      return {
        type: "element",
        tagName: "td",
        properties: {},
        children: [
          { type: "text", value: row.modified ? formatDate(row.modified, cfg.locale) : "" },
        ],
      }
    default: {
      const exhaustiveCheck: never = field.path
      throw new Error(`Unsupported dataview field: ${exhaustiveCheck}`)
    }
  }
}

function buildDataviewTable(
  query: DataviewQuery,
  rows: DataviewRow[],
  slug: FullSlug,
  cfg: GlobalConfiguration,
): Element {
  const headerRow: Element = {
    type: "element",
    tagName: "tr",
    properties: {},
    children: query.fields.map((f) => ({
      type: "element",
      tagName: "th",
      properties: {},
      children: [{ type: "text", value: f.label }],
    })),
  }

  const bodyRows: Element[] =
    rows.length > 0
      ? rows.map((row) => ({
          type: "element",
          tagName: "tr",
          properties: {},
          children: query.fields.map((f) => buildDataviewCell(f, row, slug, cfg)),
        }))
      : [
          {
            type: "element",
            tagName: "tr",
            properties: {},
            children: [
              {
                type: "element",
                tagName: "td",
                properties: { colSpan: query.fields.length },
                children: [{ type: "text", value: "표시할 글이 없습니다." }],
              },
            ],
          },
        ]

  return {
    type: "element",
    tagName: "table",
    properties: { className: ["dataview-table"] },
    children: [
      { type: "element", tagName: "thead", properties: {}, children: [headerRow] },
      { type: "element", tagName: "tbody", properties: {}, children: bodyRows },
    ],
  }
}

function renderDataviewBlocks(
  root: Root,
  cfg: GlobalConfiguration,
  slug: FullSlug,
  componentData: QuartzComponentProps,
) {
  visit(root, "element", (node) => {
    // mdast-util-to-hast always wraps a `code` node in `<pre>`; our transformer's
    // hName override only replaces the inner node, so the placeholder actually
    // shows up as `<pre><div class="dataview-block">`. Replace the `<pre>` itself.
    if (node.tagName !== "pre") return
    const child = node.children[0]
    if (!child || child.type !== "element" || child.tagName !== "div") return

    const classNames = (child.properties?.className ?? []) as string[]
    if (!classNames.includes(DATAVIEW_BLOCK_CLASS)) return

    const encoded = child.properties?.[DATAVIEW_QUERY_ATTR] as string | undefined
    node.children = []
    if (!encoded) return

    const source = Buffer.from(encoded, "base64").toString("utf-8")
    const query = parseDataviewQuery(source)
    if (!query) {
      console.warn(
        styleText("yellow", `Dataview: could not parse query in \`${slug}\`, leaving block empty`),
      )
      return
    }

    const rows = runDataviewQuery(query, componentData.allFiles)
    const table = buildDataviewTable(query, rows, slug, cfg)
    node.tagName = table.tagName
    node.properties = table.properties
    node.children = table.children
  })
}

export function renderPage(
  cfg: GlobalConfiguration,
  slug: FullSlug,
  componentData: QuartzComponentProps,
  components: RenderComponents,
  pageResources: StaticResources,
): string {
  // make a deep copy of the tree so we don't remove the transclusion references
  // for the file cached in contentMap in build.ts
  const root = clone(componentData.tree) as Root
  renderTranscludes(root, cfg, slug, componentData)
  renderDataviewBlocks(root, cfg, slug, componentData)

  // set componentData.tree to the edited html that has transclusions rendered
  componentData.tree = root

  const {
    head: Head,
    header,
    beforeBody,
    pageBody: Content,
    afterBody,
    left,
    right,
    footer: Footer,
  } = components
  const Header = HeaderConstructor()
  const Body = BodyConstructor()

  const LeftComponent = (
    <div class="left sidebar">
      {left.map((BodyComponent) => (
        <BodyComponent {...componentData} />
      ))}
    </div>
  )

  const RightComponent = (
    <div class="right sidebar">
      {right.map((BodyComponent) => (
        <BodyComponent {...componentData} />
      ))}
    </div>
  )

  const lang = componentData.fileData.frontmatter?.lang ?? cfg.locale?.split("-")[0] ?? "en"
  const doc = (
    <html lang={lang}>
      <Head {...componentData} />
      <body data-slug={slug}>
        <div id="quartz-root" class="page">
          <Body {...componentData}>
            {LeftComponent}
            <div class="center">
              <div class="page-header">
                <Header {...componentData}>
                  {header.map((HeaderComponent) => (
                    <HeaderComponent {...componentData} />
                  ))}
                </Header>
                <div class="popover-hint">
                  {beforeBody.map((BodyComponent) => (
                    <BodyComponent {...componentData} />
                  ))}
                </div>
              </div>
              <Content {...componentData} />
              <hr />
              <div class="page-footer">
                {afterBody.map((BodyComponent) => (
                  <BodyComponent {...componentData} />
                ))}
              </div>
            </div>
            {RightComponent}
            <Footer {...componentData} />
          </Body>
        </div>
      </body>
      {pageResources.js
        .filter((resource) => resource.loadTime === "afterDOMReady")
        .map((res) => JSResourceToScriptElement(res))}
    </html>
  )

  return "<!DOCTYPE html>\n" + render(doc)
}
