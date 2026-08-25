import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';

export default function PhotoTicketModal({ movie, user, userRating = 5.0, userReview = '', onClose, onSaveTicket }) {
  if (!movie) return null;

  // Formatting initial values
  const todayStr = new Date().toISOString().split('T')[0].replace(/-/g, '.');
  const rawPoster = movie.poster_path || movie.posterPath || '';
  const rawBackdrop = movie.backdrop_path || movie.backdropPath || '';

  const defaultPosterUrl = (rawPoster && rawPoster.length > 3)
    ? (rawPoster.startsWith('http') ? rawPoster : `https://image.tmdb.org/t/p/w780${rawPoster.startsWith('/') ? rawPoster : '/' + rawPoster}`)
    : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop';

  const defaultBackdropUrl = (rawBackdrop && rawBackdrop.length > 3)
    ? (rawBackdrop.startsWith('http') ? rawBackdrop : `https://image.tmdb.org/t/p/w1280${rawBackdrop.startsWith('/') ? rawBackdrop : '/' + rawBackdrop}`)
    : defaultPosterUrl;

  // States
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(defaultPosterUrl);
  const [customPhotoUrl, setCustomPhotoUrl] = useState(null);
  const [viewDate, setViewDate] = useState(todayStr);
  const [viewTime, setViewTime] = useState('19:30');
  const [theater, setTheater] = useState('CineFlix 1관 (IMAX LASER)');
  const [seat, setSeat] = useState('H열 14번 (VIP)');
  const [rating, setRating] = useState(userRating > 0 ? userRating : 5.0);
  const [quote, setQuote] = useState(userReview || '극장에서 느낀 압도적인 감동과 여운!');
  const [theme, setTheme] = useState('gold'); // 'gold' | 'neon' | 'classic' | 'vintage'
  const [downloading, setDownloading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const frontTicketRef = useRef(null);
  const backTicketRef = useRef(null);
  const fileInputRef = useRef(null);

  // Available Photos Carousel
  const photoOptions = [
    { label: '공식 포스터', url: defaultPosterUrl },
    ...(defaultBackdropUrl !== defaultPosterUrl ? [{ label: '와이드 스틸컷', url: defaultBackdropUrl }] : [])
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setCustomPhotoUrl(uploadEvent.target.result);
        setSelectedPhoto(uploadEvent.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = async (side = 'current') => {
    setDownloading(true);
    try {
      const targetRef = (side === 'front' || (!isFlipped && side === 'current'))
        ? frontTicketRef.current
        : backTicketRef.current;

      if (!targetRef) return;

      const canvas = await html2canvas(targetRef, {
        scale: 3, // High-res 3x DPI for crystal-clear image export
        useCORS: true,
        allowTaint: true,
        backgroundColor: null
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const sideName = (!isFlipped && side === 'current') ? '앞면' : '뒷면';
      link.download = `CineFlix_포토티켓_${(movie.title || 'Movie').replace(/\s+/g, '_')}_${sideName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download photo ticket:', err);
      alert('티켓 다운로드 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setDownloading(false);
    }
  };

  const handleSaveToBook = () => {
    try {
      const savedTickets = JSON.parse(localStorage.getItem('cineflix_photo_tickets') || '[]');
      const newTicket = {
        id: 'TKT_' + Date.now(),
        movieId: movie.id,
        movieTitle: movie.title,
        photoUrl: selectedPhoto,
        viewDate,
        viewTime,
        theater,
        seat,
        rating,
        quote,
        theme,
        userIdentifier: user ? user.nickname : 'Guest',
        createdAt: new Date().toISOString()
      };

      const updated = [newTicket, ...savedTickets];
      localStorage.setItem('cineflix_photo_tickets', JSON.stringify(updated));
      window.dispatchEvent(new Event('cineflix_ticket_saved'));

      if (onSaveTicket) {
        onSaveTicket(newTicket);
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save ticket:', err);
    }
  };

  // Theme Styles Dictionary
  const themeStyles = {
    gold: {
      border: 'linear-gradient(135deg, #FFDF00, #D4AF37, #AA771C)',
      accent: 'var(--accent-gold, #FFC107)',
      stampColor: '#FFB800',
      badgeBg: 'rgba(255, 193, 7, 0.18)',
      textGradient: 'linear-gradient(135deg, #FFF, #FFE082)'
    },
    neon: {
      border: 'linear-gradient(135deg, #FF007F, #7928CA, #00DFD8)',
      accent: '#00DFD8',
      stampColor: '#FF007F',
      badgeBg: 'rgba(0, 223, 216, 0.18)',
      textGradient: 'linear-gradient(135deg, #FFF, #80E9FF)'
    },
    classic: {
      border: 'linear-gradient(135deg, #E50914, #9E000B, #500000)',
      accent: '#E50914',
      stampColor: '#E50914',
      badgeBg: 'rgba(229, 9, 20, 0.18)',
      textGradient: 'linear-gradient(135deg, #FFF, #FFA8A8)'
    },
    vintage: {
      border: 'linear-gradient(135deg, #D7CCC8, #8D6E63, #4E342E)',
      accent: '#D7CCC8',
      stampColor: '#BCAAA4',
      badgeBg: 'rgba(215, 204, 200, 0.18)',
      textGradient: 'linear-gradient(135deg, #FFF, #D7CCC8)'
    }
  };

  const currentTheme = themeStyles[theme] || themeStyles.gold;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1500,
        padding: '20px',
        overflowY: 'auto'
      }}
    >
      <div
        className="glass"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '920px',
          maxHeight: '92vh',
          borderRadius: '28px',
          padding: '32px',
          background: 'rgba(16, 16, 24, 0.98)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          overflowY: 'auto'
        }}
      >
        {/* Modal Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.8rem' }}>🎫</span>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#FFF', margin: 0 }}>
                나만의 시네마 포토티켓 제작
              </h2>
              <span style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                소장하고 싶은 영화의 포토와 관람 기록을 디지털 굿즈 티켓으로 만들어보세요!
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: '#FFF',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              fontSize: '1.1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Main Grid: Left Ticket 3D Preview | Right Customizer Controls */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 360px) 1fr',
          gap: '32px',
          alignItems: 'start'
        }}>
          {/* ================= LEFT: 3D Ticket Interactive Card ================= */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            {/* Card Flip Wrapper */}
            <div
              style={{
                perspective: '1200px',
                width: '320px',
                height: '520px',
                cursor: 'pointer'
              }}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}
              >
                {/* ---------------- FRONT FACE (Photo Art) ---------------- */}
                <div
                  ref={frontTicketRef}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backfaceVisibility: 'hidden',
                    borderRadius: '22px',
                    overflow: 'hidden',
                    background: '#0B0C10',
                    border: '2px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  {/* Background Image with Gradient Overlay */}
                  <img
                    src={selectedPhoto}
                    alt="Ticket Poster"
                    crossOrigin="anonymous"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: theme === 'vintage' ? 'sepia(0.3) contrast(1.1)' : (theme === 'neon' ? 'saturate(1.3) contrast(1.1)' : 'none')
                    }}
                  />

                  {/* Gradient Shadow Overlay */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0.4) 65%, rgba(0,0,0,0.95) 100%)'
                  }} />

                  {/* Top Notch Hole Cutouts (Ticket Styling) */}
                  <div style={{
                    position: 'absolute',
                    top: '55px',
                    left: '-12px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'rgba(16, 16, 24, 1)',
                    boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.6)',
                    zIndex: 5
                  }} />
                  <div style={{
                    position: 'absolute',
                    top: '55px',
                    right: '-12px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'rgba(16, 16, 24, 1)',
                    boxShadow: 'inset 2px 0 4px rgba(0,0,0,0.6)',
                    zIndex: 5
                  }} />

                  {/* Top Ticket Header */}
                  <div style={{
                    position: 'relative',
                    zIndex: 3,
                    padding: '16px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px dashed rgba(255, 255, 255, 0.25)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '1rem' }}>🎬</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: '900', color: '#FFF', letterSpacing: '2px' }}>
                        CINEFLIX
                      </span>
                    </div>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: '800',
                      color: currentTheme.accent,
                      background: 'rgba(0,0,0,0.6)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      PHOTO TICKET
                    </span>
                  </div>

                  {/* Bottom Movie Title & Gold Seal */}
                  <div style={{
                    position: 'relative',
                    zIndex: 3,
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: currentTheme.accent, fontSize: '0.9rem' }}>
                        {'★'.repeat(Math.round(rating))}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: '#DDD', fontWeight: '700' }}>
                        {Number(rating).toFixed(1)} / 5.0
                      </span>
                    </div>

                    <h3 style={{
                      fontSize: '1.45rem',
                      fontWeight: '900',
                      color: '#FFF',
                      margin: 0,
                      lineHeight: '1.2',
                      textShadow: '0 2px 8px rgba(0,0,0,0.8)'
                    }}>
                      {movie.title}
                    </h3>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.76rem',
                      color: '#BBB',
                      marginTop: '4px'
                    }}>
                      <span>{viewDate} • {theater.split(' ')[0]}</span>
                      <span style={{ color: currentTheme.accent, fontWeight: '800' }}>ADMIT ONE</span>
                    </div>
                  </div>
                </div>

                {/* ---------------- BACK FACE (Classic Ticket Admission Pass) ---------------- */}
                <div
                  ref={backTicketRef}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    borderRadius: '22px',
                    overflow: 'hidden',
                    background: 'linear-gradient(145deg, #14151F 0%, #0A0A10 100%)',
                    border: '2px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
                    padding: '24px 22px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxSizing: 'border-box'
                  }}
                >
                  {/* Top Notch Cutouts */}
                  <div style={{
                    position: 'absolute',
                    top: '55px',
                    left: '-12px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'rgba(16, 16, 24, 1)',
                    zIndex: 5
                  }} />
                  <div style={{
                    position: 'absolute',
                    top: '55px',
                    right: '-12px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'rgba(16, 16, 24, 1)',
                    zIndex: 5
                  }} />

                  {/* Header Title */}
                  <div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: '1px dashed rgba(255, 255, 255, 0.25)',
                      paddingBottom: '14px',
                      marginBottom: '16px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '1rem' }}>🎟️</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: '900', color: currentTheme.accent, letterSpacing: '1px' }}>
                          CINEFLIX PASS
                        </span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#888', fontWeight: '700' }}>
                        NO. {Math.floor(100000 + Math.random() * 900000)}
                      </span>
                    </div>

                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: '900',
                      color: '#FFF',
                      margin: '0 0 14px 0',
                      lineHeight: '1.3'
                    }}>
                      {movie.title}
                    </h3>

                    {/* Ticket Details Info Table */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '10px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      fontSize: '0.82rem',
                      marginBottom: '14px'
                    }}>
                      <div>
                        <div style={{ color: '#888', fontSize: '0.72rem' }}>관람일시 (DATE/TIME)</div>
                        <div style={{ color: '#FFF', fontWeight: '800', marginTop: '2px' }}>{viewDate} {viewTime}</div>
                      </div>
                      <div>
                        <div style={{ color: '#888', fontSize: '0.72rem' }}>상영관 (THEATER)</div>
                        <div style={{ color: currentTheme.accent, fontWeight: '800', marginTop: '2px' }}>{theater}</div>
                      </div>
                      <div>
                        <div style={{ color: '#888', fontSize: '0.72rem' }}>좌석 (SEAT)</div>
                        <div style={{ color: '#FFF', fontWeight: '800', marginTop: '2px' }}>{seat}</div>
                      </div>
                      <div>
                        <div style={{ color: '#888', fontSize: '0.72rem' }}>나의 별점 (RATING)</div>
                        <div style={{ color: currentTheme.accent, fontWeight: '800', marginTop: '2px' }}>★ {Number(rating).toFixed(1)} / 5.0</div>
                      </div>
                    </div>

                    {/* Memorable Quote Box */}
                    <div style={{
                      background: currentTheme.badgeBg,
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      padding: '12px',
                      color: '#E2E8F0',
                      fontSize: '0.82rem',
                      lineHeight: '1.45',
                      fontStyle: 'italic'
                    }}>
                      💬 "{quote}"
                    </div>
                  </div>

                  {/* Bottom Barcode & Wax Seal Stamp */}
                  <div>
                    {/* Barcode SVG Visual */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      borderTop: '1px dashed rgba(255, 255, 255, 0.2)',
                      paddingTop: '14px',
                      marginTop: '10px'
                    }}>
                      {/* Realistic Barcode Lines */}
                      <div style={{
                        display: 'flex',
                        height: '32px',
                        width: '85%',
                        gap: '2px',
                        justifyContent: 'center',
                        opacity: 0.85
                      }}>
                        {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1, 3, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4].map((w, i) => (
                          <div key={i} style={{ width: `${w}px`, background: '#FFF', height: '100%' }} />
                        ))}
                      </div>
                      <span style={{ fontSize: '0.68rem', letterSpacing: '4px', color: '#888', fontWeight: '800' }}>
                        CNFX • {movie.id} • {viewDate.replace(/\./g, '')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Flip Card Hint Button */}
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#FFF',
                padding: '8px 18px',
                borderRadius: '12px',
                fontSize: '0.86rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              <span>🔄</span>
              <span>{isFlipped ? '앞면(포토) 보기' : '뒷면(티켓 정보) 보기'}</span>
            </button>
          </div>

          {/* ================= RIGHT: Customizer Controls Panel ================= */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 1. Photo Selection */}
            <div>
              <label style={{ fontSize: '0.9rem', fontWeight: '800', color: '#FFF', marginBottom: '8px', display: 'block' }}>
                📸 포토티켓 이미지 선택
              </label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                {photoOptions.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedPhoto(opt.url)}
                    style={{
                      background: selectedPhoto === opt.url ? currentTheme.badgeBg : 'rgba(255, 255, 255, 0.05)',
                      border: selectedPhoto === opt.url ? `1px solid ${currentTheme.accent}` : '1px solid rgba(255, 255, 255, 0.1)',
                      color: selectedPhoto === opt.url ? currentTheme.accent : '#CCC',
                      padding: '8px 14px',
                      borderRadius: '10px',
                      fontSize: '0.84rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {opt.label}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  style={{
                    background: customPhotoUrl && selectedPhoto === customPhotoUrl ? currentTheme.badgeBg : 'rgba(255, 255, 255, 0.05)',
                    border: customPhotoUrl && selectedPhoto === customPhotoUrl ? `1px solid ${currentTheme.accent}` : '1px dashed rgba(255, 255, 255, 0.3)',
                    color: customPhotoUrl && selectedPhoto === customPhotoUrl ? currentTheme.accent : '#FFF',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    fontSize: '0.84rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>📁</span>
                  <span>{customPhotoUrl ? '내 사진 변경' : '내 사진 업로드'}</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            {/* 2. Theme Selection */}
            <div>
              <label style={{ fontSize: '0.9rem', fontWeight: '800', color: '#FFF', marginBottom: '8px', display: 'block' }}>
                🎨 티켓 테마 스타일
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {[
                  { id: 'gold', label: '골드 VIP', icon: '👑' },
                  { id: 'classic', label: '클래식 레드', icon: '🎬' },
                  { id: 'neon', label: '네온 사이버', icon: '⚡' },
                  { id: 'vintage', label: '빈티지 모노', icon: '🎞️' }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    style={{
                      background: theme === t.id ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                      border: theme === t.id ? '1px solid var(--accent-gold)' : '1px solid rgba(255, 255, 255, 0.08)',
                      color: theme === t.id ? 'var(--accent-gold)' : '#CCC',
                      padding: '10px 8px',
                      borderRadius: '12px',
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>{t.icon}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Ticket Metadata Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                  📅 관람 날짜
                </label>
                <input
                  type="text"
                  value={viewDate}
                  onChange={(e) => setViewDate(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#FFF',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    fontSize: '0.88rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                  ⏰ 관람 시간
                </label>
                <input
                  type="text"
                  value={viewTime}
                  onChange={(e) => setViewTime(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#FFF',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    fontSize: '0.88rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                  🏛️ 상영관
                </label>
                <input
                  type="text"
                  value={theater}
                  onChange={(e) => setTheater(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#FFF',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    fontSize: '0.88rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                  💺 좌석 번호
                </label>
                <input
                  type="text"
                  value={seat}
                  onChange={(e) => setSeat(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#FFF',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    fontSize: '0.88rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* 4. Rating & Memorable Quote */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  ⭐ 나의 별점: <strong style={{ color: 'var(--accent-gold)' }}>★ {Number(rating).toFixed(1)}</strong>
                </label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: s <= rating ? 'var(--accent-gold)' : '#555',
                        fontSize: '1.2rem',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                💬 기억에 남는 한줄평 / 명대사
              </label>
              <textarea
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                maxLength={90}
                rows={2}
                placeholder="영화에 대한 짧은 감상이나 명대사를 적어보세요."
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#FFF',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  fontSize: '0.88rem',
                  resize: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* 5. Action Download & Save Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => handleDownload('current')}
                disabled={downloading}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #FFB800, #FF8C00)',
                  color: '#000',
                  border: 'none',
                  padding: '13px 20px',
                  borderRadius: '14px',
                  fontWeight: '900',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 6px 18px rgba(255, 184, 0, 0.35)',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>📥</span>
                <span>{downloading ? '티켓 렌더링 중...' : '티켓 이미지 다운로드 (PNG)'}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveToBook}
                style={{
                  background: savedSuccess ? 'rgba(46, 204, 113, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                  border: savedSuccess ? '1px solid #2ECC71' : '1px solid rgba(255, 255, 255, 0.15)',
                  color: savedSuccess ? '#2ECC71' : '#FFF',
                  padding: '13px 20px',
                  borderRadius: '14px',
                  fontWeight: '800',
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>{savedSuccess ? '✅' : '💾'}</span>
                <span>{savedSuccess ? '티켓북 저장 완료!' : '내 티켓북에 보관'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
