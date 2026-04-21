import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './SubscriptionCheckoutPage.css';

export default function SubscriptionCheckoutPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { plan, deliveryDate, anniversaries, letterService, letterMessage, selectedColor } = location.state || {};

  const [orderStep, setOrderStep] = useState('info'); // info | payment | complete
  const [processing, setProcessing] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [completedDate, setCompletedDate] = useState(null);

  const [deliveryInfo, setDeliveryInfo] = useState({
    name: user?.nickname || '',
    phone: '',
    address: '',
    addressDetail: '',
    memo: '문 앞에 놓아주세요',
    memoCustom: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('card');

  // 선택 정보 없으면 리다이렉트
  if (!plan) {
    return <Navigate to="/subscription" replace />;
  }

  if (!user) {
    return (
      <div className="sub-checkout-page">
        <div className="sub-checkout-auth">
          <p>로그인이 필요합니다.</p>
          <button onClick={() => navigate('/login')}>로그인하기</button>
        </div>
      </div>
    );
  }

  const isSingle = plan.isSingle;
  const totalPrice = plan.price;
  const deliveryFee = 0; // 구독/단일구매 배송 무료
  const finalPrice = totalPrice + deliveryFee;

  const handleInfoChange = (e) => {
    setDeliveryInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const proceedToPayment = () => {
    if (!deliveryInfo.name || !deliveryInfo.phone || !deliveryInfo.address) {
      alert('배송 정보를 모두 입력해주세요.');
      return;
    }
    setOrderStep('payment');
    window.scrollTo(0, 0);
  };

  const processPayment = async () => {
    setProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1800));
      const newOrderId = 'SUB-' + Date.now();
      const now = new Date();
      setOrderId(newOrderId);
      setCompletedDate(now);
      setOrderStep('complete');
      window.scrollTo(0, 0);

      // 구독 데이터 localStorage에 저장 (단일구매 제외)
      if (!isSingle) {
        const FLOWER_COLOR_NAMES_MAP = {
          pink: '핑크', red: '레드', white: '화이트', yellow: '옐로우',
          purple: '퍼플', peach: '피치', blue: '블루', mixed: '믹스',
        };
        const existing = JSON.parse(localStorage.getItem('flora-subscriptions') || '[]');
        // 기존 활성 구독은 모두 자동 취소 (정기구독은 1개만 허용)
        const updated = existing.map(s =>
          s.status === 'active'
            ? { ...s, status: 'cancelled', cancelledAt: now.toISOString(), cancelReason: '플랜 변경으로 자동 취소' }
            : s
        );
        const newSub = {
          id: newOrderId,
          planName: plan.name,
          planPrice: plan.price,
          planPeriodLabel: plan.periodLabel,
          planDescription: plan.description,
          planColor: plan.color,
          planGradient: plan.gradient,
          selectedColor: selectedColor,
          selectedColorName: FLOWER_COLOR_NAMES_MAP[selectedColor] || selectedColor,
          letterService: letterService || false,
          anniversaries: anniversaries || [],
          startDate: now.toISOString(),
          status: 'active',
          deliveryInfo: { ...deliveryInfo },
        };
        updated.push(newSub);
        localStorage.setItem('flora-subscriptions', JSON.stringify(updated));

        // 종 알림 생성 (localStorage에 저장 → NotificationBell에서 표시)
        const y = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const notifMsg = `${y}년${mm}월${dd}일부로 정기구독 ${plan.name} 결제 완료`;
        const localNotifs = JSON.parse(localStorage.getItem('flora-local-notifications') || '[]');
        localNotifs.unshift({
          id: 'LN-' + Date.now(),
          type: 'SUBSCRIPTION',
          message: notifMsg,
          isRead: false,
          createdAt: now.toISOString(),
          relatedType: 'SUBSCRIPTION',
          relatedId: 0,
        });
        localStorage.setItem('flora-local-notifications', JSON.stringify(localNotifs));
      }
    } catch (e) {
      alert('결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setProcessing(false);
    }
  };

  // 알림 메시지 생성
  const getNotificationMessage = () => {
    if (!completedDate) return '';
    const year = completedDate.getFullYear();
    const month = String(completedDate.getMonth() + 1).padStart(2, '0');
    const day = String(completedDate.getDate()).padStart(2, '0');
    const dateStr = `${year}년 ${month}월 ${day}일`;

    if (isSingle && deliveryDate) {
      const d = new Date(deliveryDate);
      const dy = d.getFullYear();
      const dm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${dy}년 ${dm}월 ${dd}일 배송 예정`;
    } else {
      return `${dateStr}부로 ${plan.name} 구독 시작`;
    }
  };

  const FLOWER_COLOR_NAMES = {
    pink: '핑크', red: '레드', white: '화이트', yellow: '옐로우',
    purple: '퍼플', peach: '피치', blue: '블루', mixed: '믹스',
  };

  return (
    <div className="sub-checkout-page">
      {/* Steps */}
      <div className="checkout-steps">
        <div className={`checkout-step ${orderStep === 'info' ? 'active' : orderStep === 'payment' || orderStep === 'complete' ? 'done' : ''}`}>
          <span className="step-num">1</span>
          <span>배송정보</span>
        </div>
        <div className="step-line" />
        <div className={`checkout-step ${orderStep === 'payment' ? 'active' : orderStep === 'complete' ? 'done' : ''}`}>
          <span className="step-num">2</span>
          <span>결제</span>
        </div>
        <div className="step-line" />
        <div className={`checkout-step ${orderStep === 'complete' ? 'active' : ''}`}>
          <span className="step-num">3</span>
          <span>완료</span>
        </div>
      </div>

      <div className="checkout-body">
        {/* Left: Form */}
        <div className="checkout-form-area">

          {/* 배송 정보 */}
          {orderStep === 'info' && (
            <div className="checkout-section">
              <h2>배송 정보</h2>
              <div className="checkout-field">
                <label>수령인 *</label>
                <input name="name" value={deliveryInfo.name} onChange={handleInfoChange} placeholder="이름" />
              </div>
              <div className="checkout-field">
                <label>연락처 *</label>
                <input name="phone" value={deliveryInfo.phone} onChange={handleInfoChange} placeholder="010-0000-0000" />
              </div>
              <div className="checkout-field">
                <label>주소 *</label>
                <input name="address" value={deliveryInfo.address} onChange={handleInfoChange} placeholder="기본 주소" />
              </div>
              <div className="checkout-field">
                <label>상세 주소</label>
                <input name="addressDetail" value={deliveryInfo.addressDetail} onChange={handleInfoChange} placeholder="상세 주소 (동/호수)" />
              </div>
              <div className="checkout-field">
                <label>배송 메모</label>
                <select name="memo" value={deliveryInfo.memo} onChange={handleInfoChange}>
                  <option value="문 앞에 놓아주세요">문 앞에 놓아주세요</option>
                  <option value="경비실에 맡겨주세요">경비실에 맡겨주세요</option>
                  <option value="배송 전 연락해주세요">배송 전 연락해주세요</option>
                  <option value="직접 입력">직접 입력</option>
                </select>
                {deliveryInfo.memo === '직접 입력' && (
                  <input
                    name="memoCustom"
                    value={deliveryInfo.memoCustom}
                    onChange={handleInfoChange}
                    placeholder="배송 메모를 직접 입력해주세요"
                    style={{ marginTop: '8px' }}
                  />
                )}
              </div>
              <button className="checkout-next-btn" onClick={proceedToPayment}>
                결제하기로 이동
              </button>
            </div>
          )}

          {/* 결제 수단 */}
          {orderStep === 'payment' && (
            <div className="checkout-section">
              <h2>결제 수단</h2>
              <div className="payment-methods">
                {[
                  { value: 'card', label: '신용/체크카드', icon: '💳' },
                  { value: 'bank', label: '무통장입금', icon: '🏦' },
                  { value: 'kakao', label: '카카오페이', icon: '💛' },
                  { value: 'naver', label: '네이버페이', icon: '💚' },
                  { value: 'deferred', label: '후불결제 (테스트)', icon: '🧪' },
                ].map(m => (
                  <button
                    key={m.value}
                    className={`payment-method ${paymentMethod === m.value ? 'active' : ''}`}
                    onClick={() => setPaymentMethod(m.value)}
                  >
                    <span>{m.icon}</span>
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>

              <div className="checkout-agreement">
                <p>위 주문 내용을 확인하였으며, 결제에 동의합니다.</p>
                <p className="checkout-demo-note">* 데모 결제 - 실제 결제가 진행되지 않습니다.</p>
              </div>

              <div className="checkout-payment-actions">
                <button className="checkout-back-btn" onClick={() => setOrderStep('info')}>
                  뒤로
                </button>
                <button
                  className="checkout-pay-btn"
                  onClick={processPayment}
                  disabled={processing}
                >
                  {processing ? '결제 처리 중...' : `${finalPrice.toLocaleString()}원 결제하기`}
                </button>
              </div>
            </div>
          )}

          {/* 결제 완료 */}
          {orderStep === 'complete' && (
            <div className="checkout-complete">
              <div className="complete-icon">✓</div>
              <h2>결제가 완료되었습니다.</h2>
              <p className="complete-order-id">주문번호: {orderId}</p>

              {/* 알림 메시지 */}
              <div className={`sub-complete-notification ${isSingle ? 'delivery' : 'subscription'}`}>
                <span className="sub-complete-notification-icon">
                  {isSingle ? '🚚' : '🌸'}
                </span>
                <p>{getNotificationMessage()}</p>
              </div>

              <p className="complete-msg">
                {isSingle
                  ? '주문이 접수되었습니다. 배송 시작 시 알림을 보내드립니다.'
                  : '구독이 시작되었습니다. 마이페이지에서 구독 현황을 확인하세요.'}
              </p>
              <div className="complete-actions">
                <button onClick={() => navigate('/mypage')}>마이페이지 가기</button>
                <button onClick={() => navigate('/subscription')} className="complete-shop-btn">
                  구독 더 보기
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: 구독 요약 */}
        {orderStep !== 'complete' && (
          <div className="checkout-summary">
            <h3>주문 요약</h3>

            <div className="sub-checkout-plan-header">
              <div
                className="sub-checkout-plan-dot"
                style={{ background: plan.gradient || plan.color }}
              />
              <div>
                <strong className="sub-checkout-plan-name">{plan.name}</strong>
                <span className="sub-checkout-plan-period">{plan.periodLabel}</span>
              </div>
            </div>

            <div className="summary-items">
              <div className="summary-item">
                <span className="summary-item-name">{plan.description}</span>
                <span className="summary-item-qty">x1</span>
                <span className="summary-item-price">{plan.price.toLocaleString()}원</span>
              </div>
              {letterService && (
                <div className="summary-item">
                  <span className="summary-item-name">편지 서비스</span>
                  <span className="summary-item-qty">x1</span>
                  <span className="summary-item-price" style={{ color: '#35A865' }}>무료</span>
                </div>
              )}
            </div>

            {/* 선택 옵션 요약 */}
            <div className="sub-checkout-opts">
              {isSingle && deliveryDate && (
                <div className="sub-checkout-opt-row">
                  <span>배송 희망일</span>
                  <strong>{deliveryDate}</strong>
                </div>
              )}
              {!isSingle && anniversaries && anniversaries.filter(a => a.date).length > 0 && (
                <div className="sub-checkout-opt-row">
                  <span>기념일</span>
                  <strong>{anniversaries.filter(a => a.date).length}건 등록</strong>
                </div>
              )}
              {selectedColor && (
                <div className="sub-checkout-opt-row">
                  <span>꽃다발 색상</span>
                  <strong>{FLOWER_COLOR_NAMES[selectedColor] || selectedColor}</strong>
                </div>
              )}
              {letterService && (
                <div className="sub-checkout-opt-row">
                  <span>편지 서비스</span>
                  <strong style={{ color: '#35A865' }}>포함 (무료)</strong>
                </div>
              )}
            </div>

            <div className="summary-divider" />
            <div className="summary-row">
              <span>상품금액</span>
              <span>{totalPrice.toLocaleString()}원</span>
            </div>
            <div className="summary-row">
              <span>배송비</span>
              <span style={{ color: '#35A865', fontWeight: 600 }}>무료</span>
            </div>
            <div className="summary-divider" />
            <div className="summary-row summary-total">
              <span>총 결제금액</span>
              <span>{finalPrice.toLocaleString()}원</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
