import { useParams, Link } from 'react-router-dom'
import { galleryPlants, popularProducts } from '../data/mockData'
import ProductCard from '../components/common/ProductCard'
import './PlantDetail.css'

const difficultyColor = {
  '매우 쉬움': '#22c55e',
  '쉬움': '#84cc16',
  '중간': '#f59e0b',
  '어려움': '#ef4444',
}

const careGuide = {
  '매우 쉬움': '초보자도 쉽게 키울 수 있습니다. 기본적인 물 주기와 햇빛만 제공하면 잘 자랍니다.',
  '쉬움': '큰 어려움 없이 키울 수 있습니다. 주기적인 관리가 필요합니다.',
  '중간': '약간의 원예 경험이 있다면 잘 키울 수 있습니다. 환경 관리에 신경 써주세요.',
  '어려움': '세심한 관리가 필요합니다. 원예 경험자에게 추천합니다.',
}

const monthlyGuide = [
  { month: '3월', tip: '봄 파종 준비, 분갈이 적기' },
  { month: '4월', tip: '정기적인 물 주기 시작, 비료 시작' },
  { month: '5월', tip: '성장 최성기, 해충 점검' },
  { month: '6월', tip: '여름 대비 차양 설치 고려' },
  { month: '7-8월', tip: '강한 직사광선 주의, 물 주기 빈도 증가' },
  { month: '9월', tip: '가을 비료 마무리' },
  { month: '10-11월', tip: '겨울 준비, 월동 조치' },
  { month: '12-2월', tip: '실내 보관, 물 주기 감소' },
]

export default function PlantDetail() {
  const { id } = useParams()
  const plant = galleryPlants.find((p) => p.id === id)

  if (!plant) {
    return (
      <div className="plant-not-found">
        <span>🌱</span>
        <h2>식물을 찾을 수 없습니다</h2>
        <Link to="/gallery" className="back-btn">식물도감으로 돌아가기</Link>
      </div>
    )
  }

  const relatedProducts = popularProducts.slice(0, 3)
  const relatedPlants = galleryPlants
    .filter((p) => p.id !== plant.id && p.category === plant.category)
    .slice(0, 3)

  return (
    <main className="plant-detail">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="breadcrumb-inner">
          <Link to="/">홈</Link>
          <span>/</span>
          <Link to="/gallery">식물도감</Link>
          <span>/</span>
          <span>{plant.name}</span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="detail-hero">
        <div className="detail-hero-inner">
          <div className="detail-image-area">
            <div className="detail-image-box">
              <span className="detail-emoji">{plant.emoji}</span>
            </div>
          </div>

          <div className="detail-info">
            <p className="detail-category">{plant.category}</p>
            <h1 className="detail-name">{plant.name}</h1>
            <p className="detail-scientific">{plant.scientificName}</p>

            <div className="detail-tags">
              {plant.tags.map((tag) => (
                <span key={tag} className="detail-tag">#{tag}</span>
              ))}
            </div>

            <p className="detail-description">{plant.description}</p>

            {/* Care Info Cards */}
            <div className="care-cards">
              <div className="care-card">
                <span className="care-icon">☀️</span>
                <p className="care-label">햇빛</p>
                <p className="care-value">{plant.light}</p>
              </div>
              <div className="care-card">
                <span className="care-icon">💧</span>
                <p className="care-label">물 주기</p>
                <p className="care-value">{plant.water}</p>
              </div>
              <div className="care-card">
                <span className="care-icon">🌤</span>
                <p className="care-label">제철</p>
                <p className="care-value">{plant.season}</p>
              </div>
              <div className="care-card">
                <span className="care-icon">🌱</span>
                <p className="care-label">난이도</p>
                <p
                  className="care-value"
                  style={{ color: difficultyColor[plant.difficulty] }}
                >
                  {plant.difficulty}
                </p>
              </div>
            </div>

            <p className="care-tip">{careGuide[plant.difficulty]}</p>

            <div className="detail-actions">
              <Link to={`/market?q=${plant.name}`} className="action-btn primary">
                🛒 관련 상품 보기
              </Link>
              <button className="action-btn secondary">
                🔖 관심 식물 등록
              </button>
              <button className="action-btn secondary">
                🤖 AI 재배 상담
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Care Guide */}
      <section className="detail-section">
        <div className="detail-section-inner">
          <h2>월별 관리 가이드 📅</h2>
          <p className="section-desc">AI 기반 맞춤 재배 가이드 — 식물 캘린더에서 진행 상황을 체크하세요!</p>
          <div className="monthly-grid">
            {monthlyGuide.map((item) => (
              <div key={item.month} className="monthly-card">
                <p className="monthly-month">{item.month}</p>
                <p className="monthly-tip">{item.tip}</p>
              </div>
            ))}
          </div>
          <div className="calendar-cta">
            <p>나만의 식물 캘린더로 관리 기록을 남겨보세요</p>
            <Link to="/calendar" className="calendar-link">식물 캘린더 열기 →</Link>
          </div>
        </div>
      </section>

      {/* Related Products */}
      <section className="detail-section bg-light">
        <div className="detail-section-inner">
          <h2>관련 상품</h2>
          <p className="section-desc">{plant.name} 재배에 필요한 상품들을 마켓에서 찾아보세요</p>
          <div className="related-products-grid">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Related Plants */}
      {relatedPlants.length > 0 && (
        <section className="detail-section">
          <div className="detail-section-inner">
            <h2>같은 종류의 식물</h2>
            <div className="related-plants-grid">
              {relatedPlants.map((p) => (
                <Link key={p.id} to={`/gallery/${p.id}`} className="related-plant-card">
                  <span className="related-plant-emoji">{p.emoji}</span>
                  <div>
                    <p className="related-plant-name">{p.name}</p>
                    <p className="related-plant-sci">{p.scientificName}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Back to Gallery */}
      <div className="detail-footer">
        <Link to="/gallery" className="back-to-gallery">← 식물도감으로 돌아가기</Link>
      </div>
    </main>
  )
}
