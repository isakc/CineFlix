import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiUrl } from '../config/api';

export default function LoginPage({ onAuthSuccess }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || '이메일 또는 비밀번호가 일치하지 않습니다.');
      }

      const normalized = {
        ...data,
        token: data.accessToken || data.token,
        nickname: data.nickname,
        email: data.email || email
      };

      if (onAuthSuccess) {
        onAuthSuccess(normalized);
      }

      navigate(-1);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container"
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px 80px 20px'
      }}
    >
      <div
        className="glass"
        style={{
          width: '100%',
          maxWidth: '460px',
          borderRadius: '24px',
          padding: '40px 36px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          background: 'linear-gradient(145deg, rgba(25, 25, 38, 0.95), rgba(12, 12, 20, 0.98))',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
        }}
      >
        {/* Header & Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🎬</div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: '900', margin: '0 0 8px 0', color: '#fff' }}>
            Cine<span style={{ color: 'var(--accent-red)' }}>Flix</span> 로그인
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: 0 }}>
            시네플릭스 계정으로 로그인하세요.
          </p>
        </div>

        {/* Error Message Box */}
        {errorMsg && (
          <div
            style={{
              background: 'rgba(229, 9, 20, 0.15)',
              border: '1px solid rgba(229, 9, 20, 0.4)',
              color: '#FF6B6B',
              padding: '12px 16px',
              borderRadius: '12px',
              fontSize: '0.9rem',
              fontWeight: '600',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '700', color: '#E2E8F0', marginBottom: '8px' }}>
              이메일 주소
            </label>
            <input
              type="email"
              placeholder="example@cineflix.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '13px 16px',
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
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '700', color: '#E2E8F0', marginBottom: '8px' }}>
              비밀번호
            </label>
            <input
              type="password"
              placeholder="비밀번호 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '13px 16px',
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
            disabled={loading}
            style={{
              padding: '14px',
              fontSize: '1.05rem',
              fontWeight: '800',
              borderRadius: '14px',
              marginTop: '10px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '로그인 중...' : '🔑 로그인하기'}
          </button>
        </form>

        {/* Footer Link to Signup */}
        <div style={{ textAlign: 'center', marginTop: '26px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '20px' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            아직 계정이 없으신가요?{' '}
          </span>
          <Link
            to="/signup"
            style={{
              color: 'var(--accent-red)',
              fontWeight: '800',
              textDecoration: 'none',
              fontSize: '0.92rem'
            }}
          >
            회원가입하기 ✨
          </Link>
        </div>
      </div>
    </div>
  );
}
