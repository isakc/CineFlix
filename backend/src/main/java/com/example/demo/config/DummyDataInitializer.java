package com.example.demo.config;

import com.example.demo.domain.member.entity.Member;
import com.example.demo.domain.member.entity.Role;
import com.example.demo.domain.member.repository.MemberRepository;
import com.example.demo.domain.post.entity.Post;
import com.example.demo.domain.post.repository.PostRepository;
import com.example.demo.domain.review.entity.Review;
import com.example.demo.domain.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DummyDataInitializer implements CommandLineRunner {

    private final MemberRepository memberRepository;
    private final ReviewRepository reviewRepository;
    private final PostRepository postRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        initMembers();
        initReviews();
        initPosts();
    }

    private void initMembers() {
        if (memberRepository.count() > 0) {
            log.info("[DummyData] 회원 데이터가 이미 존재하여 초기화를 건너뜁니다.");
            return;
        }

        log.info("[DummyData] 테스트 회원 데이터 생성을 시작합니다.");
        String defaultPassword = passwordEncoder.encode("password123!");

        Member admin = Member.builder()
                .email("admin@cineflix.com")
                .password(defaultPassword)
                .nickname("시네플릭스 관리자")
                .role(Role.ROLE_ADMIN)
                .build();

        Member user1 = Member.builder()
                .email("movie_lover@cineflix.com")
                .password(defaultPassword)
                .nickname("영화보는고양이")
                .role(Role.ROLE_USER)
                .build();

        Member user2 = Member.builder()
                .email("cinephile_park@cineflix.com")
                .password(defaultPassword)
                .nickname("시네필박")
                .role(Role.ROLE_USER)
                .build();

        Member user3 = Member.builder()
                .email("popcorn_master@cineflix.com")
                .password(defaultPassword)
                .nickname("팝콘마스터")
                .role(Role.ROLE_USER)
                .build();

        Member user4 = Member.builder()
                .email("critic_kim@cineflix.com")
                .password(defaultPassword)
                .nickname("방구석평론가")
                .role(Role.ROLE_USER)
                .build();

        memberRepository.saveAll(List.of(admin, user1, user2, user3, user4));
        log.info("[DummyData] 회원 더미 데이터 5건 생성 완료!");
    }

    private void initReviews() {
        if (reviewRepository.count() > 0) {
            log.info("[DummyData] 리뷰 데이터가 이미 존재하여 초기화를 건너뜁니다.");
            return;
        }

        log.info("[DummyData] 영화 리뷰 더미 데이터 생성을 시작합니다.");

        List<Review> dummyReviews = List.of(
                // 인사이드 아웃 2 (TMDB ID: 1022789)
                Review.builder()
                        .tmdbMovieId(1022789L)
                        .author("시네필박")
                        .rating(5.0)
                        .content("불안이 캐릭터에 너무 공감돼서 눈물이 났습니다. 사춘기와 청년기를 지나온 모두를 따뜻하게 위로해주는 명작!")
                        .build(),
                Review.builder()
                        .tmdbMovieId(1022789L)
                        .author("영화보는고양이")
                        .rating(4.5)
                        .content("픽사의 마법이 다시 한번 빛을 발한 순간. 아이들과 함께 갔다가 어른들이 더 감동받고 나왔어요.")
                        .build(),

                // 와일드 로봇 (TMDB ID: 1184918)
                Review.builder()
                        .tmdbMovieId(1184918L)
                        .author("방구석평론가")
                        .rating(5.0)
                        .content("올해 본 감성 애니메이션 중 단연 으뜸입니다. 압도적인 영상미와 야생과 로봇이라는 훈훈한 감동 서사!")
                        .build(),
                Review.builder()
                        .tmdbMovieId(1184918L)
                        .author("팝콘마스터")
                        .rating(4.5)
                        .content("음악과 컷 연출이 예술입니다. 포스터만 보고 기대 안 했는데 인생작 갱신했네요.")
                        .build(),

                // 수퍼 소닉 3 (TMDB ID: 939243)
                Review.builder()
                        .tmdbMovieId(939243L)
                        .author("팝콘마스터")
                        .rating(4.0)
                        .content("섀도우 캐릭터의 압도적인 존재감! 액션 쾌감이 장난 아닙니다. 시원하게 볼 수 있는 오락 영화.")
                        .build(),

                // 파이트 클럽 (TMDB ID: 550)
                Review.builder()
                        .tmdbMovieId(550L)
                        .author("방구석평론가")
                        .rating(5.0)
                        .content("몇 번을 다시 봐도 소름 돋는 브래드 피트와 에드워드 노턴의 명연기. 현대 사회에 던지는 메시지가 강렬합니다.")
                        .build(),

                // 인터스텔라 (TMDB ID: 157336)
                Review.builder()
                        .tmdbMovieId(157336L)
                        .author("시네필박")
                        .rating(5.0)
                        .content("한스 짐머의 웅장한 OST와 크리스토퍼 놀란의 우주 상상력이 결합된 경이로운 경험.")
                        .build()
        );

        reviewRepository.saveAll(dummyReviews);
        log.info("[DummyData] 영화 리뷰 더미 데이터 {}건 생성 완료!", dummyReviews.size());
    }

    private void initPosts() {
        if (postRepository.count() > 0) {
            log.info("[DummyData] 게시글 데이터가 이미 존재하여 초기화를 건너뜁니다.");
            return;
        }

        log.info("[DummyData] 자유 게시판 더미 데이터 생성을 시작합니다.");

        List<Post> dummyPosts = List.of(
                Post.builder()
                        .title("🎬 2026년 하반기 극장에서 꼭 봐야 할 기대작 모음!")
                        .content("안녕하세요 시네플릭스 유저 여러분!\n\n올 하반기 극장가를 뜨겁게 달굴 블록버스터 및 감성 애니메이션 라인업을 공유합니다.\n여러분은 어떤 영화를 가장 기대하고 계신가요? 댓글로 공유해 주세요!")
                        .author("시네플릭스 관리자")
                        .build(),
                Post.builder()
                        .title("🍿 IMAX vs 돌비 시네마, 다들 어떤 관람관을 더 선호하시나요?")
                        .content("사운드와 선명한 컬러감은 돌비 시네마가 최고인 것 같고, 화면 비율에서 오는 압도감은 역시 IMAX 같네요.\n이번 대작 신작은 돌비관 예매 성공해서 가보려 합니다!")
                        .author("팝콘마스터")
                        .build(),
                Post.builder()
                        .title("💡 인생 영화 TOP 5 공유합니다 (추천 댓글 환영!)")
                        .content("1. 쇼생크 탈출\n2. 인터스텔라\n3. 라라랜드\n4. 센과 치히로의 행방불명\n5. 기생충\n\n다들 여러분 인생의 1위 영화는 무엇인가요?")
                        .author("시네필박")
                        .build(),
                Post.builder()
                        .title("📢 영화 관람 후 별점 및 솔직 리뷰 작성 이벤트 안내")
                        .content("시네플릭스 영화 상세 페이지에서 본인만의 별점과 한줄평을 남겨주시면 추첨을 통해 영화 관람권 및 메가박스/CGV 콤보 쿠폰을 증정해 드립니다!")
                        .author("시네플릭스 관리자")
                        .build()
        );

        postRepository.saveAll(dummyPosts);
        log.info("[DummyData] 자유 게시판 더미 데이터 {}건 생성 완료!", dummyPosts.size());
    }
}
