import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import './SubscriptionOptionsPage.css';

const ANNIVERSARY_TARGETS = [
  { id: 'spouse', label: '배우자', emoji: '💑' },
  { id: 'child', label: '자녀', emoji: '👶' },
  { id: 'parents', label: '부모님', emoji: '👨‍👩‍👦' },
  { id: 'friend', label: '친구', emoji: '🤝' },
  { id: 'lover', label: '연인', emoji: '💕' },
  { id: 'self', label: '나 자신', emoji: '🙋' },
  { id: 'custom', label: '직접 입력', emoji: '✏️' },
];

const FLOWER_COLORS = [
  { id: 'pink', label: '핑크', hex: '#F48FB1', desc: '사랑스럽고 로맨틱한' },
  { id: 'red', label: '레드', hex: '#EF5350', desc: '열정적이고 강렬한' },
  { id: 'white', label: '화이트', hex: '#F5F5F5', desc: '순수하고 우아한', border: '#ddd' },
  { id: 'yellow', label: '옐로우', hex: '#FFEE58', desc: '밝고 따뜻한' },
  { id: 'purple', label: '퍼플', hex: '#AB47BC', desc: '신비롭고 고귀한' },
  { id: 'peach', label: '피치', hex: '#FFAB91', desc: '은은하고 따스한' },
  { id: 'blue', label: '블루', hex: '#64B5F6', desc: '시원하고 차분한' },
  { id: 'mixed', label: '믹스', hex: 'linear-gradient(135deg, #F48FB1 0%, #FFEE58 33%, #64B5F6 66%, #AB47BC 100%)', desc: '다채롭고 화사한', isGradient: true },
];

