import { useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { galleryPlants, categories, seasons } from '../data/mockData'
import './Gallery.css'

const difficultyColor = {
  '매우 쉬움': '#22c55e',
  '쉬움': '#84cc16',
  '중간': '#f59e0b',
  '어려움': '#ef4444',
}

export default function Gallery() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState('전체')
  const [selectedSeason, setSelectedSeason] = useState('전체')
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [inputValue, setInputValue] = useState(searchParams.get('q') || '')

  const filtered = useMemo(() => {
    return galleryPlants.filter((plant) => {
      const matchCat =
        selectedCategory === '전체' || plant.category === selectedCategory
      const matchSeason =
        selectedSeason === '전체' || plant.season.includes(selectedSeason)
      const matchSearch =
        !searchQuery ||
        plant.name.includes(searchQuery) ||
        plant.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plant.tags.some((t) => t.includes(searchQuery))
      return matchCat && matchSeason && matchSearch
    })
  }, [selectedCategory, selectedSeason, searchQuery])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearchQuery(inputValue)
    setSearchParams(inputValue ? { q: inputValue } : {})
  }

  return (
    <main className="gallery-page">
      {/* Page Header */}
      <div className="gallery-header">
        <div className="gallery-header-inner">
          <h1>🌿 식물도감</h1>
          <p>산림청 DB 기반 식물 정보 · AI 챗봇 상담 · 어울리는 꽃 추천</p>

          <form className="gallery-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="식물 이름, 학명, 특징으로 검색..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button type="submit">검색</button>
          </form>
        </div>
      </div>

      <div className="gallery-body">
        <div className="gallery-body-inner">
          {/* Sidebar Filters */}
          <aside className="gallery-sidebar">
            <div className="filter-group">
              <h3>카테고리</h3>
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="filter-group">
              <h3>계절</h3>
              {seasons.map((season) => (
                <button
                  key={season}
                  className={`filter-btn ${selectedSeason === season ? 'active' : ''}`}
                  onClick={() => setSelectedSeason(season)}
                >
                  {season}
                </button>
              ))}
            </div>

            {/* AI Chatbot Promo */}
            <div className="ai-promo">
              <p className="ai-promo-label">🤖 AI 챗봇</p>
              <p>어울리는 꽃 추천, 선물용 꽃 상담, 식물 종류 맞추기</p>
              <button className="ai-promo-btn">챗봇 상담하기</button>
            </div>
          </aside>

          {/* Plant Grid */}
          <div className="gallery-content">
            <div className="gallery-result-info">
              <span>총 {filtered.length}종의 식물</span>
              {searchQuery && (
                <button
                  className="clear-search"
                  onClick={() => {
                    setSearchQuery('')
                    setInputValue('')
                    setSearchParams({})
                  }}
                >
                  '{searchQuery}' 검색 초기화 ×
                </button>
              )}
            </div>

            {filtered.length === 0 ? (
              <div className="gallery-empty">
                <span>🔍</span>
                <p>검색 결과가 없습니다</p>
                <p className="gallery-empty-sub">다른 검색어나 필터를 시도해보세요</p>
              </div>
            ) : (
              <div className="plant-grid">
                {filtered.map((plant) => (
                  <Link
                    key={plant.id}
                    to={`/gallery/${plant.id}`}
                    className="plant-card"
                  >
                    <div className="plant-card-image">
                      <span className="plant-emoji">{plant.emoji}</span>
                      <span
                        className="plant-difficulty"
                        style={{ color: difficultyColor[plant.difficulty] }}
                      >
                        {plant.difficulty}
                      </span>
                    </div>
                    <div className="plant-card-info">
                      <p className="plant-category">{plant.category}</p>
                      <h3 className="plant-name">{plant.name}</h3>
                      <p className="plant-scientific">{plant.scientificName}</p>
                      <p className="plant-season">🌤 {plant.season}</p>
                      <div className="plant-tags">
                        {plant.tags.map((tag) => (
                          <span key={tag} className="plant-tag">#{tag}</span>
                        ))}
                      </div>
                      <div className="plant-care">
                        <span title="햇빛">☀️ {plant.light}</span>
                        <span title="물주기">💧 {plant.water}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
