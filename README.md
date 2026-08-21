# 🎬 CineFlix - 영화 리뷰 & 위시리스트 서비스

CineFlix는 **Spring Boot 백엔드**와 **React(Vite) 프론트엔드**를 기반으로 한 영화 정보 탐색, 실시간 박스오피스 순위 조회, 왓챠피디아 스타일의 별점/리뷰 커뮤니티, 고화질 현장 스틸컷 갤러리, 커스텀 영화 리스트 및 개인화 마이페이지를 제공하는 올인원 영화 웹 애플리케이션입니다.

---

## 🌐 라이브 데모 (Live Demo)

- **프론트엔드 (Vercel)**: `https://cineflix-nine-ruddy.vercel.app`
- **백엔드 API (Render)**: `https://cineflix-backend.onrender.com`
- **Docker Hub Repository**: `https://hub.docker.com/r/shape15/cineflix-backend`

---

## 🛠️ 기술 스택 (Tech Stack)

### Backend
- **Framework:** Spring Boot 3.4, Java 21
- **Security & Auth:** Spring Security, JWT (JSON Web Token), BCrypt
- **Email Verification:** Spring Boot Starter Mail (JavaMailSender), Google SMTP
- **Persistence:** Spring Data JPA, H2 Database (File & In-Memory DB)
- **External API & Scraping:** TMDB (The Movie Database) Open API, KOBIS 실시간 예매율 크롤링

### Frontend
- **Framework:** React 19, Vite
- **Routing:** React Router DOM v7 (SPA Client-side Routing)
- **Styling:** Vanilla CSS3 (Modern Glassmorphism, Dark Mode Theme, Responsive Slider)
- **HTTP Client:** Fetch API (동적 배포 환경 API Base URL 클라이언트)

### DevOps & Deployment (100% Free Cloud Infrastructure)
- **Frontend Hosting:** Vercel (Global Edge CDN, Automatic SPA Routing)
- **Backend Hosting:** Render.com (Spring Boot Docker Container Web Service)
- **CI/CD Pipeline:** GitHub Actions (`.github/workflows/deploy.yml`)
- **Containerization:** Docker (Multi-stage Build Dockerfile), Docker Hub

---

## 📑 주요 기능 (Key Features)

### 1. 🎬 영화 탐색 & 실시간 박스오피스 차트
- **실시간 예매율 1~10위 차트**: KOBIS(영화관입장권통합전산망) 실시간 예매 순위를 크롤링하여 실시간 반영 (10분 캐싱)
- **장르별 / 테마별 명작 큐레이션**: 액션, SF, 애니메이션, 로맨스 등 평점 기반 대표 명작 추천
- **영화 키워드 실시간 검색**: 영화 제목 검색 및 상세 데이터 조회

### 2. 🎭 영화 상세 정보 & 출연 배우 캐스팅
- 감독, 주요 출연 배우 목록, 극중 배역명, 프로필 사진 제공
- 프로필 미등록 배우를 위한 실루엣 아바타 예외 처리 및 골드/볼드 테마 디자인

### 3. ⭐️ 왓챠피디아 스타일 0.5~5.0점 별점 & 커뮤니티 리뷰
- **원클릭 별점 자동 저장**: 별점(★ 0.5 ~ 5.0) 클릭 즉시 저장 및 실시간 반영
- **텍스트 한줄평/리뷰 작성**: 별점 단독 평가와 텍스트 리뷰를 분리하여 커뮤니티 피드에는 정성스러운 글 중심 노출
- **실시간 평점 요약**: 커뮤니티 유저 평균 평점 및 리뷰 개수 실시간 집계

### 4. 📸 고화질 갤러리 & 현장 스틸컷 뷰어 (TMDB 연동)
- **국내 공식 한국어 포스터 & 텍스트리스 고화질 스틸컷** 엄선 큐레이션 (중복 외국어 포스터 필터링)
- **한 줄 4개 슬라이드(캐러셀) 페이징**: 16:9 와이드 비율의 카드와 좌우 슬라이드(`❮`/`❯`) 내비게이션
- **풀스크린 라이트박스(Lightbox) 뷰어**: 고화질 원본 확대, 키보드 방향키(`←`/`→`) 연속 탐색, `ESC` 닫기 지원

### 5. 🎞️ 유튜브 공식 예고편(트레일러) 슬라이드 재생
- 영화별 공식 예고편 및 티저 영상을 4개씩 슬라이드 페이징 형태로 제공
- 클릭 시 유튜브 공식 영상으로 즉시 연결 및 16:9 썸네일/재생 버튼 오버레이

### 6. 👤 마이페이지(MyPage) & 유저 취향 관리
- **회원 정보 수정**: 닉네임 및 비밀번호 안전 변경
- **내 위시리스트 모아보기**: 찜한 영화 목록 조회 및 즉각적인 하트(❤️) 토글 인터랙션
- **내 리뷰 & 별점 평가 관리**: 내가 남긴 별점과 한줄평 목록 모아보기 및 수정/삭제
- **나만의 영화 리스트(플레이리스트)**: 테마별 커스텀 영화 컬렉션 생성/관리 및 영화 상세 페이지에서 원클릭 담기 지원

### 7. 🔐 이메일 인증 회원가입 & JWT 보안 인증
- **Google SMTP 이메일 인증**: 6자리 인증번호 전송, 5분 유효시간 타이머, 실시간 검증
- **Spring Security + JWT**: 무상태(Stateless) 토큰 기반 인증 및 BCrypt 비밀번호 암호화

---

## 🏗️ 프로젝트 구조 (Project Structure)

```
CineFlix/
├── .github/workflows/        # GitHub Actions CI/CD 파이프라인
│   └── deploy.yml
├── backend/                  # Spring Boot 백엔드 프로젝트
│   ├── src/main/java/        # Java 소스 코드
│   │   └── com/example/demo/
│   │       ├── domain/auth/      # 회원가입, 로그인, JWT 인증, 이메일 인증
│   │       ├── domain/movie/     # TMDB 클라이언트, KOBIS 크롤러, 갤러리, 예고편
│   │       ├── domain/review/    # 별점, 리뷰 CRUD 및 집계
│   │       ├── domain/wishlist/  # 위시리스트 찜 기능
│   │       └── domain/playlist/  # 커스텀 영화 리스트 (플레이리스트)
│   ├── src/main/resources/   # application.yml 및 메일 설정
│   ├── Dockerfile            # Java 21 멀티스테이지 Dockerfile
│   └── build.gradle          # Gradle 빌드 설정
├── frontend/                 # React (Vite) 프론트엔드 프로젝트
│   ├── src/
│   │   ├── components/       # Navbar, MovieCard, StarRating, Modal, Drawer 등
│   │   ├── pages/            # MovieDetailPage, MyPage, LoginPage, SignupPage
│   │   └── config/api.js     # 동적 배포 환경 API Base URL 설정
│   ├── vercel.json           # Vercel SPA 라우팅 설정
│   └── package.json          # Node.js 의존성 관리
└── README.md                 # 프로젝트 종합 문서
```
