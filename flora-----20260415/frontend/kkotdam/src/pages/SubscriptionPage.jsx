import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './SubscriptionPage.css';

const PLANS = [
  {
    id: 'basic',
    name: '베이직 플랜',
    badge: '인기',
    badgeColor: '#35A865',
    price: 19900,
    originalPrice: 25000,
    periodLabel: '/ 2주마다',
    description: '계절 꽃 한 다발',
    features: ['제철 꽃 한 다발', '무료 배송', '꽃 관리 가이드'],
    color: '#35A865',
    gradient: 'linear-gradient(135deg, #35A865 0%, #2d8a4e 100%)',
  },
  {
    id: 'single',
    name: '단일 구매',
    badge: '예약배송',
    badgeColor: '#2196F3',
    price: 30000,
    originalPrice: null,
    periodLabel: '/ 1회',
    description: '원하는 날에 딱 한 번',
    features: ['제철 꽃 한 다발', '배송 희망일 선택', '무료 배송', '편지 서비스 선택 가능(무료)'],
    color: '#2196F3',
    gradient: 'linear-gradient(135deg, #2196F3 0%, #1565C0 100%)',
    isSingle: true,
  },
  {
    id: 'premium',
    name: '프리미엄 플랜',
    badge: '추천',
    badgeColor: '#E65100',
    price: 34900,
    originalPrice: 45000,
    periodLabel: '/ 2주마다',
    description: '프리미엄 꽃 + 화병',
    features: ['프리미엄 꽃 다발', '시그니처 화병 포함', '무료 배송', '전문가 관리 팁'],
    color: '#E65100',
    gradient: 'linear-gradient(135deg, #E65100 0%, #FF8F00 100%)',
  },
  {
    id: 'season',
    name: '시즌 한정',
    badge: '한정',
    badgeColor: '#6A1B9A',
    price: 49900,
    originalPrice: 65000,
    periodLabel: '/ 월 1회',
    description: '한정판 계절 컬렉션',
    features: ['시즌 한정 꽃 컬렉션', '프리미엄 화병', '손편지 카드', '무료 배송', '1:1 플로리스트 상담'],
    color: '#6A1B9A',
    gradient: 'linear-gradient(135deg, #6A1B9A 0%, #9C27B0 100%)',
  },
];

const HOW_IT_WORKS = [
  { step: '01', icon: '🌸', title: '플랜 선택', desc: '나에게 맞는 구독 플랜을 고르세요. 2주마다 또는 월 1회, 원하는 주기로 받아보세요.' },
  { step: '02', icon: '🎨', title: '꽃 취향 설정', desc: '좋아하는 색상과 꽃 종류를 선택하면 플로리스트가 맞춤 꽃다발을 구성해드립니다.' },
  { step: '03', icon: '📦', title: '신선하게 배송', desc: '산지에서 직접 공수한 신선한 꽃을 정성껏 포장하여 문 앞까지 배달해드립니다.' },
  { step: '04', icon: '💐', title: '일상이 꽃이 되다', desc: '집, 책상, 어디든 꽃 한 다발이 있으면 일상이 특별해집니다.' },
];

const SUBSCRIPTION_BENEFITS = [
  { icon: '💸', title: '최대 30% 할인', desc: '정기 구독 시 정가 대비 최대 30% 저렴하게 즐기세요.' },
  { icon: '🚚', title: '무료 배송', desc: '모든 구독 상품은 배송비 없이 문 앞까지 배달됩니다.' },
  { icon: '✏️', title: '손편지 서비스', desc: '소중한 분께 꽃과 함께 편지를 전해보세요. 편지 서비스는 무료입니다.' },
  { icon: '🔄', title: '언제든 해지', desc: '구독 해지는 마이페이지에서 언제든 가능합니다. 위약금도 없어요.' },
  { icon: '👩‍🌾', title: '전문 플로리스트', desc: '매 회차 계절에 어울리는 꽃을 전문 플로리스트가 직접 선정합니다.' },
  { icon: '📅', title: '기념일 알림', desc: '중요한 기념일을 등록하면 특별한 꽃다발로 잊지 않도록 챙겨드립니다.' },
];

