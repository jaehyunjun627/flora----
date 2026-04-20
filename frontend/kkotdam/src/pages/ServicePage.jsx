import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ServicePage.css';

const services = [
  {
    id: 1,
    icon: '🌿',
    color: 'green',
    title: '식물 도감',
    desc: '158종의 식물 정보를 한눈에 검색하고, 이름·학명·계절·독성 여부까지 모두 확인하세요.',
    features: ['이름·학명·과(科) 통합 검색', '계절 / 카테고리 필터', '반려동물 독성 여부 표시'],
    link: '/plants',
  },
  {
    id: 2,
    icon: '🤖',
    color: 'teal',
    title: 'AI 식물 진단',
    desc: '식물 사진을 업로드하면 AI가 건강 상태를 분석하고 관리 팁을 알려드립니다.',
    features: ['사진 업로드만으로 즉시 진단', '병충해·영양 결핍 감지', '맞춤 관리 방법 제안'],
    link: '/diagnosis',
  },
  {
    id: 3,
    icon: '🛒',
    color: 'orange',
    title: '식물 마켓',
    desc: '신뢰할 수 있는 판매자가 올린 꽃·식물·화분·원예 용품을 편리하게 구매하세요.',
    features: ['카테고리별 상품 탐색', '장바구니 & 주문 관리', '판매자 직접 등록 가능'],
    link: '/products',
  },
  {
    id: 4,
    icon: '🔔',
    color: 'purple',
    title: '정기구독',
    desc: '매달 엄선한 식물·꽃다발을 문 앞까지 배송해드리는 정기구독 서비스입니다.',
    features: ['월 1회 큐레이션 배송', '첫 구매 무료배송 혜택', '구독 언제든지 취소 가능'],
    link: '/subscription',
  },
  {
    id: 5,
    icon: '💬',
    color: 'blue',
    title: '식물 커뮤니티',
    desc: '식물 애호가들과 자유롭게 소통하고, 지역 거래·나눔·식물 자랑까지 모두 여기서!',
    features: ['자유·질문·정보·후기 게시판', '지역 거래 & 나눔', '식물 사진 자랑 피드'],
    link: '/community',
  },
  {
    id: 6,
    icon: '📅',
    color: 'pink',
    title: '관리 캘린더',
    desc: '내 식물의 물주기·분갈이·비료 일정을 캘린더에 기록하고 알림을 받아보세요.',
    features: ['식물별 일정 등록', '월간·주간 보기 지원', '오늘의 할 일 요약'],
    link: '/mypage',
  },
];

export default function ServicePage() {
  const navigate = useNavigate();

  return (
    <div className="service-page">
      {/* Hero */}
      <section className="service-hero">
        <div className="service-hero-inner">
          <p className="service-hero-eyebrow">꽃담 Kkotdam</p>
          <h1 className="service-hero-title">
            식물을 사랑하는 모든 분들을 위한<br />
            <span className="service-hero-highlight">올인원 식물 플랫폼</span>
          </h1>
          <p className="service-hero-sub">
            도감 검색부터 AI 진단, 마켓 구매, 커뮤니티 소통까지<br />
            꽃담 하나로 식물 생활의 모든 것을 해결하세요.
          </p>
          <div className="service-hero-btns">
            <button className="service-btn-primary" onClick={() => navigate('/plants')}>
              식물 도감 보기
            </button>
            <button className="service-btn-secondary" onClick={() => navigate('/signup')}>
              무료 시작하기
            </button>
          </div>
        </div>
        <div className="service-hero-deco" aria-hidden="true">
          🌸🌿🌻🍀🌷🪴
        </div>
      </section>

      {/* Stats */}
      <section className="service-stats">
        <div className="service-stats-inner">
          <div className="service-stat-item">
            <span className="service-stat-num">158<span className="service-stat-unit">종</span></span>
            <span className="service-stat-label">등록 식물 정보</span>
          </div>
          <div className="service-stat-divider" />
          <div className="service-stat-item">
            <span className="service-stat-num">6<span className="service-stat-unit">가지</span></span>
            <span className="service-stat-label">핵심 서비스</span>
          </div>
          <div className="service-stat-divider" />
          <div className="service-stat-item">
            <span className="service-stat-num">24<span className="service-stat-unit">/7</span></span>
            <span className="service-stat-label">AI 챗봇 지원</span>
          </div>
          <div className="service-stat-divider" />
          <div className="service-stat-item">
            <span className="service-stat-num">무료<span className="service-stat-unit">배송</span></span>
            <span className="service-stat-label">첫 구매 혜택</span>
          </div>
        </div>
      </section>

      {/* Service Cards */}
      <section className="service-cards-section">
        <div className="service-cards-header">
          <h2 className="service-cards-title">주요 서비스</h2>
          <p className="service-cards-desc">꽃담이 제공하는 6가지 핵심 기능을 살펴보세요</p>
        </div>
        <div className="service-cards-grid">
          {services.map(svc => (
            <div
              key={svc.id}
              className={`service-card service-card--${svc.color}`}
              onClick={() => navigate(svc.link)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && navigate(svc.link)}
            >
              <div className="service-card-top">
                <div className={`service-card-icon service-card-icon--${svc.color}`}>
                  {svc.icon}
                </div>
                <span className="service-card-arrow">→</span>
              </div>
              <h3 className="service-card-title">{svc.title}</h3>
              <p className="service-card-desc">{svc.desc}</p>
              <ul className="service-card-list">
                {svc.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="service-cta">
        <div className="service-cta-inner">
          <h2 className="service-cta-title">지금 바로 시작해보세요 🌱</h2>
          <p className="service-cta-sub">회원가입 후 첫 구매 무료배송 + 포인트 2,000원을 받아가세요</p>
          <button className="service-btn-primary service-btn-lg" onClick={() => navigate('/signup')}>
            무료 회원가입
          </button>
        </div>
      </section>
    </div>
  );
}
