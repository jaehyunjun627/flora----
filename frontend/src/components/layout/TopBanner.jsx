import { Link } from 'react-router-dom'
import './TopBanner.css'

export default function TopBanner() {
  return (
    <div className="top-banner">
      첫구매 시 무료배송 + 포인트 2,000원 적립&nbsp;
      <Link to="/signup" className="top-banner-link">지금 가입하기 &gt;</Link>
    </div>
  )
}
