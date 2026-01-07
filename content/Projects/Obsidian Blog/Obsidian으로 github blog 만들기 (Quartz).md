---
{"publish":true,"created":"2025-12-15T13:05:26.748+09:00","modified":"2025-12-18T17:53:04.462+09:00","published":"2026-01-07T11:59:52.704+09:00","tags":["quartz","obsidian","digitalgarden","깃헙블로그","기술블로그"],"cssclasses":""}
---


>[!info] Overview
>Obsidian과 Quartz 템플릿을 활용해 GitHub Pages 기반 기술 블로그를 구축하는 전 과정을 정리한 글입니다. 
>
>비전공자도 따라 할 수 있도록 설치, 클론, 배포, Obsidian 연동까지의 흐름을 단계별로 안내합니다.
>
>**Platform:** Quartz, git
>
>**First upload date:** 2025-11-28
---
## I. 들어가며

데이터 분석을 공부하며, 제가 공부한 내용이 휘발되지 않도록 잘 정리해둘 필요성을 느꼈습니다.

처음엔 Notion으로 만든 제 Second Brain에 열심히 정리했는데, 코드가 길어질수록 버벅임이 심해지더군요.

제 프로젝트 결과물도 자랑할 겸 아예 기술 블로그를 하나 만들어야겠다는 생각이 들었습니다.

## II. 왜 Quartz인가?

제가 생각하는 Quartz의 장점을 말해보겠습니다.
### 1. Obsidian을 사용한다!

Obsidian의 장점인 그래프 뷰와 수많은 플러그인들, 고급 마크다운 문법을 그대로 사용 및 배포할 수 있다는 것이 아주 만족스럽습니다. 

또한 Notion과 달리 Obsidian은 제가 작성한 노트가 로컬 디렉토리에 마크다운 파일로 저장되기 때문에, 매우 매우 쾌적합니다!

### 2. 세팅과 배포가 쉽고 빠르다

저는 웹 개발에 대해 조금도 모르는 비전공자 입니다.
그럼에도 불구하고, 블로그 개설부터 seo 색인 생성 및 GA4 연동까지 오랜 시간이 걸리지 않았습니다. 

또한 한 번 세팅해두면 이후엔 평소처럼 Obsidian을 사용하시다가 git plugin을 이용하여 클릭 한 번으로 쉽고 빠르게 게시글을 배포하실 수 있습니다. 

## III. 본격적인 블로그 만들기

- *참고 게시글*
	- *[chareny's tech blog](https://chereny.github.io/Obsidian%EC%9C%BC%EB%A1%9C-GitHub-Blog-%EB%A7%8C%EB%93%A4%EA%B8%B0)*
	- *[hayoung blog](https://khy07181.github.io/blog/Obsidian%EA%B3%BC-Quartz%EB%A1%9C-%EB%B8%94%EB%A1%9C%EA%B7%B8-%EB%A7%8C%EB%93%A4%EA%B8%B0)*

- **사전 준비물**
	- github 계정 생성
	- Obsidian 계정 생성 및 설치
	- [git 설치](https://git-scm.com/)
	- [node.js 설치](https://nodejs.org/en/download)

### 1. Quartz Github Clone하기

1. 블로그의 구성 요소를 저장할 폴더를 지정합니다.
2. 빈 공간에 우클릭 후 "Open git bash here"로 GIt bash에 진입합니다.
3. 아래 코드를 순서대로 입력합니다. (로그인이 되어있지 않다면 로그인부터 합니다)

```git title="git bash here"
git config --global user.email "your e-mail"
git config --global user.name "your name"
```

```git title="Quartz-Clone"
git clone https://github.com/jackyzha0/quartz.git
cd quartz
npm i
npx quartz create
```

*지정 폴더에 quartz 폴더가 생성되었다면 clone 성공!*
### 2. Git repository 생성

이제 Github에 repository를 만들어봅니다.

```git title="repo-create"
git repo create username.github.io --public
git remote rm origin
git remote add origin git@github.com:username.github.io.git
```

리포지터리 이름은 **username.github.io**로 지정합니다.
저는 taketech019.github.io로 하였습니다.

### 3. GIthub pages 활성화

1. `quartz/.github/workflows` 경로에 메모장 파일을 새로 만듭니다.
2. 이름을 deploy.yaml로 바꾸고 아래 코드를 붙여넣습니다.

``` notepad title="Notepad-Auto-Github-Actions"
name: Deploy Quartz site to GitHub Pages
 
on:
  push:
    branches:
      - v4
 
permissions:
  contents: read
  pages: write
  id-token: write
 
concurrency:
  group: "pages"
  cancel-in-progress: false
 
jobs:
  build:
    runs-on: ubuntu-22.04
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Fetch all history for git info
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - name: Install Dependencies
        run: npm ci
      - name: Build Quartz
        run: npx quartz build
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: public
 
  deploy:
    needs: build
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

3. 다시 Git bash로 진입 후 `npx quartz sync`를 입력하여 github에 push합니다.
4. "https://username.github.io" 에 접속하면 생성된 블로그를 볼 수 있습니다!

### 4. Obsidian 연동

1. Obsidian에서 "Open foloder as vault" 선택 후 content폴더를 선택합니다.
2. Community plugins에서 Git 설치 후 Enable합니다.
3. 이제 Obsidian 내에서 쉽게 Github에 Commit & Push할 수 있습니다!
4. 이제 해당 볼트에서 작성한 모든 노트가 블로그의 게시물이 됩니다!

**축하합니다! 해냈군요!**

![[Utillities/attatchments/Pasted image 20251203012624.png|300]]

- *작성된 노트는 기본적으로 모두 content 폴더에 있어야 하니 주의*
## IV. 나가며

이렇게 맨땅에서부터 손수 블로그를 만들고, 웹 페이지로 호스팅까지 해보니 블로그에 대한 애정이 더욱 생기는 것 같습니다.

이런 無에서 有를 창조해내는 경험이 개발의 묘미가 아닐까 싶네요. 
(물론 제가 코딩한 건 없고 누군가 만들어준 템플릿을 가져왔을 뿐입니다..)

저도 언젠가 이런 멋진 오픈소스 하나 개발해보고 싶습니다~

---
## 관련 게시물
- [[Inbox/Quartz 블로그에 편의 기능 추가하기]]
- [[Inbox/Quartz 블로그에 SEO와 GA4 등록하기]]
## About me
- [My github](https://github.com/taketech019)
