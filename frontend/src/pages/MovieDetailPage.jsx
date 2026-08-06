import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiUrl } from '../config/api';

export default function MovieDetailPage({ user, userIdentifier }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [castList, setCastList] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [ratingSummary, setRatingSummary] = useState({ averageRating: 0, totalReviewCount: 0 });
  const [loading, setLoading] = useState(true);

  // Review Form
  const [author, setAuthor] = useState(user ? user.nickname : '');
  const [rating, setRating] = useState(5.0);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Playlist Picker
  const [playlists, setPlaylists] = useState([]);
  const [showPlaylistPicker, setShowPlaylistPicker] = useState(false);
  const [addingToPlaylist, setAddingToPlaylist] = useState(false);
  const [addMessage, setAddMessage] = useState('');

  useEffect(() => {
    if (user) setAuthor(user.nickname);
  }, [user]);

  useEffect(() => {
    if (id) {
      fetchMovieDetails(id);
      fetchMovieCredits(id);
      fetchReviews(id);
      fetchRatingSummary(id);
    }
  }, [id]);

  const fetchMovieDetails = async (movieId) => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl(`/api/movies/${movieId}`));
      if (res.ok) {
        const data = await res.json();
        setMovie(data);
      }
    } catch (err) {
      console.error('Failed to fetch movie details:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMovieCredits = async (movieId) => {
    try {
      const res = await fetch(apiUrl(`/api/movies/${movieId}/credits`));
      if (res.ok) {
        const data = await res.json();
        setCastList(Array.isArray(data.cast) ? data.cast.slice(0, 12) : []);
      }
    } catch (err) {
      console.error('Failed to fetch movie credits:', err);
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
    if (!movie) return;
    setAddingToPlaylist(true);
    try {
      const rawPoster = movie.poster_path || movie.posterPath || '';
      const cleanTitle = (movie.title || '').replace(/^([🥇🥈🥉]|\d+위|\s|\.)+/g, '').trim();

      const res = await fetch(apiUrl(`/api/playlists/${playlistId}/movies`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tmdbMovieId: movie.id,
          movieTitle: cleanTitle,
          posterPath: rawPoster
        })
      });

      if (res.ok) {
        setAddMessage('✅ 리스트에 성공적으로 담겼습니다!');
        setTimeout(() => setAddMessage(''), 2500);
        setShowPlaylistPicker(false);
      }
    } catch (err) {
      console.error('Failed to add movie to playlist:', err);
    } finally {
      setAddingToPlaylist(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!author.trim() || !content.trim() || !movie) return;

    setSubmitting(true);
    const headers = { 'Content-Type': 'application/json' };
    if (user && user.token) {
      headers['Authorization'] = `Bearer ${user.token}`;
    }

    try {
      const res = await fetch(apiUrl('/api/reviews'), {
        method: 'POST',
        headers,
        body: JSON.stringify({
          tmdbMovieId: movie.id,
          author,
          rating: parseFloat(rating),
          content
        })
      });

      if (res.ok) {
        if (!user) setAuthor('');
        setContent('');
        setRating(5.0);
        fetchReviews(movie.id);
        fetchRatingSummary(movie.id);
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
        🎬 영화 상세 정보를 불러오는 중입니다...
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-secondary)' }}>
        영화 정보를 찾을 수 없습니다.<br />
        <button onClick={() => navigate(-1)} className="btn-primary" style={{ marginTop: '20px' }}>
          ⬅️ 이전 화면으로 돌아가기
        </button>
      </div>
    );
  }

  const rawPoster = movie.poster_path || movie.posterPath || '';
  const posterUrl = (rawPoster && typeof rawPoster === 'string' && rawPoster.length > 3)
    ? (rawPoster.startsWith('http') ? rawPoster : `https://image.tmdb.org/t/p/w500${rawPoster.startsWith('/') ? rawPoster : '/' + rawPoster}`)
    : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop';

  return (
    <div className="container" style={{ paddingTop: '20px', paddingBottom: '80px' }}>
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        style={{
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-primary)',
          padding: '8px 18px',
          borderRadius: '12px',
          cursor: 'pointer',
          fontWeight: '700',
          marginBottom: '24px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <span>⬅️</span>
        <span>이전으로 돌아가기</span>
      </button>

      {/* Hero Movie Banner & Info Card */}
      <div
        className="glass"
        style={{
          borderRadius: '24px',
          padding: '36px',
          marginBottom: '40px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'linear-gradient(135deg, rgba(20, 20, 30, 0.9), rgba(10, 10, 18, 0.95))'
        }}
      >
        <div style={{ display: 'flex', gap: '36px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <img
            src={posterUrl}
            alt={movie.title}
            style={{
              width: '260px',
              borderRadius: '20px',
              objectFit: 'cover',
              boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          />

          <div style={{ flex: '1', minWidth: '300px' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0 0 12px 0', color: 'var(--text-primary)' }}>
              {movie.title || '제목 없음'}
            </h1>

            <div style={{ display: 'flex', gap: '18px', color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.95rem' }}>
              <span>📅 개봉일: {movie.release_date || movie.releaseDate || '미상'}</span>
              <span>⭐ TMDB 평점: ★ {movie.vote_average || movie.voteAverage ? Number(movie.vote_average || movie.voteAverage).toFixed(1) : '0.0'}</span>
            </div>

            {/* Rating Summary & Action Bar */}
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
              <div style={{
                background: 'rgba(255, 193, 7, 0.12)',
                border: '1px solid rgba(255, 193, 7, 0.3)',
                padding: '12px 20px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{ fontSize: '1.6rem', color: 'var(--accent-gold)' }}>★ {ratingSummary.averageRating}</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  유저 평점 ({ratingSummary.totalReviewCount}개 리뷰)
                </span>
              </div>

              <button
                onClick={handleOpenPlaylistPicker}
                style={{
                  background: 'rgba(255, 193, 7, 0.18)',
                  color: 'var(--accent-gold)',
                  border: '1px solid var(--accent-gold)',
                  borderRadius: '16px',
                  padding: '12px 22px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>🎬</span>
                <span>내 리스트에 담기</span>
              </button>

              {addMessage && (
                <span style={{ color: '#4CAF50', fontWeight: '700', fontSize: '0.95rem' }}>
                  {addMessage}
                </span>
              )}
            </div>

            {/* Playlist Picker Dropdown */}
            {showPlaylistPicker && (
              <div style={{
                background: 'rgba(20, 20, 30, 0.98)',
                border: '1px solid var(--accent-gold)',
                borderRadius: '16px',
                padding: '18px',
                marginBottom: '24px',
                maxWidth: '450px'
              }}>
                <div style={{ fontWeight: '700', marginBottom: '12px', color: '#fff', fontSize: '0.95rem' }}>
                  📂 담을 영화 리스트 선택:
                </div>
                {playlists.length === 0 ? (
                  <div style={{ fontSize: '0.88rem', color: '#AAA' }}>
                    등록된 영화 리스트가 없습니다. 상단 [🎬 영화 리스트] 메뉴에서 먼저 새 리스트를 생성해 보세요!
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
                          padding: '10px 14px',
                          borderRadius: '10px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '0.9rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span>🎬 {pl.title}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)' }}>+ 담기</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '10px' }}>📖 줄거리 정보</h3>
            <p style={{ lineHeight: '1.8', color: '#D1D5DB', fontSize: '1rem', margin: 0 }}>
              {movie.overview || '줄거리 정보가 등록되지 않았습니다.'}
            </p>
          </div>
        </div>
      </div>

      {/* Cast / Actors Section */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>🎭</span>
          <span>출연 배우 / 캐스팅 정보</span>
        </h2>

        {castList.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', padding: '20px 0' }}>
            등록된 출연 배우 정보가 없습니다.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: '18px'
          }}>
            {castList.map((actor) => {
              const actorPhoto = actor.profile_path || actor.profilePath
                ? `https://image.tmdb.org/t/p/w185${actor.profile_path || actor.profilePath}`
                : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop';

              return (
                <div
                  key={actor.id || actor.name}
                  className="glass"
                  style={{
                    borderRadius: '14px',
                    overflow: 'hidden',
                    textAlign: 'center',
                    border: '1px solid rgba(255,255,255,0.08)',
                    transition: 'transform 0.2s ease'
                  }}
                >
                  <img
                    src={actorPhoto}
                    alt={actor.name}
                    style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{ padding: '10px 8px' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#FFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {actor.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {actor.character ? `${actor.character} 역` : '출연'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Community Reviews Section */}
      <section className="glass" style={{ borderRadius: '24px', padding: '32px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '20px' }}>✍️ 커뮤니티 리뷰 & 별점</h2>

        <form className="review-form" onSubmit={handleSubmitReview} style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '14px' }}>
            <input
              type="text"
              placeholder="작성자 닉네임"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              readOnly={!!user}
              style={{ flex: 1, opacity: user ? 0.8 : 1 }}
              required
            />
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-color)',
                color: 'white',
                borderRadius: '8px',
                padding: '0 16px',
                fontFamily: 'inherit'
              }}
            >
              <option value="5.0" style={{ background: '#13151E' }}>★★★★★ 5.0 (최고예요)</option>
              <option value="4.0" style={{ background: '#13151E' }}>★★★★☆ 4.0 (재밌어요)</option>
              <option value="3.0" style={{ background: '#13151E' }}>★★★☆☆ 3.0 (보통이에요)</option>
              <option value="2.0" style={{ background: '#13151E' }}>★★☆☆☆ 2.0 (아쉬워요)</option>
              <option value="1.0" style={{ background: '#13151E' }}>★☆☆☆☆ 1.0 (별로예요)</option>
            </select>
          </div>
          <textarea
            placeholder="영화에 대한 감상평을 자유롭게 작성해 보세요..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            required
          />
          <div style={{ textAlign: 'right', marginTop: '12px' }}>
            <button type="submit" className="btn-primary" disabled={submitting} style={{ padding: '12px 28px' }}>
              {submitting ? '리뷰 작성 중...' : '리뷰 등록하기'}
            </button>
          </div>
        </form>

        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px' }}>💬 등록된 리뷰 목록 ({reviews.length})</h3>
        {reviews.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', padding: '20px 0', textAlign: 'center' }}>
            아직 등록된 리뷰가 없습니다. 첫 리뷰의 주인공이 되어보세요!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {reviews.map((r) => (
              <div key={r.id} style={{
                background: 'rgba(255, 255, 255, 0.04)',
                padding: '18px',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '1rem' }}>{r.author}</span>
                  <span style={{ color: 'var(--accent-gold)', fontWeight: '700' }}>★ {r.rating}</span>
                </div>
                <p style={{ color: '#D1D5DB', fontSize: '0.96rem', margin: 0 }}>{r.content}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
