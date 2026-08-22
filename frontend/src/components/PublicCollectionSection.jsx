import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../config/api';
import CollectionDetailModal from './CollectionDetailModal';

export default function PublicCollectionSection({ user, onSelectMovie }) {
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creatingCollection, setCreatingCollection] = useState(false);

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

  const handleOpenCreateModal = () => {
    if (!user) {
      if (window.confirm('나만의 영화 컬렉션 만들기 기능은 로그인 후 이용하실 수 있습니다.\n로그인 페이지로 이동하시겠습니까?')) {
        navigate('/login');
      }
      return;
    }
    setShowCreateModal(true);
  };

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setCreatingCollection(true);
    try {
      const res = await fetch(apiUrl('/api/playlists'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIdentifier: user.nickname,
          title: newTitle.trim(),
          description: newDesc.trim(),
          isPublic: true,
          public: true
        })
      });

      if (res.ok) {
        setNewTitle('');
        setNewDesc('');
        setShowCreateModal(false);
        fetchPublicCollections();
      }
    } catch (err) {
      console.error('Failed to create collection:', err);
    } finally {
      setCreatingCollection(false);
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
        <div>
          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            margin: '0 0 4px 0'
          }}>
            <span>✨</span>
            <span>테마별 추천 영화 컬렉션</span>
          </h2>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            유저들이 직접 큐레이션한 명작 리스트
          </span>
        </div>

        <button
          onClick={handleOpenCreateModal}
          style={{
            background: 'linear-gradient(135deg, #FFB800, #FF8C00)',
            color: '#000',
            border: 'none',
            padding: '10px 22px',
            borderRadius: '14px',
            fontWeight: '800',
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(255, 184, 0, 0.35)',
            transition: 'all 0.2s ease'
          }}
        >
          <span>➕</span>
          <span>나만의 컬렉션 만들기</span>
        </button>
      </div>

      {/* Create Collection Modal */}
      {showCreateModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
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
              maxWidth: '520px',
              borderRadius: '24px',
              padding: '30px',
              background: 'rgba(20, 20, 30, 0.98)',
              border: '1px solid rgba(255, 193, 7, 0.4)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📁</span>
                <span>새 영화 컬렉션 만들기</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', color: '#888', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCollection}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '700', color: '#E2E8F0', marginBottom: '8px' }}>
                  컬렉션 제목 <span style={{ color: '#e50914' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="예: 비 오는 날 보고 싶은 감성 영화 명작선"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '700', color: '#E2E8F0', marginBottom: '8px' }}>
                  컬렉션 소개 및 설명 (선택)
                </label>
                <textarea
                  placeholder="이 컬렉션에 대한 짧은 소개나 추천 이유를 적어보세요..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '0.95rem',
                    resize: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#CCC',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '12px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={creatingCollection}
                  className="btn-primary"
                  style={{ padding: '10px 24px', fontWeight: '800' }}
                >
                  {creatingCollection ? '생성 중...' : '✓ 컬렉션 생성'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&auto=format&fit=crop';
                            }}
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
