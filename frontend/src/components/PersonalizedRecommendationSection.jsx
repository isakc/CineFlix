import React, { useState, useEffect } from 'react';
import MovieCard from './MovieCard';
import { apiUrl } from '../config/api';

export default function PersonalizedRecommendationSection({
  user,
  userIdentifier,
  wishlists = [],
  onMovieClick,
  onToggleWishlist,
  onOpenOnboarding
}) {
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [userIdentifier, wishlists.length]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl(`/api/movies/recommendations?userIdentifier=${encodeURIComponent(userIdentifier || '')}`));
      if (res.ok) {
        const data = await res.json();
        setRecommendedMovies(Array.isArray(data.results) ? data.results : []);
      }
    } catch (err) {
      console.error('Failed to fetch recommended movies:', err);
    } finally {
      setLoading(false);
    }
  };

  const wishlistTitles = wishlists.slice(0, 3).map((w) => w.movieTitle).join(', ');
  const wishlistMap = wishlists.reduce((acc, item) => {
    acc[item.tmdbMovieId] = item;
    return acc;
  }, {});

  return (
    <section style={{ marginTop: '30px', marginBottom: '40px' }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(229, 9, 20, 0.15), rgba(255, 193, 7, 0.08))',
        border: '1px solid rgba(229, 9, 20, 0.3)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '1.4rem' }}>🔮</span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                {user ? user.nickname : '고객'}님을 위한 취향 맞춤 추천
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              {wishlists.length > 0
                ? `선택하신 [${wishlistTitles}${wishlists.length > 3 ? ' 외' : ''}] 취향 패턴을 분석하여 엄선했습니다.`
                : '좋아하는 영화를 고르시면 더욱 정교한 취향 분석이 제공됩니다.'}
            </p>
          </div>

          <button
            onClick={onOpenOnboarding}
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              color: 'var(--accent-gold)',
              border: '1px solid var(--accent-gold)',
              borderRadius: '20px',
              padding: '8px 18px',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 193, 7, 0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'}
          >
            <span>🎯</span>
            <span>취향 다시 선택하기</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card-skeleton" style={{ height: '280px', borderRadius: '12px' }} />
          ))}
        </div>
      ) : recommendedMovies.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
          추천 영화를 불러오는 중입니다.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '20px'
        }}>
          {recommendedMovies.slice(0, 10).map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onClick={onMovieClick}
              isWishlisted={!!wishlistMap[movie.id]}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
      )}
    </section>
  );
}
