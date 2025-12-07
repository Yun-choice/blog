import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
//import RecentNotesForIndex from "./quartz/components/RecentNotesForIndex"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [
    Component.ConditionalRender({
      component: Component.Comments({
        provider: "giscus",
        options: {
          repo: "taketech019/taketech019.github.io",
          repoId: "R_kgDOPpecrQ",                    
          category: "General",
          categoryId: "DIC_kwDOPpecrc4Cu8Rp",        
          mapping: "pathname",
          strict: false,
          reactionsEnabled: true,
          inputPosition: "bottom",                               
	  lang: "ko",
          lightTheme: "light_protanopia",              
          darkTheme: "dark_protanopia"          }
      }),
      condition: (page) => page.fileData.slug !== "index",
    })
  ],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/taketech019",
      "My Portfolio": "https://taketech019.github.io/DataAnalysis/data_analyst_intro_test.html",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
        { Component: Component.ReaderMode() },
      ],
    }),
    Component.Explorer(),
  ],
  right: [
    Component.Graph(),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.Explorer({
      title: "🔎Explorer"}),
  ],
  right: [],
}