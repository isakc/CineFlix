import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function OAuth2RedirectHandler({ onAuthSuccess }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const processedRef = React.useRef(false);

  useEffect(() => {
    if (processedRef.current) return;

    const token = searchParams.get('token');
    const email = searchParams.get('email');
    const nickname = searchParams.get('nickname');

    if (token) {
      processedRef.current = true;
      const decodedEmail = email ? decodeURIComponent(email) : '';
      const decodedNickname = nickname ? decodeURIComponent(nickname) : (decodedEmail.split('@')[0] || 'Member');

      const userData = {
        token,
        accessToken: token,
        email: decodedEmail,
        nickname: decodedNickname
      };

      try {
        localStorage.setItem('cineflix_user', JSON.stringify(userData));
        if (onAuthSuccess) {
          onAuthSuccess(userData);
        }
        // Smooth transition to main home
        setTimeout(() => {
          window.location.replace('/');
        }, 500);
      } catch (err) {
        console.error('Failed to save user auth session:', err);
        setError('로그인 정보를 저장하는 중 오류가 발생했습니다.');
      }
    } else {
      const errorMsg = searchParams.get('error') || '소셜 인증에 실패했습니다.';
      setError(decodeURIComponent(errorMsg));
    }
  }, [searchParams]);

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        className="glass"
        style={{
          padding: '48px 40px',
          borderRadius: '24px',
          textAlign: 'center',
          maxWidth: '440px',
          width: '100%',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          background: 'linear-gradient(145deg, rgba(20, 22, 32, 0.95), rgba(12, 13, 20, 0.98))',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)'
        }}
      >
        {error ? (
          <div>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#FF6B6B', marginBottom: '12px' }}>
              로그인 실패
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '24px', lineHeight: '1.5' }}>
              {error}
            </p>
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="btn-primary"
              style={{ padding: '12px 28px', fontWeight: '800' }}
            >
              로그인 페이지로 돌아가기
            </button>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '3.2rem', marginBottom: '16px', animation: 'pulse 1.5s infinite' }}>
              🎬
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: '900', color: '#FFF', marginBottom: '10px' }}>
              소셜 로그인 완료!
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '20px' }}>
              CineFlix 서비스로 안전하게 이동 중입니다...
            </p>
            {/* Elegant Loading Spinner */}
            <div
              style={{
                width: '36px',
                height: '36px',
                border: '3px solid rgba(255, 255, 255, 0.1)',
                borderTop: '3px solid var(--accent-red)',
                borderRadius: '50%',
                margin: '0 auto',
                animation: 'spin 0.8s linear infinite'
              }}
            />
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}
      </div>
    </div>
  );
}
