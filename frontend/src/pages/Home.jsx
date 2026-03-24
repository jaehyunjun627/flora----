import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/common/ProductCard'
import { popularProducts, notices } from '../data/mockData'
import { getBirthFlower } from '../data/birthFlowers'
import quizData from '../data/quizData'
import './Home.css'

const banners = [
  {
    id: 1,
    title: '봄맞이 식물 페스티벌',
    subtitle: '인기 식물 최대 40% 할인',
    cta: '지금 구경하기',
    ctaLink: '/market?category=popular',
    bg: 'linear-gradient(135deg, #d4edda 0%, #a8d5b5 50%, #6aaf84 100%)',
  },
  {
    id: 2,
    title: '구독 서비스 출시!',
    subtitle: '매달 제철 꽃다발을 집에서 받아보세요',
    cta: '구독하기',
    ctaLink: '/subscription',
    bg: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 50%, #f48fb1 100%)',
  },
  {
    id: 3,
    title: '식물 도감에서 찾아보세요',
    subtitle: '산림청 API 기반 2,000종 이상의 식물 정보',
    cta: '식물도감 보기',
    ctaLink: '/gallery',
    bg: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 50%, #81c784 100%)',
  },
]

const seasonalFlowers = [
  { emoji: '🌸', name: '벚꽃', season: '봄 제철' },
  { emoji: '🌷', name: '튤립', season: '봄 제철' },
  { emoji: '🌼', name: '수선화', season: '봄 제철' },
  { emoji: '🌹', name: '장미', season: '봄~여름' },
]

