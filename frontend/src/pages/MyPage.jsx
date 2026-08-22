import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiUrl } from '../config/api';
import StarRatingInput from '../components/StarRatingInput';
import CollectionDetailModal from '../components/CollectionDetailModal';

export default function MyPage({ user, onUpdateUser, onLogout, userIdentifier, onSelectMovie }) {
  const navigate = useNavigate();

  // Active Tab: 'reviews' | 'playlists' | 'wishlists' | 'settings'
  const [activeTab, setActiveTab] = useState('reviews');

  // Data States
  const [myReviews, setMyReviews] = useState([]);
  const [myPlaylists, setMyPlaylists] = useState([]);
  const [myWishlists, setMyWishlists] = useState([]);
  const [loading, setLoading] = useState(true);

  // Collection Create & Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [creatingCollection, setCreatingCollection] = useState(false);
  const [selectedMyCollection, setSelectedMyCollection] = useState(null);

  // Profile Edit State
  const [newNickname, setNewNickname] = useState(user ? user.nickname : '');
  const [updatingNickname, setUpdatingNickname] = useState(false);
  const [nicknameMsg, setNicknameMsg] = useState({ text: '', isError: false });

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ text: '', isError: false });

  // Review Edit State
  const [editingReview, setEditingReview] = useState(null);
  const [editRating, setEditRating] = useState(5.0);
  const [editContent, setEditContent] = useState('');
  const [savingReview, setSavingReview] = useState(false);

  // If not logged in, redirect
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Load My Reviews, Playlists, Wishlists
  useEffect(() => {
    if (!user) return;
    fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      // 1. Fetch My Reviews
      const authorQuery = encodeURIComponent(user.nickname);
      const reviewsRes = await fetch(apiUrl(`/api/reviews/my?author=${authorQuery}`), {
        headers: user.token ? { Authorization: `Bearer ${user.token}` } : {}
      });
      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        const list = Array.isArray(reviewsData) ? reviewsData : (reviewsData.content || []);
        setMyReviews(list);
      }

      // 2. Fetch My Playlists
      const uid = userIdentifier || (user ? (user.nickname || user.email) : '');
      const playlistsRes = await fetch(apiUrl(`/api/playlists?userIdentifier=${encodeURIComponent(uid)}`));
      if (playlistsRes.ok) {
        const playlistsData = await playlistsRes.json();
        const plList = Array.isArray(playlistsData) ? playlistsData : (playlistsData.content || []);
        setMyPlaylists(plList);
      }

      // 3. Fetch My Wishlists
      const wishlistsRes = await fetch(apiUrl(`/api/wishlists?userIdentifier=${encodeURIComponent(uid)}`));
      if (wishlistsRes.ok) {
        const wishlistsData = await wishlistsRes.json();
        const wList = Array.isArray(wishlistsData) ? wishlistsData : (wishlistsData.content || []);
        setMyWishlists(wList);
      }
    } catch (err) {
      console.error('Failed to fetch mypage data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Nickname Update
  const handleUpdateNickname = async (e) => {
    e.preventDefault();
    if (!newNickname.trim() || newNickname.trim() === user.nickname) return;

    setUpdatingNickname(true);
    setNicknameMsg({ text: '', isError: false });

    try {
      const res = await fetch(apiUrl('/api/auth/profile'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ nickname: newNickname.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || '닉네임 변경에 실패했습니다.');
      }

      const updatedUser = {
        ...user,
        token: data.accessToken || user.token,
        nickname: data.nickname || newNickname.trim()
      };

      if (onUpdateUser) {
        onUpdateUser(updatedUser);
      }

      setNicknameMsg({ text: '✓ 닉네임이 성공적으로 변경되었습니다!', isError: false });
    } catch (err) {
      setNicknameMsg({ text: err.message, isError: true });
    } finally {
      setUpdatingNickname(false);
    }
  };

  // Handle Password Update
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg({ text: '', isError: false });

    if (newPassword.length < 6) {
      setPasswordMsg({ text: '새 비밀번호는 6자리 이상이어야 합니다.', isError: true });
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      setPasswordMsg({ text: '새 비밀번호와 확인이 일치하지 않습니다.', isError: true });
      return;
    }

    setUpdatingPassword(true);

    try {
      const res = await fetch(apiUrl('/api/auth/password'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || '비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인해 주세요.');
      }

      setPasswordMsg({ text: '✓ 비밀번호가 성공적으로 변경되었습니다!', isError: false });
      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordConfirm('');
    } catch (err) {
      setPasswordMsg({ text: err.message, isError: true });
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Handle Review Delete
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('정말로 이 리뷰를 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(apiUrl(`/api/reviews/${reviewId}`), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      if (res.ok) {
        setMyReviews((prev) => prev.filter((r) => r.id !== reviewId));
      } else {
        alert('리뷰 삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error(err);
      alert('오류가 발생했습니다.');
    }
  };

  // Open Review Edit Modal
  const handleOpenEditReview = (review) => {
    setEditingReview(review);
    setEditRating(review.rating || 5.0);
    setEditContent(review.content || '');
  };

  // Submit Review Edit
  const handleSaveReviewEdit = async (e) => {
    e.preventDefault();
    if (!editingReview) return;

    setSavingReview(true);

    try {
      const res = await fetch(apiUrl(`/api/reviews/${editingReview.id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          rating: editRating,
          content: editContent
        })
      });

      if (res.ok) {
        setMyReviews((prev) =>
          prev.map((r) =>
            r.id === editingReview.id ? { ...r, rating: editRating, content: editContent } : r
          )
        );
        setEditingReview(null);
      } else {
        alert('리뷰 수정에 실패했습니다.');
      }
    } catch (err) {
      console.error(err);
      alert('오류가 발생했습니다.');
    } finally {
      setSavingReview(false);
    }
  };

  // Handle Remove Wishlist
  const handleRemoveWishlist = async (e, item) => {
    e.stopPropagation();
    try {
      if (item.id) {
        await fetch(apiUrl(`/api/wishlists/${item.id}`), { method: 'DELETE' });
      } else if (item.tmdbMovieId) {
        const uid = userIdentifier || (user ? (user.nickname || user.email) : '');
        await fetch(apiUrl(`/api/wishlists?userIdentifier=${encodeURIComponent(uid)}&movieId=${item.tmdbMovieId}`), { method: 'DELETE' });
      }
      setMyWishlists((prev) => prev.filter((w) => (item.id ? w.id !== item.id : w.tmdbMovieId !== item.tmdbMovieId)));
    } catch (err) {
      console.error('Failed to remove wishlist:', err);
    }
  };

  if (!user) return null;

  // Calculate Average Rating
  const avgGivenRating =
    myReviews.length > 0
      ? (myReviews.reduce((acc, r) => acc + (r.rating || 0), 0) / myReviews.length).toFixed(1)
      : '0.0';

  return (
    <div className="container" style={{ paddingTop: '35px', paddingBottom: '80px', maxWidth: '1080px' }}>
      {/* 1. Profile Hero Card */}
      <div
        className="glass"
        style={{
          borderRadius: '24px',
          padding: '36px',
          marginBottom: '32px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          background: 'linear-gradient(135deg, rgba(30, 30, 46, 0.9), rgba(15, 15, 26, 0.95))',
          boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #e50914, #ffb800)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              boxShadow: '0 0 25px rgba(229, 9, 20, 0.5)'
            }}
          >
            👤
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff', margin: 0 }}>
                {user.nickname}
              </h1>
              <span
                style={{
                  background: 'rgba(255, 193, 7, 0.2)',
                  color: 'var(--accent-gold)',
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 193, 7, 0.4)'
                }}
              >
                VIP MOVIE FAN
              </span>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
              ✉️ {user.email || '인증된 계정'}
            </div>
          </div>
        </div>

        {/* User Activity Stats Counters */}
        <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap' }}>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '12px 20px',
              borderRadius: '16px',
              textAlign: 'center',
              minWidth: '90px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#FFB800' }}>
              ★ {avgGivenRating}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>평균 별점</div>
          </div>

          <div
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '12px 20px',
              borderRadius: '16px',
              textAlign: 'center',
              minWidth: '90px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#fff' }}>
              {myReviews.length}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>평가 리뷰</div>
          </div>

          <div
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '12px 20px',
              borderRadius: '16px',
              textAlign: 'center',
              minWidth: '90px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#fff' }}>
              {myPlaylists.length}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>영화 컬렉션</div>
          </div>

          <div
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '12px 20px',
              borderRadius: '16px',
              textAlign: 'center',
              minWidth: '90px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#fff' }}>
              {myWishlists.length}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>위시리스트</div>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '28px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: '12px',
          overflowX: 'auto'
        }}
      >
        <button
          onClick={() => setActiveTab('reviews')}
          style={{
            padding: '10px 22px',
            borderRadius: '12px',
            border: 'none',
            background: activeTab === 'reviews' ? 'var(--accent-red)' : 'rgba(255, 255, 255, 0.05)',
            color: '#fff',
            fontWeight: '800',
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>✍️</span>
          <span>내 리뷰 & 별점 ({myReviews.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('playlists')}
          style={{
            padding: '10px 22px',
            borderRadius: '12px',
            border: 'none',
            background: activeTab === 'playlists' ? 'var(--accent-gold)' : 'rgba(255, 255, 255, 0.05)',
            color: activeTab === 'playlists' ? '#000' : '#fff',
            fontWeight: '800',
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>📁</span>
          <span>내 영화 컬렉션 ({myPlaylists.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('wishlists')}
          style={{
            padding: '10px 22px',
            borderRadius: '12px',
            border: 'none',
            background: activeTab === 'wishlists' ? '#FF4081' : 'rgba(255, 255, 255, 0.05)',
            color: '#fff',
            fontWeight: '800',
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>❤️</span>
          <span>위시리스트 ({myWishlists.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          style={{
            padding: '10px 22px',
            borderRadius: '12px',
            border: 'none',
            background: activeTab === 'settings' ? '#4A5568' : 'rgba(255, 255, 255, 0.05)',
            color: '#fff',
            fontWeight: '800',
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>⚙️</span>
          <span>프로필 & 계정 설정</span>
        </button>
      </div>

      {/* 3. Tab Contents */}

      {/* TAB 1: My Reviews & Ratings */}
      {activeTab === 'reviews' && (
        <div>
          {myReviews.length === 0 ? (
            <div
              className="glass"
              style={{
                borderRadius: '20px',
                padding: '60px 20px',
                textAlign: 'center',
                border: '1px dashed rgba(255, 255, 255, 0.15)'
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🍿</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>
                아직 작성한 별점이나 리뷰가 없습니다
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '24px' }}>
                박스오피스 순위나 추천 영화를 둘러보고 첫 0.5점 단위 솔직 리뷰를 남겨보세요!
              </p>
              <Link to="/" className="btn-primary" style={{ textDecoration: 'none', padding: '12px 28px' }}>
                🎬 영화 둘러보러 가기
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {myReviews.map((review) => (
                <div
                  key={review.id}
                  className="glass"
                  style={{
                    borderRadius: '18px',
                    padding: '22px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                    <div
                      style={{ display: 'flex', gap: '14px', alignItems: 'center', cursor: 'pointer' }}
                      onClick={() => navigate(`/movie/${review.tmdbMovieId}`)}
                    >
                      {review.moviePosterPath && (
                        <img
                          src={`https://image.tmdb.org/t/p/w200${review.moviePosterPath}`}
                          alt={review.movieTitle}
                          style={{
                            width: '48px',
                            height: '68px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
                          }}
                        />
                      )}
                      <div>
                        <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>
                          {review.movieTitle} ↗
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : '방금 전'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span
                        style={{
                          fontSize: '1.2rem',
                          fontWeight: '900',
                          color: '#FFB800',
                          background: 'rgba(255, 184, 0, 0.12)',
                          padding: '4px 12px',
                          borderRadius: '10px',
                          border: '1px solid rgba(255, 184, 0, 0.3)'
                        }}
                      >
                        ★ {review.rating ? Number(review.rating).toFixed(1) : '5.0'}
                      </span>
                      <button
                        onClick={() => handleOpenEditReview(review)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.08)',
                          color: '#E2E8F0',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: '700'
                        }}
                      >
                        ✏️ 수정
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        style={{
                          background: 'rgba(229, 9, 20, 0.15)',
                          color: '#FF6B6B',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: '700'
                        }}
                      >
                        🗑️ 삭제
                      </button>
                    </div>
                  </div>

                  {review.content ? (
                    <p
                      style={{
                        color: '#D1D5DB',
                        fontSize: '0.96rem',
                        lineHeight: '1.6',
                        margin: 0,
                        background: 'rgba(0,0,0,0.2)',
                        padding: '14px 16px',
                        borderRadius: '12px'
                      }}
                    >
                      {review.content}
                    </p>
                  ) : (
                    <div
                      style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.88rem',
                        background: 'rgba(255, 255, 255, 0.03)',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px dashed rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>⭐</span>
                      <span>별점만 평가한 영화입니다 (작성된 한줄평 없음)</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: My Collections */}
      {activeTab === 'playlists' && (
        <div>
          {/* Header Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📁</span>
                <span>내 영화 컬렉션 ({myPlaylists.length})</span>
              </h2>
              <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                나만의 테마로 영화들을 모아 컬렉션을 구성해보세요.
              </span>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                background: 'linear-gradient(135deg, #FFB800, #FF8C00)',
                color: '#000',
                border: 'none',
                padding: '10px 22px',
                borderRadius: '14px',
                fontWeight: '800',
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(255, 184, 0, 0.35)',
                transition: 'all 0.2s ease'
              }}
            >
              <span>➕</span>
              <span>새 컬렉션 만들기</span>
            </button>
          </div>

          {/* Create Collection Modal */}
          {showCreateModal && (
            <div
              className="modal-overlay"
              onClick={() => setShowCreateModal(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1400,
                padding: '20px'
              }}
            >
              <div
                className="glass"
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: '100%',
                  maxWidth: '520px',
                  borderRadius: '24px',
                  padding: '30px',
                  background: 'rgba(20, 20, 30, 0.98)',
                  border: '1px solid rgba(255, 193, 7, 0.4)',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📁</span>
                    <span>새 영화 컬렉션 만들기</span>
                  </h3>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    style={{ background: 'none', border: 'none', color: '#888', fontSize: '1.2rem', cursor: 'pointer' }}
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newTitle.trim()) return;

                  setCreatingCollection(true);
                  try {
                    const res = await fetch(apiUrl('/api/playlists'), {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        userIdentifier: user.nickname,
                        title: newTitle.trim(),
                        description: newDesc.trim(),
                        isPublic: Boolean(isPublic),
                        public: Boolean(isPublic)
                      })
                    });

                    if (res.ok) {
                      setNewTitle('');
                      setNewDesc('');
                      setIsPublic(true);
                      setShowCreateModal(false);
                      fetchUserData();
                    }
                  } catch (err) {
                    console.error('Failed to create collection:', err);
                  } finally {
                    setCreatingCollection(false);
                  }
                }}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '700', color: '#E2E8F0', marginBottom: '8px' }}>
                      컬렉션 제목 <span style={{ color: '#e50914' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="예: 비 오는 날 보고 싶은 감성 영화 명작선"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '0.95rem'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '700', color: '#E2E8F0', marginBottom: '8px' }}>
                      컬렉션 소개 및 설명 (선택)
                    </label>
                    <textarea
                      placeholder="이 컬렉션에 대한 짧은 소개나 추천 이유를 적어보세요..."
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '0.95rem',
                        resize: 'none'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="checkbox"
                      id="isPublicCheck"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent-gold)' }}
                    />
                    <label htmlFor="isPublicCheck" style={{ fontSize: '0.9rem', color: '#E2E8F0', cursor: 'pointer' }}>
                      🌐 <strong>전체 공개</strong> (체크 시 메인 추천 컬렉션에 노출됩니다)
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        color: '#CCC',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '12px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      disabled={creatingCollection}
                      className="btn-primary"
                      style={{ padding: '10px 24px', fontWeight: '800' }}
                    >
                      {creatingCollection ? '생성 중...' : '✓ 컬렉션 생성'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {myPlaylists.length === 0 ? (
            <div
              className="glass"
              style={{
                borderRadius: '20px',
                padding: '60px 20px',
                textAlign: 'center',
                border: '1px dashed rgba(255, 255, 255, 0.15)'
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📁</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>
                생성된 영화 컬렉션이 없습니다
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '24px' }}>
                상단의 [➕ 새 컬렉션 만들기]를 누르거나 영화 상세 페이지에서 [📁 내 컬렉션에 담기]를 통해 컬렉션을 시작해보세요!
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
                style={{ padding: '12px 28px', fontWeight: '800' }}
              >
                ➕ 첫 컬렉션 만들기
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '20px'
              }}
            >
              {myPlaylists.map((pl) => {
                const items = Array.isArray(pl.items) ? pl.items : [];
                const previewItems = items.slice(0, 4);

                return (
                  <div
                    key={pl.id}
                    className="glass"
                    onClick={() => setSelectedMyCollection(pl)}
                    style={{
                      borderRadius: '20px',
                      padding: '22px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      background: 'rgba(255, 255, 255, 0.03)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.borderColor = 'var(--accent-gold)';
                      e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div>
                      {/* Mosaic Poster Preview */}
                      <div style={{
                        height: '110px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        background: 'rgba(0, 0, 0, 0.5)',
                        display: 'grid',
                        gridTemplateColumns: previewItems.length > 0 ? `repeat(${Math.max(previewItems.length, 3)}, 1fr)` : '1fr',
                        gap: '4px',
                        padding: '4px',
                        marginBottom: '14px'
                      }}>
                        {previewItems.length === 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '0.85rem' }}>
                            수록된 영화 없음
                          </div>
                        ) : (
                          previewItems.map((item, idx) => {
                            const rawPoster = item.posterPath || item.poster_path;
                            const thumbUrl = (rawPoster && typeof rawPoster === 'string' && rawPoster.length > 3)
                              ? (rawPoster.startsWith('http') ? rawPoster : `https://image.tmdb.org/t/p/w300${rawPoster.startsWith('/') ? rawPoster : '/' + rawPoster}`)
                              : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&auto=format&fit=crop';

                            return (
                              <div key={idx} style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '6px', overflow: 'hidden' }}>
                                <img
                                  src={thumbUrl}
                                  alt={item.movieTitle || '영화 포스터'}
                                  loading="lazy"
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                  }}
                                />
                              </div>
                            );
                          })
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--accent-gold)', fontWeight: '800', background: 'rgba(255, 193, 7, 0.12)', padding: '2px 8px', borderRadius: '6px' }}>
                          COLLECTION #{pl.id}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700' }}>
                          🎬 {items.length}편 수록
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.18rem', fontWeight: '800', color: '#fff', margin: '0 0 8px 0', lineHeight: '1.4' }}>
                        {pl.title}
                      </h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.5', margin: 0 }}>
                        {pl.description || '컬렉션 설명이 없습니다.'}
                      </p>
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: pl.isPublic ? 'var(--accent-gold)' : '#888', fontWeight: '700', fontSize: '0.85rem' }}>
                        {pl.isPublic ? '🌐 전체 공개' : '🔒 나만 보기'}
                      </span>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMyCollection(pl);
                          }}
                          style={{
                            background: 'rgba(255, 255, 255, 0.08)',
                            color: '#fff',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.82rem',
                            fontWeight: '700'
                          }}
                        >
                          👁️ 보기
                        </button>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (!window.confirm(`'${pl.title}' 컬렉션을 정말로 삭제하시겠습니까?`)) return;

                            try {
                              const res = await fetch(apiUrl(`/api/playlists/${pl.id}?userIdentifier=${encodeURIComponent(user.nickname)}`), {
                                method: 'DELETE'
                              });
                              if (res.ok) {
                                setMyPlaylists((prev) => prev.filter((p) => p.id !== pl.id));
                              }
                            } catch (err) {
                              console.error('Failed to delete collection:', err);
                            }
                          }}
                          style={{
                            background: 'rgba(229, 9, 20, 0.15)',
                            color: '#FF6B6B',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.82rem',
                            fontWeight: '700'
                          }}
                        >
                          🗑️ 삭제
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Collection Detail Modal */}
          {selectedMyCollection && (
            <CollectionDetailModal
              collection={selectedMyCollection}
              onClose={() => setSelectedMyCollection(null)}
              onSelectMovie={(m) => {
                navigate(`/movie/${m.id}`);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}
        </div>
      )}

      {/* TAB 3: My Wishlists */}
      {activeTab === 'wishlists' && (
        <div>
          {myWishlists.length === 0 ? (
            <div
              className="glass"
              style={{
                borderRadius: '20px',
                padding: '60px 20px',
                textAlign: 'center',
                border: '1px dashed rgba(255, 255, 255, 0.15)'
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>❤️</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>
                위시리스트에 담긴 영화가 없습니다
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '24px' }}>
                보고 싶은 영화의 하트(❤️) 버튼을 눌러 위시리스트에 담아보세요!
              </p>
              <Link to="/" className="btn-primary" style={{ textDecoration: 'none', padding: '12px 28px' }}>
                영화 탐색하러 가기
              </Link>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '18px'
              }}
            >
              {myWishlists.map((w) => {
                const title = w.movieTitle || w.title || '영화';
                const poster = (w.posterPath && typeof w.posterPath === 'string')
                  ? (w.posterPath.startsWith('http') ? w.posterPath : `https://image.tmdb.org/t/p/w300${w.posterPath.startsWith('/') ? w.posterPath : '/' + w.posterPath}`)
                  : '/pB82tRdUZkn8GCHX9W3G1v9v5d.jpg';

                return (
                  <div
                    key={w.id || w.tmdbMovieId}
                    className="glass"
                    style={{
                      borderRadius: '16px',
                      padding: '14px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      position: 'relative',
                      cursor: 'pointer'
                    }}
                    onClick={() => navigate(`/movie/${w.tmdbMovieId}`)}
                  >
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '2/3', borderRadius: '10px', overflow: 'hidden' }}>
                      <img
                        src={poster}
                        alt={title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                      <button
                        onClick={(e) => handleRemoveWishlist(e, w)}
                        title="위시리스트에서 삭제"
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: 'rgba(0, 0, 0, 0.65)',
                          color: '#FF6B6B',
                          border: 'none',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          backdropFilter: 'blur(4px)'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                    <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {title}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Profile & Security Settings */}
      {activeTab === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Change Nickname Card */}
          <div
            className="glass"
            style={{
              borderRadius: '20px',
              padding: '30px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>
              👤 닉네임 변경
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
              시네플릭스에서 표시되는 닉네임을 변경합니다. (2자 이상 20자 이하)
            </p>

            {nicknameMsg.text && (
              <div
                style={{
                  background: nicknameMsg.isError ? 'rgba(229, 9, 20, 0.15)' : 'rgba(76, 175, 80, 0.15)',
                  border: nicknameMsg.isError ? '1px solid rgba(229, 9, 20, 0.4)' : '1px solid rgba(76, 175, 80, 0.4)',
                  color: nicknameMsg.isError ? '#FF6B6B' : '#81C784',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  marginBottom: '16px'
                }}
              >
                {nicknameMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdateNickname} style={{ display: 'flex', gap: '12px', maxWidth: '480px' }}>
              <input
                type="text"
                value={newNickname}
                onChange={(e) => setNewNickname(e.target.value)}
                placeholder="새 닉네임 입력"
                required
                maxLength={20}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                  fontSize: '0.95rem'
                }}
              />
              <button
                type="submit"
                className="btn-primary"
                disabled={updatingNickname || !newNickname.trim() || newNickname.trim() === user.nickname}
                style={{ padding: '0 24px', fontWeight: '800', whiteSpace: 'nowrap' }}
              >
                {updatingNickname ? '변경 중...' : '닉네임 변경'}
              </button>
            </form>
          </div>

          {/* Change Password Card */}
          <div
            className="glass"
            style={{
              borderRadius: '20px',
              padding: '30px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>
              🔒 비밀번호 변경
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
              계정 보안을 위해 현재 비밀번호를 입력하고 새로운 비밀번호를 설정하세요.
            </p>

            {passwordMsg.text && (
              <div
                style={{
                  background: passwordMsg.isError ? 'rgba(229, 9, 20, 0.15)' : 'rgba(76, 175, 80, 0.15)',
                  border: passwordMsg.isError ? '1px solid rgba(229, 9, 20, 0.4)' : '1px solid rgba(76, 175, 80, 0.4)',
                  color: passwordMsg.isError ? '#FF6B6B' : '#81C784',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  marginBottom: '16px'
                }}
              >
                {passwordMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '480px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '700', color: '#E2E8F0', marginBottom: '6px' }}>
                  현재 비밀번호
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="현재 비밀번호 입력"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#fff',
                    fontSize: '0.95rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '700', color: '#E2E8F0', marginBottom: '6px' }}>
                  새 비밀번호 (6자리 이상)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="새로운 비밀번호"
                  required
                  minLength={6}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#fff',
                    fontSize: '0.95rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '700', color: '#E2E8F0', marginBottom: '6px' }}>
                  새 비밀번호 확인
                </label>
                <input
                  type="password"
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  placeholder="새로운 비밀번호 확인"
                  required
                  minLength={6}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#fff',
                    fontSize: '0.95rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={updatingPassword}
                style={{ padding: '14px', fontWeight: '800', marginTop: '6px' }}
              >
                {updatingPassword ? '비밀번호 변경 중...' : '비밀번호 변경 완료'}
              </button>
            </form>
          </div>

          {/* Logout Section */}
          <div
            className="glass"
            style={{
              borderRadius: '20px',
              padding: '24px 30px',
              border: '1px solid rgba(229, 9, 20, 0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}
          >
            <div>
              <div style={{ fontWeight: '800', color: '#fff', fontSize: '1rem', marginBottom: '4px' }}>
                로그아웃
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
                현재 기기에서 시네플릭스 로그아웃합니다.
              </div>
            </div>
            <button
              onClick={onLogout}
              style={{
                background: 'rgba(229, 9, 20, 0.2)',
                color: '#FF6B6B',
                border: '1px solid rgba(229, 9, 20, 0.4)',
                padding: '10px 20px',
                borderRadius: '12px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              🚪 로그아웃
            </button>
          </div>
        </div>
      )}

      {/* 4. Edit Review Modal */}
      {editingReview && (
        <div
          className="modal-overlay"
          onClick={() => setEditingReview(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '20px'
          }}
        >
          <div
            className="modal-card glass"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '500px',
              borderRadius: '24px',
              padding: '32px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              background: '#151522'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', margin: 0 }}>
                ✍️ 리뷰 & 별점 수정
              </h3>
              <button
                onClick={() => setEditingReview(null)}
                style={{ background: 'none', border: 'none', color: '#AAA', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '16px', fontWeight: '700', color: 'var(--accent-gold)' }}>
              🎬 {editingReview.movieTitle}
            </div>

            <form onSubmit={handleSaveReviewEdit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <StarRatingInput value={editRating} onChange={(newRating) => setEditRating(newRating)} size={38} />
              </div>

              <textarea
                placeholder="감상평이나 리뷰를 입력해 보세요... (선택 사항)"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box'
                }}
              />

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setEditingReview(null)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#FFF',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: '12px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={savingReview}
                  style={{ padding: '10px 24px', fontWeight: '800' }}
                >
                  {savingReview ? '저장 중...' : '수정 완료'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
