# 🎬 CineFlix - 영화 리뷰 & 위시리스트 개인화 서비스

CineFlix는 Spring Boot 백엔드와 React(Vite) 프론트엔드를 기반으로 한 영화 정보 탐색, 사용자 리뷰/별점 작성, 개인화 위시리스트 관리 웹 애플리케이션입니다.

---

## 🛠️ 기술 스택 (Tech Stack)

### Backend
- **Framework:** Spring Boot 3.x, Java 17/21
- **Security & Auth:** Spring Security, JWT (JSON Web Token), BCrypt
- **Persistence:** Spring Data JPA, H2 Database (File-based local DB)
- **External API:** TMDB (The Movie Database) Open API, KOBIS Box Office API

### Frontend
- **Framework:** React 18, Vite
- **Styling:** CSS3 (Modern Flexbox/Grid, Dark Mode Theme)
- **HTTP Client:** Fetch API (with JWT Authorization Header)

---

## 📑 주요 기능 (Key Features)

1. **🎬 영화 탐색 & 검색**
   - TMDB Open API 연동 인기 영화 목록 조회 및 키워드 검색
   - 영화 상세 정보 (줄거리, 개봉일, 평점, 포스터) 확인

2. **⭐️ 리뷰 & 별점 시스템**
   - 영화별 사용자 리뷰 작성, 수정, 삭제
   - 평점 계산 및 리뷰 목록 조회

3. **❤️ 개인화 위시리스트 (보고싶은 영화)**
   - 원하는 영화를 위시리스트에 추가 / 삭제
   - 마이페이지 내 위시리스트 모아보기

4. **🔐 회원 인증 (Spring Security + JWT)**
   - 회원가입 및 로그인 기능
   - JWT 토큰 기반의 세션 없는 (Stateless) 인증 처리

---

## 🏗️ 프로젝트 구조 (Project Structure)

```
CineFlix/
├── backend/                  # Spring Boot 백엔드 프로젝트
│   ├── src/main/java/        # Java 소스 코드 (Controller, Service, Repository, Security, Entity)
│   ├── src/main/resources/   # application.yml 및 리소스
│   └── build.gradle          # Gradle 빌드 설정
├── frontend/                 # React (Vite) 프론트엔드 프로젝트
│   ├── src/                  # React 컴포넌트, CSS, API 연동 로직
│   └── package.json          # Node.js 의존성 관리
└── movie_project_plan.md     # 프로젝트 상세 아키텍처 및 ERD 설계서
```
