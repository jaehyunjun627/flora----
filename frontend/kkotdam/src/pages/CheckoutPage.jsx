import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import './CheckoutPage.css';

export default function CheckoutPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderStep, setOrderStep] = useState('info'); // info, payment, complete
  const [processing, setProcessing] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const [deliveryInfo, setDeliveryInfo] = useState({
    name: user?.nickname || '',
    phone: '',
    address: '',
    addressDetail: '',
    memo: '문 앞에 놓아주세요',
    memoCustom: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('card');

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const res = await api.get('/api/cart');
      setCartItems(res.data || []);
    } catch (e) {
      console.error('장바구니 로딩 실패:', e);
    } finally {
      setLoading(false);
    }
  };

  // CartPage와 동일한 필드명 사용 (item.subtotal 또는 item.productPrice * quantity)
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + (item.subtotal || (item.productPrice || item.price || 0) * (item.quantity || 1)), 0
  );
  const deliveryFee = totalPrice >= 50000 ? 0 : 3000;
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
  };

  const processPayment = async () => {
    setProcessing(true);
    try {
      const res = await api.post('/api/orders', {
        recipientName: deliveryInfo.name,
        recipientPhone: deliveryInfo.phone,
        deliveryAddress: `${deliveryInfo.address} ${deliveryInfo.addressDetail}`.trim(),
        deliveryMemo: deliveryInfo.memo === '직접 입력' ? deliveryInfo.memoCustom : deliveryInfo.memo,
        paymentMethod: paymentMethod,
        totalAmount: finalPrice,
      });

      setOrderId(res.data.id || res.data.orderId || 'ORD-' + Date.now());
      setOrderStep('complete');
    } catch (e) {
      console.error('주문 실패:', e);
      alert('주문 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="loading">로딩 중...</div>;

  if (!user) {
    return (
      <div className="checkout-page">
        <div className="checkout-auth">
          <p>로그인이 필요합니다.</p>
          <button onClick={() => navigate('/login')}>로그인하기</button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0 && orderStep !== 'complete') {
    return (
      <div className="checkout-page">
        <div className="checkout-empty">
          <span>🛒</span>
          <p>장바구니가 비어있습니다</p>
          <button onClick={() => navigate('/products')}>쇼핑하러 가기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
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

          {orderStep === 'complete' && (
            <div className="checkout-complete">
              <div className="complete-icon">&#10003;</div>
              <h2>주문이 완료되었습니다!</h2>
              <p className="complete-order-id">주문번호: {orderId}</p>
              <p className="complete-msg">주문 내역은 주문내역 페이지에서 확인하실 수 있습니다.</p>
              <div className="complete-actions">
                <button onClick={() => navigate('/orders')}>주문내역 보기</button>
                <button onClick={() => navigate('/products')} className="complete-shop-btn">계속 쇼핑하기</button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Order Summary */}
        {orderStep !== 'complete' && (
          <div className="checkout-summary">
            <h3>주문 요약</h3>
            <div className="summary-items">
              {cartItems.map((item, idx) => (
                <div key={idx} className="summary-item">
                  <span className="summary-item-name">{item.productName || item.name}</span>
                  <span className="summary-item-qty">x{item.quantity}</span>
                  <span className="summary-item-price">
                    {(item.subtotal || (item.productPrice || item.price || 0) * (item.quantity || 1)).toLocaleString()}원
                  </span>
                </div>
              ))}
            </div>
            <div className="summary-divider" />
            <div className="summary-row">
              <span>상품금액</span>
              <span>{totalPrice.toLocaleString()}원</span>
            </div>
            <div className="summary-row">
              <span>배송비</span>
              <span>{deliveryFee === 0 ? '무료' : `${deliveryFee.toLocaleString()}원`}</span>
            </div>
            {deliveryFee > 0 && (
              <p className="summary-free-shipping">
                {(50000 - totalPrice).toLocaleString()}원 더 담으면 무료배송!
              </p>
            )}
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
