# 🎬 CineFlix - 영화 리뷰 & 위시리스트 서비스

CineFlix는 Spring Boot 백엔드와 React(Vite) 프론트엔드를 기반으로 한 영화 정보 탐색, 실시간 박스오피스 순위 조회, 사용자 리뷰/별점 작성, 개인화 위시리스트 관리 웹 애플리케이션입니다.

---

## 🌐 라이브 데모 (Live Demo)

- **프론트엔드 (Vercel)**: 배포 주소 링크
- **백엔드 API (Render)**: `https://cineflix-backend.onrender.com`
- **Docker Hub Repository**: `https://hub.docker.com/r/ckals15/cineflix-backend`

---

## 🛠️ 기술 스택 (Tech Stack)

### Backend
- **Framework:** Spring Boot 3.4, Java 21
- **Security & Auth:** Spring Security, JWT (JSON Web Token), BCrypt
- **Persistence:** Spring Data JPA, H2 Database (File & In-Memory DB)
- **External API:** TMDB (The Movie Database) Open API, KOBIS Box Office 크롤링

### Frontend
- **Framework:** React 18, Vite
- **Styling:** Vanilla CSS3 (Modern Glassmorphism, Dark Mode Theme)
- **HTTP Client:** Fetch API (Dynamic Environment Base API Client)

### DevOps & Deployment (100% Free Cloud Infrastructure)
- **Frontend Hosting:** Vercel (Global Edge CDN, Automatic SPA Routing)
- **Backend Hosting:** Render.com (Spring Boot Docker Container Web Service)
- **CI/CD Pipeline:** GitHub Actions (`.github/workflows/deploy.yml`)
- **Containerization:** Docker (Multi-stage Build Dockerfile), Docker Hub

---

## 📑 주요 기능 (Key Features)

1. **🎬 영화 탐색 & 실시간 박스오피스**
   - TMDB Open API 연동 인기 영화 목록 조회 및 검색
   - KOBIS 실시간 예매율 박스오피스 순위 조회 및 장르별 1만+ 표본 명작 추천 차트
   - 영화 상세 정보 (줄거리, 개봉일, TMDB 평점, 포스터) 확인

2. **⭐️ 리뷰 & 별점 커뮤니티**
   - 영화별 사용자 리뷰 작성 및 별점 시스템
   - 커뮤니티 유저 평점 평균 및 리뷰 수 실시간 집계

3. **❤️ 개인화 위시리스트 (보고 싶은 영화)**
   - 영화별 위시리스트 토글 추가 및 삭제
   - 새로고침(F5) 시에도 유지되는 게스트 전용 고유 ID (`cineflix_guest_id`) 보관

4. **🔐 회원 인증 (Spring Security + JWT)**
   - 회원가입 및 로그인 기능
   - JWT 토큰 기반의 세션 없는 (Stateless) 인증 처리

---

## 🏗️ 프로젝트 구조 (Project Structure)

```
CineFlix/
├── .github/workflows/        # GitHub Actions CI/CD 파이프라인
│   └── deploy.yml
├── backend/                  # Spring Boot 백엔드 프로젝트
│   ├── src/main/java/        # Java 소스 코드 (Controller, Service, Repository, Security, Entity)
│   ├── src/main/resources/   # application.yml 및 리소스
│   ├── Dockerfile            # Java 21 멀티스테이지 Dockerfile
│   └── build.gradle          # Gradle 빌드 설정
├── frontend/                 # React (Vite) 프론트엔드 프로젝트
│   ├── src/                  # React 컴포넌트, CSS, API 연동 로직
│   │   └── config/api.js     # 동적 배포 환경 API Base URL 설정
│   ├── vercel.json           # Vercel SPA 라우팅 설정
│   └── package.json          # Node.js 의존성 관리
└── README.md                 # 프로젝트 문서
```
