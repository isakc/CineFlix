import React from 'react';

export default function MovieCard({ movie, rank, onSelectMovie, isWishlisted, onToggleWishlist }) {
  const rawPoster = movie.poster_path || movie.posterPath;
  const posterUrl = (rawPoster && typeof rawPoster === 'string' && rawPoster.length > 3)
    ? (rawPoster.startsWith('http') ? rawPoster : `https://image.tmdb.org/t/p/w500${rawPoster.startsWith('/') ? rawPoster : '/' + rawPoster}`)
    : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop';

  return (
    <div className="movie-card glass" onClick={() => onSelectMovie(movie)}>
      <div className="poster-wrapper">
        <img src={posterUrl} alt={movie.title} className="poster-img" loading="lazy" />
        
        {rank && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(8px)',
              color: 'var(--accent-gold)',
              padding: '4px 10px',
              borderRadius: '12px',
              fontWeight: '800',
              fontSize: '0.85rem'
            }}
          >
            #{rank}
          </div>
        )}
        <button
          className="btn-wishlist-toggle"
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(movie);
          }}
          title={isWishlisted ? "위시리스트에서 제거" : "위시리스트에 담기"}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: isWishlisted ? 'rgba(229, 9, 20, 0.95)' : 'rgba(0, 0, 0, 0.65)',
            boxShadow: isWishlisted ? '0 0 16px rgba(229, 9, 20, 0.8)' : '0 2px 8px rgba(0,0,0,0.5)',
            border: isWishlisted ? '1px solid rgba(255, 255, 255, 0.6)' : '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            fontSize: '1.15rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transform: isWishlisted ? 'scale(1.08)' : 'scale(1)',
            transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            backdropFilter: 'blur(6px)'
          }}
        >
          {isWishlisted ? '❤️' : '🤍'}
        </button>
      </div>

      <div className="card-content">
        <h3 className="movie-title">{movie.title}</h3>
        <div className="movie-meta">
          <span>{movie.release_date ? movie.release_date.split('-')[0] : '미상'}</span>
          <div className="rating-badge">
            ★ {movie.vote_average ? movie.vote_average.toFixed(1) : '0.0'}
          </div>
        </div>
      </div>
    </div>
  );
}
