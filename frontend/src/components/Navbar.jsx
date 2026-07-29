import React from 'react';

export default function Navbar({
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  onGoHome,
  onGoNews,
  viewMode,
  wishlistCount,
  onOpenWishlist,
  user,
  onOpenAuth,
  onLogout
}) {
  return (
    <nav className="navbar">
      <div className="nav-brand" onClick={onGoHome} style={{ cursor: 'pointer' }}>
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
          className={`btn-wishlist ${viewMode === 'news' ? 'active' : ''}`}
          onClick={onGoNews}
          style={{
            background: viewMode === 'news' ? 'var(--accent-gold)' : 'rgba(255, 255, 255, 0.05)',
            color: viewMode === 'news' ? '#000' : '#FFF',
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
