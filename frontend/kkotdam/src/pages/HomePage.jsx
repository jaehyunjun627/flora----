import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getTodayBirthFlower } from '../data/birthFlowers';
import quizData from '../data/quizData';
import api from '../api';
import './HomePage.css';

function getTodayDateStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getTodayQuiz(quizArr) {
  const dateStr = getTodayDateStr();
  const seed = dateStr.replace(/-/g, '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return quizArr[seed % quizArr.length];
}

const CAT_COLORS = {
  '공지':     { bg: '#fdeaea', color: '#c04040' },
  '자유':     { bg: '#eef6ef', color: '#4a7c59' },
  '질문':     { bg: '#e8f0fe', color: '#4a7cc8' },
  '정보':     { bg: '#e8f5e9', color: '#2e7d32' },
  '지역거래': { bg: '#fff3e0', color: '#e65100' },
  '후기':     { bg: '#fff8e1', color: '#f57f17' },
  '식물자랑': { bg: '#f5f0fa', color: '#8b6fc0' },
  '나눔':     { bg: '#fce4ec', color: '#c2185b' },
};

export default function HomePage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [popularPosts, setPopularPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [birthFlower, setBirthFlower] = useState(null);
  const [birthFlowerImg, setBirthFlowerImg] = useState(null);

  // 사이드바 로그인
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // 퀴즈
  const todayStr = getTodayDateStr();
  const QUIZ_KEY = `flora-quiz-${todayStr}`;
  const [todayQuiz] = useState(() => getTodayQuiz(quizData));
  const [selected, setSelected] = useState(() => {
    try { const saved = JSON.parse(localStorage.getItem(QUIZ_KEY)); return saved?.selected ?? null; }
    catch { return null; }
  });
  const [showResult, setShowResult] = useState(() => {
    try { return !!JSON.parse(localStorage.getItem(QUIZ_KEY))?.answered; }
    catch { return false; }
  });
  const [quizDone, setQuizDone] = useState(() => {
    try { return !!JSON.parse(localStorage.getItem(QUIZ_KEY))?.answered; }
    catch { return false; }
  });

  useEffect(() => {
    const flower = getTodayBirthFlower();
    setBirthFlower(flower);
    loadData(flower);
  }, []);

  const loadData = async (flower) => {
    try {
      const requests = [
        api.get('/api/community/posts', { params: { category: '공지', page: 0, size: 5 } }),
        api.get('/api/community/posts', { params: { page: 0, size: 15 } }),
      ];
      if (flower?.search) {
        requests.push(
          api.get('/api/external/pixabay', { params: { q: flower.search, perPage: 3 } })
        );
      }
      const results = await Promise.allSettled(requests);
      if (results[0].status === 'fulfilled') setNotices(results[0].value.data.content || []);
      if (results[1].status === 'fulfilled') {
        const allPosts = results[1].value.data.content || [];
        setRecentPosts(allPosts.filter(p => p.category !== '공지').slice(0, 15));
        // 인기글: 좋아요 많은 순
        const sorted = [...allPosts].sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
        setPopularPosts(sorted.slice(0, 5));
      }
      if (results[2]?.status === 'fulfilled') {
        const hits = results[2].value.data.hits || [];
        if (hits.length > 0) setBirthFlowerImg(hits[0].webformatURL);
      }
    } catch (e) {
      console.error('데이터 로딩 실패:', e);
    } finally {
      setLoading(false);
    }
  };

  // 사이드바 로그인 핸들러
  const handleSidebarLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) return;
    setLoginLoading(true);
    setLoginError('');
    try {
      await login(loginEmail, loginPassword);
    } catch (err) {
      setLoginError(err.response?.data?.message || '로그인에 실패했습니다');
    } finally {
      setLoginLoading(false);
    }
  };

  // 퀴즈 핸들러
  const handleSelect = (optionIndex) => {
    if (selected !== null || showResult) return;
    setSelected(optionIndex);
    setShowResult(true);
  };
  const handleFinish = () => {
    const correct = selected === todayQuiz.answer;
    localStorage.setItem(QUIZ_KEY, JSON.stringify({ answered: true, selected, correct, date: todayStr }));
    localStorage.setItem(`flora-quiz-done-${todayStr}`, '1');
    setQuizDone(true);
  };

  const formatDate = (dt) => {
    if (!dt) return '';
    const d = new Date(dt);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }
    return `${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`;
  };

  const isNew = (dt) => dt && (new Date() - new Date(dt)) < 86400000;

  const today = new Date();
  const formattedDate = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;
  const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const dayName = dayNames[today.getDay()];

  return (
    <div className="home">
      {/* 탄생화 Hero (컴팩트) */}
      {birthFlower && (
        <section className="birth-hero">
          <div className="birth-hero-bg">
            {birthFlowerImg && <img src={birthFlowerImg} alt="" className="birth-hero-bg-img" />}
            <div className="birth-hero-overlay" />
          </div>
          <div className="birth-hero-inner">
            <div className="birth-hero-content">
              <div className="birth-hero-badge">
                <span className="birth-hero-today">TODAY</span>
                <span className="birth-hero-date">{formattedDate} {dayName}</span>
              </div>
              <h1 className="birth-hero-title">{birthFlower.emoji} 오늘의 탄생화</h1>
              <h2 className="birth-hero-name">{birthFlower.name}</h2>
              <p className="birth-hero-meaning">— "{birthFlower.meaning}"</p>
              <div className="birth-hero-actions">
                <button className="birth-hero-cta" onClick={() => navigate('/plants')}>꽃말 더 알아보기</button>
                <button className="birth-hero-cta-out" onClick={() => navigate('/products')}>선물하기</button>
              </div>
            </div>
            {birthFlowerImg && (
              <div className="birth-hero-img-wrap">
                <img src={birthFlowerImg} alt={birthFlower.name} className="birth-hero-img" />
              </div>
            )}
          </div>
        </section>
      )}

      {/* 메인 컨텐츠: 아카라이브 스타일 2열 */}
      <div className="home-main">
        {/* 왼쪽 영역 */}
        <div className="home-left">
          {/* 공지사항 */}
          <div className="home-board">
            <div className="home-board-header">
              <h3>📢 공지사항</h3>
              <button className="home-board-more" onClick={() => navigate('/community')}>더보기 &gt;</button>
            </div>
            <div className="home-board-list">
              {notices.length === 0 ? (
                <div className="home-board-empty">공지사항이 없습니다</div>
              ) : (
                notices.map(n => (
                  <div key={n.id} className="home-board-row" onClick={() => navigate(`/community/${n.id}`)}>
                    <span className="home-board-badge notice">공지</span>
                    <span className="home-board-title">{n.title}</span>
                    <span className="home-board-date">{formatDate(n.createdAt)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 실시간 게시글 */}
          <div className="home-board">
            <div className="home-board-header">
              <h3>💬 실시간 게시글</h3>
              <button className="home-board-more" onClick={() => navigate('/community')}>더보기 &gt;</button>
            </div>
            <div className="home-board-list">
              {loading ? (
                <div className="home-board-empty">불러오는 중...</div>
              ) : recentPosts.length === 0 ? (
                <div className="home-board-empty">게시글이 없습니다</div>
              ) : (
                recentPosts.map(p => {
                  const catStyle = CAT_COLORS[p.category] || { bg: '#f5f2ed', color: '#7a7a7a' };
                  return (
                    <div key={p.id} className="home-board-row" onClick={() => navigate(`/community/${p.id}`)}>
                      <span className="home-board-cat" style={{ background: catStyle.bg, color: catStyle.color }}>
                        {p.category || '자유'}
                      </span>
                      <span className="home-board-title">
                        {p.title}
                        {p.commentCount > 0 && <span className="home-board-comment">[{p.commentCount}]</span>}
                        {isNew(p.createdAt) && <span className="home-board-new">N</span>}
                      </span>
                      <span className="home-board-author">{p.authorNickname}</span>
                      <span className="home-board-date">{formatDate(p.createdAt)}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 퀴즈 */}
          <div className="home-board home-quiz-board">
            <div className="home-board-header">
              <h3>🧠 오늘의 꽃 퀴즈</h3>
              <span className="home-quiz-date">{todayStr}</span>
            </div>
            <div className="home-quiz-body">
              {!quizDone ? (
                <>
                  <p className="quiz-question">{todayQuiz.question}</p>
                  <ul className="quiz-options">
                    {todayQuiz.options.map((opt, i) => {
                      let cls = 'quiz-option';
                      if (showResult) {
                        if (i === todayQuiz.answer) cls += ' correct';
                        else if (i === selected) cls += ' wrong';
                      }
                      return (
                        <li key={i}>
                          <button className={cls} onClick={() => handleSelect(i)} disabled={showResult}>
                            <span className="quiz-option-label">{String.fromCharCode(65 + i)}</span>
                            {opt}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  {showResult && (
                    <div className={`quiz-feedback ${selected === todayQuiz.answer ? 'correct' : 'wrong'}`}>
                      <p className="quiz-feedback-title">
                        {selected === todayQuiz.answer ? '정답!' : '오답!'}
                      </p>
                      <p className="quiz-explanation">{todayQuiz.explanation}</p>
                      <button className="quiz-next-btn" onClick={handleFinish}>결과 확인</button>
                    </div>
                  )}
                </>
              ) : (
                <div className="quiz-result">
                  <p className="quiz-result-emoji">{selected === todayQuiz.answer ? '🏆' : '🌱'}</p>
                  <p className="quiz-result-title">{selected === todayQuiz.answer ? '정답이에요!' : '아쉽지만 오답이에요!'}</p>
                  <p className="quiz-result-score">정답: <strong>{todayQuiz.options[todayQuiz.answer]}</strong></p>
                  <p className="quiz-result-tomorrow">내일 새로운 문제가 나와요</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 오른쪽 사이드바 */}
        <div className="home-sidebar">
          {/* 로그인 박스 (비로그인 시) */}
          {!user ? (
            <div className="sidebar-login">
              <div className="sidebar-login-header">
                <span className="sidebar-login-icon">🌿</span>
                <span>꽃담 로그인</span>
              </div>
              <form onSubmit={handleSidebarLogin} className="sidebar-login-form">
                <input
                  type="email"
                  placeholder="이메일"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  className="sidebar-login-input"
                  required
                />
                <input
                  type="password"
                  placeholder="비밀번호"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  className="sidebar-login-input"
                  required
                />
                {loginError && <p className="sidebar-login-error">{loginError}</p>}
                <button type="submit" className="sidebar-login-btn" disabled={loginLoading}>
                  {loginLoading ? '로그인 중...' : '로그인'}
                </button>
              </form>
              <div className="sidebar-login-links">
                <Link to="/signup">회원가입</Link>
              </div>
            </div>
          ) : (
            <div className="sidebar-user">
              <div className="sidebar-user-info">
                <span className="sidebar-user-emoji">{user.profileEmoji || '🌿'}</span>
                <div className="sidebar-user-detail">
                  <span className="sidebar-user-name">{user.nickname}님</span>
                  <span className="sidebar-user-role">
                    {user.role === 'ADMIN' ? '관리자' : user.role === 'SELLER' ? '판매자' : '회원'}
                  </span>
                </div>
              </div>
              <div className="sidebar-user-links">
                <button onClick={() => navigate('/mypage')}>마이페이지</button>
                <button onClick={() => navigate('/orders')}>주문내역</button>
                <button onClick={() => navigate('/cart')}>장바구니</button>
              </div>
            </div>
          )}

          {/* 인기글 */}
          <div className="sidebar-board">
            <div className="sidebar-board-header">
              <h4>🔥 인기글</h4>
            </div>
            <div className="sidebar-board-list">
              {popularPosts.length === 0 ? (
                <div className="sidebar-board-empty">인기글이 없습니다</div>
              ) : (
                popularPosts.map((p, i) => (
                  <div key={p.id} className="sidebar-board-row" onClick={() => navigate(`/community/${p.id}`)}>
                    <span className="sidebar-board-rank">{i + 1}</span>
                    <span className="sidebar-board-title">{p.title}</span>
                    {p.likeCount > 0 && <span className="sidebar-board-likes">❤️{p.likeCount}</span>}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 바로가기 */}
          <div className="sidebar-shortcuts">
            <div className="sidebar-board-header">
              <h4>바로가기</h4>
            </div>
            <div className="sidebar-shortcut-grid">
              <button onClick={() => navigate('/subscription')}>
                <span>📦</span>정기구독
              </button>
              <button onClick={() => navigate('/products')}>
                <span>🛒</span>마켓
              </button>
              <button onClick={() => navigate('/plants')}>
                <span>📖</span>식물도감
              </button>
              <button onClick={() => navigate('/community')}>
                <span>💬</span>커뮤니티
              </button>
              <button onClick={() => navigate('/local-festival')}>
                <span>🎉</span>지역축제
              </button>
              <button onClick={() => navigate('/diagnosis')}>
                <span>🔬</span>식물진단
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
