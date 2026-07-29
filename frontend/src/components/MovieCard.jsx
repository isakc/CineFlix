import React from 'react';

export default function MovieCard({ movie, onSelectMovie, isWishlisted, onToggleWishlist }) {
  const posterUrl = movie.poster_path
    ? (movie.poster_path.startsWith('http') ? movie.poster_path : `https://image.tmdb.org/t/p/w500${movie.poster_path}`)
    : 'https://via.placeholder.com/500x750?text=No+Poster';

  return (
    <div className="movie-card glass" onClick={() => onSelectMovie(movie)}>
      <div className="poster-wrapper">
        <img src={posterUrl} alt={movie.title} className="poster-img" loading="lazy" />
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
