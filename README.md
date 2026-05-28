# 위드교회 (W1th Church) 홈페이지

경기 용인시 수지구 상현동에 위치한 **위드교회(W1th Church)** 공식 웹사이트입니다.
빌드 도구 없이 HTML/CSS/Vanilla JS만으로 구성되어 있어 GitHub Pages에 그대로 배포할 수 있습니다.

배포 URL (예정): https://jiyu-kim.github.io/with_church/

---

## 1. 디렉토리 구조

```
/
├── index.html              # 메인(홈) 페이지
├── 404.html                # GitHub Pages 자동 404 페이지
├── .nojekyll               # Jekyll 비활성화 (언더스코어 폴더 보존)
├── pages/
│   ├── about/              # 인사말, 섬기는사람들, 예배시간, 예배장소, 찾아오시는길
│   ├── worship/            # 주일, 금요, 새벽묵상, 찬양
│   ├── school/             # children, teens, youth
│   └── events/             # 일정, 행사 사진
├── assets/
│   ├── css/style.css       # 전체 스타일시트
│   ├── js/main.js          # 공통 헤더/푸터 + 콘텐츠 로더
│   └── images/             # (선택) 이미지 자리
├── src/
│   ├── logo.png            # 헤더 로고
│   └── people/             # 인물 프로필 사진 ("<이름>_프로필_사진.jpeg")
├── content/
│   ├── introduction.md     # 인사말 (HTML/마크다운 인라인 허용)
│   ├── people.md           # 섬기는 사람들 (제목 + 그룹 + 인물 — 커스텀 포맷)
│   ├── service.md          # 예배 시간 안내 (커스텀 "label : time location" 포맷)
│   ├── footer.md           # 푸터 (모든 페이지 하단에 표시)
│   ├── children.md         # 키즈/칠드런 소개
│   ├── teens.md            # 틴즈 소개
│   └── youth.md            # 유스 소개
└── README.md
```

---

## 2. 처음 클론 후 설정 (API 키)

이 사이트는 **네이버 지도**와 **유튜브 Data API**를 사용하며, 키는 보안상
`assets/js/config.js` 에만 보관하고 git 에서는 제외합니다(`.gitignore`).

새로 클론한 뒤 한 번만 해주세요:

```bash
cp assets/js/config.example.js assets/js/config.js
# 그 후 에디터로 assets/js/config.js 열어서 실제 키 입력
```

키 발급/제한 방법:
- **Naver Maps Client ID**: Naver Cloud Console > Maps Dynamic Map > "Web 서비스 URL" 에 `http://localhost:8000`, `https://jiyu-kim.github.io` 등록
- **YouTube Data API v3 Key**: Google Cloud Console > API 키 > HTTP 리퍼러 제한 `http://localhost:8000/*`, `https://jiyu-kim.github.io/*`

**config.js 가 없거나 placeholder 상태여도 사이트는 동작합니다**:
- 지도 페이지 → "지도를 불러올 수 없습니다" 안내 + 네이버 외부 링크 버튼은 정상
- 주일/금요 영상 → 갤러리 대신 단일 플레이리스트 임베드(폴백)

> ⚠️ GitHub Pages 배포 시 키는 자동으로 함께 올라가지 **않습니다.** 배포 사이트에서
> 지도/YouTube 갤러리 기능까지 보이려면 별도 처리(예: GitHub Actions 의 deploy step
> 에서 secrets 주입)가 필요합니다. 기본 상태로 배포 시 폴백 화면이 노출됩니다.

## 3. 로컬에서 미리보기

`.md` 콘텐츠를 `fetch()`로 로드하기 때문에 **`file://` 직접 열기는 동작하지 않습니다.**
간단한 정적 서버를 띄워 주세요.

### Python (가장 간단)
```bash
cd with_church
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000 접속
```

### Node (npx)
```bash
npx serve .
# 또는
npx http-server -p 8000
```

### VS Code Live Server
- 확장 설치 후 `index.html`에서 우클릭 → "Open with Live Server"

---

## 4. 콘텐츠 편집 가이드

### 3-1. 단순 텍스트 (`introduction.md`, `footer.md`)
- 그대로 텍스트 에디터로 수정하면 됩니다. 줄바꿈은 화면에 그대로 반영됩니다.
- 첫 줄은 **페이지 제목**으로 사용되며(`introduction.md`, `service.md`), 나머지는 본문입니다.

