---
tags:
  - 마크다운
  - obsidian
  - cheat-sheet
---
### 콜아웃
>[!note] '노트' 콜아웃
>펜 아이콘이 떠요.
> - 문법 : >[!note] 제목
> 	- [!note]+ 제목 : 기본적으로 열림
> 	- [!note]- 제목 : 기본적으로 닫힘
> - 다른 종류의 콜아웃
> 	- 요약 : abstract
> 	- 정보 : info
> 	- 할 일 : todo
> 	- 팁 : tip
> 	- etc : success, question, warning, failure, danger, bug, example, quote...

#### 토글 만들기
<details> <summary>Short Summary</summary> <p>text to hide</p> </details>
```html
'<details> <summary>Short Summary</summary> <p>text to hide</p> </details>'
```

### iframe
```html
`<iframe width='600' height='400' src="url"></iframe>`
```

### templater

```javascript
// Date now
<% tp.date.now() %>
// Date now with format
<% tp.date.now("Do MMMM YYYY") %>
// Last week
<% tp.date.now("YYYY-MM-DD", -7) %>
// Next week
<% tp.date.now("YYYY-MM-DD", 7) %>
// Last month
<% tp.date.now("YYYY-MM-DD", "P-1M") %>
// Next year
<% tp.date.now("YYYY-MM-DD", "P1Y") %>
// File's title date + 1 day (tomorrow)
<% tp.date.now("YYYY-MM-DD", 1, tp.file.title, "YYYY-MM-DD") %>
// File's title date - 1 day (yesterday)
<% tp.date.now("YYYY-MM-DD", -1, tp.file.title, "YYYY-MM-DD") %>

// Move Backward/Forward button
⬅️ [[<% moment(tp.file.title, "YYYY-[W]ww").subtract(1, "weeks").format("YYYY-[W]ww") %>]] | [[<% moment(tp.file.title, "YYYY-[W]ww").add(1, "weeks").format("YYYY-[W]ww") %>]] ➡️

// File rename - today
<% tp.file.rename(tp.date.now(string = "YYYY-MM-DD"))%>
// File rename - Week
<% tp.file.rename(tp.date.now(string = "YYYY-[W]ww"))%>
// File rename - Last Week
<% await tp.file.rename(moment().subtract(1, 'weeks').format("YYYY-[W]ww")) %>

```