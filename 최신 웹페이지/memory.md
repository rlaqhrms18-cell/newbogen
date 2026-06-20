# 프로젝트 메모리 — 지식창고 블로그

> 대화 중 나온 중요한 맥락·핵심 결정 사항 기록 파일. (작성: 2026-06-20)

## 1. 프로젝트 개요
- **지식창고**: 생활 금융·신용 정보 정적 블로그.
- 구조: Decap CMS(`/admin`) 로 글 작성 → `content/posts/*.md` → `build.js`(Node) 가 `posts/*.html`, `index.html`, `sitemap.xml`, `robots.txt` 자동 생성 → Netlify 배포.
- 배포: Netlify, 사이트 주소 `https://gleeful-crostata-f32160.netlify.app/`
- 운영자: 김보근 (bogenkim6974@gmail.com)
- 검색 등록: 구글/네이버/빙 인증 태그 모두 삽입됨. 애드센스 `ca-pub-4100339741871957` 설치됨.
- 현재 글 7개(business-loan, credit-score, credit-score-fast, debt-adjustment, jobless-loan, personal-rehabilitation-loan, sunshine-youth).

## 2. 정기 운영 업무 (프로젝트 지침)
- 매일 오전 9시: 지난주 네이버/구글/빙에서 조회수 급상승 뉴스 스크랩 → 지식창고에 올릴 정보·뉴스 자료 정리.
- 모든 결과물은 프로젝트 폴더에 저장.
- 중요 변동사항은 즉시 슬랙으로 알림.

## 3. 새 요구사항 (2026-06-20 접수, 아직 미착수)
1. **홈페이지 대시보드**: 조회수·차트 그래프를 넣어 한눈에 보기 편하게.
2. **로그인 기반 글 발행·수정**: 홈페이지에서 로그인해 글을 발행/수정. (블로그)
3. **모든 글에 자동 목차(TOC) 삽입**: 사용자가 제공한 "숫자 카운트 목차" HTML/JS 코드를 글마다 항상 삽입.
   - 출처: 디파서블 블로그(블로그스팟 자동목차). h2/h3/h4 를 1, 1.1, 1.1.1 형식으로 자동 번호 매김.
   - 원본 셀렉터가 `.post-body h2/h3/h4` 라서, 우리 사이트 글 본문 컨테이너 클래스에 맞게 조정 필요.

## 4. 결정 사항 (2026-06-20 확정)
- **조회수 데이터 출처**: "편한 걸로" → 구현 시 가장 편한 방식 채택. 커스텀 관리자 대시보드에 직접 차트를 그리려면, 데이터를 우리가 소유·접근하기 쉬운 **경량 자체 카운터(Netlify Functions + 저장소)** 가 유력. (대안: GA4. 단 GA4는 커스텀 차트용 데이터 접근에 OAuth/API 연동 필요해 더 복잡.) → 빌드 단계에서 최종 확정·추천 예정.
- **대시보드 공개 범위**: **관리자 전용(비공개).** 로그인한 운영자만 조회수·차트 확인.
- **글 작성/수정 방식**: **기존 Decap CMS(`/admin`) 그대로 활용.** (별도 커스텀 에디터는 작업량이 커서 제외하기로 2026-06-20 확정.) 로그인·발행·수정·GitHub 커밋·자동 빌드는 이미 구축돼 있으므로 추가 개발 불필요. 필요 시 설정 점검만.

## 6. 구현 완료 내역 (2026-06-20)
- **목차 자동 번호**: `css/style.css` `.toc` 에 CSS 카운터 추가 → 모든 글 목차가 1, 1.1 형식으로 자동 번호. (기존 자동 목차 시스템을 그대로 활용, 글마다 항상 적용됨)
- **조회수 카운터(백엔드)**: `netlify/functions/hit.js`(집계, 공개)·`stats.js`(통계 반환, Netlify Identity 인증 필수). 저장은 Netlify Blobs(store="analytics", key=`views/<경로>`, `{total, daily, title}`). `package.json`에 `@netlify/blobs` 추가, `netlify.toml`에 functions 디렉터리 설정.
- **추적 스니펫**: `build.js`의 글·홈 템플릿에 방문 시 `sendBeacon`/`fetch`로 `hit` 호출(관리자/대시보드 경로는 집계 제외). 모든 생성 페이지에 자동 삽입.
- **관리자 대시보드**: `dashboard/index.html`. Netlify Identity 로그인 게이트 + Chart.js(일별 추이 30일·글별 막대·순위표·KPI 카드). 비공개(robots Disallow, noindex). 홈 헤더에 "📊 통계" 링크.

### 배포 시 사용자 확인 필요 (운영자 액션)
1. 변경된 폴더를 GitHub에 푸시 → Netlify 자동 빌드(`@netlify/blobs` 자동 설치, 함수 자동 배포).
2. 대시보드 로그인은 기존 `/admin`과 동일한 **Netlify Identity** 사용 → Identity가 켜져 있어야 함(Decap용으로 이미 켰다면 그대로 동작).
3. 조회수는 **배포 후 방문부터** 집계됨(과거 데이터 없음). Netlify Blobs는 Netlify에서 추가 설정 없이 동작.
4. "📊 통계" 링크는 홈에 공개 노출(클릭해도 로그인 안 하면 데이터 안 보임). 완전히 숨기려면 링크 제거하고 `/dashboard/` 직접 접속만 사용.

## 7. 배포 실패 진단·수정 (2026-06-20)
- **증상**: Netlify 빌드가 `node build.js` 단계에서 코드 1로 종료(또는 "build.js 없음"으로 보고됨).
- **확인된 진짜 원인**: `package.json`에 `@netlify/blobs`를 직접 추가했으나 기존 `package-lock.json`은 그대로라 둘이 불일치 → Netlify의 `npm ci`가 "package.json과 package-lock.json이 일치하지 않음"으로 실패. (작업 중 OneDrive 동기화 지연으로 잠깐 깨진 `build.js`/`package.json`이 푸시됐을 가능성도 있었음.)
- **수정**: `package.json`을 원래대로(`netlify-cli`만) 되돌려 lock과 일치시킴. `@netlify/blobs`는 `netlify-cli`에 이미 포함돼 transitive로 설치됨(설치본 v10.7.9, 코드의 getStore/setJSON/list API 호환 확인). 함수 번들러가 node_modules에서 자동 해결하므로 직접 선언 불필요.
- **검증**: 로컬 `node build.js` exit 0, `require('@netlify/blobs')` 정상.
- **재배포 시 주의**: 수정된 `build.js`·`package.json`과 새 폴더(`netlify/`, `dashboard/`), 재생성된 `index.html`/`posts/`를 저장소 **루트**에 올려야 함(하위 폴더로 중첩 금지). 깃 연동 배포면 푸시 시 자동 빌드.

## 5. 작업 진행 원칙
- 사용자가 "시작" 신호를 줄 때까지 맥락 수집·질문만. 임의로 구현 착수 금지.