### 3-2. 섬기는 사람들 (`people.md`)
포맷 예시:
```
섬기는 사람들

담임목사님 부부

최유석 목사   이은정 사모


부목사님 부부

최형순 목사   박혜나 사모


강도사님

김성민 강도사
```

규칙:
- **첫 줄** = 페이지 제목
- **빈 줄로 그룹 구분**, 각 그룹은 *그룹 헤더 → 빈 줄 → 인물 라인*
- **인물 라인 안 인물 구분은 공백 2칸 이상** (탭도 OK)
- **인물 표기**: `<이름> <직분>` (예: `최유석 목사`, `김성민 강도사`)

### 3-3. 인물 사진 추가/교체
- 위치: `src/people/`
- 파일명 규칙: **`<이름>_프로필_사진.jpeg`** (직분 제외, 이름만)
  - 예) `최유석_프로필_사진.jpeg`, `이은정_프로필_사진.jpeg`, `김성민_프로필_사진.jpeg`
- 사진이 없으면 카드에 **기본 실루엣 아이콘**이 표시됩니다.
- GitHub Pages는 대소문자/한글 파일명을 그대로 처리하므로, 파일명을 정확히 일치시켜 주세요.

> **참고**: 원본 명세는 파일명에 직분을 포함(`최유석 목사_프로필_사진.jpeg`)하도록 되어 있었으나,
> 이미 저장된 실제 파일이 이름만 사용하는 형태였기에 그에 맞춰 코드를 구현했습니다.
> 만약 명세대로 직분 포함 파일명을 쓰려면 `assets/js/main.js`의 `personCard()` 함수에서
> `filename` 변수의 템플릿을 ``${person.name} ${person.role}_프로필_사진.jpeg`` 로 바꾸세요.

### 3-4. 예배 영상 (YouTube 플레이리스트) 교체
- 주일 영상: `pages/worship/sunday.html` 안 `W1TH.embedPlaylist(..., "PL-SIZnTbdPxnJHD3VpmesGdpo_t3IcmUh")`
- 금요 영상: `pages/worship/friday.html` 안 `W1TH.embedPlaylist(..., "PL-SIZnTbdPxmerCoKZfwJFnmfzpN8gymL")`
- 홈 페이지의 "최근 주일 예배" 미리보기도 `index.html` 마지막 `<script>`에 동일한 ID를 사용합니다.
- **최신 영상이 첫 번째로 재생되게 하려면** YouTube Studio → 해당 플레이리스트 → "정렬 → 추가된 날짜 (최신순)" 으로 설정해 주세요.

### 3-5. 네이버 지도 임베드 교체
- 현재 `pages/about/directions.html` 의 `<div class="map-placeholder">` 자리에 placeholder만 들어가 있습니다.
- 네이버 지도에서 발급된 **정식 iframe 임베드 코드**를 받으면, 해당 div를 `<iframe>`으로 교체하세요.
- 코드 안에 `<!-- TODO: ... -->` 주석으로 위치가 표시되어 있습니다.

### 3-6. 새벽 묵상 / 찬양 콘텐츠 채우기
- 두 페이지 모두 현재는 "준비 중" placeholder입니다.
- 업로드 방식이 정해지면 `pages/worship/dawn.html`, `pages/worship/praise.html` 의 `<div class="coming-soon">`
  블록을 실제 콘텐츠로 교체하세요. `dawn.html`에는 옵션을 정리한 TODO 주석이 있습니다.

---

## 5. 새 페이지 추가 방법
1. `pages/<영역>/<파일>.html` 생성
2. 기존 페이지(예: `pages/about/intro.html`)를 복사해 구조 유지
3. `assets/js/main.js` 상단의 **`NAV` 배열**에 항목 추가
4. 모든 자산 경로는 페이지 깊이에 맞춘 **상대 경로**(`../../assets/...`) 사용

---

## 6. GitHub Pages 배포

리포지토리: `https://github.com/Jiyu-Kim/with_church.git`

