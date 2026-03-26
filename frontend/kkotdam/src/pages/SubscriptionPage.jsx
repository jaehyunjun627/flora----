import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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

const DELIVERY_DAYS = ['월요일', '화요일', '수요일', '목요일', '금요일'];

const BIRTH_FLOWERS = {
  '1': { name: '카네이션', emoji: '🌷' },
  '2': { name: '매화', emoji: '🌸' },
  '3': { name: '벚꽃', emoji: '🌸' },
  '4': { name: '튤립', emoji: '🌷' },
  '5': { name: '장미', emoji: '🌹' },
  '6': { name: '수국', emoji: '💐' },
  '7': { name: '해바라기', emoji: '🌻' },
  '8': { name: '백합', emoji: '🤍' },
  '9': { name: '코스모스', emoji: '🌼' },
  '10': { name: '국화', emoji: '🏵️' },
  '11': { name: '동백', emoji: '🌺' },
  '12': { name: '포인세티아', emoji: '❄️' },
};

const FLOWER_OPTIONS = [
  { id: 'rose', name: '장미', emoji: '🌹', desc: '사랑과 열정' },
  { id: 'tulip', name: '튤립', emoji: '🌷', desc: '영원한 사랑' },
  { id: 'sunflower', name: '해바라기', emoji: '🌻', desc: '동경과 기다림' },
  { id: 'lily', name: '백합', emoji: '🤍', desc: '순수와 희망' },
  { id: 'carnation', name: '카네이션', emoji: '💐', desc: '감사와 존경' },
  { id: 'hydrangea', name: '수국', emoji: '💜', desc: '진심과 감사' },
  { id: 'peony', name: '작약', emoji: '🩷', desc: '부귀와 행복' },
  { id: 'daisy', name: '데이지', emoji: '🌼', desc: '희망과 평화' },
  { id: 'lavender', name: '라벤더', emoji: '💜', desc: '기다리는 사랑' },
  { id: 'orchid', name: '난초', emoji: '🪻', desc: '고급과 우아' },
];

const ANNIVERSARY_TYPES = [
  { id: 'wedding', label: '결혼기념일', emoji: '💍' },
  { id: 'birthday', label: '생일', emoji: '🎂' },
  { id: 'first_meet', label: '처음 만난 날', emoji: '💕' },
  { id: 'parents_day', label: '어버이날', emoji: '🌹' },
  { id: 'valentines', label: '발렌타인데이', emoji: '💝' },
  { id: 'custom', label: '직접 입력', emoji: '📝' },
];

