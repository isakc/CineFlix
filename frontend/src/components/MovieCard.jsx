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
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: isWishlisted ? 'rgba(229, 9, 20, 0.85)' : 'rgba(0, 0, 0, 0.6)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            color: 'white',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
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