### 5-1. 리포지토리 Public 전환 (Private이면 필수)
GitHub Pages 무료 플랜은 **Public 리포에서만** 동작합니다.
1. GitHub의 리포 페이지 → **Settings** → **General** → 맨 아래 **Danger Zone**
2. **Change repository visibility** → **Make public** 선택
3. (GitHub Pro 이상이면 Private 그대로도 사용 가능)

### 5-2. 배포
1. 모든 변경사항을 `main` 브랜치에 push
   ```bash
   git add .
   git commit -m "Initial W1th church site"
   git push origin main
   ```
2. GitHub의 리포 페이지 → **Settings** → **Pages**
3. **Source**: `Deploy from a branch`
4. **Branch**: `main`, **Folder**: `/ (root)` 선택 → **Save**
5. 1~2분 후 `https://jiyu-kim.github.io/with_church/` 에서 사이트 확인

### 5-3. 자주 발생하는 문제
- **CSS/JS가 안 보임** → 경로가 절대(`/assets/...`)로 되어 있지 않은지 확인. 이 프로젝트는 모두 상대 경로로 작성되어 있습니다.
- **언더스코어로 시작하는 폴더가 사라짐** → 루트의 `.nojekyll` 파일이 비어있는 상태로 존재하는지 확인.
- **한글/공백 포함 파일명이 404** → `encodeURI()` 처리는 코드에서 이미 하지만, 파일명 자체에 오타가 없는지 확인.
- **fetch 실패** → 로컬에서 `file://` 로 열면 fetch가 막힙니다. 위 "로컬 미리보기" 섹션 참조.

---

## 7. 디자인 토큰

| CSS 변수 | HEX | 용도 |
|---|---|---|
| `--color-primary` | `#3252a7` | 메인 브랜드 (헤더 강조, CTA) |
| `--color-primary-soft` | `#5f72a7` | 보조 강조 (서브 헤딩) |
| `--color-primary-pale` | `#a9b6d7` | 라이트 강조 (구분선) |
| `--color-bg` | `#e8ebf0` | 섹션 배경 |
| `--color-surface` | `#ffffff` | 카드/콘텐츠 배경 |
| `--color-text` | `#171717` | 본문 |
| `--color-text-muted` | `#6d6d6d` | 보조 텍스트 |
| `--color-text-subtle` | `#404040` | 헤딩/푸터 |
| `--color-border` | `#acacac` | 경계선 |

- 한글 본문 폰트: **Pretendard** (CDN), 미사용 시 Apple SD Gothic Neo / Noto Sans KR 폴백
- 반응형 브레이크포인트: 모바일 ≤ 768px, 태블릿 ≤ 1024px, PC > 1024px

---

## 8. 가정한 사항 (Assumptions)

PROMPT.md의 모호한 부분에 대해 다음과 같이 가정하고 진행했습니다.

1. **네이버 지도 임베드**: 단축 URL은 iframe 직접 임베드가 불가능 → "네이버 지도에서 보기" 외부 링크 버튼 + placeholder로 처리. 정식 iframe 코드 수신 시 `pages/about/directions.html`의 TODO 주석 위치를 교체.
2. **인물 사진 파일명**: 명세는 `<이름> <직분>_프로필_사진.jpeg` 형태였으나, 저장된 실제 파일은 `<이름>_프로필_사진.jpeg` 형태 → 실제 파일 기준으로 구현 (위 §3-3 참조).
3. **새벽 묵상**: 카카오톡 녹음 파일 업로드 방식 미정 → "준비 중" 페이지로 처리하고 TODO 주석으로 옵션 후보(YouTube 플레이리스트 / 자체 호스팅 audio / SoundCloud 등) 명시.
4. **홈 페이지의 "최근 주일 예배 영상"**: 단일 영상을 자동 임베드하려면 YouTube Data API가 필요 → 대신 동일 플레이리스트를 임베드하고, "추가된 날짜(최신순)"으로 정렬하라는 안내를 코드 주석과 README에 포함.
5. **콘텐츠 파일**: `content/` 폴더의 `.md` 파일들 — 사용자가 직접 편집해서 사이트 콘텐츠를 갱신할 수 있도록 분리.
6. **CNAME**: 도메인 미정이므로 추가하지 않음.

---

## 9. 라이선스 / 문의

위드교회 내부 자산입니다. 사이트 관련 문의는 푸터의 교회 전화 번호로 연락 주세요.
