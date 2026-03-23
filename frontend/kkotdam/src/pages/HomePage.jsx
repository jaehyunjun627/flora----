import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './HomePage.css';

const BANNER_SLIDES = [
  {
    title: '봄맞이 식물 페스티벌',
    subtitle: '인기 식물 최대 40% 할인',
    cta: '지금 구경하기',
    bg: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 50%, #A5D6A7 100%)',
    color: '#1B5E20',
  },
  {
    title: '초보 식집사를 위한 가이드',
    subtitle: '키우기 쉬운 반려식물 TOP 10',
    cta: '추천 보기',
    bg: 'linear-gradient(135deg, #FFF8E1 0%, #FFECB3 50%, #FFE082 100%)',
    color: '#E65100',
  },
  {
    title: '꽃담 커뮤니티 오픈!',
    subtitle: '나만의 식물 이야기를 공유하세요',
    cta: '커뮤니티 가기',
    bg: 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 50%, #CE93D8 100%)',
    color: '#6A1B9A',
  },
];

const QUICK_MENUS = [
  { icon: '🌸', label: '꽃', path: '/products?category=꽃' },
  { icon: '🌿', label: '식물', path: '/products?category=식물' },
  { icon: '🪴', label: '화분', path: '/products?category=화분' },
  { icon: '🌱', label: '비료/토양', path: '/products?category=비료' },
  { icon: '✂️', label: '원예도구', path: '/products?category=도구' },
  { icon: '📖', label: '식물도감', path: '/plants' },
  { icon: '💬', label: '커뮤니티', path: '/community' },
  { icon: '🎁', label: '이벤트', path: '/' },
];

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [pixabayImages, setPixabayImages] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % BANNER_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    try {
      const [prodRes, imgRes] = await Promise.allSettled([
        api.get('/api/products', { params: { page: 0, size: 8 } }),
        api.get('/api/external/pixabay', { params: { q: 'flower bouquet', perPage: 12 } }),
      ]);
      if (prodRes.status === 'fulfilled') setProducts(prodRes.value.data.content || []);
      if (imgRes.status === 'fulfilled') setPixabayImages(imgRes.value.data.hits || []);
    } catch (e) {
      console.error('데이터 로딩 실패:', e);
    } finally {
      setLoading(false);
    }
  };

  const slide = BANNER_SLIDES[currentSlide];

  return (
    <div className="home">
      {/* Hero Banner Slider */}
      <section className="hero-banner" style={{ background: slide.bg }}>
        <div className="hero-inner">
          <div className="hero-text">
            <h1 className="hero-title" style={{ color: slide.color }}>{slide.title}</h1>
            <p className="hero-subtitle" style={{ color: slide.color, opacity: 0.8 }}>{slide.subtitle}</p>
            <button
              className="hero-cta"
              style={{ background: slide.color }}
              onClick={() => navigate('/products')}
            >
              {slide.cta}
            </button>
          </div>
          {/* Slide indicators */}
          <div className="hero-dots">
            {BANNER_SLIDES.map((_, i) => (
              <button
                key={i}
                className={`hero-dot ${i === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 인기 상품 */}
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

      {/* 오늘의 꽃 (Pixabay) */}
      {pixabayImages.length > 0 && (
        <section className="section section-gray">
          <div className="section-inner">
            <div className="section-header">
              <h2 className="section-title">오늘의 꽃</h2>
              <p className="section-subtitle">Pixabay에서 제공하는 아름다운 꽃 사진</p>
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
              <span className="intro-icon">💬</span>
              <h3>커뮤니티</h3>
              <p>식물 전문가와 초보 식집사의 소통 공간</p>
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
