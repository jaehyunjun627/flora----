import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../contexts/AuthContext";
import "./OrderNewPage.css";

export default function OrderNewPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    recipientName: "",
    recipientPhone: "",
    deliveryAddress: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchCart();
    if (user) {
      setForm((f) => ({
        ...f,
        recipientName: user.nickname || "",
        recipientPhone: user.phone || "",
      }));
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      const res = await api.get("/api/cart");
      if (res.data.length === 0) {
        alert("장바구니가 비어있습니다");
        navigate("/cart");
        return;
      }
      setCartItems(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

  const validate = () => {
    const err = {};
    if (!form.recipientName.trim()) err.recipientName = "수령인 이름을 입력해주세요";
    if (!form.recipientPhone.trim()) err.recipientPhone = "전화번호를 입력해주세요";
    if (!form.deliveryAddress.trim()) err.deliveryAddress = "배송지를 입력해주세요";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await api.post("/api/orders", form);
      navigate(`/orders/${res.data.id}`, { state: { isNew: true } });
    } catch (e) {
      alert(e.response?.data?.message || "주문 실패");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="order-new-page">
        <div className="order-new-container">
          <div className="loading">불러오는 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-new-page">
      <div className="order-new-container">
        <form onSubmit={handleSubmit}>
          {/* 주문 상품 요약 */}
          <section className="order-section">
            <h2 className="section-title">🛒 주문 상품</h2>
            {cartItems.map((item) => (
              <div key={item.id} className="order-item-row">
                <span className="item-name">
                  {item.productName} × {item.quantity}
                </span>
                <span className="item-price">
                  {item.subtotal.toLocaleString()}원
                </span>
              </div>
            ))}
            <div className="total-row">
              <span className="label">총 결제 금액</span>
              <span className="value">{totalPrice.toLocaleString()}원</span>
            </div>
          </section>

          {/* 배송 정보 */}
          <section className="order-section">
            <h2 className="section-title">🚚 배송 정보</h2>

            <div className="form-group">
              <label className="form-label">수령인 이름 *</label>
              <input
                className={`form-input ${errors.recipientName ? "error" : ""}`}
                value={form.recipientName}
                onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
                placeholder="홍길동"
              />
              {errors.recipientName && <p className="form-error">{errors.recipientName}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">전화번호 *</label>
              <input
                className={`form-input ${errors.recipientPhone ? "error" : ""}`}
                value={form.recipientPhone}
                onChange={(e) => setForm({ ...form, recipientPhone: e.target.value })}
                placeholder="010-1234-5678"
              />
              {errors.recipientPhone && <p className="form-error">{errors.recipientPhone}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">배송 주소 *</label>
              <textarea
                className={`form-textarea ${errors.deliveryAddress ? "error" : ""}`}
                value={form.deliveryAddress}
                onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
                placeholder="서울시 강남구 테헤란로 123 456호"
                rows={3}
              />
              {errors.deliveryAddress && <p className="form-error">{errors.deliveryAddress}</p>}
            </div>
          </section>

          <button
            type="submit"
            className="submit-btn"
            disabled={submitting}
          >
            {submitting ? "처리 중..." : `${totalPrice.toLocaleString()}원 결제하기`}
          </button>
        </form>
      </div>
    </div>
  );
}
