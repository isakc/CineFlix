import React, { useState, useEffect } from 'react';
import { apiUrl } from '../config/api';

export default function PlaylistModal({
  isOpen,
  onClose,
  userIdentifier,
  user,
  onMovieClick
}) {
  const [activeTab, setActiveTab] = useState('public'); // 'public' | 'my' | 'create'
  const [publicPlaylists, setPublicPlaylists] = useState([]);
  const [myPlaylists, setMyPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form State for Create
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPublicPlaylists();
      fetchMyPlaylists();
    }
  }, [isOpen, userIdentifier]);

  const fetchPublicPlaylists = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/playlists/public'));
      if (res.ok) {
        const data = await res.json();
        setPublicPlaylists(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch public playlists:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyPlaylists = async () => {
    if (!userIdentifier) return;
    try {
      const res = await fetch(apiUrl(`/api/playlists/user?userIdentifier=${encodeURIComponent(userIdentifier)}`));
      if (res.ok) {
        const data = await res.json();
        setMyPlaylists(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch user playlists:', err);
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setCreating(true);
    try {
      const res = await fetch(apiUrl('/api/playlists'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIdentifier: userIdentifier || 'guest',
          title: newTitle.trim(),
          description: newDescription.trim(),
          isPublic
        })
      });

      if (res.ok) {
        setNewTitle('');
        setNewDescription('');
        setIsPublic(true);
        await fetchMyPlaylists();
        await fetchPublicPlaylists();
        setActiveTab('my');
      }
    } catch (err) {
      console.error('Failed to create playlist:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    if (!window.confirm('정말로 이 플레이리스트를 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(apiUrl(`/api/playlists/${playlistId}?userIdentifier=${encodeURIComponent(userIdentifier)}`), {
        method: 'DELETE'
      });
      if (res.ok) {
        if (selectedPlaylist && selectedPlaylist.id === playlistId) {
          setSelectedPlaylist(null);
        }
        fetchMyPlaylists();
        fetchPublicPlaylists();
      }
    } catch (err) {
      console.error('Failed to delete playlist:', err);
    }
  };

  const handleRemoveMovieFromPlaylist = async (playlistId, tmdbMovieId) => {
    try {
      const res = await fetch(apiUrl(`/api/playlists/${playlistId}/movies/${tmdbMovieId}`), {
        method: 'DELETE'
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedPlaylist(updated);
        fetchMyPlaylists();
        fetchPublicPlaylists();
      }
    } catch (err) {
      console.error('Failed to remove movie from playlist:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div
        className="modal-card glass"
        style={{
          maxWidth: '860px',
          width: '92%',
          maxHeight: '88vh',
          overflowY: 'auto',
          padding: '28px',
          borderRadius: '20px'
        }}
      >
        {/* Header & Close */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.8rem' }}>🎵</span>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                나만의 시네마 리스트 (Movie Playlist)
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
                취향 저격 테마 컬렉션을 만들고 다른 사람들과 멋진 영화 리스트를 공유해보세요!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: '#fff',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              fontSize: '1.2rem',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
          <button
            onClick={() => { setActiveTab('public'); setSelectedPlaylist(null); }}
            style={{
              background: activeTab === 'public' ? 'var(--accent-red)' : 'rgba(255,255,255,0.06)',
              color: '#fff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '20px',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            🌍 모두의 시네마 리스트 ({publicPlaylists.length})
          </button>
          <button
            onClick={() => { setActiveTab('my'); setSelectedPlaylist(null); }}
            style={{
              background: activeTab === 'my' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.06)',
              color: activeTab === 'my' ? '#000' : '#fff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '20px',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            👤 내가 만든 리스트 ({myPlaylists.length})
          </button>
          <button
            onClick={() => { setActiveTab('create'); setSelectedPlaylist(null); }}
            style={{
              background: activeTab === 'create' ? 'rgba(76, 175, 80, 0.9)' : 'rgba(255,255,255,0.06)',
              color: '#fff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '20px',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '0.9rem',
              marginLeft: 'auto'
            }}
          >
            ➕ 새 리스트 만들기
          </button>
        </div>

        {/* Content View */}
        {selectedPlaylist ? (
          <div>
            <button
              onClick={() => setSelectedPlaylist(null)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: 'var(--accent-gold)',
                padding: '6px 14px',
                borderRadius: '12px',
                marginBottom: '16px',
                cursor: 'pointer',
                fontWeight: '700'
              }}
            >
              ⬅️ 목록으로 돌아가기
            </button>

            <div style={{
              background: 'linear-gradient(135deg, rgba(229,9,20,0.2), rgba(255,193,7,0.1))',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '20px',
              border: '1px solid rgba(229,9,20,0.3)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
                    {selectedPlaylist.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: '0 0 12px 0' }}>
                    {selectedPlaylist.description || '작성된 설명이 없습니다.'}
                  </p>
                  <div style={{ fontSize: '0.8rem', color: '#AAA' }}>
                    작성자: <strong>{selectedPlaylist.userIdentifier}</strong> | 수록 영화: {selectedPlaylist.itemCount}편
                  </div>
                </div>

                {selectedPlaylist.userIdentifier === userIdentifier && (
                  <button
                    onClick={() => handleDeletePlaylist(selectedPlaylist.id)}
                    style={{
                      background: 'rgba(255,0,0,0.2)',
                      color: '#ff5252',
                      border: '1px solid #ff5252',
                      borderRadius: '12px',
                      padding: '6px 12px',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    🗑️ 리스트 삭제
                  </button>
                )}
              </div>
            </div>

            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '14px' }}>
              🎬 수록된 영화 목록 ({selectedPlaylist.items ? selectedPlaylist.items.length : 0})
            </h4>

            {!selectedPlaylist.items || selectedPlaylist.items.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                이 플레이리스트에 아직 담긴 영화가 없습니다.<br />영화 상세 페이지에서 [➕ 리스트에 추가] 버튼을 눌러보세요!
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '16px' }}>
                {selectedPlaylist.items.map((item) => {
                  const posterUrl = item.posterPath && item.posterPath.length > 3
                    ? (item.posterPath.startsWith('http') ? item.posterPath : `https://image.tmdb.org/t/p/w300${item.posterPath.startsWith('/') ? item.posterPath : '/' + item.posterPath}`)
                    : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop';

                  return (
                    <div
                      key={item.id}
                      style={{
                        position: 'relative',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        background: '#1a1a24',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      <img
                        src={posterUrl}
                        alt={item.movieTitle}
                        style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block', cursor: 'pointer' }}
                        onClick={() => onMovieClick && onMovieClick({ id: item.tmdbMovieId, title: item.movieTitle, poster_path: item.posterPath })}
                      />
                      <div style={{
                        padding: '8px',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        textAlign: 'center',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        color: '#FFF'
                      }}>
                        {item.movieTitle}
                      </div>

                      {selectedPlaylist.userIdentifier === userIdentifier && (
                        <button
                          onClick={() => handleRemoveMovieFromPlaylist(selectedPlaylist.id, item.tmdbMovieId)}
                          style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            background: 'rgba(0,0,0,0.7)',
                            color: '#ff5252',
                            border: 'none',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="이 리스트에서 제외"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : activeTab === 'create' ? (
          <form onSubmit={handleCreatePlaylist} style={{ padding: '10px 0' }}>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '0.9rem' }}>
                📌 플레이리스트 제목
              </label>
              <input
                type="text"
                placeholder="예: 🌧️ 비 오는 날 밤 혼자 감상하고 싶은 명작 5선"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  background: 'rgba(0,0,0,0.3)',
                  color: '#fff',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '0.9rem' }}>
                📝 리스트 소개 및 설명 (선택)
              </label>
              <textarea
                rows={3}
                placeholder="예: 주말에 맥주 한 잔 하면서 느긋하게 몰아보기 딱 좋은 컬렉션입니다."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  background: 'rgba(0,0,0,0.3)',
                  color: '#fff',
                  fontSize: '0.95rem',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                id="isPublicCheck"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="isPublicCheck" style={{ cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' }}>
                🌍 공개 플레이리스트로 등록 (모두의 시네마 리스트 탭에 공유됩니다)
              </label>
            </div>

            <button
              type="submit"
              disabled={creating || !newTitle.trim()}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: '700'
              }}
            >
              {creating ? '플레이리스트 생성 중...' : '🎬 나만의 영화 리스트 만들기'}
            </button>
          </form>
        ) : (
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>
                리스트를 불러오는 중입니다...
              </div>
            ) : (activeTab === 'public' ? publicPlaylists : myPlaylists).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>
                {activeTab === 'public' ? '등록된 공개 플레이리스트가 없습니다.' : '내가 만든 플레이리스트가 없습니다. [➕ 새 리스트 만들기] 버튼을 눌러보세요!'}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '18px' }}>
                {(activeTab === 'public' ? publicPlaylists : myPlaylists).map((pl) => (
                  <div
                    key={pl.id}
                    onClick={() => setSelectedPlaylist(pl)}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '16px',
                      padding: '18px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.borderColor = 'var(--accent-gold)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '1.2rem' }}>🎬</span>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {pl.title}
                      </h3>
                    </div>

                    <p style={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.85rem',
                      margin: '0 0 14px 0',
                      height: '36px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {pl.description || '설명 없음'}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#AAA' }}>
                      <span>👤 {pl.userIdentifier}</span>
                      <span style={{ background: 'rgba(255,193,7,0.15)', color: 'var(--accent-gold)', padding: '2px 8px', borderRadius: '10px', fontWeight: '700' }}>
                        {pl.itemCount}편 수록 ➔
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
