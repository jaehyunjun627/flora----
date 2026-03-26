import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    const currentPath = location.pathname;
    const currentParams = new URLSearchParams(location.search);

    if (path === '/') {
      return currentPath === '/';
    }

    const [targetPath, targetSearch] = path.split('?');
    if (targetPath !== currentPath) {
      // /products?category=... 과 /community, /plants 구분
      return false;
    }

    if (!targetSearch) {
      // /products 기본 인기 메뉴 (category 미설정)
      if (currentPath === '/products') {
        return !currentParams.has('category');
      }
      return true;
    }

    const targetParams = new URLSearchParams(targetSearch);
    for (const [key, value] of targetParams.entries()) {
      if (currentParams.get(key) !== value) {
        return false;
      }
    }
    return true;
  };

  const navLinks = [
    { path: '/subscription', label: '정기구독' },
    { path: '/products', label: '마켓' },
    { path: '/community', label: '커뮤니티' },
    { path: '/plants', label: '식물도감' },
    { path: '/local-trade', label: '지역거래' },
    { path: '/local-festival', label: '지역축제' },
  ];

  const subNavLinks = [
    { path: '/', label: '홈' },
    { path: '/products', label: '인기' },
    { path: '/products?category=꽃', label: '꽃' },
    { path: '/products?category=식물', label: '식물' },
    { path: '/products?category=화분/소품', label: '화분/소품' },
    { path: '/products?category=비료', label: '비료/토양' },
    { path: '/products?category=도구', label: '원예도구' },
  ];

  return (
    <div className="layout">
      {/* 프로모 배너 */}
      <div className="top-bar">
        첫 구매 시 무료배송 + 포인트 2,000원 적립
        <Link to="/signup">지금 가입하기 &gt;</Link>
      </div>

      {/* Header */}
      <header className="header">
        <div className="header-main">
          <div className="header-left">
            <Link to="/" className="header-logo">
              꽃담
              <span className="header-logo-sub">kkotdam</span>
            </Link>
            <nav className="header-nav">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`header-nav-link ${isActive(link.path) ? 'active' : ''}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right */}
          <div className="header-right">
            {user ? (
              <>
                <button
                  className="header-icon-btn"
                  onClick={() => navigate('/cart')}
                >
                  &#128722;<span>장바구니</span>
                </button>
                <button
                  className="header-icon-btn"
                  onClick={() => navigate('/orders')}
                >
                  &#128230;<span>주문내역</span>
                </button>
                {user.role === 'SELLER' && (
                  <button
                    className="header-icon-btn"
                    onClick={() => navigate('/products/new')}
                  >
                    &#10133;<span>상품등록</span>
                  </button>
                )}
                <div className="header-divider" />
                <button className="header-icon-btn" onClick={() => navigate('/mypage')}>
                  &#128100;<span>{user.nickname}님</span>
                </button>
                <button className="header-logout-btn" onClick={handleLogout}>
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="header-auth-link">로그인</Link>
                <Link to="/signup" className="header-signup-btn">회원가입</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Sub Navigation */}
      <nav className="sub-nav">
        <div className="sub-nav-inner">
          {subNavLinks.map(link => (
            <Link
              key={link.label}
              to={link.path}
              className={`sub-nav-link ${isActive(link.path) ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Main */}
      <main className="main-content">
        {children}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <h3>꽃담 Kkotdam</h3>
            <p>꽃을 담다, 정보를 담다<br/>Flora Platform for Plant Lovers</p>
          </div>
          <div className="footer-links">
            <h4>서비스</h4>
            <Link to="/subscription">정기구독</Link>
            <Link to="/products">식물 마켓</Link>
            <Link to="/community">커뮤니티</Link>
            <Link to="/plants">식물도감</Link>
            <Link to="/local-trade">지역거래</Link>
            <Link to="/local-festival">지역축제</Link>
          </div>
          <div className="footer-links">
            <h4>고객지원</h4>
            <Link to="/">고객센터</Link>
            <Link to="/">이용약관</Link>
            <Link to="/">개인정보처리방침</Link>
          </div>
        </div>
        <div className="footer-bottom">
          &copy; 2026 꽃담(Kkotdam). All rights reserved. | Team Flora Project
        </div>
      </footer>
    </div>
  );
}

export default Layout;
