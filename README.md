# 🎬 CineFlix - 영화 리뷰, 위시리스트 & 소셜 커뮤니티 서비스

CineFlix는 **Spring Boot 백엔드**와 **React(Vite) 프론트엔드**를 기반으로 한 올인원 영화 탐색 및 소셜 커뮤니티 플랫폼입니다.  
실시간 박스오피스 순위 탐색, TMDB 기반 영화 상세 정보 및 고화질 스틸컷 갤러리, 유튜브 공식 트레일러 재생, 왓챠피디아 스타일의 별점/리뷰 커뮤니티, 나만의 커스텀 플레이리스트, **구글·네이버 소셜 로그인(OAuth 2.0) 및 이메일 인증 JWT 보안 체계**를 제공합니다.

---

## 🌐 라이브 데모 (Live Demo)

| 구성 요소 | 배포 플랫폼 | 접속 URL |
|:---|:---|:---|
| **Frontend** | Vercel (Edge CDN) | [![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)](https://cineflix-nine-ruddy.vercel.app) `https://cineflix-nine-ruddy.vercel.app` |
| **Backend API** | Render (Docker) | [![Render](https://img.shields.io/badge/Render-Live-46E3B7?logo=render)](https://cineflix-vm8l.onrender.com) `https://cineflix-vm8l.onrender.com` |
| **API Docs (Swagger)** | OpenAPI 3.0 / Swagger | `https://cineflix-vm8l.onrender.com/swagger-ui/index.html` |
| **OAuth Status** | Diagnostic API | `https://cineflix-vm8l.onrender.com/api/auth/oauth-status` |
| **Docker Hub** | Docker Multi-stage | `https://hub.docker.com/r/shape15/cineflix-backend` |

---

## 🛠️ 기술 스택 (Tech Stack)

### Backend
- **Core:** Java 21, Spring Boot 3.4
- **Security & Social Login:** 
  - Spring Security 6, JWT (JSON Web Token), BCrypt
  - **OAuth 2.0 Client (Google, Naver)**
  - Stateless 세션 관리 & 커스텀 `OAuth2AuthenticationSuccessHandler` / `OAuth2AuthenticationFailureHandler`
- **Email Verification:** Spring Boot Starter Mail (JavaMailSender), Google SMTP (6자리 인증코드, 5분 타이머)
- **Persistence:** Spring Data JPA, H2 Database (File & In-Memory Mode)
- **API Documentation:** SpringDoc OpenAPI 3 (Swagger UI)
- **External Integration & Scraping:** 
  - TMDB (The Movie Database) v3 API
  - KOBIS (영화관입장권통합전산망) 실시간 예매 순위 크롤링 (10분 캐싱)

### Frontend
- **Core:** React 19, Vite
- **Routing:** React Router DOM v7 (SPA 라우팅, OAuth2 리디렉션 처리)
- **Icons & Styling:** Lucide React, Vanilla CSS3 (Modern Glassmorphism, Dark Cinema Theme, Responsive Slider)
- **HTTP Client:** Fetch API (환경별 동적 API Base URL 라우팅)

### DevOps & CI/CD (100% Free Cloud Infrastructure)
- **Frontend Hosting:** Vercel (Global Edge CDN, Automatic SPA Rewrite)
- **Backend Hosting:** Render (Spring Boot Docker Container Web Service)
- **CI/CD Pipeline:** GitHub Actions (`.github/workflows/deploy.yml`)
- **Containerization:** Docker (Multi-stage Build Dockerfile), Docker Hub

---

## 📑 주요 기능 (Key Features)

### 1. 🔐 하이브리드 인증 시스템 (OAuth 2.0 & 이메일 인증 JWT)
- **구글 & 네이버 소셜 원클릭 로그인**:
  - `OAuth 2.0 Client` 기반 소셜 인증 후 자체 JWT 토큰 발급 및 안전한 리디렉션 연동
  - 신규 소셜 유저 자동 가입(랜덤 닉네임 및 안전한 난수 패스워드 설정) 및 기존 유저 소셜 연동
  - `client_secret_post` 전송 방식 및 환경변수 자동 정제(비가시 문자/따옴표/줄바꿈 필터링)를 통한 무결성 보장
- **이메일 인증 기반 자체 회원가입**:
  - Google SMTP를 통한 6자리 보안 인증번호 발송 및 5분 유효시간 검증
- **무상태(Stateless) JWT 보안 인증**:
  - Access Token 기반 API 인가 및 로컬 스토리지 자동 세션 동기화

### 2. 🎬 영화 탐색 & 실시간 박스오피스 차트
- **실시간 예매율 1~10위 차트**: KOBIS 실시간 예매 순위를 크롤링하여 실시간 반영 (10분 주기 인메모리 캐싱)
- **장르별 / 테마별 큐레이션**: 액션, SF, 애니메이션, 로맨스 등 평점 및 인기순 대표 명작 분류
- **실시간 검색**: 키워드 검색을 통한 영화 탐색 및 상세 정보 제공

### 3. 🎭 영화 상세 정보 & 배우 캐스팅
- 감독, 주요 출연 배우 목록, 배역명, 프로필 사진 제공
- 프로필 미등록 배우를 위한 실루엣 아바타 예외 처리 및 골드/볼드 테마 디자인

### 4. ⭐️ 왓챠피디아 스타일 0.5~5.0점 별점 & 커뮤니티 리뷰
- **원클릭 별점 자동 저장**: 별점(★ 0.5 ~ 5.0) 클릭 즉시 저장 및 실시간 반영
- **정성 리뷰 작성 & 커뮤니티 피드**: 별점 단독 평가와 텍스트 리뷰 분리 제공
- **실시간 평점 요약**: 커뮤니티 유저 평균 평점 및 리뷰 개수 실시간 집계

### 5. 📸 고화질 갤러리 & 현장 스틸컷 뷰어 (TMDB 연동)
- 국내 공식 한국어 포스터 & 텍스트리스 고화질 스틸컷 엄선 큐레이션 (중복 외국어 포스터 필터링)
- **16:9 슬라이드 캐러셀 & 풀스크린 라이트박스(Lightbox)**: 원본 확대, 키보드 방향키(`←`/`→`) 연속 탐색, `ESC` 닫기 지원

### 6. 🎞️ 유튜브 공식 예고편 슬라이드
- 영화별 공식 예고편 및 티저 영상을 16:9 썸네일과 슬라이드 형태로 제공하며 클릭 시 즉시 재생

### 7. 👤 마이페이지 & 커스텀 플레이리스트
- **내 위시리스트**: 찜한 영화 목록 조회 및 실시간 하트(❤️) 토글 인터랙션
- **내 리뷰 & 별점 모아보기**: 내가 작성한 별점과 한줄평 목록 모아보기 및 수정/삭제
- **나만의 영화 리스트(플레이리스트)**: 테마별 커스텀 컬렉션 생성/관리 및 상세 페이지에서 원클릭 담기 지원
- **회원 정보 수정**: 닉네임 및 비밀번호 안전 변경

---

## 🏗️ 프로젝트 구조 (Project Structure)

```
CineFlix/
├── .github/workflows/                 # GitHub Actions CI/CD 자동 배포 파이프라인
│   └── deploy.yml
├── backend/                           # Spring Boot 3.4 백엔드
│   ├── src/main/java/com/example/demo/
│   │   ├── config/
│   │   │   ├── security/              # Spring Security, JWT Provider, Filter
│   │   │   │   └── oauth2/            # OAuth2 User Service, Success/Failure Handler, UserInfo
│   │   │   └── swagger/               # Swagger OpenAPI 3 설정
│   │   └── domain/
│   │       ├── member/                # 회원, 인증(Auth), 소셜 로그인, 이메일 인증
│   │       ├── movie/                 # TMDB API 클라이언트, KOBIS 크롤러, 갤러리, 예고편
│   │       ├── review/                # 별점 및 리뷰 CRUD, 통계 집계
│   │       ├── wishlist/              # 위시리스트 (찜하기)
│   │       └── playlist/              # 나만의 영화 리스트 컬렉션
│   ├── src/main/resources/
│   │   └── application.yml            # 프로파일별 설정 (Local H2 / Prod / OAuth2)
│   ├── Dockerfile                     # Java 21 멀티스테이지 Dockerfile
│   └── build.gradle                   # Gradle 빌드 스크립트
├── frontend/                          # React 19 + Vite 프론트엔드
│   ├── src/
│   │   ├── components/                # Navbar, MovieCard, StarRating, SocialLoginButtons 등
│   │   ├── pages/                     # MovieDetailPage, MyPage, LoginPage, OAuth2RedirectHandler 등
│   │   └── config/api.js              # 동적 배포 환경 API Base URL 설정
│   ├── vercel.json                    # Vercel SPA Rewrite 라우팅 설정
│   └── package.json
└── README.md                          # 프로젝트 종합 가이드 문서
```

---

## ⚙️ 환경변수 설정 가이드 (Environment Variables)

로컬 실행 시 루트 디렉터리의 `.env` 파일에, 클라우드(Render / Vercel) 배포 시 대시보드 환경변수에 등록합니다:

| 환경변수명 | 필수 여부 | 설명 | 예시 값 |
|:---|:---:|:---|:---|
| `TMDB_API_KEY` | 필수 | TMDB v3 API Key | `335d351f...` |
| `KOBIS_API_KEY` | 필수 | 영진위 오픈 API Key | `183da6c4...` |
| `JWT_SECRET` | 필수 | JWT 서명용 비밀키 (32자 이상) | `cineflix_secret_jwt_key...` |
| `SPRING_MAIL_HOST` | 선택 | SMTP 메일 호스트 | `smtp.gmail.com` |
| `SPRING_MAIL_PORT` | 선택 | SMTP 포트 | `587` |
| `SPRING_MAIL_USERNAME` | 필수(인증) | 구글 계정 이메일 | `example@gmail.com` |
| `SPRING_MAIL_PASSWORD` | 필수(인증) | 구글 앱 비밀번호 (16자리) | `abcd efgh ijkl mnop` |
| `GOOGLE_CLIENT_ID` | 필수(소셜) | Google OAuth 2.0 클라이언트 ID | `3595...apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | 필수(소셜) | Google OAuth 2.0 보안 비밀번호 | `GOCSPX-...` |
| `NAVER_CLIENT_ID` | 필수(소셜) | Naver Developers 클라이언트 ID | `rgCEqb...` |
| `NAVER_CLIENT_SECRET` | 필수(소셜) | Naver Developers Client Secret | `j1NkW...` |
| `FRONTEND_OAUTH2_REDIRECT_URI` | 필수(소셜) | 로그인 완료 후 복귀할 프론트엔드 주소 | `https://cineflix-nine-ruddy.vercel.app/oauth2/redirect` |

---

## 🚀 로컬 개발 환경 실행 방법 (Getting Started)

### 1. Repository 클론
```bash
git clone https://github.com/isakc/CineFlix.git
cd CineFlix
```

### 2. 백엔드 실행 (Spring Boot)
```bash
cd backend
./gradlew bootRun
# 백엔드가 http://localhost:8080 에서 구동됩니다.
# H2 Console: http://localhost:8080/h2-console
# Swagger UI: http://localhost:8080/swagger-ui/index.html
# OAuth Status: http://localhost:8080/api/auth/oauth-status
```

### 3. 프론트엔드 실행 (React Vite)
```bash
cd ../frontend
npm install
npm run dev
# 프론트엔드가 http://localhost:3000 에서 구동됩니다.
```
