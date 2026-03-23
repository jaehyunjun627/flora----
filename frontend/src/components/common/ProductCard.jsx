import { Link } from 'react-router-dom'
import './ProductCard.css'

export default function ProductCard({ product }) {
  const { id, name, price, seller, emoji, badge } = product

  return (
    <Link to={`/market/product/${id}`} className="product-card">
      <div className="product-image">
        <span className="product-emoji">{emoji}</span>
        {badge && <span className="product-badge">{badge}</span>}
      </div>
      <div className="product-info">
        <p className="product-name">{name}</p>
        <p className="product-price">{price.toLocaleString()}원</p>
        <p className="product-seller">{seller}</p>
      </div>
    </Link>
  )
}