// 퀴즈: 30문제 중 랜덤 5문제
function pickRandom(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

export default function Home() {
  const [currentBanner, setCurrentBanner] = useState(0)

  // 탄생화 섹션
  const today = new Date()
  const [birthMonth, setBirthMonth] = useState(today.getMonth() + 1)
  const [birthDay, setBirthDay] = useState(today.getDate())
  const [birthFlower, setBirthFlower] = useState(() => getBirthFlower(today.getMonth() + 1, today.getDate()))

  // 퀴즈 섹션
  const [quizPool] = useState(() => pickRandom(quizData, 5))
  const [quizIndex, setQuizIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [quizDone, setQuizDone] = useState(false)
  const [showResult, setShowResult] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  // 퀴즈 완료 시 마이페이지 미션 연동
  useEffect(() => {
    if (quizDone) {
      const todayStr = new Date().toISOString().split('T')[0]
      localStorage.setItem(`flora-quiz-done-${todayStr}`, 'true')
    }
  }, [quizDone])

  const banner = banners[currentBanner]

  // 탄생화 검색
  function handleBirthSearch() {
    const m = parseInt(birthMonth)
    const d = parseInt(birthDay)
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      setBirthFlower(getBirthFlower(m, d))
    }
  }

  // 퀴즈 선택
  function handleSelect(optionIndex) {
    if (selected !== null || showResult) return
    setSelected(optionIndex)
    const correct = quizPool[quizIndex].answer === optionIndex
    if (correct) setScore((s) => s + 1)
    setShowResult(true)
  }

  function handleNext() {
    if (quizIndex + 1 >= quizPool.length) {
      setQuizDone(true)
    } else {
      setQuizIndex((i) => i + 1)
      setSelected(null)
      setShowResult(false)
    }
  }

  function handleRestart() {
    setQuizIndex(0)
    setSelected(null)
    setScore(0)
    setQuizDone(false)
    setShowResult(false)
  }

  const currentQ = quizPool[quizIndex]

  return (
    <main className="home">
      {/* Hero Banner */}
      <section className="hero-banner" style={{ background: banner.bg }}>
        <div className="hero-content">
          <h1 className="hero-title">{banner.title}</h1>
          <p className="hero-subtitle">{banner.subtitle}</p>
          <Link to={banner.ctaLink} className="hero-cta">
            {banner.cta}
          </Link>
        </div>
        <div className="hero-dots">
          {banners.map((_, i) => (
            <button
              key={i}
              className={`hero-dot ${i === currentBanner ? 'active' : ''}`}
              onClick={() => setCurrentBanner(i)}
              aria-label={`배너 ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* 탄생화 섹션 */}
      <section className="section birth-flower-section">
        <div className="section-inner">
          <div className="section-header">
            <h2>🌺 내 탄생화 찾기</h2>
          </div>
          <div className="birth-flower-card">
            <div className="birth-flower-inputs">
              <div className="birth-input-group">
                <label htmlFor="birth-month">월</label>
                <input
                  id="birth-month"
                  type="number"
                  min="1"
                  max="12"
                  value={birthMonth}
                  onChange={(e) => setBirthMonth(e.target.value)}
                  className="birth-input"
                  placeholder="1~12"
                />
              </div>
              <span className="birth-sep">월</span>
              <div className="birth-input-group">
                <label htmlFor="birth-day">일</label>
                <input
                  id="birth-day"
                  type="number"
                  min="1"
                  max="31"
                  value={birthDay}
                  onChange={(e) => setBirthDay(e.target.value)}
                  className="birth-input"
                  placeholder="1~31"
                />
              </div>
              <span className="birth-sep">일</span>
              <button className="birth-btn" onClick={handleBirthSearch}>
                찾기
              </button>
            </div>
            {birthFlower && (
              <div className="birth-flower-result">
                <span className="birth-flower-emoji">{birthFlower.emoji}</span>
                <div className="birth-flower-info">
                  <p className="birth-flower-name">{birthFlower.name}</p>
                  <p className="birth-flower-meaning">꽃말: <strong>{birthFlower.meaning}</strong></p>
                  <p className="birth-flower-desc">{birthFlower.description}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 제철 꽃 */}
      <section className="section seasonal-section">
        <div className="section-inner">
          <div className="section-header">
            <h2>🌸 이번 달 제철 꽃</h2>
            <Link to="/gallery?season=봄" className="more-link">더보기 &gt;</Link>
          </div>
          <div className="seasonal-grid">
            {seasonalFlowers.map((flower) => (
              <Link
                key={flower.name}
                to={`/gallery?q=${flower.name}`}
                className="seasonal-card"
              >
                <span className="seasonal-emoji">{flower.emoji}</span>
                <p className="seasonal-name">{flower.name}</p>
                <p className="seasonal-badge">{flower.season}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 인기 상품 */}
      <section className="section">
        <div className="section-inner">
          <div className="section-header">
            <h2>인기 상품</h2>
            <Link to="/market?category=popular" className="more-link">더보기 &gt;</Link>
          </div>
          <div className="products-grid">
            {popularProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 퀴즈 섹션 */}
      <section id="quiz" className="section quiz-section">
        <div className="section-inner">
          <div className="section-header">
            <h2>🧠 꽃 지식 퀴즈</h2>
            <span className="quiz-score-badge">점수 {score} / {quizPool.length}</span>
          </div>
          <div className="quiz-card">
            {!quizDone ? (
              <>
                <div className="quiz-progress">
                  <span>{quizIndex + 1} / {quizPool.length}</span>
                  <div className="quiz-progress-bar">
                    <div
                      className="quiz-progress-fill"
                      style={{ width: `${((quizIndex + 1) / quizPool.length) * 100}%` }}
                    />
                  </div>
                </div>
                <p className="quiz-question">{currentQ.question}</p>
                <ul className="quiz-options">
                  {currentQ.options.map((opt, i) => {
                    let cls = 'quiz-option'
                    if (showResult) {
                      if (i === currentQ.answer) cls += ' correct'
                      else if (i === selected) cls += ' wrong'
                    }
                    if (selected === i) cls += ' selected'
                    return (
                      <li key={i}>
                        <button className={cls} onClick={() => handleSelect(i)} disabled={showResult}>
                          <span className="quiz-option-label">{String.fromCharCode(65 + i)}</span>
                          {opt}
                        </button>
                      </li>
                    )
                  })}
                </ul>
                {showResult && (
                  <div className={`quiz-feedback ${selected === currentQ.answer ? 'correct' : 'wrong'}`}>
                    <p className="quiz-feedback-title">
                      {selected === currentQ.answer ? '🎉 정답!' : '❌ 오답!'}
                    </p>
                    <p className="quiz-explanation">{currentQ.explanation}</p>
                    <button className="quiz-next-btn" onClick={handleNext}>
                      {quizIndex + 1 >= quizPool.length ? '결과 보기' : '다음 문제'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="quiz-result">
                <p className="quiz-result-emoji">
                  {score === quizPool.length ? '🏆' : score >= 3 ? '🌸' : '🌱'}
                </p>
                <p className="quiz-result-title">
                  {score === quizPool.length ? '완벽해요!' : score >= 3 ? '훌륭해요!' : '더 공부해봐요!'}
                </p>
                <p className="quiz-result-score">
                  {quizPool.length}문제 중 <strong>{score}문제</strong> 정답
                </p>
                <button className="quiz-restart-btn" onClick={handleRestart}>
                  다시 풀기
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 구독 서비스 배너 */}
      <section className="subscription-banner">
        <div className="section-inner subscription-inner">
          <div className="subscription-text">
            <p className="subscription-label">🌿 꽃담 구독 서비스</p>
            <h2>매달 제철 꽃다발을<br />집으로 받아보세요</h2>
            <p className="subscription-desc">
              기념일 설정부터 정기 배송까지, 꽃담이 알아서 챙겨드립니다
            </p>
            <Link to="/subscription" className="subscription-btn">
              구독 시작하기
            </Link>
          </div>
          <div className="subscription-visual">
            <span>💐</span>
          </div>
        </div>
      </section>

      {/* 신상품 */}
      <section className="section">
        <div className="section-inner">
          <div className="section-header">
            <h2>신상품</h2>
            <Link to="/market?category=new" className="more-link">더보기 &gt;</Link>
          </div>
          <div className="products-grid">
            {popularProducts.slice(4, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 공지사항 + 식물도감 */}
      <section className="section notice-gallery-section">
        <div className="section-inner notice-gallery-inner">
          {/* 공지사항 */}
          <div className="notice-box">
            <div className="section-header">
              <h2>📢 공지사항</h2>
              <Link to="/notices" className="more-link">더보기 &gt;</Link>
            </div>
            <ul className="notice-list">
              {notices.map((notice) => (
                <li key={notice.id} className="notice-item">
                  <span className={`notice-type ${notice.type === '이벤트' ? 'event' : notice.type === '안내' ? 'info' : ''}`}>
                    {notice.type}
                  </span>
                  <span className="notice-title">
                    {notice.isNew && <span className="notice-new">N</span>}
                    {notice.title}
                  </span>
                  <span className="notice-date">{notice.date}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 식물도감 */}
          <div className="gallery-promo-box">
            <div className="gallery-promo-inner">
              <div className="gallery-promo-text">
                <h2>🌿 식물도감</h2>
                <p>산림청 API 기반으로 2,000종 이상의 식물 정보를 제공합니다.<br/>
                어울리는 꽃 추천, AI 챗봇 상담도 이용해보세요!</p>
                <Link to="/gallery" className="gallery-promo-btn">식물도감 바로가기</Link>
              </div>
              <div className="gallery-promo-emojis">
                <span>🌹</span><span>🌷</span><span>🌼</span>
                <span>🌿</span><span>🌵</span><span>🍃</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
