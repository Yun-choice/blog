import { QuartzConfig } from "./quartz/cfg" // Quartz 설정 타입 불러오기
import * as Plugin from "./quartz/plugins"   // Quartz 플러그인 모듈 전체 임포트

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */

const config: QuartzConfig = {              // Quartz 설정 객체 선언
  configuration: {                          // 사이트 전역 설정 블록
    pageTitle: "🛠️택택의 기술도입",           // 브라우저 탭/헤더에 표시될 사이트 제목
    pageTitleSuffix: "",                    // 제목 뒤에 붙일 접미사(빈 문자열이면 없음)
    enableSPA: true,                        // 단일 페이지 앱(SPA) 모드 사용
    enablePopovers: true,                   // 링크 미리보기 팝오버 활성화
    analytics: {                            // 방문자 분석 설정
      provider: "google",                // 분석 도구 제공자 선택(plausible)
      tagId: "G-END10X2HGZ",
    },
    locale: "ko-KR",                        // 기본 로케일(날짜/서식 등에 사용)
    baseUrl: "taketech019.github.io/",            // 사이트의 기본 도메인(절대 URL 생성 기준)
    ignorePatterns: ["private", ".obsidian", "Inbox", "Utillities/templates"], // 빌드에서 제외할 경로/패턴
    defaultDateType: "modified",            // 문서 날짜 기본값(수정일 기준)
    theme: {                                // 테마 설정: 미니멀 데이터 닥스 (stone + teal)
      fontOrigin: "local",                  // 폰트 로딩 소스(quartz/styles/custom.scss에서 직접 로드)
      cdnCaching: true,                     // CDN 캐싱 사용 여부
      typography: {                         // 글꼴 패밀리 지정
        header: "Pretendard Variable",      // 제목 폰트 (한글 웹폰트)
        body: "Pretendard Variable",        // 본문 폰트 (한글 웹폰트)
        code: "IBM Plex Mono",              // 코드 블록 폰트
      },
      colors: {                             // 색상 팔레트
        lightMode: {                         // 라이트 모드 색상 (stone 배경 + teal 포인트)
          light: "#FAFAF9",                  // 가장 밝은 배경색(stone-50)
          lightgray: "#E7E5E4",              // 경계/UI용 연회색(stone-200)
          gray: "#A8A29E",                   // 기본 회색(stone-400)
          darkgray: "#292524",               // 본문 텍스트(stone-800)
          dark: "#1C1917",                   // 제목 등 최암색(stone-900)
          secondary: "#0D9488",              // 포인트 보조색(teal-600, 링크/태그)
          tertiary: "#0F766E",               // 보조2 색(teal-700, hover 등)
          highlight: "rgba(13, 148, 136, 0.1)", // 하이라이트 배경(teal 저채도)
          textHighlight: "#0D948866",        // 텍스트 드래그/강조(teal 40% 투명)
        },
        darkMode: {                         // 다크 모드 색상
          light: "#0C0A09",                 // 가장 어두운 배경(stone-950)
          lightgray: "#292524",             // 경계/UI용 어두운 회색(stone-800)
          gray: "#78716C",                  // 기본 회색(stone-500)
          darkgray: "#D6D3D1",              // 본문 텍스트(stone-300)
          dark: "#FAFAF9",                  // 제목 등 가장 밝은 텍스트색(stone-50)
          secondary: "#2DD4BF",             // 포인트 보조색(teal-400, 대비를 위해 밝게)
          tertiary: "#5EEAD4",              // 보조2 색(teal-300)
          highlight: "rgba(45, 212, 191, 0.1)", // 하이라이트 배경(teal 저채도)
          textHighlight: "#2DD4BF66",       // 텍스트 드래그/강조 색
        },
      },
    },
  },
  plugins: {                                // 플러그인 파이프라인
    transformers: [                         // 전처리/변환 단계 플러그인들
      Plugin.FrontMatter(),                 // 프론트매터 파싱
      Plugin.CreatedModifiedDate({          // 생성/수정일 메타데이터 산출
        priority: ["frontmatter", "git", "filesystem"], // 날짜 소스 우선순위
      }),
      Plugin.SyntaxHighlighting({           // 코드 하이라이팅
        theme: {
          light: "github-light",            // 라이트 하이라이트 테마
          dark: "github-dark",              // 다크 하이라이트 테마
        },
        keepBackground: false,              // 코드 배경색 제거
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }), // Obsidian 문법 지원
      Plugin.Dataview(),                    // Obsidian Dataview TABLE 블록을 실제 글 목록으로 렌더링
      Plugin.GitHubFlavoredMarkdown(),      // GitHub Flavored Markdown 지원
      Plugin.TableOfContents(),             // 문서 내 목차 자동 생성
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }), // 내부 링크 해석 및 최단 경로화
      Plugin.Description(),                 // 문서 설명/요약 생성
      Plugin.Latex({ renderEngine: "katex" }), // LaTeX 수식 렌더링(KaTeX)
    ],
    filters: [Plugin.RemoveDrafts()],       // draft 문서 제거 필터
    emitters: [                             // 실제 산출물 생성 단계
      Plugin.AliasRedirects(),              // 별칭 리다이렉트 페이지 생성
      Plugin.ComponentResources(),          // 컴포넌트 리소스 번들링
      Plugin.ContentPage(),                 // 일반 콘텐츠 페이지 생성기
      Plugin.FolderPage(),                  // 폴더 인덱스 페이지 생성기
      Plugin.TagPage(),                     // 태그별 목록 페이지 생성기
      Plugin.ContentIndex({                 // 인덱스/피드 관련 산출물
        enableSiteMap: true,                // 사이트맵 생성
        enableRSS: true,                    // RSS 피드 생성
      }),
      Plugin.Assets(),                      // 정적 에셋 복사(이미지 등)
      Plugin.Static(),                      // /static 폴더 내용 복사
      Plugin.StaticRoot(),                  // 루트 정적 파일 복사(robots.txt 등)
      Plugin.Favicon(),                     // 파비콘 처리
      Plugin.NotFoundPage(),                // 404 페이지 생성
      // CustomOgImages는 항상 Google Fonts에서 헤더/본문 폰트를 가져오는데
      // Pretendard Variable은 Google Fonts에 없어 빌드가 실패함. static/og-image.png
      // 기본 이미지로 대체(quartz/components/Head.tsx의 usesCustomOgImage 폴백).
      // Plugin.CustomOgImages(),
    ],
  },
}

export default config                         // 설정 객체 기본 내보내기
