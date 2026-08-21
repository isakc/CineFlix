import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiUrl } from '../config/api';

export default function SignupPage({ onAuthSuccess }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 6) {
      setErrorMsg('비밀번호는 최소 6자리 이상이어야 합니다.');
      return;
    }

    if (password !== passwordConfirm) {
      setErrorMsg('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(apiUrl('/api/auth/signup'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, nickname, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || '회원가입에 실패했습니다. 입력 정보를 확인해 주세요.');
      }

      const normalized = {
        ...data,
        token: data.accessToken || data.token,
        nickname: data.nickname || nickname,
        email: data.email || email
      };

      if (onAuthSuccess) {
        onAuthSuccess(normalized);
      }

      navigate('/');
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
          maxWidth: '520px',
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
            Cine<span style={{ color: 'var(--accent-red)' }}>Flix</span> 회원가입
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: 0, lineHeight: '1.5' }}>
            나만의 인생 영화를 기록하고 0.5점 단위 솔직 리뷰를 남겨보세요.
          </p>
        </div>

        {/* CineFlix Benefit Highlights */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '16px',
            padding: '16px 20px',
            marginBottom: '26px',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}
        >
          <div style={{ fontSize: '0.85rem', color: '#E2E8F0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⭐</span>
              <span>왓챠피디아 스타일 0.5점 단위 별점 & 리뷰 작성</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🎬</span>
              <span>나만의 맞춤 영화 플레이리스트 생성 & 보관</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>❤️</span>
              <span>보고 싶은 영화 위시리스트 실시간 동기화</span>
            </div>
          </div>
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

        {/* Signup Form */}
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
              닉네임
            </label>
            <input
              type="text"
              placeholder="시네플릭스에서 사용할 닉네임"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
              maxLength={20}
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
              placeholder="6자리 이상 비밀번호 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
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
              비밀번호 확인
            </label>
            <input
              type="password"
              placeholder="비밀번호를 한번 더 입력해 주세요"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '13px 16px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: passwordConfirm && password !== passwordConfirm ? '1px solid #FF6B6B' : '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                fontSize: '0.95rem',
                boxSizing: 'border-box'
              }}
            />
            {passwordConfirm && password === passwordConfirm && (
              <div style={{ color: '#4CAF50', fontSize: '0.82rem', marginTop: '6px', fontWeight: '600' }}>
                ✓ 비밀번호가 일치합니다.
              </div>
            )}
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
            {loading ? '가입 처리 중...' : '✨ 무료 회원가입 완료하기'}
          </button>
        </form>

        {/* Footer Link to Login */}
        <div style={{ textAlign: 'center', marginTop: '26px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '20px' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            이미 CineFlix 계정이 있으신가요?{' '}
          </span>
          <Link
            to="/login"
            style={{
              color: 'var(--accent-gold)',
              fontWeight: '800',
              textDecoration: 'none',
              fontSize: '0.92rem'
            }}
          >
            로그인하기 ➡️
          </Link>
        </div>
      </div>
    </div>
  );
}
