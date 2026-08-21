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

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => navigate('/mypage')}
              style={{
                background: location.pathname === '/mypage' ? 'rgba(255, 193, 7, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                color: 'var(--accent-gold)',
                border: '1px solid rgba(255, 193, 7, 0.3)',
                padding: '7px 14px',
                borderRadius: '20px',
                fontWeight: '700',
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>👤</span>
              <span>{user.nickname}님</span>
            </button>
            <button
              onClick={onLogout}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#AAA',
                padding: '7px 12px',
                borderRadius: '20px',
                fontSize: '0.82rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              🚪 로그아웃
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="btn-wishlist"
              onClick={() => navigate('/login')}
              style={{
                padding: '8px 14px',
                fontSize: '0.88rem',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#E2E8F0',
                fontWeight: '700',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}
            >
              🔑 로그인
            </button>
            <button
              className="btn-primary"
              onClick={() => navigate('/signup')}
              style={{
                padding: '8px 16px',
                fontSize: '0.88rem',
                fontWeight: '800',
                borderRadius: '20px'
              }}
            >
              ✨ 회원가입
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
