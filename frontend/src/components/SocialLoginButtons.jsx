import React from 'react';
import { apiUrl } from '../config/api';

export default function SocialLoginButtons() {
  const handleSocialLogin = (provider) => {
    // Redirect directly to Spring Security OAuth2 authorization endpoint
    window.location.href = apiUrl(`/oauth2/authorization/${provider}`);
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Divider */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        margin: '18px 0 10px 0',
        color: 'var(--text-secondary, #888)',
        fontSize: '0.82rem'
      }}>
        <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.12)' }} />
        <span style={{ padding: '0 12px', fontWeight: '700' }}>또는 소셜 계정으로 계속하기</span>
        <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.12)' }} />
      </div>

      {/* Google Login Button */}
      <button
        type="button"
        onClick={() => handleSocialLogin('google')}
        style={{
          width: '100%',
          padding: '11px 16px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          background: '#FFFFFF',
          color: '#1F1F1F',
          fontWeight: '700',
          fontSize: '0.92rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 4px 14px rgba(255, 255, 255, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
        }}
      >
        {/* Google G Logo SVG */}
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>구글 계정으로 계속하기</span>
      </button>

      {/* Naver Login Button */}
      <button
        type="button"
        onClick={() => handleSocialLogin('naver')}
        style={{
          width: '100%',
          padding: '11px 16px',
          borderRadius: '12px',
          border: 'none',
          background: '#03C75A',
          color: '#FFFFFF',
          fontWeight: '800',
          fontSize: '0.92rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          boxShadow: '0 2px 8px rgba(3, 199, 90, 0.25)',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 4px 14px rgba(3, 199, 90, 0.45)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(3, 199, 90, 0.25)';
        }}
      >
        {/* Naver N Logo SVG */}
        <svg width="15" height="15" viewBox="0 0 24 24" fill="#FFFFFF">
          <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845z" />
        </svg>
        <span>네이버 아이디로 로그인</span>
      </button>
    </div>
  );
}
