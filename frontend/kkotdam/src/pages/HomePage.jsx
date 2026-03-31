import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getTodayBirthFlower } from '../data/birthFlowers';
import quizData from '../data/quizData';
import api from '../api';
import './HomePage.css';

// 날짜 기반으로 오늘의 퀴즈 1문제 선택
function getTodayDateStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getTodayQuiz(quizArr) {
  const dateStr = getTodayDateStr();
  // 날짜 문자열을 숫자로 변환해 index 결정 (매일 다른 문제)
  const seed = dateStr.replace(/-/g, '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return quizArr[seed % quizArr.length];
}

const GROUP_PURCHASE_DATA = [
  {
    id: 1, type: 'group', badgeText: '공동구매', emoji: '🌹',
    seller: '🌿 장미농장', name: '장미 모종 공동구매',
    price: '3,500원', originalPrice: '7,000원',
    rating: 4.9, reviewCount: 12,
    progress: 77, participants: '23/30명 참여',
    autoDelivery: null,
  },
  {
    id: 2, type: 'subscription', badgeText: '구독', emoji: '💉🌱',
    seller: '🪴 흙사랑', name: '유기농 비료 정기배송',
    price: '월 9,900원', originalPrice: null,
    rating: 4.7, reviewCount: 44,
    progress: null, participants: null,
    autoDelivery: '매월 자동 배송',
  },
  {
    id: 3, type: 'group', badgeText: '공동구매', emoji: '🌿',
    seller: '🌱 그린팜', name: '몬스테라 대형 화분 공구',
    price: '15,000원', originalPrice: '28,000원',
    rating: 4.8, reviewCount: 31,
    progress: 60, participants: '18/30명 참여',
    autoDelivery: null,
  },
  {
    id: 4, type: 'event', badgeText: '이벤트', emoji: '🌸',
    seller: '🏪 꽃담스토어', name: '봄맞이 꽃다발 특가',
    price: '12,900원', originalPrice: '25,000원',
    rating: 4.6, reviewCount: 89,
    progress: null, participants: null,
    autoDelivery: null,
  },
];

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [pixabayImages, setPixabayImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [birthFlower, setBirthFlower] = useState(null);
  const [birthFlowerImg, setBirthFlowerImg] = useState(null);

  // 퀴즈 - 하루 1문제
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
        api.get('/api/products', { params: { page: 0, size: 8 } }),
        api.get('/api/external/pixabay', { params: { q: 'flower bouquet', perPage: 12 } }),
      ];
      if (flower?.search) {
        requests.push(
          api.get('/api/external/pixabay', { params: { q: flower.search, perPage: 3 } })
        );
      }
      const results = await Promise.allSettled(requests);
      if (results[0].status === 'fulfilled') setProducts(results[0].value.data.content || []);
      if (results[1].status === 'fulfilled') setPixabayImages(results[1].value.data.hits || []);
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

  // 퀴즈 핸들러 - 하루 1회, 결과 localStorage 저장
  const handleSelect = (optionIndex) => {
    if (selected !== null || showResult) return;
    setSelected(optionIndex);
    setShowResult(true);
  };
  const handleFinish = () => {
    const correct = selected === todayQuiz.answer;
    // 퀴즈 결과 저장
    localStorage.setItem(QUIZ_KEY, JSON.stringify({ answered: true, selected, correct, date: todayStr }));
    // 마이페이지 출석 미션 연동용 키도 저장
    localStorage.setItem(`flora-quiz-done-${todayStr}`, '1');
    setQuizDone(true);
  };

  const today = new Date();
  const formattedDate = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;
  const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const dayName = dayNames[today.getDay()];

  return (
    <div className="home">
      {/* 오늘의 탄생화 Hero */}
      {birthFlower && (
        <section className="birth-flower-hero">
          <div className="birth-flower-bg">
            {birthFlowerImg && <img src={birthFlowerImg} alt="" className="birth-flower-bg-img" />}
            <div className="birth-flower-bg-overlay" />
          </div>
          <div className="birth-flower-inner">
            <div className="birth-flower-content">
              <div className="birth-flower-date-badge">
                <span className="birth-flower-today-label">TODAY</span>
                <span className="birth-flower-date">{formattedDate} {dayName}</span>
              </div>
              <h1 className="birth-flower-title">
                {birthFlower.emoji} 오늘의 탄생화
              </h1>
              <h2 className="birth-flower-name">
                {birthFlower.name}
              </h2>
              <p className="birth-flower-meaning">
                — "{birthFlower.meaning}"
              </p>
              <div className="birth-flower-actions">
                <button className="birth-flower-cta" onClick={() => navigate('/plants')}>
                  꽃말 더 알아보기
                </button>
                <button className="birth-flower-cta-outline" onClick={() => navigate('/products')}>
                  선물하기
                </button>
              </div>
            </div>
            {birthFlowerImg && (
              <div className="birth-flower-image-wrap">
                <img src={birthFlowerImg} alt={birthFlower.name} className="birth-flower-image" />
              </div>
            )}
          </div>
        </section>
      )}

      {/* 카테고리 태그 (kukka 스타일) */}
      <section className="category-tags-section">
        <div className="category-tags-inner">
          {[
            { label: '🌸 봄맞이 꽃', path: '/products?category=꽃' },
            { label: '🌿 인기 식물', path: '/products?category=식물' },
            { label: '🪴 감성 화분', path: '/products?category=화분/소품' },
            { label: '📖 식물도감', path: '/plants' },
            { label: '💬 커뮤니티', path: '/community' },
            { label: '🎁 이벤트', path: '#group-purchase' },
          ].map((tag, i) => (
            <button
              key={i}
              className={`category-tag ${i === 0 ? 'active' : ''}`}
              onClick={() => {
                if (tag.path.startsWith('#')) {
                  document.getElementById(tag.path.slice(1))?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  navigate(tag.path);
                }
              }}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </section>

      {/* 인기 상품 (kukka 스타일 카드) */}
      <section className="section">
        <div className="section-inner">
          <div className="section-header">
            <h2 className="section-title">인기 상품</h2>
            <button className="section-more" onClick={() => navigate('/products')}>
              더보기 &gt;
            </button>
          </div>
          {loading ? (
            <div className="loading">불러오는 중...</div>
          ) : products.length > 0 ? (
            <div className="product-scroll">
              {products.map(product => (
                <div
                  key={product.id}
                  className="home-product-card"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <div className="home-product-img">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} />
                    ) : (
                      <span className="home-product-emoji">{getCategoryEmoji(product.category)}</span>
                    )}
                  </div>
                  <div className="home-product-info">
                    <p className="home-product-name">{product.name}</p>
                    {product.description && (
                      <p className="home-product-desc">{product.description}</p>
                    )}
                    <p className="home-product-price">
                      {product.price?.toLocaleString()}원
                    </p>
                    {product.sellerNickname && (
                      <p className="home-product-seller">{product.sellerNickname}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="home-empty-products">
              <p>아직 등록된 상품이 없습니다</p>
              {user?.role === 'SELLER' && (
                <button className="home-register-btn" onClick={() => navigate('/products/new')}>
                  첫 상품 등록하기
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 공동구매 & 이벤트 */}
      <section className="section" id="group-purchase">
        <div className="section-inner">
          <div className="section-header">
            <h2 className="section-title">공동구매 & 이벤트</h2>
            <button className="section-more" onClick={() => navigate('/products')}>
              더보기 &gt;
            </button>
          </div>
          <div className="group-purchase-grid">
            {GROUP_PURCHASE_DATA.map(item => (
              <div key={item.id} className="gp-card" onClick={() => navigate('/products')}>
                <div className="gp-card-badge-wrap">
                  <span className={`gp-card-badge ${item.type}`}>{item.badgeText}</span>
                </div>
                <div className="gp-card-img">
                  <span className="gp-card-emoji">{item.emoji}</span>
                </div>
                <div className="gp-card-body">
                  <p className="gp-card-seller">{item.seller}</p>
                  <h3 className="gp-card-name">{item.name}</h3>
                  <div className="gp-card-pricing">
                    <span className="gp-card-price">{item.price}</span>
                    {item.originalPrice && <span className="gp-card-original">{item.originalPrice}</span>}
                  </div>
                  <div className="gp-card-rating">
                    {'★'.repeat(Math.floor(item.rating))}{'☆'.repeat(5 - Math.floor(item.rating))}
                    <span>{item.rating} ({item.reviewCount})</span>
                  </div>
                  {item.progress && (
                    <div className="gp-card-progress-wrap">
                      <div className="gp-card-progress">
                        <div className="gp-card-progress-bar" style={{ width: `${item.progress}%` }} />
                      </div>
                      <span className="gp-card-progress-text">👥 {item.participants}</span>
                    </div>
                  )}
                  {item.autoDelivery && (
                    <p className="gp-card-auto">📦 {item.autoDelivery}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 퀴즈 섹션 - 하루 1문제 */}
      <section className="section quiz-section">
        <div className="section-inner">
          <div className="section-header">
            <h2 className="section-title">🧠 오늘의 꽃 퀴즈</h2>
            <span className="quiz-score-badge">📅 {todayStr}</span>
          </div>
          <div className="quiz-card">
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
                      {selected === todayQuiz.answer ? '🎉 정답!' : '❌ 오답!'}
                    </p>
                    <p className="quiz-explanation">{todayQuiz.explanation}</p>
                    <button className="quiz-next-btn" onClick={handleFinish}>
                      결과 확인
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="quiz-result">
                <p className="quiz-result-emoji">
                  {selected === todayQuiz.answer ? '🏆' : '🌱'}
                </p>
                <p className="quiz-result-title">
                  {selected === todayQuiz.answer ? '정답이에요!' : '아쉽지만 오답이에요!'}
                </p>
                <p className="quiz-result-score">
                  정답: <strong>{todayQuiz.options[todayQuiz.answer]}</strong>
                </p>
                <p className="quiz-result-tomorrow">내일 새로운 문제가 나와요 😊</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 꽃 갤러리 (기존 Pixabay) */}
      {pixabayImages.length > 0 && (
        <section className="section section-gray">
          <div className="section-inner">
            <div className="section-header">
              <h2 className="section-title">이달의 추천 꽃</h2>
              <p className="section-subtitle">계절에 맞는 아름다운 꽃을 만나보세요</p>
            </div>
            <div className="flower-gallery">
              {pixabayImages.slice(0, 8).map(img => (
                <div key={img.id} className="flower-card">
                  <img src={img.webformatURL} alt={img.tags} />
                  <div className="flower-overlay">
                    <span className="flower-tags">{img.tags}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 꽃담 소개 배너 */}
      <section className="intro-banner">
        <div className="section-inner">
          <div className="intro-grid">
            <div className="intro-card">
              <span className="intro-icon">🌱</span>
              <h3>신선한 식물</h3>
              <p>산지 직송 건강한 식물을 합리적인 가격에</p>
            </div>
            <div className="intro-card">
              <span className="intro-icon">📦</span>
              <h3>안전 배송</h3>
              <p>식물 전문 포장으로 안전하게 배송</p>
            </div>
            <div className="intro-card">
              <span className="intro-icon">🔄</span>
              <h3>정기구독</h3>
              <p>2주마다 제철 꽃을 문 앞까지 배달</p>
            </div>
            <div className="intro-card">
              <span className="intro-icon">📖</span>
              <h3>식물도감</h3>
              <p>산림청 데이터 기반 식물 정보 제공</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function getCategoryEmoji(category) {
  const map = { '식물': '🌿', '꽃': '🌸', '화분': '🪴', '비료': '🌱', '도구': '✂️' };
  return map[category] || '🌼';
}
