import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MovieCard from './components/MovieCard';
import MovieDetailModal from './components/MovieDetailModal';
import WishlistDrawer from './components/WishlistDrawer';
import AuthModal from './components/AuthModal';
import TopRatedCategorySection from './components/TopRatedCategorySection';
import MovieNewsSection from './components/MovieNewsSection';

export default function App() {
  const [popularMovies, setPopularMovies] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [viewMode, setViewMode] = useState('home'); // 'home' | 'news' | 'search'
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [wishlists, setWishlists] = useState([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sliderPage, setSliderPage] = useState(0);

  useEffect(() => {
    // Check saved user token
    const savedUser = localStorage.getItem('cineflix_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('cineflix_user');
      }
    }

    fetchPopularMovies();
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const fetchPopularMovies = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/movies/popular');
      if (res.ok) {
        const data = await res.json();
        setPopularMovies(Array.isArray(data.results) ? data.results : []);
      }
    } catch (err) {
      console.error('Failed to fetch popular movies:', err);
    } finally {
      setLoading(false);
    }
  };

  const getUserIdentifier = () => {
    return user ? user.email : 'guest_user';
  };

  const fetchWishlist = async () => {
    const userIdentifier = getUserIdentifier();
    try {
      const res = await fetch(`/api/wishlists?userIdentifier=${encodeURIComponent(userIdentifier)}`);
      if (res.ok) {
        const data = await res.json();
        setWishlists(Array.isArray(data) ? data : (data.content || []));
      }
    } catch (err) {
      console.error('Failed to fetch wishlists:', err);
      setWishlists([]);
    }
  };

  const handleToggleWishlist = async (movie) => {
    const userIdentifier = getUserIdentifier();
    const list = Array.isArray(wishlists) ? wishlists : [];
    const existing = list.find((w) => w.tmdbMovieId === movie.id);

    if (existing) {
      try {
        const res = await fetch(`/api/wishlists?userIdentifier=${encodeURIComponent(userIdentifier)}&movieId=${movie.id}`, { method: 'DELETE' });
        if (res.ok) fetchWishlist();
      } catch (err) {
        console.error('Failed to remove wishlist:', err);
      }
    } else {
      const posterPath = movie.poster_path || '';
      try {
        const res = await fetch('/api/wishlists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userIdentifier,
            tmdbMovieId: movie.id,
            movieTitle: movie.title,
            posterPath
          })
        });
        if (res.ok) fetchWishlist();
      } catch (err) {
        console.error('Failed to add wishlist:', err);
      }
    }
  };

  const handleRemoveWishlist = async (wishlistId) => {
    const userIdentifier = getUserIdentifier();
    const list = Array.isArray(wishlists) ? wishlists : [];
    const target = list.find(w => w.id === wishlistId);
    
    try {
      if (target) {
        const res = await fetch(`/api/wishlists?userIdentifier=${encodeURIComponent(userIdentifier)}&movieId=${target.tmdbMovieId}`, { method: 'DELETE' });
        if (res.ok) fetchWishlist();
      }
    } catch (err) {
      console.error('Failed to remove wishlist:', err);
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setActiveQuery(searchQuery);
    setViewMode('search');

    try {
      const res = await fetch(`/api/movies/search?query=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(Array.isArray(data.results) ? data.results : []);
      }
    } catch (err) {
      console.error('Failed to search movies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoHome = () => {
    setViewMode('home');
    setSearchQuery('');
    setActiveQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoNews = () => {
    setViewMode('news');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('cineflix_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('cineflix_user');
  };

  const itemsPerPage = 5;
  const totalPages = Math.ceil(popularMovies.length / itemsPerPage) || 1;
  const startIndex = sliderPage * itemsPerPage;
  const currentSlideMovies = popularMovies.slice(startIndex, startIndex + itemsPerPage);

  const displayMovies = viewMode === 'home' ? currentSlideMovies : searchResults;

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
        onGoHome={handleGoHome}
        onGoNews={handleGoNews}
        viewMode={viewMode}
        wishlistCount={safeWishlists.length}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      <div className="container" style={{ paddingTop: '35px' }}>
        {viewMode === 'news' ? (
          <div style={{ paddingTop: '10px' }}>
            <MovieNewsSection />
          </div>
        ) : (
          <>
            <div className="section-header">
              {viewMode === 'home' ? (
                <>
                  <h2>🏆 박스오피스 순위 (예매율순)</h2>
                  <div className="slider-controls">
                    <div className="slider-tab-group">
                      <button
                        className={`slider-tab ${sliderPage === 0 ? 'active' : ''}`}
                        onClick={() => setSliderPage(0)}
                      >
                        🥇 1위 ~ 5위
                      </button>
                      <button
                        className={`slider-tab ${sliderPage === 1 ? 'active' : ''}`}
                        onClick={() => setSliderPage(1)}
                      >
                        🍿 6위 ~ 10위
                      </button>
                    </div>
                    <button
                      className="slider-btn"
                      onClick={() => setSliderPage((prev) => Math.max(0, prev - 1))}
                      disabled={sliderPage === 0}
                      title="이전 5개 영화"
                    >
                      ◀
                    </button>
                    <button
                      className="slider-btn"
                      onClick={() => setSliderPage((prev) => Math.min(totalPages - 1, prev + 1))}
                      disabled={sliderPage >= totalPages - 1}
                      title="다음 5개 영화"
                    >
                      ▶
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <h2>🔍 '{activeQuery}' 검색 결과 ({searchResults.length}건)</h2>
                  <button
                    className="btn-primary"
                    onClick={handleGoHome}
                    style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid var(--border-color)' }}
                  >
                    ⬅️ 인기 차트로 돌아가기
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
                🎬 영화 데이터를 불러오는 중입니다...
              </div>
            ) : displayMovies.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
                검색 결과가 없습니다. 다른 키워드로 검색해 보세요.
              </div>
            ) : (
              <div className={viewMode === 'home' ? "movie-grid-5" : "movie-grid"} key={viewMode === 'home' ? sliderPage : 'search'}>
                {displayMovies.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onSelectMovie={setSelectedMovie}
                    isWishlisted={safeWishlists.some((w) => w.tmdbMovieId === movie.id)}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
              </div>
            )}

            {/* Top Rated Genre Category Section */}
            {viewMode === 'home' && (
              <TopRatedCategorySection
                onMovieClick={setSelectedMovie}
                wishlistMap={wishlistMap}
                onToggleWishlist={handleToggleWishlist}
              />
            )}
          </>
        )}
      </div>

      {selectedMovie && (
        <MovieDetailModal
          movie={selectedMovie}
          user={user}
          onClose={() => setSelectedMovie(null)}
        />
      )}

      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlists={safeWishlists}
        onRemoveWishlist={handleRemoveWishlist}
        onSelectMovie={setSelectedMovie}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
