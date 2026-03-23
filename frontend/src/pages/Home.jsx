import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/common/ProductCard'
import { popularProducts } from '../data/mockData'
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

export default function Home() {
  const [currentBanner, setCurrentBanner] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const banner = banners[currentBanner]

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

      {/* 식물도감 바로가기 */}
      <section className="section gallery-promo">
        <div className="section-inner">
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
      </section>
    </main>
  )
}