export default function SubscriptionOptionsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const plan = location.state?.plan;

  // 선택한 플랜이 없으면 구독 페이지로 리다이렉트
  if (!plan) {
    return <Navigate to="/subscription" replace />;
  }

  const isSingle = plan.isSingle;

  // 단일 구매: 배송 희망일
  const [deliveryDate, setDeliveryDate] = useState('');

  // 기념일 (구독만)
  const [anniversaries, setAnniversaries] = useState([
    { id: 1, targetId: 'spouse', customTarget: '', date: '' },
  ]);
  const [nextAnniId, setNextAnniId] = useState(2);

  // 편지 서비스
  const [letterService, setLetterService] = useState(false);
  const [letterMessage, setLetterMessage] = useState('');

  // 꽃다발 색
  const [selectedColor, setSelectedColor] = useState('');

  const addAnniversary = () => {
    setAnniversaries([...anniversaries, { id: nextAnniId, targetId: 'parents', customTarget: '', date: '' }]);
    setNextAnniId(nextAnniId + 1);
  };

  const removeAnniversary = (id) => {
    if (anniversaries.length <= 1) return;
    setAnniversaries(anniversaries.filter(a => a.id !== id));
  };

  const updateAnniversary = (id, field, value) => {
    setAnniversaries(anniversaries.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const handleProceed = () => {
    if (isSingle && !deliveryDate) {
      alert('배송 희망일을 선택해주세요.');
      return;
    }
    if (!selectedColor) {
      alert('꽃다발 색상을 선택해주세요.');
      return;
    }
    navigate('/subscription/checkout', {
      state: {
        plan,
        deliveryDate,
        anniversaries: isSingle ? [] : anniversaries,
        letterService,
        letterMessage,
        selectedColor,
      },
    });
  };

  return (
    <div className="sub-options-page">
      {/* 상단: 선택한 플랜 표시 */}
      <div className="sub-options-header">
        <button className="sub-options-back" onClick={() => navigate('/subscription')}>← 플랜 변경</button>
        <div className="sub-options-plan-badge" style={{ background: plan.gradient || plan.color }}>
          {plan.name} · {plan.price.toLocaleString()}원{plan.periodLabel}
        </div>
      </div>

      <div className="sub-options-body">
        <div className="sub-options-main">
          <h1 className="sub-options-title">
            {isSingle ? '배송 옵션을 설정해주세요' : '구독 옵션을 설정해주세요'}
          </h1>
          <p className="sub-options-subtitle">
            {isSingle
              ? '원하는 날에 딱 한 번 특별한 꽃을 받아보세요.'
              : '기념일, 편지, 꽃 색상을 미리 설정해두면 더 특별한 구독이 됩니다.'}
          </p>

          {/* 단일 구매: 배송 희망일 */}
          {isSingle && (
            <div className="sub-opts-card">
              <div className="sub-opts-card-title">
                <span className="sub-opts-icon">📅</span>
                <h2>배송 희망일 선택</h2>
                <span className="sub-opts-required">필수</span>
              </div>
              <p className="sub-opts-desc">꽃을 받고 싶은 날짜를 선택해주세요. (주문일로부터 최소 2일 이후)</p>
              <input
                type="date"
                className="sub-opts-date-input"
                value={deliveryDate}
                onChange={e => setDeliveryDate(e.target.value)}
                min={(() => {
                  const d = new Date();
                  d.setDate(d.getDate() + 2);
                  return d.toISOString().split('T')[0];
                })()}
              />
            </div>
          )}

          {/* 구독: 기념일 입력 */}
          {!isSingle && (
            <div className="sub-opts-card">
              <div className="sub-opts-card-title">
                <span className="sub-opts-icon">🎂</span>
                <h2>기념일 등록</h2>
                <span className="sub-opts-optional">선택</span>
              </div>
              <p className="sub-opts-desc">소중한 분들의 기념일을 등록해두면 특별한 꽃으로 챙겨드려요.</p>

              <div className="sub-opts-anni-list">
                {anniversaries.map((anni) => (
                  <div key={anni.id} className="sub-opts-anni-row">
                    <select
                      className="sub-opts-select"
                      value={anni.targetId}
                      onChange={e => updateAnniversary(anni.id, 'targetId', e.target.value)}
                    >
                      {ANNIVERSARY_TARGETS.map(t => (
                        <option key={t.id} value={t.id}>{t.emoji} {t.label}</option>
                      ))}
                    </select>
                    {anni.targetId === 'custom' && (
                      <input
                        type="text"
                        className="sub-opts-custom-input"
                        placeholder="대상 입력 (예: 할머니)"
                        value={anni.customTarget}
                        onChange={e => updateAnniversary(anni.id, 'customTarget', e.target.value)}
                      />
                    )}
                    <input
                      type="date"
                      className="sub-opts-date-input sub-opts-date-input--inline"
                      value={anni.date}
                      onChange={e => updateAnniversary(anni.id, 'date', e.target.value)}
                    />
                    {anniversaries.length > 1 && (
                      <button
                        className="sub-opts-remove-btn"
                        onClick={() => removeAnniversary(anni.id)}
                      >✕</button>
                    )}
                  </div>
                ))}
              </div>

              <button className="sub-opts-add-btn" onClick={addAnniversary}>
                + 대상 추가
              </button>
            </div>
          )}

          {/* 편지 서비스 */}
          <div className="sub-opts-card">
            <div className="sub-opts-card-title">
              <span className="sub-opts-icon">✉️</span>
              <h2>편지 서비스</h2>
              <span className="sub-opts-free-badge">무료</span>
            </div>
            <p className="sub-opts-desc">꽃과 함께 손편지를 동봉해드립니다. 소중한 분께 마음을 전해보세요.</p>

            <div className="sub-opts-toggle-row">
              <span className="sub-opts-toggle-label">편지 서비스 추가</span>
              <button
                className={`sub-opts-toggle ${letterService ? 'on' : 'off'}`}
                onClick={() => setLetterService(!letterService)}
              >
                <span className="sub-opts-toggle-knob" />
              </button>
              <span className={`sub-opts-toggle-status ${letterService ? 'on' : ''}`}>
                {letterService ? '추가됨' : '미추가'}
              </span>
            </div>

            {letterService && (
              <div className="sub-opts-letter-area">
                <label className="sub-opts-label">편지 내용 <span>(선택)</span></label>
                <textarea
                  className="sub-opts-textarea"
                  placeholder="꽃과 함께 전하고 싶은 마음을 적어주세요...&#10;예: 항상 행복하세요 💐"
                  value={letterMessage}
                  onChange={e => setLetterMessage(e.target.value)}
                  rows={4}
                  maxLength={200}
                />
                <p className="sub-opts-char-count">{letterMessage.length} / 200</p>
              </div>
            )}
          </div>

          {/* 꽃다발 색 선택 */}
          <div className="sub-opts-card">
            <div className="sub-opts-card-title">
              <span className="sub-opts-icon">🌸</span>
              <h2>꽃다발 색상 선택</h2>
              <span className="sub-opts-required">필수</span>
            </div>
            <p className="sub-opts-desc">원하는 색상 테마를 선택하면 플로리스트가 어울리는 꽃으로 구성해드립니다.</p>

            <div className="sub-opts-color-grid">
              {FLOWER_COLORS.map(color => (
                <div
                  key={color.id}
                  className={`sub-opts-color-card ${selectedColor === color.id ? 'selected' : ''}`}
                  onClick={() => setSelectedColor(color.id)}
                >
                  <div
                    className="sub-opts-color-swatch"
                    style={{
                      background: color.hex,
                      border: color.border ? `1px solid ${color.border}` : 'none',
                    }}
                  />
                  <span className="sub-opts-color-name">{color.label}</span>
                  <span className="sub-opts-color-desc">{color.desc}</span>
                  {selectedColor === color.id && (
                    <span className="sub-opts-color-check">✓</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 사이드바: 선택 요약 */}
        <div className="sub-opts-sidebar">
          <div className="sub-opts-summary">
            <h3>선택 요약</h3>
            <div className="sub-opts-summary-plan">
              <div
                className="sub-opts-summary-plan-color"
                style={{ background: plan.gradient || plan.color }}
              />
              <div>
                <strong>{plan.name}</strong>
                <span>{plan.price.toLocaleString()}원{plan.periodLabel}</span>
              </div>
            </div>
            <div className="sub-opts-summary-divider" />

            {isSingle && deliveryDate && (
              <div className="sub-opts-summary-row">
                <span>배송 희망일</span>
                <strong>{deliveryDate}</strong>
              </div>
            )}

            {!isSingle && anniversaries.filter(a => a.date).length > 0 && (
              <div className="sub-opts-summary-row">
                <span>기념일</span>
                <strong>{anniversaries.filter(a => a.date).length}건 등록</strong>
              </div>
            )}

            <div className="sub-opts-summary-row">
              <span>편지 서비스</span>
              <strong style={{ color: letterService ? '#35A865' : 'inherit' }}>
                {letterService ? '추가 (무료)' : '미추가'}
              </strong>
            </div>

            {selectedColor && (
              <div className="sub-opts-summary-row">
                <span>꽃다발 색상</span>
                <strong>{FLOWER_COLORS.find(c => c.id === selectedColor)?.label}</strong>
              </div>
            )}

            <div className="sub-opts-summary-divider" />
            <div className="sub-opts-summary-row sub-opts-summary-total">
              <span>결제 예정금액</span>
              <strong>{plan.price.toLocaleString()}원</strong>
            </div>

            <button
              className="sub-opts-proceed-btn"
              onClick={handleProceed}
              style={{ background: plan.gradient || plan.color }}
            >
              {isSingle ? '구매하러 가기 →' : '구독하러 가기 →'}
            </button>
            <p className="sub-opts-note">* 언제든 해지 가능 · 배송 3일 전 변경/취소 가능</p>
          </div>
        </div>
      </div>
    </div>
  );
}
