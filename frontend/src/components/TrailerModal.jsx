import React, { useState, useEffect } from 'react';
import { apiUrl } from '../config/api';

export default function TrailerModal({ isOpen, onClose, movieId, movieTitle }) {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && movieId) {
      fetchMovieVideos(movieId);
    } else {
      setVideos([]);
      setSelectedVideo(null);
      setError(null);
    }
  }, [isOpen, movieId]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const fetchMovieVideos = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(apiUrl(`/api/movies/${id}/videos`));
      if (res.ok) {
        const data = await res.json();
        const results = Array.isArray(data.results) ? data.results : [];
        const ytVideos = results.filter(
          (v) => (v.site || '').toLowerCase() === 'youtube' && v.key
        );

        if (ytVideos.length > 0) {
          // Sort by priority: Official Trailers first, then Trailers, then others
          ytVideos.sort((a, b) => {
            const aIsTrailer = (a.type || '').toLowerCase() === 'trailer';
            const bIsTrailer = (b.type || '').toLowerCase() === 'trailer';
            if (aIsTrailer && !bIsTrailer) return -1;
            if (!aIsTrailer && bIsTrailer) return 1;
            return (b.official ? 1 : 0) - (a.official ? 1 : 0);
          });

          setVideos(ytVideos);
          setSelectedVideo(ytVideos[0]);
        } else {
          setError('해당 영화의 등록된 예고편 영상이 없습니다.');
        }
      } else {
        setError('예고편 정보를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('Failed to fetch movie trailers:', err);
      setError('네트워크 오류로 예고편을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const cleanTitle = (movieTitle || '').replace(/^([🥇🥈🥉]|\d+위|\s|\.)+/g, '').trim();

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '960px',
          background: 'linear-gradient(145deg, #181924, #0f1016)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(229, 9, 20, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(255, 255, 255, 0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.4rem' }}>🎬</span>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: '1.25rem',
                  fontWeight: '800',
                  color: '#fff',
                  letterSpacing: '-0.3px'
                }}
              >
                {cleanTitle}
              </h2>
              {selectedVideo && (
                <div style={{ fontSize: '0.82rem', color: '#9CA3AF', marginTop: '2px' }}>
                  {selectedVideo.name}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: '#FFF',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              fontSize: '1.1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)')}
          >
            ✕
          </button>
        </div>

        {/* Video Player Body */}
        <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', background: '#000' }}>
          {loading ? (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#E5E7EB',
                gap: '14px'
              }}
            >
              <div style={{ fontSize: '2.5rem', animation: 'spin 1.2s linear infinite' }}>⏳</div>
              <div style={{ fontSize: '1rem', fontWeight: '600' }}>공식 예고편 영상을 준비 중입니다...</div>
            </div>
          ) : error || !selectedVideo ? (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9CA3AF',
                padding: '30px',
                textAlign: 'center',
                gap: '16px'
              }}
            >
              <div style={{ fontSize: '2.5rem' }}>📼</div>
              <div style={{ fontSize: '1.05rem', color: '#E5E7EB', fontWeight: '600' }}>
                {error || '재생 가능한 예고편이 없습니다.'}
              </div>
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(cleanTitle + ' 예고편')}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: '#e50914',
                  color: '#fff',
                  padding: '10px 20px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>▶ YouTube에서 직접 검색하기</span>
              </a>
            </div>
          ) : (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${selectedVideo.key}?autoplay=1&rel=0&modestbranding=1`}
              title={selectedVideo.name || `${cleanTitle} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none'
              }}
            />
          )}
        </div>

        {/* Video Selectors (if multiple clips exist) */}
        {videos.length > 1 && (
          <div
            style={{
              padding: '14px 20px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(10, 10, 15, 0.95)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              overflowX: 'auto'
            }}
          >
            <span style={{ fontSize: '0.85rem', color: '#9CA3AF', fontWeight: '700', whiteSpace: 'nowrap' }}>
              🎞️ 관련 영상 ({videos.length}):
            </span>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
              {videos.map((vid) => {
                const isActive = selectedVideo && selectedVideo.id === vid.id;
                return (
                  <button
                    key={vid.id || vid.key}
                    onClick={() => setSelectedVideo(vid)}
                    style={{
                      background: isActive
                        ? 'linear-gradient(135deg, #e50914, #b20710)'
                        : 'rgba(255, 255, 255, 0.08)',
                      color: isActive ? '#fff' : '#D1D5DB',
                      border: isActive ? '1px solid #ff4b55' : '1px solid rgba(255, 255, 255, 0.08)',
                      padding: '6px 14px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      fontWeight: isActive ? '700' : '500',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    ▶ {vid.name.length > 25 ? vid.name.substring(0, 25) + '...' : vid.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
