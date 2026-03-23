import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Header.css'

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/gallery?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="logo">
          <span className="logo-text">꽃담</span>
          <span className="logo-sub">kkotdam</span>
        </Link>

        <nav className="main-nav">
          <Link to="/market">마켓</Link>
          <Link to="/community">커뮤니티</Link>
          <Link to="/gallery">식물도감</Link>
        </nav>

        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="어떤 식물을 찾으시나요?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" aria-label="검색">
            🔍
          </button>
        </form>

        <div className="header-actions">
          <Link to="/cart">🛒 장바구니</Link>
          <Link to="/orders">🌸 주문내역</Link>
          <Link to="/calendar">🌿 식물캘린더</Link>
          <Link to="/mypage">👤 조이키님</Link>
          <button className="logout-btn">로그아웃</button>
        </div>
      </div>
    </header>
  )
}
