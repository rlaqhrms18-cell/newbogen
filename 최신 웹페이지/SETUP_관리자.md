# 지식창고 관리자(Decap CMS) 설정 가이드

이 가이드대로 **한 번만** 설정하면, 그 뒤로는 `내사이트주소/admin/` 에서 글을 쓰고 저장하면
**자동으로 정적 페이지가 만들어지고 사이트에 반영**됩니다. zip 다운로드·수동 재배포가 더 이상 필요 없습니다.

준비물: GitHub 계정(무료), Netlify 계정(이미 있음), 본인 이메일.

---

## 1단계 — GitHub에 코드 올리기
1. https://github.com 가입/로그인.
2. 우측 상단 **+ → New repository**. 이름 예: `jisikchango`. **Public** 선택 → **Create repository**.
3. 새 화면의 **"uploading an existing file"** 링크 클릭.
4. 이 폴더 안의 **모든 파일·폴더를 통째로 드래그**해서 업로드합니다.
   (`index.html`, `build.js`, `package.json`, `netlify.toml`, `admin/`, `content/`, `css/`, `js/`, `posts/`, `images/` 전부)
5. 맨 아래 **Commit changes** 클릭.

> `images/uploads` 폴더는 비어 있어도 `.gitkeep` 파일과 함께 올라가야 합니다(이미 포함됨).

---

## 2단계 — Netlify 연결 (추천: 기존 사이트 그대로 쓰기)

### 방법 A (추천) — 기존 사이트를 GitHub에 연결 → 주소·검색등록 유지
1. Netlify → 기존 사이트(`gleeful-crostata-f32160`) 클릭.
2. **Site configuration → Build & deploy → Continuous deployment**.
3. **"Link repository"**(또는 Link site to Git) → GitHub 연결 → 방금 만든 repo 선택.
4. 빌드 설정 자동 인식: Build command `node build.js`, Publish directory `.` → 저장.
→ 같은 주소를 유지하면서 GitHub 연동 배포로 전환됩니다. (검색엔진 재등록 불필요)

### 방법 B — 새 사이트로 만들기 (주소가 바뀜)
1. Netlify → **Add new site → Import an existing project → GitHub** → repo 선택 → Deploy.
2. 주소가 새로 생기므로, 구글·네이버·빙에 **새 주소로 다시 등록**해야 합니다.
   (메타 인증태그는 페이지에 이미 있으니 대부분 "확인"만 누르면 됩니다. 네이버·빙 코드가 새로 나오면 저에게 주세요.)

---

## 3단계 — 로그인 기능(Identity) 켜기
1. Netlify 사이트 → **Site configuration → Identity → Enable Identity**.
2. **Registration → "Invite only"** 로 설정(아무나 가입 못 하게).
3. **Services → Git Gateway → Enable Git Gateway**.

## 4단계 — 내 계정 초대
1. **Identity → Invite users** → 본인 이메일 입력 → 초대.
2. 메일로 온 초대 링크 클릭 → 비밀번호 설정.

## 5단계 — 글쓰기 (이제 끝!)
1. 브라우저에서 **`내사이트주소/admin/`** 접속.
2. 로그인 → **글 → New 글** → 제목·URL주소(영문)·태그·요약·본문 작성 → **Publish**.
3. 1~2분 뒤 자동으로 빌드되어 사이트에 새 글이 올라갑니다.
   수정·삭제도 `/admin` 에서 하면 자동 반영됩니다.

---

## 글 잘 쓰는 팁
- **제목**: 핵심 키워드를 앞에 + "2026 최신" 같은 표현 → 검색에 유리.
- **URL주소(slug)**: 영문 소문자 + `-` (예: `card-limit-guide`). 한 번 정하면 바꾸지 마세요.
- **본문(마크다운)**: `## 소제목`, `### 작은제목`, `**굵게**`, `- 목록`, 표 `| 항목 | 값 |` 지원.
- 글 끝에 정보 출처/주의문구를 넣으면 신뢰도와 검색 품질이 올라갑니다.

## 작동 원리(참고)
- `/admin` 에서 글 저장 → `content/posts/글.md` 파일이 GitHub에 커밋됨
- Netlify가 `node build.js` 실행 → `posts/글.html`·`index.html`·`sitemap.xml`·`robots.txt` 자동 생성
- 정적 HTML이므로 구글·네이버·빙이 본문을 바로 읽습니다(검색 최적화 유지).
