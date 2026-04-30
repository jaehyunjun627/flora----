import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../contexts/AuthContext";
import "./OrderListPage.css";

const STATUS_MAP = {
  PENDING: { label: "주문접수" },
  PREPARING: { label: "배송준비중" },
  SHIPPING: { label: "배송중" },
  DELIVERED: { label: "배송완료" },
  CANCELLED: { label: "취소됨" },
};

export default function OrderListPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return; // 인증 정보 로딩 중이면 대기
    if (!user) {
      navigate("/login");
      return;
    }
    fetchOrders();
  }, [user, authLoading]);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/api/orders");
      setOrders(Array.isArray(res.data) ? res.data : []);
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
                    {order.productName && (
                      <div className="order-item">
                        <span className="item-name">
                          {order.productName} × {order.quantity || 1}
                        </span>
                        <span className="item-price">
                          {Number(order.unitPrice || 0).toLocaleString()}원
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="order-footer">
                    <span className="order-total">
                      총 {Number(order.totalPrice || 0).toLocaleString()}원
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

                  {order.scheduledDeliveryDate && (
                    <p className="delivery-info">
                      📅 예약 발송: {new Date(order.scheduledDeliveryDate).toLocaleDateString('ko-KR')}
                    </p>
                  )}
                  {order.deliveryAddress && (
                    <p className="delivery-info">📍 {order.deliveryAddress}</p>
                  )}
                  {order.courierName && order.trackingNumber && (
                    <p className="delivery-info">🚚 {order.courierName} | 송장번호: {order.trackingNumber}</p>
                  )}
                  {order.status === "DELIVERED" && order.deliveredAt && (
                    <p className="delivery-info">✅ {new Date(order.deliveredAt).toLocaleDateString('ko-KR')} 배송완료</p>
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
