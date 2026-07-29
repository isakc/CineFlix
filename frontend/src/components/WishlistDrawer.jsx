import React from 'react';

export default function WishlistDrawer({ isOpen, onClose, wishlists, onRemoveWishlist, onSelectMovie }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card glass" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <button className="btn-close" onClick={onClose}>×</button>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '20px' }}>
          ❤️ 내가 담은 위시리스트 ({wishlists.length})
        </h2>

        {wishlists.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
            아직 위시리스트에 담은 영화가 없습니다.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '60vh', overflowY: 'auto' }}>
            {wishlists.map((w) => (
              <div
                key={w.id || w.tmdbMovieId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '12px 18px',
                  borderRadius: '14px',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  onSelectMovie({ id: w.tmdbMovieId, title: w.movieTitle, poster_path: w.posterPath });
                  onClose();
                }}
              >
                <img
                  src={w.posterPath ? (w.posterPath.startsWith('http') ? w.posterPath : `https://image.tmdb.org/t/p/w200${w.posterPath}`) : 'https://via.placeholder.com/100'}
                  alt={w.movieTitle}
                  style={{ width: '50px', height: '70px', borderRadius: '8px', objectFit: 'cover' }}
                />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{w.movieTitle}</h4>
                </div>
                <button
                  className="btn-close"
                  style={{ position: 'relative', top: '0', right: '0', background: 'rgba(229, 9, 20, 0.2)' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveWishlist(w.tmdbMovieId);
                  }}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
