import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/common/ProductCard'
import DailyQuiz from '../components/common/DailyQuiz'
import { popularProducts } from '../data/mockData'
import { getBirthFlower, getDateString } from '../data/birthFlowers'
import './Home.css'

const today = new Date()
const birthFlower = getBirthFlower(today)
const dateString = getDateString(today)

const seasonalFlowers = [
  { emoji: '🌸', name: '벚꽃', season: '봄 제철' },
  { emoji: '🌷', name: '튤립', season: '봄 제철' },
  { emoji: '🌼', name: '수선화', season: '봄 제철' },
  { emoji: '🌹', name: '장미', season: '봄~여름' },
]

export default function Home() {
  return (
    <main className="home">
      {/* 탄생화 히어로 */}
      <section className="birth-hero">
        <div className="birth-hero-inner">
          <div className="birth-hero-left">
            <div className="birth-today-badge">TODAY</div>
            <p className="birth-date">{dateString}</p>
            <p className="birth-label">🤍 오늘의 탄생화</p>
            <h1 className="birth-flower-name">{birthFlower.flower}</h1>
            <p className="birth-meaning">"{birthFlower.meaning}"</p>
            <div className="birth-buttons">
              <Link to={`/gallery?q=${birthFlower.flower}`} className="birth-btn birth-btn-primary">
                꽃말 더 알아보기
              </Link>
              <Link to="/market" className="birth-btn birth-btn-outline">
                선물하기
              </Link>
              <Link to="/subscription" className="birth-btn birth-btn-green">
                🌸 정기 구독하기
              </Link>
            </div>
          </div>
          <div className="birth-hero-right">
            <div className="birth-flower-img" style={{ background: `radial-gradient(circle, ${birthFlower.color}33 0%, ${birthFlower.color}11 70%)`, border: `2px solid ${birthFlower.color}66` }}>
              <span className="birth-flower-emoji">{birthFlower.emoji}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 카테고리 탭 */}
      <section className="category-tabs-section">
        <div className="section-inner">
          <div className="category-tabs">
            <Link to="/market?category=spring" className="cat-tab">🌸 봄맞이 꽃</Link>
            <Link to="/market?category=plant" className="cat-tab">🌿 인기 식물</Link>
            <Link to="/market?category=pot" className="cat-tab">🪴 감성 화분</Link>
            <Link to="/gallery" className="cat-tab">📚 식물도감</Link>
            <Link to="/community" className="cat-tab">💬 커뮤니티</Link>
            <Link to="/market?category=event" className="cat-tab">🎁 이벤트</Link>
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

      {/* 데일리 퀴즈 */}
      <DailyQuiz />

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
