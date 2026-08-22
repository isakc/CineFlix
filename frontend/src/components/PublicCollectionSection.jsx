import React, { useState, useEffect } from 'react';
import { apiUrl } from '../config/api';
import CollectionDetailModal from './CollectionDetailModal';

export default function PublicCollectionSection({ onSelectMovie }) {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState(null);

  useEffect(() => {
    fetchPublicCollections();
  }, []);

  const fetchPublicCollections = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/playlists/public'));
      if (res.ok) {
        const data = await res.json();
        setCollections(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch public collections:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!loading && collections.length === 0) {
    return null;
  }

  return (
    <section style={{ marginTop: '50px', marginBottom: '60px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '22px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <h2 style={{
          fontSize: '1.8rem',
          fontWeight: '800',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          margin: 0
        }}>
          <span>✨</span>
          <span>테마별 추천 영화 컬렉션</span>
        </h2>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          유저들이 직접 큐레이션한 명작 리스트
        </span>
      </div>

      {loading ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card-skeleton" style={{ height: '260px', borderRadius: '20px' }} />
          ))}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '22px'
        }}>
          {collections.map((col) => {
            const items = Array.isArray(col.items) ? col.items : [];
            const previewItems = items.slice(0, 4);

            return (
              <div
                key={col.id}
                onClick={() => setSelectedCollection(col)}
                className="glass"
                style={{
                  borderRadius: '20px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.borderColor = 'var(--accent-gold)';
                  e.currentTarget.style.boxShadow = '0 16px 36px rgba(0, 0, 0, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Poster Preview Mosaic */}
                <div style={{
                  height: '140px',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  background: 'rgba(0, 0, 0, 0.5)',
                  display: 'grid',
                  gridTemplateColumns: previewItems.length > 0 ? `repeat(${Math.max(previewItems.length, 3)}, 1fr)` : '1fr',
                  gap: '4px',
                  padding: '4px'
                }}>
                  {previewItems.length === 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '0.85rem' }}>
                      영화 미등록
                    </div>
                  ) : (
                    previewItems.map((item, idx) => {
                      const rawPoster = item.posterPath || item.poster_path;
                      const thumbUrl = (rawPoster && typeof rawPoster === 'string' && rawPoster.length > 3)
                        ? (rawPoster.startsWith('http') ? rawPoster : `https://image.tmdb.org/t/p/w300${rawPoster.startsWith('/') ? rawPoster : '/' + rawPoster}`)
                        : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&auto=format&fit=crop';

                      return (
                        <div key={idx} style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '8px', overflow: 'hidden' }}>
                          <img
                            src={thumbUrl}
                            alt={item.movieTitle || '영화 포스터'}
                            loading="lazy"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Collection Meta Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        color: 'var(--accent-gold)',
                        fontWeight: '800',
                        background: 'rgba(255, 193, 7, 0.12)',
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}>
                        👤 {col.userIdentifier || '큐레이터'}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '700' }}>
                        🎞️ {items.length}개 작품
                      </span>
                    </div>

                    <h3 style={{
                      fontSize: '1.08rem',
                      fontWeight: '800',
                      color: '#FFF',
                      margin: '0 0 6px 0',
                      lineHeight: '1.4',
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {col.title}
                    </h3>

                    {col.description && (
                      <p style={{
                        fontSize: '0.84rem',
                        color: 'var(--text-secondary)',
                        margin: 0,
                        lineHeight: '1.4',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {col.description}
                      </p>
                    )}
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    color: 'var(--accent-gold)',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    gap: '4px',
                    paddingTop: '6px'
                  }}>
                    <span>컬렉션 보기</span>
                    <span>➔</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Collection Full View Modal */}
      {selectedCollection && (
        <CollectionDetailModal
          collection={selectedCollection}
          onClose={() => setSelectedCollection(null)}
          onSelectMovie={onSelectMovie}
        />
      )}
    </section>
  );
}
