import React, { useState } from 'react';
import { apiUrl } from '../config/api';

const SAMPLE_ONBOARDING_MOVIES = [
  { id: 157336, title: "인터스텔라", poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg" },
  { id: 27205, title: "인셉션", poster_path: "/oYuLEW9W0bbUhEjAQe01 meE69.jpg" }, // fallbacks
  { id: 155, title: "다크 나이트", poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg" },
  { id: 496243, title: "기생충", poster_path: "/7FiFiqB7LwR1ZpBf02aDqY7l6S.jpg" },
  { id: 299536, title: "어벤져스: 인피니티 워", poster_path: "/7WsyChvLEzFiDOVTGDRtq38d6UX.jpg" },
  { id: 313369, title: "라라랜드", poster_path: "/uDO8VRIEREsZLE 1d860dDk.jpg" },
  { id: 19995, title: "아바타", poster_path: "/6g02568gDq.jpg" },
  { id: 508442, title: "소울", poster_path: "/hm58Jw4Lw8w8.jpg" },
  { id: 597, title: "타이타닉", poster_path: "/9xjZS2rlVxm8SFx8k.jpg" },
  { id: 475557, title: "조커", poster_path: "/udDclso.jpg" },
  { id: 603, title: "매트릭스", poster_path: "/f89U3w9.jpg" },
  { id: 545611, title: "에브리씽 에브리웨어 올 앳 원스", poster_path: "/r2J.jpg" }
];

export default function PreferenceOnboardingModal({ isOpen, onClose, onComplete, popularMovies = [], userIdentifier }) {
  const displayMovies = (popularMovies && popularMovies.length >= 10) 
    ? popularMovies.slice(0, 12) 
    : SAMPLE_ONBOARDING_MOVIES;

  const [selectedMovieIds, setSelectedMovieIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleSelect = (movieId) => {
    if (selectedMovieIds.includes(movieId)) {
      setSelectedMovieIds(selectedMovieIds.filter((id) => id !== movieId));
    } else {
      setSelectedMovieIds([...selectedMovieIds, movieId]);
    }
  };

  const handleSubmit = async () => {
    if (selectedMovieIds.length === 0) return;

    setSubmitting(true);
    const selectedObjects = displayMovies.filter((m) => selectedMovieIds.includes(m.id));
    const payload = selectedObjects.map((movie) => ({
      userIdentifier,
      tmdbMovieId: movie.id,
      movieTitle: (movie.title || "").replace(/^([🥇🥈🥉]|\d+위|\s|\.)+/g, "").trim(),
      posterPath: movie.poster_path || ""
    }));

    try {
      const res = await fetch(apiUrl('/api/wishlists/batch'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        onComplete();
        onClose();
      }
    } catch (err) {
      console.error('Failed to submit onboarding preferences:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div 
        className="modal-card glass" 
        style={{ 
          maxWidth: '820px', 
          width: '90%', 
          maxHeight: '85vh', 
          overflowY: 'auto', 
          padding: '28px',
          borderRadius: '20px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: '2.5rem' }}>🎬</span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '8px 0', color: 'var(--text-primary)' }}>
            취향 영화를 3개 이상 선택해 주세요!
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            선택하신 영화를 바탕으로 AI가 나만을 위한 맞춤 추천 영화를 찾아드립니다.
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
          gap: '14px',
          marginBottom: '28px' 
        }}>
          {displayMovies.map((movie) => {
            const isSelected = selectedMovieIds.includes(movie.id);
            const posterUrl = movie.poster_path
              ? (movie.poster_path.startsWith('http') ? movie.poster_path : `https://image.tmdb.org/t/p/w300${movie.poster_path}`)
              : 'https://via.placeholder.com/300x450?text=CineFlix';

            return (
              <div
                key={movie.id}
                onClick={() => toggleSelect(movie.id)}
                style={{
                  position: 'relative',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: isSelected ? '3px solid var(--accent-red)' : '2px solid transparent',
                  transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 0 16px rgba(229, 9, 20, 0.6)' : 'none'
                }}
              >
                <img 
                  src={posterUrl} 
                  alt={movie.title} 
                  style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }} 
                />

                {isSelected && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'var(--accent-red)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '26px',
                    height: '26px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '0.85rem',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
                  }}>
                    ✓
                  </div>
                )}

                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.95))',
                  padding: '12px 8px 6px 8px',
                  color: '#fff',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {movie.title}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', alignItems: 'center' }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 20px',
              background: 'rgba(255,255,255,0.08)',
              color: 'var(--text-secondary)',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            나중에 고르기
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedMovieIds.length === 0 || submitting}
            className="btn-primary"
            style={{
              padding: '12px 28px',
              borderRadius: '10px',
              fontWeight: '700',
              opacity: selectedMovieIds.length === 0 ? 0.5 : 1,
              cursor: selectedMovieIds.length === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            {submitting 
              ? '취향 저장 중...' 
              : `취향 선택 완료 (${selectedMovieIds.length}개 선택됨)`}
          </button>
        </div>
      </div>
    </div>
  );
}
