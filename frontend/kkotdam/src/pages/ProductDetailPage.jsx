import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./ProductDetailPage.css";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [cartMsg, setCartMsg] = useState("");

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/api/products/${id}`);
      setProduct(res.data);
    } catch (e) {
      console.error("상품 조회 실패:", e);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      await api.post("/api/cart", { productId: product.id, quantity });
      setCartMsg("✅ 장바구니에 담았습니다!");
      setTimeout(() => setCartMsg(""), 2500);
    } catch (e) {
      setCartMsg("❌ " + (e.response?.data?.message || "장바구니 추가 실패"));
      setTimeout(() => setCartMsg(""), 2500);
    }
  };

  const buyNow = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      await api.post("/api/cart", { productId: product.id, quantity });
      navigate("/cart");
    } catch (e) {
      alert(e.response?.data?.message || "오류가 발생했습니다");
    }
  };

  const discount = product?.originalPrice && product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  if (loading) {
    return <div className="loading">불러오는 중...</div>;
  }

  if (!product) {
    return (
      <div className="not-found">
        <p>상품을 찾을 수 없습니다</p>
        <button onClick={() => navigate("/products")} className="btn-secondary">
          목록으로
        </button>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        <div className="product-detail-card">
          {/* 상품 이미지 */}
          <div className="product-image-area">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="product-detail-img" />
            ) : (
              <span className="product-image-emoji">{getCategoryEmoji(product.category)}</span>
            )}
          </div>

          <div className="product-info">
            {/* 배지 */}
            <div className="product-badges">
              {product.category && (
                <span className="badge badge-category">{product.category}</span>
              )}
              {product.isGroupBuy && (
                <span className="badge badge-group-buy">🤝 공동구매</span>
              )}
              {discount && (
                <span className="badge badge-discount">{discount}% 할인</span>
              )}
              {product.stockQuantity === 0 && (
                <span className="badge badge-sold-out">품절</span>
              )}
            </div>

            <h1 className="product-name">{product.name}</h1>

            {product.sellerNickname && (
              <p className="product-seller">🌿 판매자: {product.sellerNickname}</p>
            )}

            {/* 상품 설명 */}
            {product.description && (
              <div className="product-description">
                <p>{product.description}</p>
              </div>
            )}

            {/* 가격 */}
            <div className="price-section">
              <div className="price-display">
                <span className="current-price">
                  {product.price.toLocaleString()}원
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="original-price">
                    {product.originalPrice.toLocaleString()}원
                  </span>
                )}
              </div>
              <p className="stock-info">
                재고: {product.stockQuantity > 0 ? `${product.stockQuantity}개` : "품절"}
              </p>
            </div>

            {/* 수량 선택 */}
            {product.stockQuantity > 0 && (
              <div className="quantity-section">
                <label className="quantity-label">수량</label>
                <div className="quantity-selector">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="qty-btn"
                  >
                    −
                  </button>
                  <span className="qty-display">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                    className="qty-btn"
                  >
                    +
                  </button>
                  <span className="qty-total">
                    합계:{" "}
                    <span className="qty-total-amount">
                      {(product.price * quantity).toLocaleString()}원
                    </span>
                  </span>
                </div>
              </div>
            )}

            {/* 알림 메시지 */}
            {cartMsg && (
              <div
                className={`cart-message ${
                  cartMsg.startsWith("✅") ? "success" : "error"
                }`}
              >
                {cartMsg}
              </div>
            )}

            {/* 버튼 */}
            <div className="action-buttons">
              <button
                onClick={addToCart}
                disabled={product.stockQuantity === 0}
                className="btn-cart"
              >
                🛒 장바구니 담기
              </button>
              <button
                onClick={buyNow}
                disabled={product.stockQuantity === 0}
                className="btn-buy"
              >
                바로 구매
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getCategoryEmoji(category) {
  const map = {
    "식물": "🌿",
    "꽃": "🌸",
    "화분": "🪴",
    "비료": "🌱",
    "도구": "🔧",
  };
  return map[category] || "🌼";
}
