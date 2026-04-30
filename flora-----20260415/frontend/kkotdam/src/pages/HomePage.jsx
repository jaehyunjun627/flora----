import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getTodayBirthFlower } from '../data/birthFlowers';
import api from '../api';
import './HomePage.css';

function getTodayDateStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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

  // 퀴즈 (MongoDB 기반: 계정별 풀이 상태 유지)
  const todayStr = getTodayDateStr();
  const [todayQuiz, setTodayQuiz] = useState(null); // { id, question, options, rewardPoints }
  const [quizLoading, setQuizLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [quizDone, setQuizDone] = useState(false);
  const [quizResult, setQuizResult] = useState(null); // { isCorrect, answerIdx, explanation, rewardPoints }

  useEffect(() => {
    const flower = getTodayBirthFlower();
    setBirthFlower(flower);
    loadData(flower);
  }, []);

  // 로그인 상태가 바뀔 때마다 오늘의 퀴즈 재조회 (계정별/로그아웃 시 상태 갱신)
  useEffect(() => {
    loadQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const loadQuiz = async () => {
    // 비로그인 상태: 퀴즈 데이터는 아직 로드하지 않음 (버튼 누르면 /login으로 이동)
    if (!user) {
      setTodayQuiz(null);
      setQuizDone(false);
      setShowResult(false);
      setSelected(null);
      setQuizResult(null);
      return;
    }
    setQuizLoading(true);
    try {
      const res = await api.get('/api/quiz/daily');
      const data = res.data;
      setTodayQuiz({
        id: data.id,
        question: data.question,
        options: data.options || [],
        rewardPoints: data.rewardPoints || 0,
      });
      if (data.alreadyAnswered && data.lastAttempt) {
        setQuizDone(true);
        setShowResult(true);
        setSelected(data.lastAttempt.selectedIdx);
        setQuizResult({
          isCorrect: data.lastAttempt.isCorrect,
          answerIdx: data.lastAttempt.answerIdx,
          explanation: null,
          rewardPoints: 0,
        });
      } else {
        setQuizDone(false);
        setShowResult(false);
        setSelected(null);
        setQuizResult(null);
      }
    } catch (e) {
      console.error('퀴즈 로드 실패:', e);
      setTodayQuiz(null);
    } finally {
      setQuizLoading(false);
    }
  };

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

  // 퀴즈 핸들러 (API 기반)
  const handleQuizClick = () => {
    // 비로그인 상태에서 퀴즈 영역 클릭 → 로그인 페이지로 이동
    if (!user) navigate('/login');
  };

  const handleSelect = async (optionIndex) => {
    if (!user) { navigate('/login'); return; }
    if (!todayQuiz || selected !== null || showResult) return;
    setSelected(optionIndex);
    try {
      const res = await api.post('/api/quiz/submit', {
        quizId: todayQuiz.id,
        selectedIdx: optionIndex,
      });
      setQuizResult({
        isCorrect: res.data.isCorrect,
        answerIdx: res.data.answerIdx,
        explanation: res.data.explanation,
        rewardPoints: res.data.rewardPoints,
      });
      setShowResult(true);
      // 퀴즈 미션 완료 표시 (마이페이지 출석 미션 연동용)
      localStorage.setItem(`flora-quiz-done-${todayStr}`, '1');
    } catch (e) {
      console.error('퀴즈 제출 실패:', e);
      setSelected(null);
      alert('퀴즈 제출에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleFinish = () => {
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
              {!user ? (
                <div className="quiz-result" style={{ textAlign: 'center' }}>
                  <p className="quiz-result-emoji">🔒</p>
                  <p className="quiz-result-title">로그인 후 퀴즈를 풀 수 있어요</p>
                  <p className="quiz-result-tomorrow">로그인하면 오늘의 꽃 퀴즈에 도전하고 포인트를 모을 수 있어요!</p>
                  <button
                    className="quiz-next-btn"
                    style={{ marginTop: 12 }}
                    onClick={handleQuizClick}
                  >
                    로그인 하러가기
                  </button>
                </div>
              ) : quizLoading || !todayQuiz ? (
                <p className="quiz-question">퀴즈를 불러오는 중...</p>
              ) : !quizDone ? (
                <>
                  <p className="quiz-question">{todayQuiz.question}</p>
                  <ul className="quiz-options">
                    {todayQuiz.options.map((opt, i) => {
                      let cls = 'quiz-option';
                      if (showResult && quizResult) {
                        if (i === quizResult.answerIdx) cls += ' correct';
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
                  {showResult && quizResult && (
                    <div className={`quiz-feedback ${quizResult.isCorrect ? 'correct' : 'wrong'}`}>
                      <p className="quiz-feedback-title">
                        {quizResult.isCorrect ? `정답! +${quizResult.rewardPoints}P` : '오답!'}
                      </p>
                      {quizResult.explanation && (
                        <p className="quiz-explanation">{quizResult.explanation}</p>
                      )}
                      <button className="quiz-next-btn" onClick={handleFinish}>결과 확인</button>
                    </div>
                  )}
                </>
              ) : (
                <div className="quiz-result">
                  <p className="quiz-result-emoji">{quizResult?.isCorrect ? '🏆' : '🌱'}</p>
                  <p className="quiz-result-title">{quizResult?.isCorrect ? '정답이에요!' : '아쉽지만 오답이에요!'}</p>
                  {quizResult?.answerIdx != null && todayQuiz?.options?.[quizResult.answerIdx] != null && (
                    <p className="quiz-result-score">정답: <strong>{todayQuiz.options[quizResult.answerIdx]}</strong></p>
                  )}
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
                <span>🌿</span>식물백과
              </button>
              <button onClick={() => navigate('/community')}>
                <span>💬</span>커뮤니티
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
