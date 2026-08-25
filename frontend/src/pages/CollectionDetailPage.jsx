import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiUrl } from '../config/api';

const DEFAULT_POSTER_FALLBACK = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop';

export default function CollectionDetailPage({ user, wishlists = [], onToggleWishlist }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchCollectionDetail();
  }, [id]);

  const fetchCollectionDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(apiUrl(`/api/playlists/${id}`));
      if (!res.ok) {
        if (res.status === 404) {
          setError('해당 영화 컬렉션을 찾을 수 없습니다.');
        } else {
          setError('컬렉션 정보를 불러오는 중 오류가 발생했습니다.');
        }
        return;
      }
      const data = await res.json();
      setCollection(data);
    } catch (err) {
      console.error('Failed to fetch collection detail:', err);
      setError('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDeleteCollection = async () => {
    if (!user || user.nickname !== collection.userIdentifier) {
      alert('컬렉션 작성자만 삭제할 수 있습니다.');
      return;
    }

    if (!window.confirm(`'${collection.title}' 컬렉션을 정말 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(apiUrl(`/api/playlists/${id}?userIdentifier=${encodeURIComponent(user.nickname)}`), {
        method: 'DELETE'
      });
      if (res.ok) {
        alert('컬렉션이 성공적으로 삭제되었습니다.');
        navigate('/');
      } else {
        alert('컬렉션 삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error('Failed to delete collection:', err);
      alert('삭제 중 오류가 발생했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  const handleRemoveMovieFromCollection = async (e, tmdbMovieId, movieTitle) => {
    e.stopPropagation();
    if (!user || user.nickname !== collection.userIdentifier) return;

    if (!window.confirm(`'${movieTitle}' 영화를 이 컬렉션에서 제외하시겠습니까?`)) {
      return;
    }

    try {
      const res = await fetch(apiUrl(`/api/playlists/${id}/movies/${tmdbMovieId}`), {
        method: 'DELETE'
      });
      if (res.ok) {
        const updated = await res.json();
        setCollection(updated);
      }
    } catch (err) {
      console.error('Failed to remove movie from collection:', err);
    }
  };

  const isOwner = user && collection && user.nickname === collection.userIdentifier;
  const items = (collection && Array.isArray(collection.items)) ? collection.items : [];
  const safeWishlists = Array.isArray(wishlists) ? wishlists : [];

  if (loading) {
    return (
      <div className="container" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '16px', animation: 'spin 1.5s infinite linear' }}>🎬</div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>영화 컬렉션을 불러오는 중입니다...</div>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="container" style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '20px' }}>
        <div style={{ fontSize: '3rem' }}>📂</div>
        <h2 style={{ fontSize: '1.6rem', color: '#FFF' }}>{error || '컬렉션을 찾을 수 없습니다.'}</h2>
        <button
          onClick={() => navigate('/')}
          className="btn-primary"
          style={{ padding: '12px 28px', borderRadius: '14px', fontWeight: '800' }}
        >
          ⬅️ 메인 홈으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '30px', paddingBottom: '80px' }}>
      {/* Top Navigation & Breadcrumbs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#FFF',
              padding: '7px 14px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '700',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)')}
          >
            <span>⬅️</span>
            <span>뒤로가기</span>
          </button>
          <span>/</span>
          <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>홈</Link>
          <span>/</span>
          <span style={{ color: 'var(--accent-gold)', fontWeight: '700' }}>{collection.title}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleCopyLink}
            style={{
              background: copied ? 'rgba(46, 204, 113, 0.2)' : 'rgba(255, 255, 255, 0.08)',
              border: copied ? '1px solid #2ECC71' : '1px solid rgba(255, 255, 255, 0.14)',
              color: copied ? '#2ECC71' : '#FFF',
              padding: '8px 16px',
              borderRadius: '12px',
              fontSize: '0.88rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <span>{copied ? '✅' : '🔗'}</span>
            <span>{copied ? '링크 복사됨!' : '컬렉션 링크 공유'}</span>
          </button>

          {isOwner && (
            <button
              onClick={handleDeleteCollection}
              disabled={deleting}
              style={{
                background: 'rgba(229, 9, 20, 0.15)',
                border: '1px solid rgba(229, 9, 20, 0.4)',
                color: '#FF4D4D',
                padding: '8px 16px',
                borderRadius: '12px',
                fontSize: '0.88rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>🗑️</span>
              <span>{deleting ? '삭제 중...' : '컬렉션 삭제'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Banner Section */}
      <div
        className="glass"
        style={{
          borderRadius: '24px',
          padding: '36px 40px',
          marginBottom: '40px',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(25, 25, 38, 0.95), rgba(12, 12, 18, 0.98))',
          border: '1px solid rgba(255, 193, 7, 0.2)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Ambient Gold Glow Backdrop */}
        <div style={{
          position: 'absolute',
          top: '-30%',
          right: '-10%',
          width: '350px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(255, 184, 0, 0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <span style={{
              background: 'rgba(255, 193, 7, 0.15)',
              color: 'var(--accent-gold)',
              padding: '5px 14px',
              borderRadius: '10px',
              fontSize: '0.82rem',
              fontWeight: '800',
              border: '1px solid rgba(255, 193, 7, 0.3)'
            }}>
              📁 영화 컬렉션
            </span>
            <span style={{
              background: collection.isPublic ? 'rgba(52, 152, 219, 0.15)' : 'rgba(150, 150, 150, 0.15)',
              color: collection.isPublic ? '#5DADE2' : '#AAA',
              padding: '5px 12px',
              borderRadius: '10px',
              fontSize: '0.82rem',
              fontWeight: '700'
            }}>
              {collection.isPublic ? '🌐 전체 공개' : '🔒 비공개'}
            </span>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              작성자: <strong style={{ color: '#FFF' }}>👤 {collection.userIdentifier || '큐레이터'}</strong>
            </span>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              • 총 <strong style={{ color: 'var(--accent-gold)', fontSize: '1rem' }}>{items.length}</strong>편의 영화
            </span>
          </div>

          <h1 style={{
            fontSize: '2.4rem',
            fontWeight: '900',
            color: '#FFF',
            margin: '0 0 16px 0',
            lineHeight: '1.3',
            letterSpacing: '-0.5px'
          }}>
            {collection.title}
          </h1>

          {collection.description && (
            <p style={{
              fontSize: '1.05rem',
              color: '#CBD5E1',
              margin: 0,
              lineHeight: '1.7',
              maxWidth: '850px',
              whiteSpace: 'pre-line'
            }}>
              {collection.description}
            </p>
          )}
        </div>
      </div>

      {/* Movies Grid Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
          <span>🎞️</span>
          <span>수록된 영화 목록 ({items.length})</span>
        </h2>
        <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          포스터를 클릭하면 상세 페이지로 이동합니다
        </span>
      </div>

      {/* Movie Grid */}
      {items.length === 0 ? (
        <div
          className="glass"
          style={{
            textAlign: 'center',
            padding: '80px 20px',
            borderRadius: '24px',
            color: 'var(--text-secondary)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div style={{ fontSize: '3rem' }}>🎬</div>
          <div style={{ fontSize: '1.2rem', color: '#FFF', fontWeight: '700' }}>
            컬렉션에 담긴 영화가 아직 없습니다.
          </div>
          <p style={{ margin: 0, maxWidth: '400px', fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
            메인 홈이나 검색을 통해 마음에 드는 영화를 찾아 상세 페이지에서 컬렉션에 추가해 보세요!
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
            style={{ marginTop: '10px', padding: '12px 26px', borderRadius: '12px', fontWeight: '800' }}
          >
            🍿 영화 구경하러 가기
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
          gap: '22px'
        }}>
          {items.map((movie, idx) => {
            const rawPoster = movie.posterPath || movie.poster_path;
            const thumbUrl = (rawPoster && typeof rawPoster === 'string' && rawPoster.length > 3)
              ? (rawPoster.startsWith('http') ? rawPoster : `https://image.tmdb.org/t/p/w500${rawPoster.startsWith('/') ? rawPoster : '/' + rawPoster}`)
              : DEFAULT_POSTER_FALLBACK;

            const movieIdNum = Number(movie.tmdbMovieId || movie.id);
            const isWishlisted = safeWishlists.some((w) => Number(w.tmdbMovieId) === movieIdNum);

            return (
              <div
                key={movie.id || movie.tmdbMovieId || idx}
                onClick={() => {
                  if (movieIdNum) {
                    navigate(`/movie/${movieIdNum}`);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="glass"
                style={{
                  borderRadius: '18px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'rgba(255, 255, 255, 0.03)',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                  e.currentTarget.style.borderColor = 'var(--accent-gold)';
                  e.currentTarget.style.boxShadow = '0 16px 36px rgba(0, 0, 0, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Ranking / Number Badge */}
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  zIndex: 3,
                  background: 'rgba(0, 0, 0, 0.75)',
                  backdropFilter: 'blur(6px)',
                  color: 'var(--accent-gold)',
                  fontWeight: '900',
                  fontSize: '0.85rem',
                  padding: '3px 9px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 193, 7, 0.3)'
                }}>
                  #{idx + 1}
                </div>

                {/* Wishlist Toggle Button */}
                {onToggleWishlist && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWishlist({
                        id: movieIdNum,
                        title: movie.movieTitle || movie.title,
                        poster_path: rawPoster
                      });
                    }}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      zIndex: 3,
                      background: 'rgba(0, 0, 0, 0.7)',
                      backdropFilter: 'blur(6px)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '34px',
                      height: '34px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      transition: 'transform 0.2s ease',
                      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.4)'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.15)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  >
                    {isWishlisted ? '❤️' : '🤍'}
                  </button>
                )}

                {/* Poster Image */}
                <div style={{ position: 'relative', paddingTop: '148%', background: '#0A0A10', overflow: 'hidden' }}>
                  <img
                    src={thumbUrl}
                    alt={movie.movieTitle || movie.title || '영화 포스터'}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = DEFAULT_POSTER_FALLBACK;
                    }}
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

                {/* Movie Title & Owner Actions */}
                <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, justifyContent: 'space-between' }}>
                  <h3 style={{
                    fontSize: '0.98rem',
                    fontWeight: '800',
                    color: '#FFF',
                    margin: 0,
                    lineHeight: '1.4',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {movie.movieTitle || movie.title}
                  </h3>

                  {isOwner && (
                    <button
                      onClick={(e) => handleRemoveMovieFromCollection(e, movieIdNum, movie.movieTitle || movie.title)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#AAA',
                        borderRadius: '8px',
                        padding: '5px 10px',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        marginTop: '4px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(229, 9, 20, 0.2)';
                        e.currentTarget.style.borderColor = '#E50914';
                        e.currentTarget.style.color = '#FF4D4D';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.color = '#AAA';
                      }}
                    >
                      <span>✕</span>
                      <span>컬렉션에서 제외</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
