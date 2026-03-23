import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './SignupPage.css';

function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', passwordConfirm: '', nickname: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다');
      return;
    }
    if (form.password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다');
      return;
    }

    setLoading(true);
    try {
      await signup(form.email, form.password, form.nickname, form.phone);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || '회원가입에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h1 className="signup-logo">🌿 꽃담</h1>
        <p className="signup-subtitle">회원가입</p>

        <form onSubmit={handleSubmit} className="signup-form">
          {error && <div className="signup-error">{error}</div>}

          <div className="signup-field">
            <label className="signup-label">이메일 *</label>
            <input type="email" name="email" value={form.email}
              onChange={handleChange} placeholder="example@email.com"
              className="signup-input" required />
          </div>

          <div className="signup-field">
            <label className="signup-label">닉네임 *</label>
            <input type="text" name="nickname" value={form.nickname}
              onChange={handleChange} placeholder="2~20자"
              className="signup-input" required />
          </div>

          <div className="signup-field">
            <label className="signup-label">비밀번호 *</label>
            <input type="password" name="password" value={form.password}
              onChange={handleChange} placeholder="6자 이상"
              className="signup-input" required />
          </div>

          <div className="signup-field">
            <label className="signup-label">비밀번호 확인 *</label>
            <input type="password" name="passwordConfirm" value={form.passwordConfirm}
              onChange={handleChange} placeholder="비밀번호를 다시 입력하세요"
              className="signup-input" required />
          </div>

          <div className="signup-field">
            <label className="signup-label">전화번호</label>
            <input type="tel" name="phone" value={form.phone}
              onChange={handleChange} placeholder="010-0000-0000"
              className="signup-input" />
          </div>

          <button type="submit" disabled={loading} className="signup-button">
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <p className="signup-footer">
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;
