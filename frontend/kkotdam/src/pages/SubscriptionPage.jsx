import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './SubscriptionPage.css';

const PLANS = [
  {
    id: 'basic',
    name: '베이직',
    price: 19900,
    originalPrice: 25000,
    period: '2주',
    description: '계절 꽃 한 다발을 2주마다 받아보세요',
    features: [
      '제철 꽃 한 다발 (5~7송이)',
      '무료 배송',
      '꽃 관리 가이드 동봉',
      '배송일 변경 가능',
    ],
    popular: false,
  },
  {
    id: 'premium',
    name: '프리미엄',
    price: 34900,
    originalPrice: 45000,
    period: '2주',
    description: '프리미엄 꽃다발과 시그니처 화병을 함께',
    features: [
      '프리미엄 꽃다발 (10~12송이)',
      '첫 회 시그니처 화병 증정',
      '무료 배송',
      '전문 플로리스트 관리 팁',
      '메시지 카드 무료 동봉',
    ],
    popular: true,
  },
  {
    id: 'season',
    name: '시즌 한정',
    price: 49900,
    originalPrice: 65000,
    period: '월',
    description: '매달 한정 수량의 특별한 꽃 컬렉션',
    features: [
      '시즌 한정 꽃 컬렉션',
      '프리미엄 수입 화병',
      '손편지 카드',
      '무료 배송',
      '1:1 플로리스트 상담',
      '기념일 리마인더 서비스',
    ],
    popular: false,
  },
];

const DELIVERY_DAYS = ['월요일', '화요일', '수요일', '목요일', '금요일'];

