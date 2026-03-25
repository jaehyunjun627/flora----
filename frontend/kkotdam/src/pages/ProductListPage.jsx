import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./ProductListPage.css";

const CATEGORIES = [
  { value: "", label: "전체" },
  { value: "꽃", label: "꽃" },
  { value: "식물", label: "식물" },
  { value: "화분/소품", label: "화분/소품" },
  { value: "비료", label: "비료/토양" },
  { value: "도구", label: "원예도구" },
];

export default function ProductListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setCategory(cat);
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [page, category]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { page, size: 12 };
      if (category) params.category = category;
      const res = await api.get("/api/products", { params });
      setProducts(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch (e) {
      console.error("상품 조회 실패:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setPage(0);
    const query = cat ? `?category=${encodeURIComponent(cat)}` : '';
    navigate(`/products${query}`);
  };

  return (
    <div className="product-list-page">
      <div className="product-list-header">
        <h1>식물 마켓</h1>
        <p>신선한 식물과 꽃을 만나보세요</p>
      </div>

      {/* 카테고리 필터 */}
      <div className="category-filters">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => handleCategoryChange(cat.value)}
            className={`category-btn category-button ${category === cat.value ? "active" : ""}`}
          >
            {cat.label}
          </button>
        ))}
        {user && (user.role === 'SELLER' || user.role === 'ADMIN') && (
          <button
            className="category-btn register-btn"
            onClick={() => navigate('/products/new')}
          >
            + 상품 등록
          </button>
        )}
      </div>

      {/* 상품 그리드 */}
      {loading ? (
        <div className="loading">불러오는 중...</div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🌱</div>
          <p>등록된 상품이 없습니다</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => navigate(`/products/${product.id}`)}
            />
          ))}
        </div>
      )}

      {/* 페이징 */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="page-btn"
          >
            &lsaquo; 이전
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`page-btn ${i === page ? "active" : ""}`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="page-btn"
          >
            다음 &rsaquo;
          </button>
        </div>
      )}
    </div>
  );
}

function ProductCard({ product, onClick }) {
  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : null;

  return (
    <div onClick={onClick} className="product-card">
      <div className="product-card-image">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="product-card-img" />
        ) : (
          <span className="product-card-emoji">{getCategoryEmoji(product.category)}</span>
        )}
      </div>

      <div className="product-card-body">
        <div className="product-card-badges">
          {product.category && (
            <span className="badge badge-category">{product.category}</span>
          )}
          {discount && (
            <span className="badge badge-discount">{discount}%</span>
          )}
        </div>

        <p className="product-card-name">{product.name}</p>

        {product.sellerNickname && (
          <p className="product-card-seller">{product.sellerNickname}</p>
        )}

        <div className="product-card-prices">
          <span className="product-card-price">
            {product.price?.toLocaleString()}원
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="product-card-original-price">
              {product.originalPrice?.toLocaleString()}원
            </span>
          )}
        </div>

        {product.stockQuantity === 0 && (
          <div className="product-card-stock-info">품절</div>
        )}
      </div>
    </div>
  );
}

function getCategoryEmoji(category) {
  const map = { "식물": "🌿", "꽃": "🌸", "화분": "🪴", "비료": "🌱", "도구": "✂️" };
  return map[category] || "🌼";
}
