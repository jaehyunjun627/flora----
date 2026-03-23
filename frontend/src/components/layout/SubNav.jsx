import { NavLink } from 'react-router-dom'
import './SubNav.css'

const categories = [
  { label: '홈', to: '/' },
  { label: '인기', to: '/market?category=popular' },
  { label: '꽃', to: '/market?category=flower' },
  { label: '식물', to: '/market?category=plant' },
  { label: '화분/소품', to: '/market?category=pot' },
  { label: '비료/토양', to: '/market?category=soil' },
  { label: '원예도구', to: '/market?category=tool' },
]

export default function SubNav() {
  return (
    <nav className="sub-nav">
      <div className="sub-nav-inner">
        {categories.map((cat) => (
          <NavLink
            key={cat.label}
            to={cat.to}
            end={cat.to === '/'}
            className={({ isActive }) =>
              isActive ? 'sub-nav-link active' : 'sub-nav-link'
            }
          >
            {cat.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
