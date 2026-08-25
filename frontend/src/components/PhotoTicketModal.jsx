import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';

const DEFAULT_POSTER_FALLBACK = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop';

const resolveImageUrl = (path) => {
  if (!path || typeof path !== 'string' || path.length < 3) {
    return DEFAULT_POSTER_FALLBACK;
  }
  if (path.startsWith('data:') || path.startsWith('blob:') || path.startsWith('http')) {
    return path;
  }
  return `https://image.tmdb.org/t/p/w780${path.startsWith('/') ? path : '/' + path}`;
};

export default function PhotoTicketModal({
  movie,
  user,
  userRating = 5.0,
  userReview = '',
  stills = [],
  castList = [],
  onClose,
  onSaveTicket
}) {
  if (!movie) return null;

  // Format initial values
  const todayStr = new Date().toISOString().split('T')[0].replace(/-/g, '.');
  const ticketNumber = String(movie.id ? Math.abs(Number(movie.id)) % 1000 : 42).padStart(3, '0');

  // Extract all available photos from movie, posters, and stills
  const rawPoster = movie.poster_path || movie.posterPath || '';
  const rawBackdrop = movie.backdrop_path || movie.backdropPath || '';
  
  const posterUrl = resolveImageUrl(rawPoster);
  const backdropUrl = resolveImageUrl(rawBackdrop);

  // Build photo candidate list
  const photoCandidates = [];
  if (posterUrl && posterUrl !== DEFAULT_POSTER_FALLBACK) {
    photoCandidates.push({ label: '메인 포스터', url: posterUrl });
  }
  if (backdropUrl && backdropUrl !== DEFAULT_POSTER_FALLBACK && backdropUrl !== posterUrl) {
    photoCandidates.push({ label: '와이드 스틸컷', url: backdropUrl });
  }

  // Add still cuts from gallery if available
  if (Array.isArray(stills)) {
    stills.forEach((s, idx) => {
      const sUrl = resolveImageUrl(s.file_path || s.filePath || s);
      if (sUrl && !photoCandidates.some((p) => p.url === sUrl) && photoCandidates.length < 8) {
        photoCandidates.push({ label: `스틸컷 #${photoCandidates.length + 1}`, url: sUrl });
      }
    });
  }

  if (photoCandidates.length === 0) {
    photoCandidates.push({ label: '기본 포스터', url: DEFAULT_POSTER_FALLBACK });
  }

  // States
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(photoCandidates[0].url);
  const [customPhotoUrl, setCustomPhotoUrl] = useState(null);
  const [ticketNo, setTicketNo] = useState(`NO. ${ticketNumber}`);
  const [viewDate, setViewDate] = useState(todayStr);
  const [viewTime, setViewTime] = useState('19:30');
  const [theater, setTheater] = useState('CineFlix 특별관 (DOLBY CINEMA)');
  const [seat, setSeat] = useState('H열 14번 (VIP)');
  const [rating, setRating] = useState(userRating > 0 ? userRating : 5.0);
  const [quote, setQuote] = useState(userReview || '극장에서 느낀 압도적인 전율과 감동!');
  const [theme, setTheme] = useState('gold'); // 'gold' | 'silver' | 'neon' | 'noir'
  const [downloading, setDownloading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const frontTicketRef = useRef(null);
  const backTicketRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sync photo selection if candidate list updates
  useEffect(() => {
    if (photoCandidates[0] && !customPhotoUrl) {
      setSelectedPhoto(photoCandidates[0].url);
    }
  }, [movie]);

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
        scale: 3, // 3x High-DPI crystal-clear export
        useCORS: true,
        allowTaint: true,
        backgroundColor: null
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const sideName = (!isFlipped && side === 'current') ? '오리지널_아트(앞면)' : '티켓_인포(뒷면)';
      link.download = `CineFlix_오리지널티켓_${(movie.title || 'Movie').replace(/\s+/g, '_')}_${sideName}.png`;
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
        ticketNo,
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

  // Megabox Original Ticket Theme Presets
  const themeStyles = {
    gold: {
      accent: '#FFD700',
      badgeBg: 'rgba(255, 215, 0, 0.15)',
      borderColor: '#D4AF37',
      foilGradient: 'linear-gradient(135deg, #FFE066, #FFB800, #AA771C)',
      titleGlow: '0 0 12px rgba(255, 215, 0, 0.6)'
    },
    silver: {
      accent: '#E0E6ED',
      badgeBg: 'rgba(224, 230, 237, 0.15)',
      borderColor: '#A0AEC0',
      foilGradient: 'linear-gradient(135deg, #FFFFFF, #CBD5E1, #64748B)',
      titleGlow: '0 0 12px rgba(255, 255, 255, 0.5)'
    },
    neon: {
      accent: '#00F5D4',
      badgeBg: 'rgba(0, 245, 212, 0.15)',
      borderColor: '#7B2CBF',
      foilGradient: 'linear-gradient(135deg, #00F5D4, #7B2CBF, #F72585)',
      titleGlow: '0 0 12px rgba(0, 245, 212, 0.6)'
    },
    noir: {
      accent: '#E50914',
      badgeBg: 'rgba(229, 9, 20, 0.15)',
      borderColor: '#9E000B',
      foilGradient: 'linear-gradient(135deg, #FF4D4D, #E50914, #7A0006)',
      titleGlow: '0 0 12px rgba(229, 9, 20, 0.6)'
    }
  };

  const currentTheme = themeStyles[theme] || themeStyles.gold;

  // Main Actors snippet
  const castSnippet = Array.isArray(castList) && castList.length > 0
    ? castList.slice(0, 3).map((c) => c.name).join(', ')
    : '';

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.9)',
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
          maxWidth: '960px',
          maxHeight: '94vh',
          borderRadius: '28px',
          padding: '30px 34px',
          background: 'rgba(14, 15, 22, 0.98)',
          border: '1px solid rgba(255, 215, 0, 0.25)',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.85)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          overflowY: 'auto'
        }}
      >
        {/* Modal Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.8rem' }}>🎟️</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.45rem', fontWeight: '900', color: '#FFF', margin: 0 }}>
                  오리지널 티켓 (Original Ticket) 제작기
                </h2>
                <span style={{
                  background: 'linear-gradient(135deg, #FFB800, #FF8C00)',
                  color: '#000',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: '900'
                }}>
                  도무송 시그니처 컷
                </span>
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                메가박스 시그니처 굿즈 스타일의 도무송 타공과 금박 인포메이션이 담긴 오리지널 티켓입니다.
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

        {/* Modal Main Grid: Left Die-Cut Ticket 3D Preview | Right Customizer Controls */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(300px, 330px) 1fr',
          gap: '36px',
          alignItems: 'start'
        }}>
          {/* ================= LEFT: Megabox Original Ticket Die-Cut 3D Card ================= */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            {/* 3D Flip Card Container */}
            <div
              style={{
                perspective: '1200px',
                width: '300px',
                height: '560px',
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
                {/* ---------------- FRONT FACE (Original Ticket Art with Die-Cut Notches) ---------------- */}
                <div
                  ref={frontTicketRef}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backfaceVisibility: 'hidden',
                    borderRadius: '18px',
                    overflow: 'hidden',
                    background: '#0B0C10',
                    border: '1.5px solid rgba(255, 255, 255, 0.16)',
                    boxShadow: '0 24px 50px rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxSizing: 'border-box'
                  }}
                >
                  {/* Photo Art Background Image */}
                  <img
                    src={selectedPhoto}
                    alt={movie.title || 'Ticket Art'}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = DEFAULT_POSTER_FALLBACK;
                    }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: theme === 'noir' ? 'contrast(1.15) saturate(1.1)' : (theme === 'silver' ? 'contrast(1.1)' : 'none')
                    }}
                  />

                  {/* Gradient Shadow Overlay */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.92) 100%)'
                  }} />

                  {/* ✂️ DIE-CUT TOP STAMP ROW (위쪽 도무송 펀칭 타공) */}
                  <div style={{
                    position: 'absolute',
                    top: '-9px',
                    left: '0',
                    right: '0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0 6px',
                    zIndex: 10,
                    pointerEvents: 'none'
                  }}>
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        style={{
                          width: '15px',
                          height: '15px',
                          borderRadius: '50%',
                          background: 'rgba(14, 15, 22, 1)',
                          boxShadow: 'inset 0 -2px 3px rgba(0,0,0,0.8)'
                        }}
                      />
                    ))}
                  </div>

                  {/* ✂️ DIE-CUT BOTTOM STAMP ROW (아래쪽 도무송 펀칭 타공) */}
                  <div style={{
                    position: 'absolute',
                    bottom: '-9px',
                    left: '0',
                    right: '0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0 6px',
                    zIndex: 10,
                    pointerEvents: 'none'
                  }}>
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        style={{
                          width: '15px',
                          height: '15px',
                          borderRadius: '50%',
                          background: 'rgba(14, 15, 22, 1)',
                          boxShadow: 'inset 0 2px 3px rgba(0,0,0,0.8)'
                        }}
                      />
                    ))}
                  </div>

                  {/* Top Perforated Stub Header */}
                  <div style={{
                    position: 'relative',
                    zIndex: 4,
                    height: '72px',
                    padding: '0 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '2px dashed rgba(255, 255, 255, 0.4)',
                    boxSizing: 'border-box'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.62rem', fontWeight: '900', letterSpacing: '2px', color: '#BBB' }}>
                        ● CINEFLIX ●
                      </span>
                      <span style={{ fontSize: '0.78rem', fontWeight: '900', color: currentTheme.accent, letterSpacing: '1px' }}>
                        ORIGINAL TICKET
                      </span>
                    </div>

                    <div style={{
                      background: 'rgba(0, 0, 0, 0.7)',
                      border: `1px solid ${currentTheme.borderColor}`,
                      padding: '3px 9px',
                      borderRadius: '8px',
                      fontSize: '0.76rem',
                      fontWeight: '900',
                      color: currentTheme.accent,
                      letterSpacing: '1px'
                    }}>
                      {ticketNo}
                    </div>
                  </div>

                  {/* Bottom Movie Title & Details Plate */}
                  <div style={{
                    position: 'relative',
                    zIndex: 4,
                    padding: '20px 18px 52px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    boxSizing: 'border-box'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: currentTheme.accent, fontSize: '0.92rem' }}>
                        {'★'.repeat(Math.round(rating))}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: '#EEE', fontWeight: '800' }}>
                        {Number(rating).toFixed(1)} / 5.0
                      </span>
                    </div>

                    <h3 style={{
                      fontSize: '1.35rem',
                      fontWeight: '900',
                      color: '#FFF',
                      margin: 0,
                      lineHeight: '1.25',
                      textShadow: '0 2px 10px rgba(0,0,0,0.9)'
                    }}>
                      {movie.title}
                    </h3>

                    {castSnippet && (
                      <div style={{ fontSize: '0.74rem', color: '#DDD', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                        출연: {castSnippet}
                      </div>
                    )}

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.72rem',
                      color: '#AAA',
                      marginTop: '4px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.15)',
                      paddingTop: '6px'
                    }}>
                      <span>{viewDate}</span>
                      <span style={{ color: currentTheme.accent, fontWeight: '800' }}>SPECIAL EDITION</span>
                    </div>
                  </div>

                  {/* Bottom Die-Cut Stub Footer */}
                  <div style={{
                    position: 'relative',
                    zIndex: 4,
                    height: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderTop: '2px dashed rgba(255, 255, 255, 0.4)',
                    background: 'rgba(0, 0, 0, 0.65)',
                    fontSize: '0.68rem',
                    fontWeight: '900',
                    color: '#FFF',
                    letterSpacing: '3px'
                  }}>
                    ★ ADMIT ONE ★
                  </div>
                </div>

                {/* ---------------- BACK FACE (Megabox Original Ticket Info Pass) ---------------- */}
                <div
                  ref={backTicketRef}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    borderRadius: '18px',
                    overflow: 'hidden',
                    background: 'linear-gradient(150deg, #161724 0%, #0A0A10 100%)',
                    border: '1.5px solid rgba(255, 255, 255, 0.16)',
                    boxShadow: '0 24px 50px rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxSizing: 'border-box'
                  }}
                >
                  {/* ✂️ DIE-CUT TOP STAMP ROW (위쪽 도무송 펀칭 타공) */}
                  <div style={{
                    position: 'absolute',
                    top: '-9px',
                    left: '0',
                    right: '0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0 6px',
                    zIndex: 10,
                    pointerEvents: 'none'
                  }}>
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        style={{
                          width: '15px',
                          height: '15px',
                          borderRadius: '50%',
                          background: 'rgba(14, 15, 22, 1)',
                          boxShadow: 'inset 0 -2px 3px rgba(0,0,0,0.8)'
                        }}
                      />
                    ))}
                  </div>

                  {/* ✂️ DIE-CUT BOTTOM STAMP ROW (아래쪽 도무송 펀칭 타공) */}
                  <div style={{
                    position: 'absolute',
                    bottom: '-9px',
                    left: '0',
                    right: '0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0 6px',
                    zIndex: 10,
                    pointerEvents: 'none'
                  }}>
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        style={{
                          width: '15px',
                          height: '15px',
                          borderRadius: '50%',
                          background: 'rgba(14, 15, 22, 1)',
                          boxShadow: 'inset 0 2px 3px rgba(0,0,0,0.8)'
                        }}
                      />
                    ))}
                  </div>

                  {/* Top Perforated Stub Header */}
                  <div style={{
                    height: '72px',
                    padding: '0 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '2px dashed rgba(255, 255, 255, 0.4)',
                    boxSizing: 'border-box'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '1rem' }}>🎟️</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: '900', color: currentTheme.accent, letterSpacing: '1px' }}>
                        ORIGINAL PASS
                      </span>
                    </div>

                    <div style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${currentTheme.borderColor}`,
                      padding: '3px 9px',
                      borderRadius: '8px',
                      fontSize: '0.74rem',
                      fontWeight: '900',
                      color: currentTheme.accent
                    }}>
                      {ticketNo}
                    </div>
                  </div>

                  {/* Middle Ticket Specs & Review Information */}
                  <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                    <h3 style={{
                      fontSize: '1.2rem',
                      fontWeight: '900',
                      color: '#FFF',
                      margin: 0,
                      lineHeight: '1.3'
                    }}>
                      {movie.title}
                    </h3>

                    {/* Meta Info Grid */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      padding: '10px 12px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      fontSize: '0.78rem'
                    }}>
                      <div>
                        <div style={{ color: '#888', fontSize: '0.68rem', fontWeight: '700' }}>DATE & TIME</div>
                        <div style={{ color: '#FFF', fontWeight: '800', marginTop: '2px' }}>{viewDate} {viewTime}</div>
                      </div>
                      <div>
                        <div style={{ color: '#888', fontSize: '0.68rem', fontWeight: '700' }}>THEATER</div>
                        <div style={{ color: currentTheme.accent, fontWeight: '800', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {theater.split(' ')[0]}
                        </div>
                      </div>
                      <div>
                        <div style={{ color: '#888', fontSize: '0.68rem', fontWeight: '700' }}>SEAT NO.</div>
                        <div style={{ color: '#FFF', fontWeight: '800', marginTop: '2px' }}>{seat}</div>
                      </div>
                      <div>
                        <div style={{ color: '#888', fontSize: '0.68rem', fontWeight: '700' }}>MY RATING</div>
                        <div style={{ color: currentTheme.accent, fontWeight: '800', marginTop: '2px' }}>★ {Number(rating).toFixed(1)} / 5.0</div>
                      </div>
                    </div>

                    {/* Memorable Review / Quote Box */}
                    <div style={{
                      background: currentTheme.badgeBg,
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      padding: '12px',
                      color: '#E2E8F0',
                      fontSize: '0.8rem',
                      lineHeight: '1.45',
                      fontStyle: 'italic'
                    }}>
                      💬 "{quote}"
                    </div>

                    {/* Barcode Graphic */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      marginTop: 'auto'
                    }}>
                      <div style={{
                        display: 'flex',
                        height: '28px',
                        width: '80%',
                        gap: '2px',
                        justifyContent: 'center',
                        opacity: 0.85
                      }}>
                        {[2, 1, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 3, 2, 4].map((w, i) => (
                          <div key={i} style={{ width: `${w}px`, background: '#FFF', height: '100%' }} />
                        ))}
                      </div>
                      <span style={{ fontSize: '0.65rem', letterSpacing: '3px', color: '#888', fontWeight: '800' }}>
                        ORIGINAL • {movie.id} • {ticketNumber}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Die-Cut Stub Footer */}
                  <div style={{
                    height: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderTop: '2px dashed rgba(255, 255, 255, 0.4)',
                    background: 'rgba(0, 0, 0, 0.65)',
                    fontSize: '0.68rem',
                    fontWeight: '900',
                    color: currentTheme.accent,
                    letterSpacing: '2px'
                  }}>
                    ★ CINEFLIX AUTHENTIC ★
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
                padding: '8px 20px',
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
              <span>{isFlipped ? '앞면(오리지널 아트) 보기' : '뒷면(티켓 인포) 보기'}</span>
            </button>
          </div>

          {/* ================= RIGHT: Customizer Controls Panel ================= */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* 1. Photo Selection Carousel */}
            <div>
              <label style={{ fontSize: '0.88rem', fontWeight: '800', color: '#FFF', marginBottom: '8px', display: 'block' }}>
                📸 오리지널 아트 이미지 선택 ({photoCandidates.length}개)
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                {photoCandidates.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedPhoto(opt.url)}
                    style={{
                      background: selectedPhoto === opt.url ? currentTheme.badgeBg : 'rgba(255, 255, 255, 0.05)',
                      border: selectedPhoto === opt.url ? `1.5px solid ${currentTheme.accent}` : '1px solid rgba(255, 255, 255, 0.1)',
                      color: selectedPhoto === opt.url ? currentTheme.accent : '#CCC',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
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
                    border: customPhotoUrl && selectedPhoto === customPhotoUrl ? `1.5px solid ${currentTheme.accent}` : '1px dashed rgba(255, 255, 255, 0.3)',
                    color: customPhotoUrl && selectedPhoto === customPhotoUrl ? currentTheme.accent : '#FFF',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
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
              <label style={{ fontSize: '0.88rem', fontWeight: '800', color: '#FFF', marginBottom: '8px', display: 'block' }}>
                🎨 오리지널 티켓 가공 테마
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {[
                  { id: 'gold', label: '골드 포일', icon: '👑' },
                  { id: 'silver', label: '실버 홀로그램', icon: '✨' },
                  { id: 'neon', label: '사이버 네온', icon: '⚡' },
                  { id: 'noir', label: '시네마 느와르', icon: '🎬' }
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

            {/* 3. Ticket Number & Specs Customizer */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                  🏷️ 티켓 고유 넘버 (NO.)
                </label>
                <input
                  type="text"
                  value={ticketNo}
                  onChange={(e) => setTicketNo(e.target.value)}
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
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                  📅 관람 일시
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    value={viewDate}
                    onChange={(e) => setViewDate(e.target.value)}
                    style={{
                      flex: 2,
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#FFF',
                      borderRadius: '10px',
                      padding: '8px 10px',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box'
                    }}
                  />
                  <input
                    type="text"
                    value={viewTime}
                    onChange={(e) => setViewTime(e.target.value)}
                    style={{
                      flex: 1,
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#FFF',
                      borderRadius: '10px',
                      padding: '8px 10px',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
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
                    fontSize: '0.85rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                  💺 좌석
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
                    fontSize: '0.85rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* 4. Rating & Quote */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
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

              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
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
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
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
                <span>{downloading ? '티켓 렌더링 중...' : '오리지널 티켓 다운로드 (PNG)'}</span>
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
