import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [],
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
    // 탐색기 개선 옵션들
    Component.Explorer({
      title: "Categories",
      folderClickBehavior: "collapse", // 폴더 클릭 시 접기/펼치기
      folderDefaultState: "collapsed", // 기본적으로 폴더 접혀있음
      useSavedState: true, // 사용자의 폴더 상태 기억
      mapFn: (node) => {
        // 파일명에서 날짜 제거하고 카테고리별 그룹핑
        if (node.file) {
          node.displayName = node.file.frontmatter?.title || node.displayName
        }
        return node
      },
      filterFn: (node) => {
        // draft 파일들 숨기기
        if (node.file?.frontmatter?.draft) return false
        return true
      },
      order: ["filter", "map", "sort"] // 정렬 순서
    }),
  ],
  right: [
    Component.Graph(),
    // 목차 개선
    Component.DesktopOnly(
      Component.TableOfContents({
        maxDepth: 4, // 최대 4단계까지
        minEntries: 1, // 최소 1개 항목부터 표시
        showByDefault: true, // 기본적으로 표시
        collapseByDefault: false // 기본적으로 펼쳐진 상태
      })
    ),
    Component.Backlinks(),
  ],
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
          inputPosition: "top",                               
	  lang: "ko",
          lightTheme: "noborder_light",              
          darkTheme: "noborder_dark"          }
      }),
      condition: (page) => page.fileData.slug !== "index",
    })
  ],
}
// components for pages that display lists of pages (e.g. tags or folders)
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
      title: "Categories",
      folderClickBehavior: "collapse",
      folderDefaultState: "collapsed",
      useSavedState: true,
    }),
  ],
  right: [],
}
