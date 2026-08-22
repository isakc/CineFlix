import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import MovieCard from "./components/MovieCard";
import WishlistDrawer from "./components/WishlistDrawer";
import AuthModal from "./components/AuthModal";
import TopRatedCategorySection from "./components/TopRatedCategorySection";
import PublicCollectionSection from "./components/PublicCollectionSection";
import PlaylistModal from "./components/PlaylistModal";
import MovieDetailPage from "./pages/MovieDetailPage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import MyPage from "./pages/MyPage";
import { apiUrl } from "./config/api";

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const [popularMovies, setPopularMovies] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [viewMode, setViewMode] = useState("home"); // 'home' | 'search'
  const [wishlists, setWishlists] = useState([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("cineflix_user");
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        localStorage.removeItem("cineflix_user");
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(true);
  const [sliderPage, setSliderPage] = useState(0);

  useEffect(() => {
    fetchPopularMovies();
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const getUserIdentifier = () => {
    if (user && user.nickname) {
      return user.nickname;
    }
    return null;
  };

  const fetchPopularMovies = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/movies/popular"));
      if (res.ok) {
        const data = await res.json();
        setPopularMovies(Array.isArray(data.results) ? data.results : []);
      }
    } catch (err) {
      console.error("Failed to fetch rankings:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    if (!user || !user.nickname) {
      setWishlists([]);
      return;
    }
    try {
      const userIdentifier = user.nickname;
      const res = await fetch(
        apiUrl(`/api/wishlists?userIdentifier=${encodeURIComponent(userIdentifier)}`),
      );
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.content || []);
        setWishlists(list);
      }
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
    }
  };

  const handleToggleWishlist = async (movie) => {
    if (!movie || !movie.id) return;
    if (!user) {
      if (window.confirm("위시리스트 찜 기능은 로그인 후 이용하실 수 있습니다.\n로그인 페이지로 이동하시겠습니까?")) {
        navigate("/login");
      }
      return;
    }
    const userIdentifier = user.nickname;
    const movieIdNum = Number(movie.id);
    const isWishlisted = safeWishlists.some((w) => Number(w.tmdbMovieId) === movieIdNum);

    if (isWishlisted) {
      const target = safeWishlists.find((w) => Number(w.tmdbMovieId) === movieIdNum);
      // Optimistic update: instantly remove so heart turns white immediately
      setWishlists((prev) => prev.filter((w) => Number(w.tmdbMovieId) !== movieIdNum));

      try {
        if (target && target.id) {
          await fetch(apiUrl(`/api/wishlists/${target.id}`), { method: "DELETE" });
        } else {
          await fetch(
            apiUrl(`/api/wishlists?userIdentifier=${encodeURIComponent(userIdentifier)}&movieId=${movieIdNum}`),
            { method: "DELETE" },
          );
        }
        fetchWishlist();
      } catch (err) {
        console.error("Failed to remove wishlist:", err);
        fetchWishlist();
      }
    } else {
      const cleanTitle = (movie.title || "").replace(/^([🥇🥈🥉]|\d+위|\s|\.)+/g, "").trim();
      const rawPoster = movie.poster_path || movie.posterPath || "";
      const tempItem = {
        id: Date.now(),
        userIdentifier,
        tmdbMovieId: movieIdNum,
        movieTitle: cleanTitle,
        posterPath: rawPoster,
      };
      // Optimistic update: instantly add so heart turns red with 0ms delay!
      setWishlists((prev) => [tempItem, ...prev]);

      const payload = {
        userIdentifier,
        tmdbMovieId: movieIdNum,
        movieTitle: cleanTitle,
        posterPath: rawPoster,
      };

      try {
        const res = await fetch(apiUrl("/api/wishlists"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          fetchWishlist();
        }
      } catch (err) {
        console.error("Failed to add wishlist:", err);
        fetchWishlist();
      }
    }
  };

  const handleRemoveWishlist = async (id) => {
    try {
      const res = await fetch(apiUrl(`/api/wishlists/${id}`), {
        method: "DELETE",
      });
      if (res.ok) {
        fetchWishlist();
      }
    } catch (err) {
      console.error("Failed to remove wishlist:", err);
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setActiveQuery(searchQuery);
    setViewMode("search");

    if (location.pathname !== "/") {
      navigate("/");
    }

    try {
      const res = await fetch(
        apiUrl(`/api/movies/search?query=${encodeURIComponent(searchQuery)}`),
      );
      if (res.ok) {
        const data = await res.json();
        setSearchResults(Array.isArray(data.results) ? data.results : []);
      }
    } catch (err) {
      console.error("Failed to search movies:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoHome = () => {
    setViewMode("home");
    setSearchQuery("");
    setActiveQuery("");
    navigate("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectMovie = (movie) => {
    if (movie && movie.id) {
      navigate(`/movie/${movie.id}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem("cineflix_user", JSON.stringify(userData));
    setIsAuthOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("cineflix_user");
  };

  const itemsPerPage = 5;
  const totalPages = Math.ceil(popularMovies.length / itemsPerPage) || 1;
  const startIndex = sliderPage * itemsPerPage;
  const currentSlideMovies = popularMovies.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const displayMovies =
    viewMode === "home" ? currentSlideMovies : searchResults;

  const safeWishlists = Array.isArray(wishlists) ? wishlists : [];
  const wishlistMap = safeWishlists.reduce((acc, curr) => {
    if (curr && curr.tmdbMovieId) acc[curr.tmdbMovieId] = true;
    return acc;
  }, {});

  return (
    <div className="app">
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        wishlistCount={safeWishlists.length}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenPlaylist={() => {
          if (!user) {
            if (window.confirm("영화 리스트 기능은 로그인 후 이용하실 수 있습니다.\n로그인 페이지로 이동하시겠습니까?")) {
              navigate("/login");
            }
            return;
          }
          setIsPlaylistOpen(true);
        }}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      <Routes>
        <Route
          path="/"
          element={
            <div className="container" style={{ paddingTop: "35px" }}>
              <div className="section-header">
                {viewMode === "home" ? (
                  <>
                    <h2>🏆 박스오피스 순위</h2>
                    <div className="slider-controls">
                      <div className="slider-tab-group">
                        <button
                          className={`slider-tab ${sliderPage === 0 ? "active" : ""}`}
                          onClick={() => setSliderPage(0)}
                        >
                          🥇 1위 ~ 5위
                        </button>
                        <button
                          className={`slider-tab ${sliderPage === 1 ? "active" : ""}`}
                          onClick={() => setSliderPage(1)}
                        >
                          🍿 6위 ~ 10위
                        </button>
                      </div>
                      <button
                        className="slider-btn"
                        onClick={() =>
                          setSliderPage((prev) => Math.max(0, prev - 1))
                        }
                        disabled={sliderPage === 0}
                        title="이전 5개 영화"
                      >
                        ◀
                      </button>
                      <button
                        className="slider-btn"
                        onClick={() =>
                          setSliderPage((prev) =>
                            Math.min(totalPages - 1, prev + 1),
                          )
                        }
                        disabled={sliderPage >= totalPages - 1}
                        title="다음 5개 영화"
                      >
                        ▶
                      </button>
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <h2>
                      🔍 '{activeQuery}' 검색 결과 ({searchResults.length}건)
                    </h2>
                    <button
                      className="btn-primary"
                      onClick={handleGoHome}
                      style={{
                        background: "rgba(255, 255, 255, 0.1)",
                        border: "1px solid var(--border-color)",
                      }}
                    >
                      ⬅️ 인기 차트로 돌아가기
                    </button>
                  </div>
                )}
              </div>

              {loading ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "60px",
                    color: "var(--text-secondary)",
                    fontSize: "1.2rem",
                  }}
                >
                  🎬 영화 데이터를 불러오는 중입니다...
                </div>
              ) : displayMovies.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "60px",
                    color: "var(--text-secondary)",
                  }}
                >
                  검색 결과가 없습니다. 다른 키워드로 검색해 보세요.
                </div>
              ) : (
                <div
                  className={viewMode === "home" ? "movie-grid-5" : "movie-grid"}
                  key={viewMode === "home" ? sliderPage : "search"}
                >
                  {displayMovies.map((movie, idx) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      rank={viewMode === "home" ? startIndex + idx + 1 : null}
                      onSelectMovie={handleSelectMovie}
                      isWishlisted={safeWishlists.some(
                        (w) => w.tmdbMovieId === movie.id,
                      )}
                      onToggleWishlist={handleToggleWishlist}
                    />
                  ))}
                </div>
              )}

              {/* Top Rated Genre Category Section */}
              {viewMode === "home" && (
                <>
                  <TopRatedCategorySection
                    onMovieClick={handleSelectMovie}
                    wishlistMap={wishlistMap}
                    onToggleWishlist={handleToggleWishlist}
                  />

                  {/* Public Cinema Collections List Section */}
                  <PublicCollectionSection
                    onSelectMovie={handleSelectMovie}
                  />
                </>
              )}
            </div>
          }
        />

        <Route
          path="/movie/:id"
          element={
            <MovieDetailPage
              user={user}
              userIdentifier={getUserIdentifier()}
              onOpenAuth={() => setIsAuthOpen(true)}
            />
          }
        />

        <Route
          path="/signup"
          element={<SignupPage onAuthSuccess={handleAuthSuccess} />}
        />

        <Route
          path="/login"
          element={<LoginPage onAuthSuccess={handleAuthSuccess} />}
        />

        <Route
          path="/mypage"
          element={
            <MyPage
              user={user}
              onUpdateUser={handleAuthSuccess}
              onLogout={handleLogout}
              userIdentifier={getUserIdentifier()}
              onSelectMovie={handleSelectMovie}
            />
          }
        />
      </Routes>

      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlists={safeWishlists}
        onRemoveWishlist={handleRemoveWishlist}
        onSelectMovie={handleSelectMovie}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <PlaylistModal
        isOpen={isPlaylistOpen}
        onClose={() => setIsPlaylistOpen(false)}
        userIdentifier={getUserIdentifier()}
        user={user}
        onMovieClick={handleSelectMovie}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
