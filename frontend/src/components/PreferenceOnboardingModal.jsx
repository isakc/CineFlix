import React, { useState, useEffect } from 'react';
import { apiUrl } from '../config/api';

const FAMOUS_MOVIES_POOL = [
  { id: 157336, title: "인터스텔라", poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg" },
  { id: 27205, title: "인셉션", poster_path: "/oYuLEW9W0bbUhEjAQe01meE69.jpg" },
  { id: 155, title: "다크 나이트", poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg" },
  { id: 496243, title: "기생충", poster_path: "/7FiFiqB7LwR1ZpBf02aDqY7l6S.jpg" },
  { id: 299536, title: "어벤져스: 인피니티 워", poster_path: "/7WsyChvLEzFiDOVTGDRtq38d6UX.jpg" },
  { id: 313369, title: "라라랜드", poster_path: "/uDO8VRIEREsZLE1d860dDk.jpg" },
  { id: 19995, title: "아바타", poster_path: "/6g02568gDq.jpg" },
  { id: 508442, title: "소울", poster_path: "/hm58Jw4Lw8w8.jpg" },
  { id: 597, title: "타이타닉", poster_path: "/9xjZS2rlVxm8SFx8k.jpg" },
  { id: 475557, title: "조커", poster_path: "/udDclso.jpg" },
  { id: 603, title: "매트릭스", poster_path: "/f89U3w9.jpg" },
  { id: 545611, title: "에브리씽 에브리웨어 올 앳 원스", poster_path: "/r2J.jpg" },
  { id: 13, title: "포레스트 검프", poster_path: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg" },
  { id: 129, title: "센과 치히로의 행방불명", poster_path: "/39wmItE2FMv4FNEzxsFm0LGoKW2.jpg" },
  { id: 372058, title: "너의 이름은.", poster_path: "/q719jXXEzOoYaps6babgKnFiONX.jpg" },
  { id: 98, title: "글래디에이터", poster_path: "/ty8TFPAu2PhPVwPxnhUQGlmATN5.jpg" },
  { id: 872585, title: "오펜하이머", poster_path: "/8Gxv8gSFCU0XGDykEGvjZ71MYYh.jpg" },
  { id: 361743, title: "탑건: 매버릭", poster_path: "/62HCioFi8hRfsSuvF3P2PrmmB1U.jpg" },
  { id: 324857, title: "스파이더맨: 뉴 유니버스", poster_path: "/uC6kgxR4WEVQG2wN1dhGlvLFWiv.jpg" },
  { id: 244786, title: "위플래쉬", poster_path: "/7fn624j5lj3xTme2SgiLCeMYmSX.jpg" },
  { id: 8587, title: "어바웃 타임", poster_path: "/iE006w2c8C7Fm3l5Y0e5.jpg" },
  { id: 150540, title: "인사이드 아웃", poster_path: "/lRHE0vVJ31I1gZ0GuF8.jpg" },
  { id: 1726, title: "아이언맨", poster_path: "/78lPtwv72eTNqFW99qvoGD822jU.jpg" },
  { id: 438631, title: "듄(Dune)", poster_path: "/d5NGoE8sKM5VFi9yG9y.jpg" }
];

export default function PreferenceOnboardingModal({ isOpen, onClose, onComplete, popularMovies = [], userIdentifier }) {
  const [displayMovies, setDisplayMovies] = useState([]);
  const [selectedMovieIds, setSelectedMovieIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const shuffleMovies = () => {
    let pool = [...FAMOUS_MOVIES_POOL];
    if (popularMovies && popularMovies.length > 0) {
      pool = [...popularMovies, ...FAMOUS_MOVIES_POOL];
    }
    const shuffled = pool.sort(() => 0.5 - Math.random());
    const unique = [];
    const seen = new Set();
    for (const item of shuffled) {
      if (item && item.id && !seen.has(item.id)) {
        seen.add(item.id);
        unique.push(item);
      }
      if (unique.length >= 12) break;
    }
    setDisplayMovies(unique);
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedMovieIds([]);
      shuffleMovies();
    }
  }, [isOpen]);

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
        if (onComplete) {
          await onComplete();
        }
        onClose();
      } else {
        console.error('Batch wishlist submission failed status:', res.status);
        onClose();
      }
    } catch (err) {
      console.error('Failed to submit onboarding preferences:', err);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div 
        className="modal-card glass" 
        style={{ 
          maxWidth: '840px', 
          width: '92%', 
          maxHeight: '88vh', 
          overflowY: 'auto', 
          padding: '28px',
          borderRadius: '20px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.7rem', fontWeight: '800', margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
              🎬 취향 영화를 선택해 주세요! (3개 이상 권장)
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              선택하신 명작 영화들을 바탕으로 나만을 위한 맞춤 영화를 즉시 추천해 드립니다.
            </p>
          </div>
          <button
            onClick={shuffleMovies}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'var(--accent-gold)',
              border: '1px solid var(--accent-gold)',
              borderRadius: '20px',
              padding: '6px 14px',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            🎲 다른 유명 영화 더보기
          </button>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))', 
          gap: '14px',
          marginBottom: '24px' 
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
                  style={{ width: '100%', height: '190px', objectFit: 'cover', display: 'block' }} 
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
