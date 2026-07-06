import { QuartzTransformerPlugin } from "../types"
import { Root, Code } from "mdast"
import { visit } from "unist-util-visit"

// Turns ```dataview code fences (from Obsidian's Dataview plugin) into a
// placeholder hast node carrying the raw query text. The actual query is
// parsed and executed later in components/renderPage.tsx, since only the
// page-render step has access to `allFiles` (every page's frontmatter).
export const DATAVIEW_BLOCK_CLASS = "dataview-block"
// Plain camelCase (no hyphen): mdast-util-to-hast's hProperties normalization
// rewrites hyphenated "data-*" keys to camelCase, so write/read must agree
// on the post-normalization name rather than the literal HTML attribute form.
export const DATAVIEW_QUERY_ATTR = "dataQuery"

export const Dataview: QuartzTransformerPlugin = () => ({
  name: "Dataview",
  markdownPlugins() {
    return [
      () => (tree: Root) => {
        visit(tree, "code", (node: Code) => {
          if (node.lang !== "dataview") return

          node.data = {
            hName: "div",
            hProperties: {
              className: [DATAVIEW_BLOCK_CLASS],
              [DATAVIEW_QUERY_ATTR]: Buffer.from(node.value, "utf-8").toString("base64"),
            },
            hChildren: [],
          }
        })
      },
    ]
  },
})
