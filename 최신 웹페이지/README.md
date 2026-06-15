# 지식창고 — 정적 블로그 + Decap CMS (검색 최적화 유지)

웹 관리자(`/admin`)에서 글을 쓰면 정적 HTML이 자동 생성·배포되는 금융/신용 정보 블로그입니다.

## 빠른 시작
설정 방법은 **`SETUP_관리자.md`** 를 보세요. (GitHub + Netlify + Decap 연결, 한 번만)

## 구조
```
content/posts/*.md   글 원본(마크다운). /admin 에서 관리.
build.js             마크다운 → 정적 HTML 생성기(의존성 없음, Node)
admin/               Decap CMS 관리자 페이지 + 설정(config.yml)
css/style.css        디자인(모바일 우선·다크/라이트·한국어 가독성)
js/site.js           테마/연도
js/article.js        글 페이지(목차·진행률·글자크기·공유)
js/home.js           홈(검색·카테고리 필터)
netlify.toml         Netlify 빌드 설정(node build.js)
posts/, index.html, sitemap.xml, robots.txt   build.js가 자동 생성
```

## 로컬에서 다시 빌드
```
node build.js
```
도메인은 Netlify 배포 시 자동 인식(`URL` 환경변수)됩니다.

## 광고(수익화)
`class="ad-slot"` 4곳(헤더/사이드바/본문중간/글하단)에 구글 애드센스 코드를 넣으면 됩니다.
