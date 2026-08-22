import React from 'react';

export default function CollectionDetailModal({ collection, onClose, onSelectMovie }) {
  if (!collection) return null;

  const items = Array.isArray(collection.items) ? collection.items : [];

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1400,
        padding: '20px'
      }}
    >
      <div
        className="glass"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '850px',
          maxHeight: '90vh',
          borderRadius: '24px',
          padding: '30px',
          overflowY: 'auto',
          background: 'rgba(15, 15, 22, 0.96)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '18px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span style={{
                background: 'rgba(255, 193, 7, 0.15)',
                color: 'var(--accent-gold)',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: '800'
              }}>
                📁 영화 컬렉션
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                작성자: <strong style={{ color: '#FFF' }}>{collection.userIdentifier}</strong>
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                총 <strong style={{ color: 'var(--accent-gold)' }}>{items.length}</strong>개 작품
              </span>
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '0 0 6px 0', color: '#FFF' }}>
              {collection.title}
            </h2>

            {collection.description && (
              <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                {collection.description}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: '#FFF',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              fontSize: '1.1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
          >
            ✕
          </button>
        </div>

        {/* Movie Grid */}
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
            컬렉션에 등록된 영화가 아직 없습니다.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '16px'
          }}>
            {items.map((movie) => {
              const rawPoster = movie.posterPath || movie.poster_path;
              const thumbUrl = (rawPoster && typeof rawPoster === 'string' && rawPoster.length > 3)
                ? (rawPoster.startsWith('http') ? rawPoster : `https://image.tmdb.org/t/p/w500${rawPoster.startsWith('/') ? rawPoster : '/' + rawPoster}`)
                : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop';

              return (
                <div
                  key={movie.id || movie.tmdbMovieId}
                  onClick={() => {
                    onClose();
                    if (onSelectMovie) {
                      onSelectMovie({ id: movie.tmdbMovieId || movie.id, title: movie.movieTitle || movie.title });
                    }
                  }}
                  className="glass"
                  style={{
                    borderRadius: '14px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    transition: 'all 0.25s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'rgba(255, 255, 255, 0.03)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
                    e.currentTarget.style.borderColor = 'var(--accent-gold)';
                    e.currentTarget.style.boxShadow = '0 10px 24px rgba(0, 0, 0, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ position: 'relative', paddingTop: '145%', background: '#000', overflow: 'hidden' }}>
                    <img
                      src={thumbUrl}
                      alt={movie.movieTitle || movie.title}
                      loading="lazy"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                  <div style={{ padding: '10px 12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{
                      fontSize: '0.88rem',
                      fontWeight: '700',
                      color: '#FFF',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {movie.movieTitle || movie.title}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
