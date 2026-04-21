import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import sellerApi from '../api/sellerApi';
import './SellerDashboardPage.css';

const COURIER_LIST = [
  'CJ대한통운', '한진택배', '롯데택배', '우체국택배',
  '로젠택배', '경동택배', 'GS25편의점택배', 'CU편의점택배',
];

const STATUS_MAP = {
  PENDING: { label: '신규주문', color: '#ff6b35', icon: '🔔' },
  PREPARING: { label: '배송준비', color: '#2196f3', icon: '📦' },
  SHIPPING: { label: '배송중', color: '#ff9800', icon: '🚚' },
  DELIVERED: { label: '배송완료', color: '#4caf50', icon: '✅' },
  CANCELLED: { label: '주문취소', color: '#9e9e9e', icon: '❌' },
};

const TABS = [
  { key: 'orders', label: '주문관리', icon: '📋' },
  { key: 'shipping', label: '배송관리', icon: '🚚' },
  { key: 'products', label: '상품관리', icon: '🏷️' },
];

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
  const [dashboard, setDashboard] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderFilter, setOrderFilter] = useState('');
  const [shippingFilter, setShippingFilter] = useState('PREPARING');

  // 송장 입력 모달
  const [shipModal, setShipModal] = useState(null);
  const [courier, setCourier] = useState('');
  const [trackingNum, setTrackingNum] = useState('');

  // 상품 수정 모달
  const [editModal, setEditModal] = useState(null);

  useEffect(() => {
    if (!user || (user.role !== 'SELLER' && user.role !== 'ADMIN')) {
      navigate('/');
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashRes, ordersRes, productsRes] = await Promise.all([
        sellerApi.getDashboard(),
        sellerApi.getOrders(),
        sellerApi.getProducts(),
      ]);
      setDashboard(dashRes.data);
      setOrders(ordersRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      console.error('판매자 데이터 로딩 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async (status) => {
    try {
      const res = await sellerApi.getOrders(status || undefined);
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // 주문 확인
  const handleConfirm = async (orderId) => {
    if (!window.confirm('주문을 확인하시겠습니까?')) return;
    try {
      await sellerApi.confirmOrder(orderId);
      await loadOrders(orderFilter || undefined);
      const dashRes = await sellerApi.getDashboard();
      setDashboard(dashRes.data);
    } catch (err) {
      alert(err.response?.data?.message || '주문 확인 실패');
    }
  };

  // 배송 시작
  const handleShip = async () => {
    if (!courier || !trackingNum.trim()) {
      alert('택배사와 송장번호를 입력해주세요');
      return;
    }
    try {
      await sellerApi.shipOrder(shipModal, courier, trackingNum.trim());
      setShipModal(null);
      setCourier('');
      setTrackingNum('');
      await loadOrders(shippingFilter || undefined);
      const dashRes = await sellerApi.getDashboard();
      setDashboard(dashRes.data);
    } catch (err) {
      alert(err.response?.data?.message || '발송 처리 실패');
    }
  };

  // 배송 완료
  const handleDeliver = async (orderId) => {
    if (!window.confirm('배송 완료 처리하시겠습니까?')) return;
    try {
      await sellerApi.deliverOrder(orderId);
      await loadOrders(shippingFilter || undefined);
      const dashRes = await sellerApi.getDashboard();
      setDashboard(dashRes.data);
    } catch (err) {
      alert(err.response?.data?.message || '배송완료 처리 실패');
    }
  };

  // 상품 활성/비활성 토글
  const handleToggleProduct = async (productId) => {
    try {
      await sellerApi.toggleProduct(productId);
      const res = await sellerApi.getProducts();
      setProducts(res.data);
    } catch (err) {
      alert('상품 상태 변경 실패');
    }
  };

  // 상품 삭제
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('이 상품을 삭제하시겠습니까?')) return;
    try {
      await sellerApi.deleteProduct(productId);
      const res = await sellerApi.getProducts();
      setProducts(res.data);
    } catch (err) {
      alert('상품 삭제 실패');
    }
  };

  const filteredOrders = orderFilter
    ? orders.filter(o => o.status === orderFilter)
    : orders;

  const shippingOrders = shippingFilter
    ? orders.filter(o => o.status === shippingFilter)
    : orders.filter(o => ['PREPARING', 'SHIPPING', 'DELIVERED'].includes(o.status));

  if (loading) {
    return (
      <div className="sd-loading">
        <div className="sd-spinner" />
        <p>스토어 데이터를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="sd-container">
      {/* 헤더 */}
      <div className="sd-header">
        <h1 className="sd-title">스토어 관리</h1>
        <p className="sd-subtitle">{user?.nickname}님의 판매자 센터</p>
      </div>

      {/* 대시보드 요약 카드 */}
      {dashboard && (
        <div className="sd-stats-grid">
          <div className="sd-stat-card sd-stat-pending">
            <span className="sd-stat-icon">🔔</span>
            <div className="sd-stat-info">
              <span className="sd-stat-num">{dashboard.pendingOrders}</span>
              <span className="sd-stat-label">신규주문</span>
            </div>
          </div>
          <div className="sd-stat-card sd-stat-preparing">
            <span className="sd-stat-icon">📦</span>
            <div className="sd-stat-info">
              <span className="sd-stat-num">{dashboard.preparingOrders}</span>
              <span className="sd-stat-label">배송준비</span>
            </div>
          </div>
          <div className="sd-stat-card sd-stat-shipping">
            <span className="sd-stat-icon">🚚</span>
            <div className="sd-stat-info">
              <span className="sd-stat-num">{dashboard.shippingOrders}</span>
              <span className="sd-stat-label">배송중</span>
            </div>
          </div>
          <div className="sd-stat-card sd-stat-delivered">
            <span className="sd-stat-icon">✅</span>
            <div className="sd-stat-info">
              <span className="sd-stat-num">{dashboard.deliveredOrders}</span>
              <span className="sd-stat-label">배송완료</span>
            </div>
          </div>
          <div className="sd-stat-card sd-stat-revenue">
            <span className="sd-stat-icon">💰</span>
            <div className="sd-stat-info">
              <span className="sd-stat-num">{Number(dashboard.totalRevenue || 0).toLocaleString()}원</span>
              <span className="sd-stat-label">총 매출</span>
            </div>
          </div>
          <div className="sd-stat-card sd-stat-products">
            <span className="sd-stat-icon">🏷️</span>
            <div className="sd-stat-info">
              <span className="sd-stat-num">{dashboard.totalProducts}</span>
              <span className="sd-stat-label">등록 상품</span>
            </div>
          </div>
        </div>
      )}

      {/* 탭 네비게이션 */}
      <div className="sd-tabs">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`sd-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div className="sd-content">
        {/* ===== 주문관리 탭 ===== */}
        {activeTab === 'orders' && (
          <div className="sd-section">
            <div className="sd-section-header">
              <h2>주문 관리</h2>
              <div className="sd-filter-btns">
                {[
                  { value: '', label: '전체' },
                  { value: 'PENDING', label: '신규주문' },
                  { value: 'PREPARING', label: '배송준비' },
                  { value: 'SHIPPING', label: '배송중' },
                  { value: 'DELIVERED', label: '배송완료' },
                  { value: 'CANCELLED', label: '취소' },
                ].map(f => (
                  <button
                    key={f.value}
                    className={`sd-filter-btn ${orderFilter === f.value ? 'active' : ''}`}
                    onClick={() => { setOrderFilter(f.value); loadOrders(f.value || undefined); }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="sd-empty">주문이 없습니다</div>
            ) : (
              <div className="sd-order-list">
                {filteredOrders.map(order => (
                  <div key={order.id} className="sd-order-card">
                    <div className="sd-order-top">
                      <span className="sd-order-number">{order.orderNumber}</span>
                      <span className={`sd-order-status sd-status-${order.status?.toLowerCase()}`}>
                        {STATUS_MAP[order.status]?.icon} {STATUS_MAP[order.status]?.label || order.status}
                      </span>
                    </div>
                    <div className="sd-order-body">
                      <div className="sd-order-product">
                        <strong>{order.productName}</strong>
                        <span className="sd-order-qty">x{order.quantity}</span>
                      </div>
                      <div className="sd-order-details">
                        <span>💰 {Number(order.totalPrice || 0).toLocaleString()}원</span>
                        <span>👤 {order.buyerNickname || order.recipientName}</span>
                        <span>📞 {order.recipientPhone}</span>
                      </div>
                      <div className="sd-order-address">
                        📍 {order.deliveryAddress}
                      </div>
                      <div className="sd-order-date">
                        🕐 {order.orderedAt ? new Date(order.orderedAt).toLocaleDateString('ko-KR') : '-'}
                      </div>
                    </div>
                    <div className="sd-order-actions">
                      {order.status === 'PENDING' && (
                        <button className="sd-btn sd-btn-confirm" onClick={() => handleConfirm(order.id)}>
                          주문 확인
                        </button>
                      )}
                      {order.status === 'PREPARING' && (
                        <button className="sd-btn sd-btn-ship" onClick={() => { setShipModal(order.id); setCourier(''); setTrackingNum(''); }}>
                          발송 처리
                        </button>
                      )}
                      {order.status === 'SHIPPING' && (
                        <button className="sd-btn sd-btn-deliver" onClick={() => handleDeliver(order.id)}>
                          배송완료
                        </button>
                      )}
                      {order.status === 'SHIPPING' && order.courierName && (
                        <span className="sd-tracking-info">
                          {order.courierName} | {order.trackingNumber}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== 배송관리 탭 ===== */}
        {activeTab === 'shipping' && (
          <div className="sd-section">
            <div className="sd-section-header">
              <h2>배송 관리</h2>
              <div className="sd-filter-btns">
                {[
                  { value: 'PREPARING', label: '배송준비' },
                  { value: 'SHIPPING', label: '배송중' },
                  { value: 'DELIVERED', label: '배송완료' },
                ].map(f => (
                  <button
                    key={f.value}
                    className={`sd-filter-btn ${shippingFilter === f.value ? 'active' : ''}`}
                    onClick={() => { setShippingFilter(f.value); loadOrders(f.value); }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {shippingOrders.length === 0 ? (
              <div className="sd-empty">해당 주문이 없습니다</div>
            ) : (
              <table className="sd-ship-table">
                <thead>
                  <tr>
                    <th>주문번호</th>
                    <th>상품</th>
                    <th>수량</th>
                    <th>수령인</th>
                    <th>배송지</th>
                    <th>택배사</th>
                    <th>송장번호</th>
                    <th>상태</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {shippingOrders.map(order => (
                    <tr key={order.id}>
                      <td className="sd-cell-num">{order.orderNumber?.slice(-8)}</td>
                      <td>{order.productName}</td>
                      <td>{order.quantity}</td>
                      <td>{order.recipientName}</td>
                      <td className="sd-cell-addr">{order.deliveryAddress}</td>
                      <td>{order.courierName || '-'}</td>
                      <td>{order.trackingNumber || '-'}</td>
                      <td>
                        <span className={`sd-badge sd-badge-${order.status?.toLowerCase()}`}>
                          {STATUS_MAP[order.status]?.label}
                        </span>
                      </td>
                      <td>
                        {order.status === 'PREPARING' && (
                          <button className="sd-btn-sm sd-btn-ship" onClick={() => { setShipModal(order.id); setCourier(''); setTrackingNum(''); }}>
                            발송
                          </button>
                        )}
                        {order.status === 'SHIPPING' && (
                          <button className="sd-btn-sm sd-btn-deliver" onClick={() => handleDeliver(order.id)}>
                            완료
                          </button>
                        )}
                        {order.status === 'DELIVERED' && (
                          <span className="sd-delivered-date">
                            {order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString('ko-KR') : ''}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ===== 상품관리 탭 ===== */}
        {activeTab === 'products' && (
          <div className="sd-section">
            <div className="sd-section-header">
              <h2>상품 관리</h2>
              <button className="sd-btn sd-btn-add" onClick={() => navigate('/products/new')}>
                + 상품 등록
              </button>
            </div>

            {products.length === 0 ? (
              <div className="sd-empty">등록된 상품이 없습니다</div>
            ) : (
              <div className="sd-product-grid">
                {products.map(product => (
                  <div key={product.id} className={`sd-product-card ${!product.isActive ? 'sd-inactive' : ''}`}>
                    <div className="sd-product-img">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} />
                      ) : (
                        <div className="sd-product-noimg">🌸</div>
                      )}
                      {!product.isActive && <div className="sd-product-overlay">판매중지</div>}
                    </div>
                    <div className="sd-product-info">
                      <h3 className="sd-product-name">{product.name}</h3>
                      <div className="sd-product-meta">
                        <span className="sd-product-price">{Number(product.price || 0).toLocaleString()}원</span>
                        <span className="sd-product-stock">재고 {product.stockQuantity ?? 0}</span>
                      </div>
                      <div className="sd-product-category">{product.category}</div>
                    </div>
                    <div className="sd-product-actions">
                      <button
                        className={`sd-btn-sm ${product.isActive ? 'sd-btn-pause' : 'sd-btn-resume'}`}
                        onClick={() => handleToggleProduct(product.id)}
                      >
                        {product.isActive ? '판매중지' : '판매재개'}
                      </button>
                      <button
                        className="sd-btn-sm sd-btn-edit"
                        onClick={() => navigate(`/products/new?edit=${product.id}`)}
                      >
                        수정
                      </button>
                      <button
                        className="sd-btn-sm sd-btn-delete"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 송장 입력 모달 */}
      {shipModal && (
        <div className="sd-modal-overlay" onClick={() => setShipModal(null)}>
          <div className="sd-modal" onClick={e => e.stopPropagation()}>
            <h3 className="sd-modal-title">🚚 발송 처리</h3>
            <div className="sd-modal-body">
              <label className="sd-modal-label">택배사 선택</label>
              <select
                className="sd-modal-select"
                value={courier}
                onChange={e => setCourier(e.target.value)}
              >
                <option value="">택배사를 선택하세요</option>
                {COURIER_LIST.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <label className="sd-modal-label">송장번호</label>
              <input
                className="sd-modal-input"
                type="text"
                placeholder="송장번호를 입력하세요"
                value={trackingNum}
                onChange={e => setTrackingNum(e.target.value)}
              />
            </div>
            <div className="sd-modal-actions">
              <button className="sd-btn sd-btn-cancel" onClick={() => setShipModal(null)}>취소</button>
              <button className="sd-btn sd-btn-ship" onClick={handleShip}>발송 처리</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
