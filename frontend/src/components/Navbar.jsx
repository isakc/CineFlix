import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar({
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  wishlistCount,
  onOpenWishlist,
  onOpenPlaylist,
  user,
  onOpenAuth,
  onLogout
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoHome = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoNews = () => {
    navigate('/news');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="navbar">
      <div className="nav-brand" onClick={handleGoHome} style={{ cursor: 'pointer' }}>
        🎬 Cine<span>Flix</span>
      </div>

      <form className="nav-search" onSubmit={onSearchSubmit}>
        <span>🔍</span>
        <input
          type="text"
          placeholder="영화 제목 검색 후 Enter..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>

      <div className="nav-actions">
        <button
          className="btn-wishlist"
          onClick={onOpenPlaylist}
          style={{
            background: 'rgba(255, 193, 7, 0.12)',
            color: 'var(--accent-gold)',
            borderColor: 'var(--accent-gold)',
            fontWeight: '700'
          }}
        >
          🎬 영화 리스트
        </button>

        <button
          className={`btn-wishlist ${location.pathname === '/news' ? 'active' : ''}`}
          onClick={handleGoNews}
          style={{
            background: location.pathname === '/news' ? 'var(--accent-gold)' : 'rgba(255, 255, 255, 0.05)',
            color: location.pathname === '/news' ? '#000' : '#FFF',
            fontWeight: '700'
          }}
        >
          📰 영화 뉴스
        </button>

        <button className="btn-wishlist" onClick={onOpenWishlist}>
          ❤️ 위시리스트 ({wishlistCount})
        </button>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontWeight: '700', color: 'var(--accent-gold)' }}>
              👤 {user.nickname}님
            </span>
            <button
              onClick={onLogout}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#AAA',
                padding: '8px 14px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              🚪 로그아웃
            </button>
          </div>
        ) : (
          <button className="btn-primary" onClick={onOpenAuth} style={{ padding: '8px 18px', fontSize: '0.9rem' }}>
            🔑 로그인 / 가입
          </button>
        )}
      </div>
    </nav>
  );
}
