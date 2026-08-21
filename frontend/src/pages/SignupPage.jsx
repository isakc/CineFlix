import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiUrl } from '../config/api';

export default function SignupPage({ onAuthSuccess }) {
  const navigate = useNavigate();

  // Form State
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  // Email Verification State
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [devCodeHint, setDevCodeHint] = useState('');

  // General Status
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Countdown timer for verification code
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // 1. Send 6-digit Verification Code
  const handleSendCode = async () => {
    if (!email || !email.includes('@')) {
      setErrorMsg('올바른 이메일 주소를 입력해 주세요.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setSendingCode(true);

    try {
      const res = await fetch(apiUrl('/api/auth/send-verification-code'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || '인증번호 발송에 실패했습니다.');
      }

      setCodeSent(true);
      setTimeLeft(data.expireSeconds || 300);
      if (data.devCode) {
        setDevCodeHint(data.devCode);
      }
      setSuccessMsg('인증번호 6자리가 발송되었습니다. 메일함(또는 아래 안내)을 확인해 주세요.');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSendingCode(false);
    }
  };

  // 2. Verify 6-digit Code
  const handleVerifyCode = async () => {
    if (!code || code.trim().length !== 6) {
      setErrorMsg('6자리 인증번호를 정확히 입력해 주세요.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setVerifyingCode(true);

    try {
      const res = await fetch(apiUrl('/api/auth/verify-code'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: code.trim() })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || '인증번호가 일치하지 않습니다.');
      }

      setIsEmailVerified(true);
      setSuccessMsg('✓ 이메일 인증이 성공적으로 완료되었습니다!');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setVerifyingCode(false);
    }
  };

  // 3. Final Signup Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isEmailVerified) {
      setErrorMsg('이메일 인증을 먼저 완료해 주세요.');
      return;
    }

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
        minHeight: '85vh',
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
          maxWidth: '540px',
          borderRadius: '24px',
          padding: '40px 36px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          background: 'linear-gradient(145deg, rgba(25, 25, 38, 0.95), rgba(12, 12, 20, 0.98))',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
        }}
      >
        {/* Header & Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🎬</div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: '900', margin: '0 0 8px 0', color: '#fff' }}>
            Cine<span style={{ color: 'var(--accent-red)' }}>Flix</span> 회원가입
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: 0, lineHeight: '1.5' }}>
            이메일 인증을 통해 안전하게 계정을 생성하고 시작해 보세요.
          </p>
        </div>

        {/* Status Alerts */}
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

        {successMsg && (
          <div
            style={{
              background: 'rgba(76, 175, 80, 0.15)',
              border: '1px solid rgba(76, 175, 80, 0.4)',
              color: '#81C784',
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
            <span>✨</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Email & Send Code Row */}
          <div>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '700', color: '#E2E8F0', marginBottom: '8px' }}>
              이메일 주소 {isEmailVerified && <span style={{ color: '#4CAF50', marginLeft: '6px' }}>✓ 인증완료</span>}
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="email"
                placeholder="example@cineflix.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isEmailVerified}
                required
                style={{
                  flex: 1,
                  padding: '13px 16px',
                  borderRadius: '12px',
                  background: isEmailVerified ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.06)',
                  border: isEmailVerified ? '1px solid #4CAF50' : '1px solid rgba(255, 255, 255, 0.15)',
                  color: isEmailVerified ? '#4CAF50' : '#fff',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={handleSendCode}
                disabled={sendingCode || isEmailVerified}
                style={{
                  padding: '0 18px',
                  borderRadius: '12px',
                  background: isEmailVerified ? 'rgba(255, 255, 255, 0.1)' : 'var(--accent-red)',
                  color: '#fff',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '0.88rem',
                  cursor: isEmailVerified || sendingCode ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap',
                  opacity: isEmailVerified ? 0.5 : 1
                }}
              >
                {sendingCode ? '발송 중...' : (codeSent ? '인증번호 재발송' : '인증번호 발송')}
              </button>
            </div>
          </div>

          {/* Verification Code Input Section */}
          {codeSent && !isEmailVerified && (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '16px',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#E2E8F0' }}>
                  6자리 인증번호 입력
                </label>
                {timeLeft > 0 && (
                  <span style={{ fontSize: '0.85rem', color: '#FF6B6B', fontWeight: '700' }}>
                    ⏳ 유효시간 {formatTimer(timeLeft)}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="6자리 숫자 입력"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  maxLength={6}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#fff',
                    fontSize: '1.1rem',
                    letterSpacing: '3px',
                    fontWeight: '800',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={handleVerifyCode}
                  disabled={verifyingCode || timeLeft <= 0}
                  style={{
                    padding: '0 20px',
                    borderRadius: '12px',
                    background: 'var(--accent-gold)',
                    color: '#000',
                    border: 'none',
                    fontWeight: '800',
                    fontSize: '0.9rem',
                    cursor: verifyingCode || timeLeft <= 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  {verifyingCode ? '확인 중...' : '인증 확인'}
                </button>
              </div>

              {devCodeHint && (
                <div style={{ marginTop: '10px', fontSize: '0.82rem', color: '#F6E05E', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>💡</span>
                  <span>[개발/테스트 안내] 발송된 인증번호: <strong>{devCodeHint}</strong></span>
                </div>
              )}
            </div>
          )}

          {/* Nickname */}
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

          {/* Password */}
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

          {/* Password Confirmation */}
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

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !isEmailVerified}
            style={{
              padding: '14px',
              fontSize: '1.05rem',
              fontWeight: '800',
              borderRadius: '14px',
              marginTop: '10px',
              cursor: loading || !isEmailVerified ? 'not-allowed' : 'pointer',
              opacity: !isEmailVerified ? 0.6 : 1
            }}
          >
            {loading ? '가입 처리 중...' : (isEmailVerified ? '✨ 무료 회원가입 완료하기' : '🔒 이메일 인증 후 가입 가능')}
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
