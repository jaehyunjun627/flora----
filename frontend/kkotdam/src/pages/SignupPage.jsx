import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './SignupPage.css';

function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '', password: '', passwordConfirm: '', nickname: '', phone: '',
    role: 'USER', businessName: '', businessNumber: ''
  });
  const [agrees, setAgrees] = useState({
    terms: false,
    privacy: false,
    marketing: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'businessNumber') {
      // 자동으로 000-00-00000 형식 적용
      const digits = value.replace(/\D/g, '').slice(0, 10);
      let formatted = digits;
      if (digits.length > 5) formatted = digits.slice(0,3) + '-' + digits.slice(3,5) + '-' + digits.slice(5);
      else if (digits.length > 3) formatted = digits.slice(0,3) + '-' + digits.slice(3);
      setForm({ ...form, businessNumber: formatted });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleAgreeChange = (key) => {
    setAgrees(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAllAgree = () => {
    const allChecked = agrees.terms && agrees.privacy && agrees.marketing;
    setAgrees({ terms: !allChecked, privacy: !allChecked, marketing: !allChecked });
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
    if (!agrees.terms || !agrees.privacy) {
      setError('필수 약관에 동의해 주세요');
      return;
    }
    if (form.role === 'SELLER') {
      if (!form.businessName.trim()) {
        setError('사업자명을 입력해 주세요');
        return;
      }
      const cleanNumber = form.businessNumber.replace(/-/g, '');
      if (cleanNumber.length !== 10) {
        setError('사업자등록번호는 10자리여야 합니다 (예: 123-45-67890)');
        return;
      }
    }

    setLoading(true);
    try {
      await signup(
        form.email, form.password, form.nickname, form.phone,
        form.role, form.businessName, form.businessNumber
      );
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || '회원가입에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const allAgreed = agrees.terms && agrees.privacy && agrees.marketing;

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h1 className="signup-logo">🌿 꽃담</h1>
        <p className="signup-subtitle">회원가입</p>

        <form onSubmit={handleSubmit} className="signup-form">
          {error && <div className="signup-error">{error}</div>}

          {/* 계정 유형 선택 */}
          <div className="signup-field">
            <label className="signup-label">계정 유형 *</label>
            <div className="signup-role-selector">
              <button
                type="button"
                className={`role-btn ${form.role === 'USER' ? 'active' : ''}`}
                onClick={() => setForm({ ...form, role: 'USER', businessName: '', businessNumber: '' })}
              >
                <span className="role-icon">🛒</span>
                <span className="role-name">일반 회원</span>
                <span className="role-desc">꽃과 식물을 구매해요</span>
              </button>
              <button
                type="button"
                className={`role-btn ${form.role === 'SELLER' ? 'active' : ''}`}
                onClick={() => setForm({ ...form, role: 'SELLER' })}
              >
                <span className="role-icon">🏪</span>
                <span className="role-name">판매자</span>
                <span className="role-desc">상품을 등록하고 판매해요</span>
              </button>
            </div>
          </div>

          {/* 판매자 전용: 사업자 정보 */}
          {form.role === 'SELLER' && (
            <div className="seller-info-box">
              <div className="seller-info-title">📋 사업자 정보</div>
              <div className="signup-field">
                <label className="signup-label">사업자명 *</label>
                <input
                  type="text" name="businessName" value={form.businessName}
                  onChange={handleChange} placeholder="사업자 등록증의 상호명을 입력하세요"
                  className="signup-input" />
              </div>
              <div className="signup-field">
                <label className="signup-label">사업자등록번호 *</label>
                <input
                  type="text" name="businessNumber" value={form.businessNumber}
                  onChange={handleChange} placeholder="000-00-00000"
                  className="signup-input" maxLength={12} />
                <span className="signup-hint">사업자등록증에 기재된 10자리 번호를 입력하세요</span>
              </div>
            </div>
          )}

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

          {/* 약관 동의 */}
          <div className="agree-box">
            <label className="agree-all-label" onClick={handleAllAgree}>
              <span className={`agree-checkbox ${allAgreed ? 'checked' : ''}`}>
                {allAgreed ? '✓' : ''}
              </span>
              <span className="agree-all-text">전체 동의</span>
            </label>
            <div className="agree-divider" />
            <label className="agree-item-label" onClick={() => handleAgreeChange('terms')}>
              <span className={`agree-checkbox ${agrees.terms ? 'checked' : ''}`}>
                {agrees.terms ? '✓' : ''}
              </span>
              <span className="agree-item-text">
                <span className="agree-required">[필수]</span> 이용약관 동의
              </span>
              <a href="#" className="agree-link" onClick={e => e.stopPropagation()}>보기</a>
            </label>
            <label className="agree-item-label" onClick={() => handleAgreeChange('privacy')}>
              <span className={`agree-checkbox ${agrees.privacy ? 'checked' : ''}`}>
                {agrees.privacy ? '✓' : ''}
              </span>
              <span className="agree-item-text">
                <span className="agree-required">[필수]</span> 개인정보 처리방침 동의
              </span>
              <a href="#" className="agree-link" onClick={e => e.stopPropagation()}>보기</a>
            </label>
            <label className="agree-item-label" onClick={() => handleAgreeChange('marketing')}>
              <span className={`agree-checkbox ${agrees.marketing ? 'checked' : ''}`}>
                {agrees.marketing ? '✓' : ''}
              </span>
              <span className="agree-item-text">
                <span className="agree-optional">[선택]</span> 마케팅 정보 수신 동의
              </span>
            </label>
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
