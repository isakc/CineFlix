import React, { useState, useEffect } from 'react';
import { apiUrl } from '../config/api';
import StarRatingInput from './StarRatingInput';

export default function MovieDetailModal({ movie, user, userIdentifier, onClose, onOpenAuth }) {
  const [movieDetails, setMovieDetails] = useState(movie || {});
  const [reviews, setReviews] = useState([]);
  const [ratingSummary, setRatingSummary] = useState({ averageRating: 0, totalReviewCount: 0 });
  const [author, setAuthor] = useState(user ? user.nickname : '');
  const [rating, setRating] = useState(5.0);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  // Playlist Add state
  const [playlists, setPlaylists] = useState([]);
  const [showPlaylistPicker, setShowPlaylistPicker] = useState(false);
  const [addingToPlaylist, setAddingToPlaylist] = useState(false);
  const [addMessage, setAddMessage] = useState('');

  const targetMovie = movieDetails || movie || {};
  const rawPoster = targetMovie.poster_path || targetMovie.posterPath || '';
  const posterUrl = (rawPoster && typeof rawPoster === 'string' && rawPoster.length > 3)
    ? (rawPoster.startsWith('http') ? rawPoster : `https://image.tmdb.org/t/p/w500${rawPoster.startsWith('/') ? rawPoster : '/' + rawPoster}`)
    : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop';

  useEffect(() => {
    if (user) setAuthor(user.nickname);
  }, [user]);

  useEffect(() => {
    if (movie && movie.id) {
      setMovieDetails(movie);
      fetchMovieDetails(movie.id);
      fetchReviews(movie.id);
      fetchRatingSummary(movie.id);
    }
  }, [movie]);

  const fetchUserPlaylists = async () => {
    if (!userIdentifier) return;
    try {
      const res = await fetch(apiUrl(`/api/playlists/user?userIdentifier=${encodeURIComponent(userIdentifier)}`));
      if (res.ok) {
        const data = await res.json();
        setPlaylists(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch user playlists:', err);
    }
  };

  const handleOpenPlaylistPicker = () => {
    fetchUserPlaylists();
    setShowPlaylistPicker(!showPlaylistPicker);
  };

  const handleAddToPlaylist = async (playlistId) => {
    setAddingToPlaylist(true);
    try {
      const res = await fetch(apiUrl(`/api/playlists/${playlistId}/movies`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tmdbMovieId: targetMovie.id,
          movieTitle: (targetMovie.title || '').replace(/^([🥇🥈🥉]|\d+위|\s|\.)+/g, '').trim(),
          posterPath: rawPoster
        })
      });

      if (res.ok) {
        setAddMessage('✅ 플레이리스트에 담겼습니다!');
        setTimeout(() => setAddMessage(''), 2500);
        setShowPlaylistPicker(false);
      }
    } catch (err) {
      console.error('Failed to add movie to playlist:', err);
    } finally {
      setAddingToPlaylist(false);
    }
  };

  const fetchMovieDetails = async (movieId) => {
    try {
      const res = await fetch(apiUrl(`/api/movies/${movieId}`));
      if (res.ok) {
        const data = await res.json();
        setMovieDetails((prev) => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error('Failed to fetch full movie details:', err);
    }
  };

  const fetchReviews = async (movieId) => {
    try {
      const res = await fetch(apiUrl(`/api/movies/${movieId}/reviews`));
      if (res.ok) {
        const data = await res.json();
        setReviews(data.content || []);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    }
  };

  const fetchRatingSummary = async (movieId) => {
    try {
      const res = await fetch(apiUrl(`/api/movies/${movieId}/rating-summary`));
      if (res.ok) {
        const data = await res.json();
        setRatingSummary(data);
      }
    } catch (err) {
      console.error('Failed to fetch rating summary:', err);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!author.trim() || !content.trim()) return;

    setLoading(true);
    const headers = { 'Content-Type': 'application/json' };
    if (user && user.token) {
      headers['Authorization'] = `Bearer ${user.token}`;
    }

    try {
      const res = await fetch(apiUrl('/api/reviews'), {
        method: 'POST',
        headers,
        body: JSON.stringify({
          tmdbMovieId: targetMovie.id,
          author,
          rating: parseFloat(rating),
          content
        })
      });

      if (res.ok) {
        if (!user) setAuthor('');
        setContent('');
        setRating(5.0);
        fetchReviews(targetMovie.id);
        fetchRatingSummary(targetMovie.id);
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card glass" onClick={(e) => e.stopPropagation()}>
        <button className="btn-close" onClick={onClose}>×</button>

        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
          <img
            src={posterUrl}
            alt={targetMovie.title}
            style={{ width: '220px', borderRadius: '16px', objectFit: 'cover' }}
          />

          <div style={{ flex: '1', minWidth: '280px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '10px' }}>{targetMovie.title || '제목 없음'}</h2>
            <div style={{ display: 'flex', gap: '15px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              <span>개봉일: {targetMovie.release_date || targetMovie.releaseDate || '미상'}</span>
              <span>TMDB 평점: ★ {targetMovie.vote_average || targetMovie.voteAverage ? Number(targetMovie.vote_average || targetMovie.voteAverage).toFixed(1) : '0.0'}</span>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
              <div style={{
                background: 'rgba(255, 193, 7, 0.1)',
                border: '1px solid rgba(255, 193, 7, 0.3)',
                padding: '10px 16px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ fontSize: '1.4rem', color: 'var(--accent-gold)' }}>★ {ratingSummary.averageRating}</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  유저 평점 ({ratingSummary.totalReviewCount}개 리뷰)
                </span>
              </div>

              <button
                onClick={handleOpenPlaylistPicker}
                style={{
                  background: 'rgba(255, 193, 7, 0.15)',
                  color: 'var(--accent-gold)',
                  border: '1px solid var(--accent-gold)',
                  borderRadius: '12px',
                  padding: '10px 18px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🎬</span>
                <span>내 리스트에 담기</span>
              </button>

              {addMessage && (
                <span style={{ color: '#4CAF50', fontWeight: '700', fontSize: '0.9rem' }}>
                  {addMessage}
                </span>
              )}
            </div>

            {/* Playlist Picker Dropdown */}
            {showPlaylistPicker && (
              <div style={{
                background: 'rgba(20, 20, 30, 0.95)',
                border: '1px solid var(--accent-gold)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <div style={{ fontWeight: '700', marginBottom: '10px', color: '#fff', fontSize: '0.9rem' }}>
                  📂 담을 플레이리스트 선택:
                </div>
                {playlists.length === 0 ? (
                  <div style={{ fontSize: '0.85rem', color: '#AAA' }}>
                    등록된 플레이리스트가 없습니다. 상단 [🎵 영화 리스트] 메뉴에서 먼저 새 리스트를 생성해 보세요!
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {playlists.map((pl) => (
                      <button
                        key={pl.id}
                        onClick={() => handleAddToPlaylist(pl.id)}
                        disabled={addingToPlaylist}
                        style={{
                          background: 'rgba(255,255,255,0.08)',
                          color: '#fff',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '0.85rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span>🎬 {pl.title}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>+ 담기</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <p style={{ lineHeight: '1.7', color: '#D1D5DB', marginBottom: '24px' }}>
              {targetMovie.overview || '줄거리 정보가 없습니다.'}
            </p>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '30px 0' }} />

        <div className="review-box">
          <h3 style={{ marginBottom: '16px', fontSize: '1.2rem', fontWeight: '700' }}>✍️ 리뷰 & 별점 남기기</h3>

          {!user ? (
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px dashed rgba(255, 255, 255, 0.15)',
              borderRadius: '16px',
              padding: '24px 16px',
              textAlign: 'center',
              marginBottom: '24px'
            }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🔒</div>
              <div style={{ fontSize: '1rem', fontWeight: '700', color: '#fff', marginBottom: '6px' }}>
                별점 및 리뷰 작성을 위해 로그인이 필요합니다
              </div>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                로그인 후 0.5점 단위 별점과 솔직한 감상평을 남겨보세요!
              </p>
              <button
                onClick={onOpenAuth}
                className="btn-primary"
                style={{
                  padding: '10px 24px',
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🔑</span>
                <span>로그인 / 회원가입</span>
              </button>
            </div>
          ) : (
            <form className="review-form" onSubmit={handleSubmitReview}>
              {/* Watcha-style 5-Star Rating Input */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: '16px'
              }}>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '700' }}>
                  영화 별점을 평가해 주세요 (0.5점 단위)
                </div>
                <StarRatingInput value={rating} onChange={(newRating) => setRating(newRating)} size={38} />
              </div>

              <div style={{ marginBottom: '12px', fontSize: '0.9rem', fontWeight: '700', color: '#E2E8F0' }}>
                👤 작성자: <span style={{ color: 'var(--accent-gold)' }}>{user.nickname}</span> 님
              </div>

              <textarea
                placeholder="영화에 대한 감상평을 자유롭게 적어주세요..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
              <div style={{ textAlign: 'right' }}>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? '등록 중...' : '리뷰 등록하기'}
                </button>
              </div>
            </form>
          )}

          <h4 style={{ margin: '24px 0 12px 0', fontSize: '1.1rem' }}>💬 등록된 리뷰 목록 ({reviews.length})</h4>
          {reviews.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', padding: '20px 0', textAlign: 'center' }}>
              아직 등록된 리뷰가 없습니다. 첫 리뷰를 작성해보세요!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reviews.map((r) => (
                <div key={r.id} style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{r.author}</span>
                    <span style={{ color: 'var(--accent-gold)', fontWeight: '700' }}>★ {r.rating}</span>
                  </div>
                  <p style={{ color: '#D1D5DB', fontSize: '0.95rem' }}>{r.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
