import React, { useState, useEffect } from 'react';

const GENRES = [
  { id: 0, name: '🎬 전체' },
  { id: 28, name: '💥 액션' },
  { id: 35, name: '😂 코미디' },
  { id: 10749, name: '💖 로맨스' },
  { id: 16, name: '🎨 애니메이션' },
  { id: 878, name: '🚀 SF/판타지' },
  { id: 27, name: '🧟 공포/스릴러' }
];

export default function TopRatedCategorySection({ onMovieClick, wishlistMap = {}, onToggleWishlist }) {
  const [selectedGenre, setSelectedGenre] = useState(0);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchTopRatedMovies = async () => {
      setLoading(true);
      try {
        const url = selectedGenre > 0 
          ? `/api/movies/top-rated?genreId=${selectedGenre}` 
          : '/api/movies/top-rated';
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setMovies(Array.isArray(data.results) ? data.results.slice(0, 10) : []);
          }
        }
      } catch (err) {
        console.error('Failed to fetch top rated movies by genre:', err);
        if (isMounted) setMovies([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTopRatedMovies();
    return () => { isMounted = false; };
  }, [selectedGenre]);

  return (
    <section style={{ marginTop: '50px', marginBottom: '60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>⭐</span> 장르별 명작 평점 차트 TOP 10
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '4px' }}>
            세계 영화 팬들이 선정한 높은 평점의 카테고리별 검증된 명작 목록입니다.
          </p>
        </div>

        {/* Genre Pill Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {GENRES.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedGenre(g.id)}
              style={{
                background: selectedGenre === g.id ? 'var(--accent-gold)' : 'rgba(255, 255, 255, 0.06)',
                color: selectedGenre === g.id ? '#000' : 'var(--text-primary)',
                border: selectedGenre === g.id ? 'none' : '1px solid var(--border-color)',
                padding: '8px 16px',
                borderRadius: '20px',
                fontWeight: selectedGenre === g.id ? '800' : '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '0.9rem'
              }}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card-skeleton" style={{ height: '320px', borderRadius: '16px' }} />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          해당 장르의 영화 데이터를 불러올 수 없습니다.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '22px' }}>
          {movies.map((m, idx) => {
            if (!m) return null;

            const poster = m.poster_path
              ? (m.poster_path.startsWith('http') ? m.poster_path : `https://image.tmdb.org/t/p/w500${m.poster_path}`)
              : 'https://via.placeholder.com/500x750?text=No+Poster';

            const isWishlisted = wishlistMap && m.id ? !!wishlistMap[m.id] : false;

            return (
              <div
                key={m.id || idx}
                className="movie-card glass"
                onClick={() => onMovieClick && onMovieClick(m)}
                style={{
                  cursor: 'pointer',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                }}
              >
                <div style={{ position: 'relative', paddingTop: '140%', overflow: 'hidden' }}>
                  <img
                    src={poster}
                    alt={m.title || '영화'}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: 'rgba(0, 0, 0, 0.75)',
                      backdropFilter: 'blur(8px)',
                      color: 'var(--accent-gold)',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontWeight: '800',
                      fontSize: '0.85rem'
                    }}
                  >
                    #{idx + 1}
                  </div>

                  {onToggleWishlist && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWishlist(m);
                      }}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'rgba(0, 0, 0, 0.65)',
                        border: 'none',
                        color: isWishlisted ? '#FF4D4D' : '#FFF',
                        borderRadius: '50%',
                        width: '34px',
                        height: '34px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.1rem'
                      }}
                    >
                      {isWishlisted ? '❤️' : '🤍'}
                    </button>
                  )}
                </div>

                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <h3
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: '700',
                      marginBottom: '8px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {m.title || '제목 없음'}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--accent-gold)', fontWeight: '700' }}>
                      ★ {m.vote_average ? Number(m.vote_average).toFixed(1) : '8.0'}
                    </span>
                    <span>{m.release_date ? String(m.release_date).substring(0, 4) : ''}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
