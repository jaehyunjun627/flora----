import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./CartPage.css";

export default function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchCart();
  }, [user]);

  const fetchCart = async () => {
    try {
      const res = await api.get("/api/cart");
      setCartItems(res.data);
    } catch (e) {
      console.error("장바구니 조회 실패:", e);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;
    try {
      const res = await api.patch(`/api/cart/${itemId}`, { quantity });
      setCartItems((prev) => prev.map((i) => (i.id === itemId ? res.data : i)));
    } catch (e) {
      alert(e.response?.data?.message || "수량 변경 실패");
    }
  };

  const removeItem = async (itemId) => {
    try {
      await api.delete(`/api/cart/${itemId}`);
      setCartItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch (e) {
      alert("삭제 실패");
    }
  };

  const clearCart = async () => {
    if (!confirm("장바구니를 비우시겠습니까?")) return;
    try {
      await api.delete("/api/cart");
      setCartItems([]);
    } catch (e) {
      alert("오류가 발생했습니다");
    }
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

  if (loading) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <div className="loading">불러오는 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <div className="empty-icon">🛒</div>
            <p className="empty-text">장바구니가 비어있습니다</p>
            <button className="cart-empty shop-btn" onClick={() => navigate("/products")}>
              쇼핑하러 가기
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items-header">
              <h2>총 {cartItems.length}개 상품</h2>
              <button className="clear-btn" onClick={clearCart}>
                전체 삭제
              </button>
            </div>

            <div className="cart-items">
              {cartItems.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                  onProductClick={() => navigate(`/products/${item.productId}`)}
                />
              ))}
            </div>

            <div className="cart-summary">
              <div className="summary-row">
                <span className="label">상품 금액</span>
                <span className="value">{totalPrice.toLocaleString()}원</span>
              </div>
              <div className="summary-row shipping">
                <span className="label">배송비</span>
                <span className="value">무료</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-total">
                <span className="label">총 결제 금액</span>
                <span className="value">{totalPrice.toLocaleString()}원</span>
              </div>
              <button
                className="order-btn"
                onClick={() => navigate("/checkout")}
              >
                주문하기 ({cartItems.length}개)
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CartItemRow({ item, onUpdateQuantity, onRemove, onProductClick }) {
  return (
    <div className="cart-item">
      <div className="cart-item-image" onClick={onProductClick}>
        🌿
      </div>

      <div className="cart-item-info">
        <p className="cart-item-name" onClick={onProductClick}>
          {item.productName}
        </p>
        <p className="cart-item-price">{item.productPrice.toLocaleString()}원</p>
        {item.stockQuantity < 5 && item.stockQuantity > 0 && (
          <p className="cart-item-stock">잔여 {item.stockQuantity}개</p>
        )}
      </div>

      <div className="qty-controls">
        <button
          className="qty-btn"
          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
          disabled={item.quantity <= 1}
        >
          −
        </button>
        <span className="qty-display">{item.quantity}</span>
        <button
          className="qty-btn"
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          disabled={item.quantity >= item.stockQuantity}
        >
          +
        </button>
      </div>

      <div className="cart-item-subtotal">
        <p className="cart-item-subtotal-price">
          {item.subtotal.toLocaleString()}원
        </p>
        <button className="remove-btn" onClick={() => onRemove(item.id)}>
          삭제
        </button>
      </div>
    </div>
  );
}