export default function SubscriptionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 현재 활성 구독 플랜명 읽기
  const currentActivePlanName = React.useMemo(() => {
    try {
      const subs = JSON.parse(localStorage.getItem('flora-subscriptions') || '[]');
      const active = subs.find(s => s.status === 'active');
      return active ? active.planName : null;
    } catch { return null; }
  }, []);

  const handlePlanSelect = (plan) => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/subscription/options', { state: { plan } });
  };

  return (
    <div className="subscription-page">
      {/* Hero */}
      <section className="sub-hero">
        <div className="sub-hero-inner">
          <span className="sub-hero-badge">SUBSCRIPTION</span>
          <h1 className="sub-hero-title">꽃담 정기구독</h1>
          <p className="sub-hero-desc">
            2주마다 신선한 제철 꽃을 문 앞까지 배달해드립니다.<br />
            당신의 일상에 꽃을 더하세요.
          </p>
        </div>
      </section>

      {/* 서비스 소개 - How it works */}
      <section className="sub-howto-section">
        <div className="sub-section-inner">
          <div className="sub-howto-header">
            <span className="sub-section-chip">서비스 안내</span>
            <h2 className="sub-howto-title">꽃담 구독, 이렇게 이용하세요</h2>
            <p className="sub-howto-subtitle">간단한 4단계로 나만의 꽃 구독을 시작해보세요</p>
          </div>
          <div className="sub-howto-grid">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="sub-howto-card">
                <div className="sub-howto-step">{item.step}</div>
                <div className="sub-howto-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 구독 혜택 */}
      <section className="sub-benefits-section">
        <div className="sub-section-inner">
          <div className="sub-benefits-header">
            <span className="sub-section-chip sub-section-chip--pink">혜택</span>
            <h2 className="sub-howto-title">구독하면 이런 혜택을 드려요</h2>
          </div>
          <div className="sub-benefits-grid">
            {SUBSCRIPTION_BENEFITS.map((b, i) => (
              <div key={i} className="sub-benefit-card">
                <span className="sub-benefit-icon">{b.icon}</span>
                <div>
                  <strong>{b.title}</strong>
                  <p>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 플랜 선택 */}
      <section className="sub-plans-section">
        <div className="sub-section-inner">
          <div className="sub-plans-header">
            <span className="sub-section-chip sub-section-chip--green">플랜</span>
            <h2 className="sub-howto-title">원하는 플랜을 선택하세요</h2>
            <p className="sub-howto-subtitle">구독 또는 단일 구매 중 원하는 방식을 선택하세요</p>
          </div>
          <div className="sub-plans-grid">
            {PLANS.map(plan => {
              const isCurrent = !plan.isSingle && currentActivePlanName === plan.name;
              return (
                <div
                  key={plan.id}
                  className={`sub-plan-card ${plan.isSingle ? 'sub-plan-card--single' : ''} ${isCurrent ? 'sub-plan-card--current' : ''}`}
                >
                  {isCurrent && (
                    <div className="sub-plan-current-badge">✓ 현재 구독 중</div>
                  )}
                  <div className="sub-plan-popular" style={{ background: plan.badgeColor }}>
                    {plan.badge}
                  </div>
                  <div className="sub-plan-header">
                    <h3>{plan.name}</h3>
                    <p>{plan.description}</p>
                  </div>
                  <div className="sub-plan-price">
                    <div className="sub-plan-price-row">
                      {plan.originalPrice && (
                        <span className="sub-plan-original">{plan.originalPrice.toLocaleString()}원</span>
                      )}
                      <strong className="sub-plan-amount">{plan.price.toLocaleString()}<span className="sub-plan-won">원</span></strong>
                      <span className="sub-plan-period">{plan.periodLabel}</span>
                    </div>
                    {plan.originalPrice && (
                      <div className="sub-plan-discount-wrap">
                        <span className="sub-plan-discount">
                          {Math.round((1 - plan.price / plan.originalPrice) * 100)}% 할인
                        </span>
                      </div>
                    )}
                    {plan.isSingle && (
                      <div className="sub-plan-discount-wrap">
                        <span className="sub-plan-single-badge">📅 예약 발송 · 편지 서비스 무료</span>
                      </div>
                    )}
                  </div>

                  {/* CTA 버튼: 가격 바로 아래 — 가장 눈에 띄는 위치 */}
                  <button
                    className={`sub-plan-btn ${isCurrent ? 'sub-plan-btn--current' : ''}`}
                    style={isCurrent ? {} : { background: plan.gradient || plan.color }}
                    onClick={() => handlePlanSelect(plan)}
                  >
                    {plan.isSingle
                      ? '날짜 선택하고 예약하기'
                      : isCurrent
                        ? '구독 변경하기'
                        : currentActivePlanName
                          ? '이 플랜으로 변경'
                          : '구독 시작하기'}
                  </button>

                  <ul className="sub-plan-features">
                    {plan.features.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="sub-faq-section">
        <div className="sub-section-inner">
          <h2 className="sub-section-title">자주 묻는 질문</h2>
          <div className="sub-faq-list">
            {[
              { q: '구독은 어떻게 해지하나요?', a: '마이페이지에서 언제든 해지할 수 있습니다. 다음 결제일 3일 전까지 해지하시면 추가 과금이 없습니다.' },
              { q: '배송일을 변경할 수 있나요?', a: '네, 배송 3일 전까지 마이페이지에서 변경 가능합니다.' },
              { q: '어떤 꽃이 오나요?', a: '전문 플로리스트가 계절에 맞는 꽃을 엄선하여 보내드립니다. 꽃의 종류는 매 회차 달라집니다.' },
              { q: '선물 구독도 가능한가요?', a: '네, 주문 시 선물하기를 선택하면 원하는 분께 정기적으로 꽃을 보낼 수 있습니다.' },
              { q: '단일 구매와 구독의 차이는 무엇인가요?', a: '단일 구매는 원하는 날 한 번만 배송받는 서비스이고, 구독은 정기적으로 꽃을 받아보는 서비스입니다. 구독 시 할인 혜택이 있습니다.' },
            ].map((item, i) => (
              <details key={i} className="sub-faq-item">
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
