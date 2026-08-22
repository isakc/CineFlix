import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiUrl } from '../config/api';
import StarRatingInput from '../components/StarRatingInput';

const DEFAULT_BLANK_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24"><rect width="100%" height="100%" fill="%231A1B26"/><circle cx="12" cy="8" r="4" fill="%23787C99"/><path d="M12 14c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" fill="%23787C99"/></svg>`;

export default function MovieDetailPage({ user, userIdentifier, onOpenAuth }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [castList, setCastList] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [ratingSummary, setRatingSummary] = useState({ averageRating: 0, totalReviewCount: 0 });
  const [trailers, setTrailers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Form
  const [author, setAuthor] = useState(user ? user.nickname : '');
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [ratingMessage, setRatingMessage] = useState('');

  // Playlist Picker
  const [playlists, setPlaylists] = useState([]);
  const [showPlaylistPicker, setShowPlaylistPicker] = useState(false);
  const [addingToPlaylist, setAddingToPlaylist] = useState(false);
  const [addMessage, setAddMessage] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Unified Gallery Photos & Still Cuts
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // 4-Item Carousel / Slide States
  const [videoSlidePage, setVideoSlidePage] = useState(0);
  const [photoSlidePage, setPhotoSlidePage] = useState(0);

  useEffect(() => {
    if (user) setAuthor(user.nickname);
  }, [user]);

  useEffect(() => {
    if (id) {
      fetchMovieDetails(id);
      fetchMovieCredits(id);
      fetchMovieTrailers(id);
      fetchMovieImages(id);
      fetchReviews(id);
      fetchRatingSummary(id);
      if (user && user.nickname) {
        fetch(apiUrl(`/api/wishlists/check?userIdentifier=${encodeURIComponent(user.nickname)}&movieId=${id}`))
          .then((res) => res.json())
          .then((data) => setIsWishlisted(!!data))
          .catch(() => {});
      } else {
        setIsWishlisted(false);
      }
    }
  }, [id, user]);

  // Lightbox keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null || galleryPhotos.length === 0) return;

      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setLightboxIndex((prev) => (prev + 1) % galleryPhotos.length);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setLightboxIndex((prev) => (prev - 1 + galleryPhotos.length) % galleryPhotos.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, galleryPhotos]);

  const fetchMovieImages = async (movieId) => {
    setLoadingGallery(true);
    try {
      const res = await fetch(apiUrl(`/api/movies/${movieId}/images`));
      if (res.ok) {
        const data = await res.json();
        const posters = Array.isArray(data.posters) ? data.posters : [];
        const backdrops = Array.isArray(data.backdrops) ? data.backdrops : [];

        // Combine Korean posters first, then high-res scene cuts, deduplicating by filePath
        const seen = new Set();
        const combined = [];

        // Add Korean / official posters first
        for (const p of posters) {
          const path = p.file_path || p.filePath;
          if (path && !seen.has(path)) {
            seen.add(path);
            combined.push({ ...p, type: 'poster' });
          }
        }

        // Add backdrops / scene cuts
        for (const b of backdrops) {
          const path = b.file_path || b.filePath;
          if (path && !seen.has(path)) {
            seen.add(path);
            combined.push({ ...b, type: 'backdrop' });
          }
        }

        setGalleryPhotos(combined);
      }
    } catch (err) {
      console.error('Failed to fetch movie gallery images:', err);
    } finally {
      setLoadingGallery(false);
    }
  };

  const fetchMovieTrailers = async (movieId) => {
    try {
      const res = await fetch(apiUrl(`/api/movies/${movieId}/videos`));
      if (res.ok) {
        const data = await res.json();
        const results = Array.isArray(data.results) ? data.results : [];
        const ytVideos = results.filter(
          (v) => (v.site || '').toLowerCase() === 'youtube' && v.key
        );
        ytVideos.sort((a, b) => {
          const aIsTrailer = (a.type || '').toLowerCase() === 'trailer';
          const bIsTrailer = (b.type || '').toLowerCase() === 'trailer';
          if (aIsTrailer && !bIsTrailer) return -1;
          if (!aIsTrailer && bIsTrailer) return 1;
          return (b.official ? 1 : 0) - (a.official ? 1 : 0);
        });
        setTrailers(ytVideos);
      }
    } catch (err) {
      console.error('Failed to fetch movie trailers:', err);
    }
  };

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
        const list = Array.isArray(data.content) ? data.content : [];
        setReviews(list);

        if (user && user.nickname) {
          const myReview = list.find((r) => r.author === user.nickname);
          if (myReview) {
            setRating(Number(myReview.rating) || 0);
            setContent(myReview.content || '');
          }
        }
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
    if (!user) {
      if (window.confirm('내 영화 리스트에 담기 기능은 로그인 후 이용하실 수 있습니다.\n로그인 페이지로 이동하시겠습니까?')) {
        navigate('/login');
      }
      return;
    }
    fetchUserPlaylists();
    setShowPlaylistPicker(!showPlaylistPicker);
  };

  const handleAddToPlaylist = async (playlistId) => {
    if (!movie) return;
    if (!user) {
      if (window.confirm('내 영화 리스트에 담기 기능은 로그인 후 이용하실 수 있습니다.\n로그인 페이지로 이동하시겠습니까?')) {
        navigate('/login');
      }
      return;
    }
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

  const handleToggleWishlist = async () => {
    if (!movie || !movie.id) return;
    if (!user) {
      if (window.confirm('위시리스트 찜 기능은 로그인 후 이용하실 수 있습니다.\n로그인 페이지로 이동하시겠습니까?')) {
        navigate('/login');
      }
      return;
    }
    const nextState = !isWishlisted;
    setIsWishlisted(nextState);

    try {
      if (!nextState) {
        await fetch(apiUrl(`/api/wishlists?userIdentifier=${encodeURIComponent(user.nickname)}&movieId=${movie.id}`), { method: 'DELETE' });
      } else {
        const cleanTitle = (movie.title || '').replace(/^([🥇🥈🥉]|\d+위|\s|\.)+/g, '').trim();
        await fetch(apiUrl('/api/wishlists'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userIdentifier: user.nickname,
            tmdbMovieId: movie.id,
            movieTitle: cleanTitle,
            posterPath: movie.poster_path || movie.posterPath || ''
          })
        });
      }
    } catch (err) {
      console.error(err);
      setIsWishlisted(!nextState);
    }
  };

  const handleRatingChange = async (newRating) => {
    if (!user) {
      if (window.confirm('별점 평가는 로그인 후 저장하실 수 있습니다.\n로그인 페이지로 이동하시겠습니까?')) {
        navigate('/login');
      }
      return;
    }
    setRating(newRating);
    if (!movie || !movie.id) return;

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (user && user.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }
      const res = await fetch(apiUrl('/api/reviews'), {
        method: 'POST',
        headers,
        body: JSON.stringify({
          tmdbMovieId: movie.id,
          author: user.nickname,
          rating: parseFloat(newRating),
          content: content.trim()
        })
      });
      if (res.ok) {
        fetchReviews(movie.id);
        fetchRatingSummary(movie.id);
      }
    } catch (err) {
      console.error('Failed to save rating:', err);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      if (window.confirm('리뷰 작성은 로그인 후 이용하실 수 있습니다.\n로그인 페이지로 이동하시겠습니까?')) {
        navigate('/login');
      }
      return;
    }
    if (!rating || rating <= 0) {
      alert('별점을 0.5점 이상 선택해 주세요.');
      return;
    }
    if (!movie) return;

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
          author: user.nickname,
          rating: parseFloat(rating),
          content: content.trim()
        })
      });

      if (res.ok) {
        fetchReviews(movie.id);
        fetchRatingSummary(movie.id);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.message || '리뷰 등록에 실패했습니다.');
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
      alert('오류가 발생했습니다.');
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
                onClick={handleToggleWishlist}
                style={{
                  background: isWishlisted ? 'rgba(229, 9, 20, 0.95)' : 'rgba(255, 255, 255, 0.08)',
                  color: isWishlisted ? '#fff' : 'var(--text-primary)',
                  border: isWishlisted ? '1px solid rgba(255, 255, 255, 0.6)' : '1px solid var(--border-color)',
                  boxShadow: isWishlisted ? '0 0 16px rgba(229, 9, 20, 0.7)' : 'none',
                  borderRadius: '16px',
                  padding: '12px 22px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
              >
                <span>{isWishlisted ? '❤️' : '🤍'}</span>
                <span>{isWishlisted ? '위시리스트 찜 완료' : '위시리스트 담기'}</span>
              </button>

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
            gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))',
            gap: '18px'
          }}>
            {castList.map((actor, idx) => {
              const rawActorPhoto = actor.profile_path || actor.profilePath;
              const actorPhoto = (rawActorPhoto && typeof rawActorPhoto === 'string' && rawActorPhoto.length > 3)
                ? (rawActorPhoto.startsWith('http')
                  ? rawActorPhoto
                  : `https://image.tmdb.org/t/p/w185${rawActorPhoto.startsWith('/') ? rawActorPhoto : '/' + rawActorPhoto}`)
                : DEFAULT_BLANK_AVATAR;

              return (
                <div
                  key={actor.id || actor.name || idx}
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
                    style={{ width: '100%', height: '165px', objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{ padding: '12px 8px', background: 'rgba(0, 0, 0, 0.4)' }}>
                    <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '4px' }}>
                      {actor.name}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#FFD700', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {actor.character ? actor.character.replace(/\s*역$/g, '').trim() : '출연'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Community Reviews Section (Placed right below Cast & above Videos) */}
      <section className="glass" style={{ borderRadius: '24px', padding: '32px', border: '1px solid rgba(255, 255, 255, 0.1)', marginBottom: '48px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '20px' }}>✍️ 커뮤니티 리뷰 & 별점</h2>

        {!user ? (
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px dashed rgba(255, 255, 255, 0.18)',
            borderRadius: '20px',
            padding: '36px 24px',
            textAlign: 'center',
            marginBottom: '36px'
          }}>
            <div style={{ fontSize: '2.2rem', marginBottom: '10px' }}>🔒</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>
              별점 및 리뷰 작성을 위해 로그인이 필요합니다
            </h3>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/signup')}
                className="btn-primary"
                style={{
                  padding: '12px 28px',
                  fontSize: '0.95rem',
                  fontWeight: '800',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>✨</span>
                <span>무료 회원가입</span>
              </button>
              <button
                onClick={() => navigate('/login')}
                className="btn-wishlist"
                style={{
                  padding: '12px 24px',
                  fontSize: '0.95rem',
                  fontWeight: '700',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#fff'
                }}
              >
                <span>🔑</span>
                <span>로그인</span>
              </button>
            </div>
          </div>
        ) : (
          <form className="review-form" onSubmit={handleSubmitReview} style={{ marginBottom: '32px' }}>
            {/* 5-Star Rating Input */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '18px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: '20px'
            }}>
              <StarRatingInput value={rating} onChange={handleRatingChange} size={42} />
            </div>

            <div style={{ marginBottom: '14px', fontSize: '0.95rem', fontWeight: '700', color: '#E2E8F0' }}>
              👤 작성자: <span style={{ color: 'var(--accent-gold)' }}>{user.nickname}</span> 님
            </div>

            <textarea
              placeholder="영화에 대한 솔직한 한줄평이나 리뷰를 남겨보세요... (선택 사항)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
            />
            <div style={{ textAlign: 'right', marginTop: '12px' }}>
              <button type="submit" className="btn-primary" disabled={submitting} style={{ padding: '12px 28px' }}>
                {submitting ? '리뷰 저장 중...' : (content.trim() ? '리뷰 등록하기' : '별점 & 리뷰 저장')}
              </button>
            </div>
          </form>
        )}

        {(() => {
          const writtenReviews = reviews.filter((r) => r.content && r.content.trim().length > 0);
          return (
            <>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px' }}>
                💬 등록된 리뷰 목록 ({writtenReviews.length})
              </h3>
              {writtenReviews.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', padding: '20px 0', textAlign: 'center' }}>
                  아직 작성된 한줄평/리뷰가 없습니다. 첫 리뷰의 주인공이 되어보세요!
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {writtenReviews.map((r) => (
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
            </>
          );
        })()}
      </section>

      {/* Official YouTube Trailers & Videos Section (with 4-card slider) */}
      <section id="trailers-section" style={{ marginBottom: '48px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <span>🎞️</span>
            <span>공식 예고편 및 관련 영상 ({trailers.length})</span>
          </h2>

          {/* Slide Navigation Controls */}
          {trailers.length > 4 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: '700' }}>
                {videoSlidePage + 1} / {Math.ceil(trailers.length / 4)}
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => setVideoSlidePage((prev) => Math.max(0, prev - 1))}
                  disabled={videoSlidePage === 0}
                  style={{
                    background: videoSlidePage === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.12)',
                    color: videoSlidePage === 0 ? '#555' : '#fff',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    width: '36px',
                    height: '36px',
                    cursor: videoSlidePage === 0 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                    transition: 'all 0.2s ease'
                  }}
                  title="이전 영상"
                >
                  ❮
                </button>
                <button
                  onClick={() => setVideoSlidePage((prev) => Math.min(Math.ceil(trailers.length / 4) - 1, prev + 1))}
                  disabled={videoSlidePage >= Math.ceil(trailers.length / 4) - 1}
                  style={{
                    background: videoSlidePage >= Math.ceil(trailers.length / 4) - 1 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.12)',
                    color: videoSlidePage >= Math.ceil(trailers.length / 4) - 1 ? '#555' : '#fff',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    width: '36px',
                    height: '36px',
                    cursor: videoSlidePage >= Math.ceil(trailers.length / 4) - 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                    transition: 'all 0.2s ease'
                  }}
                  title="다음 영상"
                >
                  ❯
                </button>
              </div>
            </div>
          )}
        </div>

        {trailers.length === 0 ? (
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '16px',
            padding: '30px',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '14px' }}>
              등록된 공식 영상이 없습니다. YouTube에서 검색해 보세요!
            </p>
            <a
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent((movie.title || '') + ' 예고편')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'linear-gradient(135deg, #e50914, #b20710)',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: '0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>▶ YouTube에서 '{movie.title}' 예고편 검색</span>
            </a>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: '18px'
          }}>
            {trailers.slice(videoSlidePage * 4, (videoSlidePage + 1) * 4).map((vid) => {
              const ytUrl = `https://www.youtube.com/watch?v=${vid.key}`;
              const thumbUrl = `https://img.youtube.com/vi/${vid.key}/hqdefault.jpg`;

              return (
                <a
                  key={vid.id || vid.key}
                  href={ytUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass"
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.25s ease',
                    position: 'relative'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.borderColor = '#e50914';
                    e.currentTarget.style.boxShadow = '0 12px 28px rgba(229, 9, 20, 0.35)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#000', overflow: 'hidden' }}>
                    <img
                      src={thumbUrl}
                      alt={vid.name}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      loading="lazy"
                    />

                    {/* Red Play Button Icon Overlay */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(0, 0, 0, 0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <div style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #e50914, #b20710)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '1.3rem',
                        boxShadow: '0 4px 18px rgba(0,0,0,0.6)',
                        border: '2px solid rgba(255,255,255,0.3)'
                      }}>
                        ▶
                      </div>
                    </div>

                    {/* Badge: Trailer Type */}
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      background: 'rgba(0,0,0,0.8)',
                      backdropFilter: 'blur(6px)',
                      color: '#fff',
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      {vid.type || '예고편'}
                    </div>
                  </div>

                  <div style={{ padding: '14px 16px', background: 'rgba(15, 15, 22, 0.95)', flex: 1, display: 'flex', alignItems: 'center' }}>
                    <div style={{
                      fontWeight: '700',
                      fontSize: '0.92rem',
                      color: '#fff',
                      lineHeight: '1.4',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {vid.name}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </section>

      {/* Movie Photo Gallery & Still Cuts Unified Section (with 4-card slider) */}
      <section style={{ marginBottom: '48px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px'
        }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <span>📸</span>
            <span>영화 포토 & 현장 스틸컷 ({galleryPhotos.length})</span>
          </h2>

          {/* Slide Navigation Controls */}
          {galleryPhotos.length > 4 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: '700' }}>
                {photoSlidePage + 1} / {Math.ceil(galleryPhotos.length / 4)}
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => setPhotoSlidePage((prev) => Math.max(0, prev - 1))}
                  disabled={photoSlidePage === 0}
                  style={{
                    background: photoSlidePage === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.12)',
                    color: photoSlidePage === 0 ? '#555' : '#fff',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    width: '36px',
                    height: '36px',
                    cursor: photoSlidePage === 0 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                    transition: 'all 0.2s ease'
                  }}
                  title="이전 사진"
                >
                  ❮
                </button>
                <button
                  onClick={() => setPhotoSlidePage((prev) => Math.min(Math.ceil(galleryPhotos.length / 4) - 1, prev + 1))}
                  disabled={photoSlidePage >= Math.ceil(galleryPhotos.length / 4) - 1}
                  style={{
                    background: photoSlidePage >= Math.ceil(galleryPhotos.length / 4) - 1 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.12)',
                    color: photoSlidePage >= Math.ceil(galleryPhotos.length / 4) - 1 ? '#555' : '#fff',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    width: '36px',
                    height: '36px',
                    cursor: photoSlidePage >= Math.ceil(galleryPhotos.length / 4) - 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                    transition: 'all 0.2s ease'
                  }}
                  title="다음 사진"
                >
                  ❯
                </button>
              </div>
            </div>
          )}
        </div>

        {loadingGallery ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '16px' }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card-skeleton" style={{ height: '170px', borderRadius: '16px' }} />
            ))}
          </div>
        ) : galleryPhotos.length === 0 ? (
          <div className="glass" style={{
            padding: '36px 20px',
            borderRadius: '16px',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <p style={{ margin: 0, fontSize: '0.95rem' }}>
              등록된 영화 포토 이미지가 없습니다.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: '18px'
          }}>
            {galleryPhotos.slice(photoSlidePage * 4, (photoSlidePage + 1) * 4).map((img, idx) => {
              const globalIdx = photoSlidePage * 4 + idx;
              const rawPath = img.file_path || img.filePath;
              const thumbUrl = `https://image.tmdb.org/t/p/w780${rawPath}`;

              return (
                <div
                  key={globalIdx}
                  onClick={() => setLightboxIndex(globalIdx)}
                  className="glass"
                  style={{
                    position: 'relative',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    aspectRatio: '16 / 9',
                    transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                    e.currentTarget.style.borderColor = 'var(--accent-gold)';
                    e.currentTarget.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <img
                    src={thumbUrl}
                    alt={`${movie.title} 포토 ${globalIdx + 1}`}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)',
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      opacity: 0.9
                    }}
                  >
                    <span style={{ fontSize: '0.78rem', color: '#FFF', fontWeight: '700', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                      #{globalIdx + 1}
                    </span>
                    <span style={{
                      background: 'rgba(0,0,0,0.65)',
                      backdropFilter: 'blur(4px)',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      color: 'var(--accent-gold)',
                      fontWeight: '800',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span>🔍</span>
                      <span>확대</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Lightbox High-Resolution Full-Screen Modal */}
      {lightboxIndex !== null && (() => {
        const currentImg = galleryPhotos[lightboxIndex];
        if (!currentImg) return null;
        const rawPath = currentImg.file_path || currentImg.filePath;
        const highResUrl = `https://image.tmdb.org/t/p/original${rawPath}`;

        return (
          <div
            className="modal-overlay"
            onClick={() => setLightboxIndex(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.94)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 1300,
              padding: '20px'
            }}
          >
            {/* Top Toolbar */}
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '1200px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: '#fff',
                padding: '10px 0'
              }}
            >
              <div style={{ fontWeight: '800', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: 'var(--accent-gold)' }}>📸 {movie.title}</span>
                <span style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '2px 10px',
                  borderRadius: '12px',
                  fontSize: '0.85rem'
                }}>
                  {lightboxIndex + 1} / {galleryPhotos.length}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <a
                  href={highResUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: 'rgba(255, 255, 255, 0.12)',
                    color: '#fff',
                    textDecoration: 'none',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>⬇️</span>
                  <span>원본 크기로 보기</span>
                </a>
                <button
                  onClick={() => setLightboxIndex(null)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: 'none',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '38px',
                    height: '38px',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Center Image Container with Prev/Next Buttons */}
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                maxWidth: '90vw',
                maxHeight: '78vh',
                margin: 'auto'
              }}
            >
              {/* Prev Button */}
              {galleryPhotos.length > 1 && (
                <button
                  onClick={() => setLightboxIndex((prev) => (prev - 1 + galleryPhotos.length) % galleryPhotos.length)}
                  style={{
                    position: 'absolute',
                    left: '-60px',
                    background: 'rgba(0, 0, 0, 0.65)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '46px',
                    height: '46px',
                    fontSize: '1.4rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10
                  }}
                >
                  ❮
                </button>
              )}

              <img
                src={highResUrl}
                alt={`${movie.title} 포토`}
                style={{
                  maxWidth: '85vw',
                  maxHeight: '76vh',
                  objectFit: 'contain',
                  borderRadius: '12px',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
                  userSelect: 'none'
                }}
              />

              {/* Next Button */}
              {galleryPhotos.length > 1 && (
                <button
                  onClick={() => setLightboxIndex((prev) => (prev + 1) % galleryPhotos.length)}
                  style={{
                    position: 'absolute',
                    right: '-60px',
                    background: 'rgba(0, 0, 0, 0.65)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '46px',
                    height: '46px',
                    fontSize: '1.4rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10
                  }}
                >
                  ❯
                </button>
              )}
            </div>

            {/* Bottom Keyboard Hint */}
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', paddingBottom: '8px' }}>
              키보드 좌우 방향키(← / →)로 이동하거나 ESC로 닫을 수 있습니다.
            </div>
          </div>
        );
      })()}
    </div>
  );
}