export default function SubscriptionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState('premium');
  const [deliveryDay, setDeliveryDay] = useState('수요일');
  const [startDate, setStartDate] = useState('');
  const [recipient, setRecipient] = useState('self');
  const [giftName, setGiftName] = useState('');
  const [giftPhone, setGiftPhone] = useState('');
  const [giftAddress, setGiftAddress] = useState('');
  const [message, setMessage] = useState('');

  const currentPlan = PLANS.find(p => p.id === selectedPlan);

  const handleSubscribe = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    alert(`'${currentPlan.name}' 플랜 구독이 신청되었습니다!\n매 ${currentPlan.period}마다 ${deliveryDay}에 배송됩니다.`);
    navigate('/mypage');
  };

  return (
    <div className="subscription-page">
      {/* Hero */}
      <section className="sub-hero">
        <div className="sub-hero-inner">
          <span className="sub-hero-badge">FLOWER SUBSCRIPTION</span>
          <h1 className="sub-hero-title">꽃담 정기구독</h1>
          <p className="sub-hero-desc">
            2주마다, 혹은 매달 한 번. 전문 플로리스트가 엄선한<br />
            신선한 제철 꽃을 문 앞까지 배달해드립니다.
          </p>
        </div>
      </section>

      {/* 플랜 선택 */}
      <section className="sub-plans-section">
        <div className="sub-section-inner">
          <h2 className="sub-section-title">구독 플랜 선택</h2>
          <div className="sub-plans-grid">
            {PLANS.map(plan => (
              <div
                key={plan.id}
                className={`sub-plan-card ${selectedPlan === plan.id ? 'selected' : ''} ${plan.popular ? 'popular' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && <div className="sub-plan-popular">추천</div>}
                <div className="sub-plan-header">
                  <h3>{plan.name}</h3>
                  <p>{plan.description}</p>
                </div>
                <div className="sub-plan-price">
                  <span className="sub-plan-original">{plan.originalPrice.toLocaleString()}원</span>
                  <div className="sub-plan-current">
                    <strong>{plan.price.toLocaleString()}</strong>
                    <span>원 / {plan.period}</span>
                  </div>
                  <span className="sub-plan-discount">
                    {Math.round((1 - plan.price / plan.originalPrice) * 100)}% 할인
                  </span>
                </div>
                <ul className="sub-plan-features">
                  {plan.features.map((f, i) => (
                    <li key={i}>✓ {f}</li>
                  ))}
                </ul>
                <div className="sub-plan-check">
                  {selectedPlan === plan.id ? '● 선택됨' : '○ 선택하기'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 배송 설정 */}
      <section className="sub-delivery-section">
        <div className="sub-section-inner">
          <h2 className="sub-section-title">배송 설정</h2>
          <div className="sub-delivery-grid">
            <div className="sub-delivery-card">
              <h3>수령 요일</h3>
              <p>매 배송 주기마다 원하는 요일에 받으세요</p>
              <div className="sub-delivery-days">
                {DELIVERY_DAYS.map(day => (
                  <button
                    key={day}
                    className={`sub-day-btn ${deliveryDay === day ? 'active' : ''}`}
                    onClick={() => setDeliveryDay(day)}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
            <div className="sub-delivery-card">
              <h3>첫 배송일</h3>
              <p>구독 시작일을 선택해주세요</p>
              <input
                type="date"
                className="sub-date-input"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="sub-delivery-card">
              <h3>받는 분</h3>
              <p>본인 또는 선물로 보낼 수 있어요</p>
              <div className="sub-recipient-btns">
                <button
                  className={`sub-recipient-btn ${recipient === 'self' ? 'active' : ''}`}
                  onClick={() => setRecipient('self')}
                >
                  본인
                </button>
                <button
                  className={`sub-recipient-btn ${recipient === 'gift' ? 'active' : ''}`}
                  onClick={() => setRecipient('gift')}
                >
                  선물하기
                </button>
              </div>
            </div>
          </div>

          {recipient === 'gift' && (
            <div className="sub-gift-form">
              <h3>선물 받는 분 정보</h3>
              <div className="sub-gift-fields">
                <input
                  type="text"
                  placeholder="이름"
                  value={giftName}
                  onChange={e => setGiftName(e.target.value)}
                  className="sub-gift-input"
                />
                <input
                  type="tel"
                  placeholder="연락처"
                  value={giftPhone}
                  onChange={e => setGiftPhone(e.target.value)}
                  className="sub-gift-input"
                />
                <input
                  type="text"
                  placeholder="배송 주소"
                  value={giftAddress}
                  onChange={e => setGiftAddress(e.target.value)}
                  className="sub-gift-input full"
                />
                <textarea
                  placeholder="메시지 카드 내용 (선택)"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="sub-gift-textarea"
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 주문 요약 & 결제 */}
      <section className="sub-summary-section">
        <div className="sub-section-inner">
          <div className="sub-summary-card">
            <h2>구독 요약</h2>
            <div className="sub-summary-row">
              <span>플랜</span>
              <strong>{currentPlan?.name}</strong>
            </div>
            <div className="sub-summary-row">
              <span>배송 주기</span>
              <strong>{currentPlan?.period}마다</strong>
            </div>
            <div className="sub-summary-row">
              <span>수령 요일</span>
              <strong>{deliveryDay}</strong>
            </div>
            {startDate && (
              <div className="sub-summary-row">
                <span>첫 배송일</span>
                <strong>{startDate}</strong>
              </div>
            )}
            <div className="sub-summary-row">
              <span>받는 분</span>
              <strong>{recipient === 'self' ? '본인' : giftName || '선물'}</strong>
            </div>
            <div className="sub-summary-divider" />
            <div className="sub-summary-row total">
              <span>결제 금액</span>
              <strong>{currentPlan?.price.toLocaleString()}원</strong>
            </div>
            <button className="sub-subscribe-btn" onClick={handleSubscribe}>
              {user ? '구독 시작하기' : '로그인 후 구독하기'}
            </button>
            <p className="sub-summary-note">
              * 언제든 해지 가능 · 배송 3일 전 변경/취소 가능
            </p>
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
