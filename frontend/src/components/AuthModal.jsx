import React, { useState } from 'react';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    const payload = isLogin ? { email, password } : { email, password, nickname };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || '인증 처리에 실패했습니다.');
      }

      onAuthSuccess(data);
      onClose();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card glass" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
        <button className="btn-close" onClick={onClose}>×</button>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)' }}>
          <button
            style={{
              flex: 1,
              padding: '12px',
              background: 'transparent',
              color: isLogin ? 'var(--accent-red)' : 'var(--text-secondary)',
              borderBottom: isLogin ? '2px solid var(--accent-red)' : 'none',
              fontWeight: '700',
              fontSize: '1.1rem'
            }}
            onClick={() => { setIsLogin(true); setErrorMsg(''); }}
          >
            로그인
          </button>
          <button
            style={{
              flex: 1,
              padding: '12px',
              background: 'transparent',
              color: !isLogin ? 'var(--accent-red)' : 'var(--text-secondary)',
              borderBottom: !isLogin ? '2px solid var(--accent-red)' : 'none',
              fontWeight: '700',
              fontSize: '1.1rem'
            }}
            onClick={() => { setIsLogin(false); setErrorMsg(''); }}
          >
            회원가입
          </button>
        </div>

        {errorMsg && (
          <div style={{
            background: 'rgba(229, 9, 20, 0.15)',
            border: '1px solid rgba(229, 9, 20, 0.4)',
            color: '#FF6B6B',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '0.9rem',
            marginBottom: '16px'
          }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="review-form">
          <input
            type="email"
            placeholder="이메일 주소"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {!isLogin && (
            <input
              type="text"
              placeholder="닉네임"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
            />
          )}

          <input
            type="password"
            placeholder="비밀번호 (6자리 이상)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="btn-primary" style={{ marginTop: '10px' }} disabled={loading}>
            {loading ? '처리 중...' : (isLogin ? '로그인하기' : '가입완료 및 로그인')}
          </button>
        </form>
      </div>
    </div>
  );
}