function getBirthFlower(dateStr) {
  if (!dateStr) return null;
  const month = String(new Date(dateStr).getMonth() + 1);
  return BIRTH_FLOWERS[month] || null;
}

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

  // 가족 탄생일
  const [familyMembers, setFamilyMembers] = useState([
    { id: 1, label: '나', birthday: '', editable: false },
    { id: 2, label: '배우자/파트너', birthday: '', editable: false },
  ]);
  const [nextFamilyId, setNextFamilyId] = useState(3);

  // 기념일
  const [anniversaries, setAnniversaries] = useState([
    { id: 1, type: 'wedding', customLabel: '', date: '' },
  ]);
  const [nextAnniId, setNextAnniId] = useState(2);

  // 꽃 선택 (최대 5개)
  const [selectedFlowers, setSelectedFlowers] = useState([]);

  const addFamilyMember = () => {
    const childCount = familyMembers.filter(m => m.label.startsWith('자녀')).length;
    setFamilyMembers([...familyMembers, { id: nextFamilyId, label: `자녀 ${childCount + 1}`, birthday: '', editable: false }]);
    setNextFamilyId(nextFamilyId + 1);
  };

  const removeFamilyMember = (id) => {
    setFamilyMembers(familyMembers.filter(m => m.id !== id));
  };

  const updateFamilyBirthday = (id, date) => {
    setFamilyMembers(familyMembers.map(m => m.id === id ? { ...m, birthday: date } : m));
  };

  const addAnniversary = () => {
    setAnniversaries([...anniversaries, { id: nextAnniId, type: 'birthday', customLabel: '', date: '' }]);
    setNextAnniId(nextAnniId + 1);
  };

  const removeAnniversary = (id) => {
    setAnniversaries(anniversaries.filter(a => a.id !== id));
  };

  const updateAnniversary = (id, field, value) => {
    setAnniversaries(anniversaries.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const toggleFlower = (flowerId) => {
    if (selectedFlowers.includes(flowerId)) {
      setSelectedFlowers(selectedFlowers.filter(f => f !== flowerId));
    } else if (selectedFlowers.length < 5) {
      setSelectedFlowers([...selectedFlowers, flowerId]);
    }
  };

  const currentPlan = PLANS.find(p => p.id === selectedPlan);

  const handleSubscribe = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    alert(`'${currentPlan.name}' 플랜 구독이 신청되었습니다!\n${currentPlan.periodLabel} 주기로 ${deliveryDay}에 배송됩니다.`);
    navigate('/mypage');
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

      {/* 플랜 선택 */}
      <section className="sub-plans-section">
        <div className="sub-section-inner">
          <div className="sub-plans-grid">
            {PLANS.map(plan => (
              <div key={plan.id} className="sub-plan-card">
                <div className="sub-plan-popular" style={{ background: plan.badgeColor }}>
                  {plan.badge}
                </div>
                <div className="sub-plan-header">
                  <h3>{plan.name}</h3>
                  <p>{plan.description}</p>
                </div>
                <div className="sub-plan-price">
                  <div className="sub-plan-price-row">
                    <span className="sub-plan-original">{plan.originalPrice.toLocaleString()}원</span>
                    <strong className="sub-plan-amount">{plan.price.toLocaleString()}<span className="sub-plan-won">원</span></strong>
                    <span className="sub-plan-period">{plan.periodLabel}</span>
                  </div>
                  <div className="sub-plan-discount-wrap">
                    <span className="sub-plan-discount">
                      {Math.round((1 - plan.price / plan.originalPrice) * 100)}% 할인
                    </span>
                  </div>
                </div>
                <ul className="sub-plan-features">
                  {plan.features.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
                <button
                  className="sub-plan-btn"
                  style={{ background: plan.gradient || plan.color }}
                  onClick={() => { setSelectedPlan(plan.id); handleSubscribe(); }}
                >
                  구독 시작하기
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 가족 탄생일 등록 */}
      <section className="sub-family-section">
        <div className="sub-section-inner">
          <h2 className="sub-section-title"><span className="section-icon">👨‍👩‍👧‍👦</span> 가족 탄생일 등록</h2>
          <div className="sub-family-grid">
            {familyMembers.map(member => {
              const flower = getBirthFlower(member.birthday);
              return (
                <div key={member.id} className="sub-family-card">
                  <div className="sub-family-card-header">
                    <span className="sub-family-label">{member.label}</span>
                    {member.id > 2 && (
                      <button className="sub-family-remove" onClick={() => removeFamilyMember(member.id)}>✕</button>
                    )}
                  </div>
                  <input
                    type="date"
                    className="sub-date-input"
                    value={member.birthday}
                    onChange={e => updateFamilyBirthday(member.id, e.target.value)}
                    placeholder="생년월일 선택..."
                  />
                  {flower && (
                    <p className="sub-family-flower">탄생화: {flower.name} {flower.emoji}</p>
                  )}
                  {!flower && (
                    <p className="sub-family-flower placeholder">탄생화: 생년월일을 선택해주세요</p>
                  )}
                </div>
              );
            })}
            <div className="sub-family-card add-card" onClick={addFamilyMember}>
              <div className="sub-family-add-icon">+</div>
              <p>가족 추가</p>
            </div>
          </div>
        </div>
      </section>

      {/* 기념일 등록 */}
      <section className="sub-anniversary-section">
        <div className="sub-section-inner">
          <h2 className="sub-section-title"><span className="section-icon">📅</span> 기념일 등록</h2>
          <p className="sub-section-desc">기념일에 맞춰 특별한 꽃을 보내드려요</p>
          <div className="sub-anni-list">
            {anniversaries.map(anni => (
              <div key={anni.id} className="sub-anni-row">
                <select
                  className="sub-anni-select"
                  value={anni.type}
                  onChange={e => updateAnniversary(anni.id, 'type', e.target.value)}
                >
                  {ANNIVERSARY_TYPES.map(t => (
                    <option key={t.id} value={t.id}>{t.emoji} {t.label}</option>
                  ))}
                </select>
                {anni.type === 'custom' && (
                  <input
                    type="text"
                    className="sub-anni-custom"
                    placeholder="기념일 이름"
                    value={anni.customLabel}
                    onChange={e => updateAnniversary(anni.id, 'customLabel', e.target.value)}
                  />
                )}
                <input
                  type="date"
                  className="sub-date-input"
                  value={anni.date}
                  onChange={e => updateAnniversary(anni.id, 'date', e.target.value)}
                />
                {anniversaries.length > 1 && (
                  <button className="sub-anni-remove" onClick={() => removeAnniversary(anni.id)}>✕</button>
                )}
              </div>
            ))}
          </div>
          <button className="sub-anni-add-btn" onClick={addAnniversary}>+ 기념일 추가</button>
        </div>
      </section>

      {/* 선호 꽃 선택 (최대 5종) */}
      <section className="sub-flower-section">
        <div className="sub-section-inner">
          <h2 className="sub-section-title"><span className="section-icon">💐</span> 보내고 싶은 꽃 선택</h2>
          <p className="sub-section-desc">최대 5종류까지 선택할 수 있어요 ({selectedFlowers.length}/5)</p>
          <div className="sub-flower-grid">
            {FLOWER_OPTIONS.map(flower => {
              const isSelected = selectedFlowers.includes(flower.id);
              const isDisabled = !isSelected && selectedFlowers.length >= 5;
              return (
                <div
                  key={flower.id}
                  className={`sub-flower-card ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                  onClick={() => !isDisabled && toggleFlower(flower.id)}
                >
                  <span className="sub-flower-emoji">{flower.emoji}</span>
                  <span className="sub-flower-name">{flower.name}</span>
                  <span className="sub-flower-desc">{flower.desc}</span>
                  {isSelected && <span className="sub-flower-check">✓</span>}
                </div>
              );
            })}
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
              <strong>{currentPlan?.periodLabel}</strong>
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
            {selectedFlowers.length > 0 && (
              <div className="sub-summary-row">
                <span>선호 꽃</span>
                <strong>{selectedFlowers.map(fid => FLOWER_OPTIONS.find(f => f.id === fid)?.name).join(', ')}</strong>
              </div>
            )}
            {anniversaries.filter(a => a.date).length > 0 && (
              <div className="sub-summary-row">
                <span>기념일</span>
                <strong>{anniversaries.filter(a => a.date).length}건 등록</strong>
              </div>
            )}
            <div className="sub-summary-divider" />
            <div className="sub-summary-row total">
              <span>결제 금액</span>
              <strong>{currentPlan?.price.toLocaleString()}원</strong>
            </div>
            <button
              className="sub-subscribe-btn"
              onClick={handleSubscribe}
              style={{ background: currentPlan?.gradient || currentPlan?.color }}
            >
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
