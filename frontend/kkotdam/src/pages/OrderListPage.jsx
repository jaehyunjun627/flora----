import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./OrderListPage.css";

const STATUS_MAP = {
  PENDING: { label: "결제 대기" },
  PAID: { label: "결제 완료" },
  SHIPPING: { label: "배송 중" },
  DELIVERED: { label: "배송 완료" },
  CANCELLED: { label: "취소됨" },
};

export default function OrderListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/api/orders");
      setOrders(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!confirm("주문을 취소하시겠습니까?")) return;
    try {
      const res = await api.patch(`/api/orders/${orderId}/cancel`);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? res.data : o)));
    } catch (e) {
      alert(e.response?.data?.message || "취소 실패");
    }
  };

  if (loading) {
    return (
      <div className="order-list-page">
        <div className="order-list-container">
          <div className="loading">불러오는 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-list-page">
      <div className="order-list-container">
        {orders.length === 0 ? (
          <div className="order-empty">
            <div className="empty-icon">📦</div>
            <p className="empty-text">아직 주문 내역이 없습니다</p>
            <button className="order-empty shop-btn" onClick={() => navigate("/products")}>
              쇼핑하러 가기
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              const status = STATUS_MAP[order.status] || { label: order.status };
              return (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div className="order-info">
                      <span className="order-number">{order.orderNumber}</span>
                      <p className="order-date">
                        {new Date(order.orderedAt).toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <span className={`status-badge status-${order.status}`}>
                      {status.label}
                    </span>
                  </div>

                  <div className="order-items">
                    {order.items.map((item) => (
                      <div key={item.id} className="order-item">
                        <span className="item-name">
                          {item.productName} × {item.quantity}
                        </span>
                        <span className="item-price">
                          {item.subtotal.toLocaleString()}원
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="order-footer">
                    <span className="order-total">
                      총 {order.totalPrice.toLocaleString()}원
                    </span>
                    {order.status === "PENDING" && (
                      <button
                        className="cancel-btn"
                        onClick={() => cancelOrder(order.id)}
                      >
                        주문 취소
                      </button>
                    )}
                  </div>

                  {order.deliveryAddress && (
                    <p className="delivery-info">🚚 {order.deliveryAddress}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
