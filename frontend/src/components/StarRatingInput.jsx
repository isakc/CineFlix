import React, { useState } from 'react';

const RATING_LABELS = {
  0.5: '최악이에요 😫',
  1.0: '별로예요 🙁',
  1.5: '재미없어요 🥱',
  2.0: '조금 아쉬워요 😐',
  2.5: '그저 그래요 🤔',
  3.0: '보통이에요 🙂',
  3.5: '볼만해요 😊',
  4.0: '재밌어요 😄',
  4.5: '훌륭해요 🤩',
  5.0: '최고의 명작이에요! 🏆'
};

export default function StarRatingInput({ value = 0, onChange, size = 36, readOnly = false }) {
  const [hoverScore, setHoverScore] = useState(null);

  const displayScore = hoverScore !== null ? hoverScore : (Number(value) || 0);

  const handleMouseMove = (starIndex, e) => {
    if (readOnly) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isLeftHalf = x < rect.width / 2;
    const score = isLeftHalf ? starIndex - 0.5 : starIndex;
    setHoverScore(score);
  };

  const handleClick = (starIndex, e) => {
    if (readOnly || !onChange) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isLeftHalf = x < rect.width / 2;
    const score = isLeftHalf ? starIndex - 0.5 : starIndex;
    onChange(score);
  };

  const handleMouseLeave = () => {
    if (readOnly) return;
    setHoverScore(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
      {/* 5-Star Row */}
      <div
        onMouseLeave={handleMouseLeave}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          cursor: readOnly ? 'default' : 'pointer',
          padding: '6px 12px',
          background: 'rgba(255, 255, 255, 0.04)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          userSelect: 'none'
        }}
      >
        {[1, 2, 3, 4, 5].map((starIndex) => {
          let fill = 'rgba(255, 255, 255, 0.15)'; // Empty star color
          const gradientId = `watcha-star-half-${starIndex}`;

          if (displayScore >= starIndex) {
            fill = '#FFB800'; // Full star
          } else if (displayScore >= starIndex - 0.5) {
            fill = `url(#${gradientId})`; // Half star
          }

          return (
            <div
              key={starIndex}
              onMouseMove={(e) => handleMouseMove(starIndex, e)}
              onClick={(e) => handleClick(starIndex, e)}
              style={{
                width: `${size}px`,
                height: `${size}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.1s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                if (!readOnly) e.currentTarget.style.transform = 'scale(1.15)';
              }}
              onMouseLeave={(e) => {
                if (!readOnly) e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                style={{
                  filter: displayScore >= starIndex - 0.5 ? 'drop-shadow(0 0 6px rgba(255, 184, 0, 0.45))' : 'none',
                  transition: 'filter 0.15s ease'
                }}
              >
                <defs>
                  <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="50%" stopColor="#FFB800" />
                    <stop offset="50%" stopColor="rgba(255, 255, 255, 0.15)" />
                  </linearGradient>
                </defs>
                <path
                  d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                  fill={fill}
                />
              </svg>
            </div>
          );
        })}
      </div>

      {/* Dynamic Rating Score & Watcha Label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span
          style={{
            fontSize: '1.3rem',
            fontWeight: '900',
            color: '#FFB800',
            minWidth: '40px',
            textAlign: 'center'
          }}
        >
          {displayScore > 0 ? displayScore.toFixed(1) : '0.0'}
        </span>
        <span
          style={{
            fontSize: '0.92rem',
            fontWeight: '700',
            color: displayScore > 0 ? '#E2E8F0' : 'var(--text-secondary)'
          }}
        >
          {RATING_LABELS[displayScore] || (displayScore > 0 ? '별점 평가' : '별점을 선택해 주세요 ⭐')}
        </span>
      </div>
    </div>
  );
}
