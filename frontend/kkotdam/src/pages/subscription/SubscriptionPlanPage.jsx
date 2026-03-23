import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscriptionApi } from '../../api/subscriptionApi';
import './SubscriptionPlanPage.css';

const PLANS = [
  {
    type: 'MONTHLY',
    label: '월간 구독',
    price: '29,900원 / 월',
    desc: '매달 제철 꽃을 선물받고, 기념일도 챙겨드려요.',
    features: ['매달 제철 꽃 발송', '기념일 꽃 배송', '구독 할인 쿠폰 제공'],
  },
  {
    type: 'ANNUAL',
    label: '연간 구독',
    price: '299,000원 / 년',
    badge: '2개월 무료',
    desc: '1년치 한 번에 결제하고 더 많은 혜택을 누리세요.',
    features: ['매달 제철 꽃 발송', '기념일 꽃 배송', '연간 특별 쿠폰 제공', '우선 배송'],
  },
];

export default function SubscriptionPlanPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState('MONTHLY');
  const [form, setForm] = useState({
    receiverName: '',
    receiverPhone: '',
    deliveryAddress: '',
    seasonalFlower: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.receiverName || !form.receiverPhone || !form.deliveryAddress) {
      setError('모든 필드를 입력해주세요.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await subscriptionApi.create({
        userId: 1, // TODO: 로그인 연동 후 실제 userId
        planType: selected,
        ...form,
      });
      navigate(`/subscription/${res.data.id}/anniversaries`);
    } catch {
      setError('구독 신청 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="plan-page">
      <h1 className="plan-title">🌸 꽃담 구독 서비스</h1>
      <p className="plan-subtitle">제철 꽃과 기념일을 함께 챙겨드려요</p>

      <div className="plan-cards">
        {PLANS.map((plan) => (
          <button
            key={plan.type}
            className={`plan-card plan-card--${plan.type.toLowerCase()} ${selected === plan.type ? 'plan-card--selected' : ''}`}
            onClick={() => setSelected(plan.type)}
            type="button"
          >
            {plan.badge && <span className="plan-badge">{plan.badge}</span>}
            <h2 className="plan-card__name">{plan.label}</h2>
            <p className="plan-card__price">{plan.price}</p>
            <p className="plan-card__desc">{plan.desc}</p>
            <ul className="plan-card__features">
              {plan.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      <form className="plan-form" onSubmit={handleSubmit}>
        <h2 className="plan-form__title">배송 정보</h2>

        <div className="plan-form__field">
          <label className="plan-form__label" htmlFor="receiverName">받으시는 분</label>
          <input
            id="receiverName"
            className="plan-form__input"
            name="receiverName"
            value={form.receiverName}
            onChange={handleChange}
            placeholder="이름"
          />
        </div>

        <div className="plan-form__field">
          <label className="plan-form__label" htmlFor="receiverPhone">연락처</label>
          <input
            id="receiverPhone"
            className="plan-form__input"
            name="receiverPhone"
            value={form.receiverPhone}
            onChange={handleChange}
            placeholder="010-0000-0000"
          />
        </div>

        <div className="plan-form__field">
          <label className="plan-form__label" htmlFor="deliveryAddress">배송 주소</label>
          <input
            id="deliveryAddress"
            className="plan-form__input"
            name="deliveryAddress"
            value={form.deliveryAddress}
            onChange={handleChange}
            placeholder="주소를 입력해주세요"
          />
        </div>

        <label className="plan-form__checkbox">
          <input
            type="checkbox"
            name="seasonalFlower"
            checked={form.seasonalFlower}
            onChange={handleChange}
          />
          <span>제철 꽃 자동 발송 받기</span>
        </label>

        {error && <p className="plan-form__error">{error}</p>}

        <button type="submit" className="plan-form__submit" disabled={loading}>
          {loading ? '처리 중...' : '구독 신청하기 →'}
        </button>
      </form>
    </div>
  );
}
