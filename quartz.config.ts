import { QuartzConfig } from "./quartz/cfg" // Quartz 설정 타입 불러오기
import * as Plugin from "./quartz/plugins"   // Quartz 플러그인 모듈 전체 임포트

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */

const config: QuartzConfig = {              // Quartz 설정 객체 선언
  configuration: {                          // 사이트 전역 설정 블록
    pageTitle: "택택의 기술 도입",           // 브라우저 탭/헤더에 표시될 사이트 제목
    pageTitleSuffix: "",                    // 제목 뒤에 붙일 접미사(빈 문자열이면 없음)
    enableSPA: true,                        // 단일 페이지 앱(SPA) 모드 사용
    enablePopovers: true,                   // 링크 미리보기 팝오버 활성화
    analytics: {                            // 방문자 분석 설정
      provider: "google",                // 분석 도구 제공자 선택(plausible)
      tagId: "G-END10X2HGZ",
    },
    locale: "ko-KR",                        // 기본 로케일(날짜/서식 등에 사용)
    baseUrl: "taketech019.github.io/",            // 사이트의 기본 도메인(절대 URL 생성 기준)
    ignorePatterns: ["private", "Templates", ".obsidian", "Inbox"], // 빌드에서 제외할 경로/패턴
    defaultDateType: "modified",            // 문서 날짜 기본값(수정일 기준)
    theme: {                                // 테마 설정
      fontOrigin: "googleFonts",            // 폰트 로딩 소스(Google Fonts)
      cdnCaching: true,                     // CDN 캐싱 사용 여부
      typography: {                         // 글꼴 패밀리 지정
        header: "Schibsted Grotesk",        // 제목 폰트
        body: "Source Sans Pro",            // 본문 폰트
        code: "IBM Plex Mono",              // 코드 블록 폰트
      },
      colors: {                             // 색상 팔레트
        lightMode: {                         // 라이트 모드 색상 (팔레트 적용)
          light: "#F1F2E9",                  // 가장 밝은 배경색(팔레트 3)
          lightgray: "#D7DDCF",              // 경계/UI용 연회색(팔레트 그레이 톤을 밝힌 값)
          gray: "#899483",                   // 기본 회색(팔레트 2, 세이지 그레이)
          darkgray: "#4D5943",               // 진한 회색/텍스트(팔레트 5, 다크 올리브)
          dark: "#0D0D0D",                   // 최암색(팔레트 1)
          secondary: "#80951F",              // 포인트 보조색(팔레트 4, 올리브 라임)
          tertiary: "#4D5943",               // 보조2 색(팔레트 5, 톤다운 포인트)
          highlight: "rgba(128, 149, 31, 0.15)", // 하이라이트 배경(secondary RGBA)
          textHighlight: "#80951F66",        // 텍스트 드래그/강조(secondary 40% 투명)
        },
        darkMode: {                         // 다크 모드 색상
          light: "#161618",                 // 다크 모드의 밝은 톤
          lightgray: "#393639",             // 밝은 회색
          gray: "#646464",                  // 기본 회색
          darkgray: "#d4d4d4",              // 밝은 텍스트용 회색
          dark: "#ebebec",                  // 가장 밝은 텍스트색
          secondary: "#80951F",             // 포인트 보조색
          tertiary: "#84a59d",              // 보조2 색
          highlight: "rgba(143, 159, 169, 0.15)", // 하이라이트 배경
          textHighlight: "#b3aa0288",       // 텍스트 드래그/강조 색
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
      Plugin.Favicon(),                     // 파비콘 처리
      Plugin.NotFoundPage(),                // 404 페이지 생성
      // Comment out CustomOgImages to speed up build time
      Plugin.CustomOgImages(),              // OG 이미지 자동 생성(빌드 느려지면 주석 처리)
    ],
  },
}

export default config                         // 설정 객체 기본 내보내기
