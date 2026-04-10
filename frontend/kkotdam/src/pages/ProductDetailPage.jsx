import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../contexts/AuthContext";
import "./ProductDetailPage.css";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [cartMsg, setCartMsg] = useState("");

  // 탭: 상품정보 | 리뷰 | 문의
  const [activeTab, setActiveTab] = useState("info");

  // 리뷰
  const [reviews, setReviews] = useState([]);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, content: "" });
  const [reviewMsg, setReviewMsg] = useState("");

  // 문의
  const [inquiries, setInquiries] = useState([]);
  const [inquiryForm, setInquiryForm] = useState({ title: "", content: "", isSecret: false });
  const [inquiryMsg, setInquiryMsg] = useState("");
  const [answerTarget, setAnswerTarget] = useState(null); // { id }
  const [answerText, setAnswerText] = useState("");

  const isSeller = user?.role === "SELLER" || user?.role === "ADMIN";

  useEffect(() => { fetchProduct(); }, [id]);
  useEffect(() => {
    if (activeTab === "reviews") fetchReviews();
    if (activeTab === "inquiries") fetchInquiries();
  }, [activeTab, id]);

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

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/api/products/${id}/reviews`);
      setReviews(res.data.reviews || []);
      setHasReviewed(res.data.hasReviewed || false);
    } catch (e) { console.error(e); }
  };

  const fetchInquiries = async () => {
    try {
      const res = await api.get(`/api/products/${id}/inquiries`);
      setInquiries(res.data || []);
    } catch (e) { console.error(e); }
  };

  const addToCart = async () => {
    if (!user) { navigate("/login"); return; }
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
    if (!user) { navigate("/login"); return; }
    try {
      await api.post("/api/cart", { productId: product.id, quantity });
      navigate("/cart");
    } catch (e) {
      alert(e.response?.data?.message || "오류가 발생했습니다");
    }
  };

  // 리뷰 등록
  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) { navigate("/login"); return; }
    try {
      await api.post(`/api/products/${id}/reviews`, reviewForm);
      setReviewMsg("✅ 리뷰가 등록됐습니다!");
      setReviewForm({ rating: 5, content: "" });
      fetchReviews();
      setTimeout(() => setReviewMsg(""), 2500);
    } catch (err) {
      const getErrMsg = (e) => {
        if (!e.response) return "서버 연결 실패 — 백엔드를 재시작해주세요";
        if (e.response.status === 500) return "서버 오류(500) — 백엔드를 재시작해주세요 (테이블 미생성)";
        return e.response?.data?.message || "등록 실패";
      };
      setReviewMsg("❌ " + getErrMsg(err));
      setTimeout(() => setReviewMsg(""), 4000);
    }
  };

  // 리뷰 삭제
  const deleteReview = async (reviewId) => {
    if (!confirm("리뷰를 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/api/products/${id}/reviews/${reviewId}`);
      fetchReviews();
    } catch (e) { alert(e.response?.data?.message || "삭제 실패"); }
  };

  // 문의 등록
  const submitInquiry = async (e) => {
    e.preventDefault();
    if (!user) { navigate("/login"); return; }
    try {
      await api.post(`/api/products/${id}/inquiries`, inquiryForm);
      setInquiryMsg("✅ 문의가 등록됐습니다!");
      setInquiryForm({ title: "", content: "", isSecret: false });
      fetchInquiries();
      setTimeout(() => setInquiryMsg(""), 2500);
    } catch (err) {
      const getErrMsg = (e) => {
        if (!e.response) return "서버 연결 실패 — 백엔드를 재시작해주세요";
        if (e.response.status === 500) return "서버 오류(500) — 백엔드를 재시작해주세요 (테이블 미생성)";
        return e.response?.data?.message || "등록 실패";
      };
      setInquiryMsg("❌ " + getErrMsg(err));
      setTimeout(() => setInquiryMsg(""), 4000);
    }
  };

  // 문의 삭제
  const deleteInquiry = async (inquiryId) => {
    if (!confirm("문의를 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/api/products/${id}/inquiries/${inquiryId}`);
      fetchInquiries();
    } catch (e) { alert(e.response?.data?.message || "삭제 실패"); }
  };

  // 문의 답변 (판매자/관리자)
  const submitAnswer = async (inquiryId) => {
    if (!answerText.trim()) return;
    try {
      await api.patch(`/api/products/${id}/inquiries/${inquiryId}/answer`, { answer: answerText });
      setAnswerTarget(null);
      setAnswerText("");
      fetchInquiries();
    } catch (e) { alert(e.response?.data?.message || "답변 실패"); }
  };

  const discount = product?.originalPrice && product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100) : null;

  const renderStars = (rating, interactive = false) => {
    return [1, 2, 3, 4, 5].map(i => (
      <span
        key={i}
        className={`star${i <= rating ? " filled" : ""}`}
        style={interactive ? { cursor: "pointer" } : {}}
        onClick={interactive ? () => setReviewForm(p => ({ ...p, rating: i })) : undefined}
      >★</span>
    ));
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  if (loading) return <div className="loading">불러오는 중...</div>;
  if (!product) return (
    <div className="not-found">
      <p>상품을 찾을 수 없습니다</p>
      <button onClick={() => navigate("/products")} className="btn-secondary">목록으로</button>
    </div>
  );

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
            <div className="product-badges">
              {product.category && <span className="badge badge-category">{product.category}</span>}
              {product.isGroupBuy && <span className="badge badge-group-buy">🤝 공동구매</span>}
              {discount && <span className="badge badge-discount">{discount}% 할인</span>}
              {product.stockQuantity === 0 && <span className="badge badge-sold-out">품절</span>}
            </div>

            <h1 className="product-name">{product.name}</h1>
            {product.sellerNickname && <p className="product-seller">🌿 판매자: {product.sellerNickname}</p>}

            {/* 평점 요약 */}
            {avgRating && (
              <div className="product-rating-summary">
                <span className="rating-stars">{renderStars(Math.round(avgRating))}</span>
                <span className="rating-avg">{avgRating}</span>
                <span className="rating-count">({reviews.length}개 리뷰)</span>
              </div>
            )}

            {product.description && (
              <div className="product-description"><p>{product.description}</p></div>
            )}

            <div className="price-section">
              <div className="price-display">
                <span className="current-price">{product.price.toLocaleString()}원</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="original-price">{product.originalPrice.toLocaleString()}원</span>
                )}
              </div>
              <p className="stock-info">재고: {product.stockQuantity > 0 ? `${product.stockQuantity}개` : "품절"}</p>
            </div>

            {product.stockQuantity > 0 && (
              <div className="quantity-section">
                <label className="quantity-label">수량</label>
                <div className="quantity-selector">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="qty-btn">−</button>
                  <span className="qty-display">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(product.stockQuantity, q + 1))} className="qty-btn">+</button>
                  <span className="qty-total">합계: <span className="qty-total-amount">{(product.price * quantity).toLocaleString()}원</span></span>
                </div>
              </div>
            )}

            {cartMsg && (
              <div className={`cart-message ${cartMsg.startsWith("✅") ? "success" : "error"}`}>{cartMsg}</div>
            )}

            <div className="action-buttons">
              <button onClick={addToCart} disabled={product.stockQuantity === 0} className="btn-cart">🛒 장바구니 담기</button>
              <button onClick={buyNow} disabled={product.stockQuantity === 0} className="btn-buy">바로 구매</button>
            </div>
          </div>
        </div>

        {/* ── 탭 영역 (리뷰 / 문의) ── */}
        <div className="product-tabs">
          <div className="product-tab-bar">
            <button className={`product-tab${activeTab === "info" ? " active" : ""}`} onClick={() => setActiveTab("info")}>상품 정보</button>
            <button className={`product-tab${activeTab === "reviews" ? " active" : ""}`} onClick={() => setActiveTab("reviews")}>
              리뷰 {product.reviewCount > 0 ? `(${product.reviewCount})` : ""}
            </button>
            <button className={`product-tab${activeTab === "inquiries" ? " active" : ""}`} onClick={() => setActiveTab("inquiries")}>상품 문의</button>
          </div>

          {/* 상품 정보 탭 */}
          {activeTab === "info" && (
            <div className="tab-content">
              <div className="product-detail-info">
                <h3>상품 상세 정보</h3>
                <p>{product.description || "상세 설명이 없습니다."}</p>
                {product.sellerNickname && <p className="info-seller">판매자: {product.sellerNickname}</p>}
              </div>
            </div>
          )}

          {/* 리뷰 탭 */}
          {activeTab === "reviews" && (
            <div className="tab-content">
              {/* 평점 요약 */}
              {reviews.length > 0 && (
                <div className="review-summary">
                  <div className="review-avg-big">{avgRating}</div>
                  <div className="review-stars-big">{renderStars(Math.round(parseFloat(avgRating)))}</div>
                  <div className="review-count-txt">{reviews.length}개 리뷰</div>
                </div>
              )}

              {/* 리뷰 작성 폼 */}
              {user && !hasReviewed && (
                <form className="review-form" onSubmit={submitReview}>
                  <div className="review-form-header">
                    <span>{user.profileEmoji || "🌿"}</span>
                    <strong>{user.nickname}</strong>
                    <span className="review-form-label">님의 리뷰</span>
                  </div>
                  <div className="review-rating-select">
                    <label>평점</label>
                    <div className="star-selector">{renderStars(reviewForm.rating, true)}</div>
                    <span className="rating-num">{reviewForm.rating}점</span>
                  </div>
                  <textarea
                    className="review-textarea"
                    placeholder="구매 후기를 작성해주세요. (최소 5자)"
                    value={reviewForm.content}
                    onChange={e => setReviewForm(p => ({ ...p, content: e.target.value }))}
                    rows={4}
                    required
                  />
                  {reviewMsg && <p className={`form-msg ${reviewMsg.startsWith("✅") ? "ok" : "err"}`}>{reviewMsg}</p>}
                  <button type="submit" className="review-submit-btn">리뷰 등록</button>
                </form>
              )}
              {user && hasReviewed && (
                <div className="review-already">✅ 이미 리뷰를 작성하셨습니다.</div>
              )}
              {!user && (
                <div className="review-login-prompt">
                  <p>리뷰를 작성하려면 <button onClick={() => navigate("/login")}>로그인</button>이 필요합니다.</p>
                </div>
              )}

              {/* 리뷰 목록 */}
              {reviews.length === 0 ? (
                <div className="tab-empty">아직 리뷰가 없어요. 첫 리뷰를 작성해보세요!</div>
              ) : (
                <div className="review-list">
                  {reviews.map(r => (
                    <div key={r.id} className="review-item">
                      <div className="review-item-top">
                        <span className="review-emoji">{r.userProfileEmoji || "🌿"}</span>
                        <span className="review-author">{r.userNickname}</span>
                        <span className="review-stars">{renderStars(r.rating)}</span>
                        <span className="review-date">{formatDate(r.createdAt)}</span>
                        {user && user.id === r.userId && (
                          <button className="review-del-btn" onClick={() => deleteReview(r.id)}>삭제</button>
                        )}
                      </div>
                      <p className="review-content">{r.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 문의 탭 */}
          {activeTab === "inquiries" && (
            <div className="tab-content">
              {/* 문의 작성 폼 */}
              {user ? (
                <form className="inquiry-form" onSubmit={submitInquiry}>
                  <div className="inquiry-form-header">상품 문의 작성</div>
                  <input
                    className="inquiry-input"
                    type="text"
                    placeholder="문의 제목"
                    value={inquiryForm.title}
                    onChange={e => setInquiryForm(p => ({ ...p, title: e.target.value }))}
                    required
                  />
                  <textarea
                    className="inquiry-textarea"
                    placeholder="재입고 문의, 배송 관련 문의 등 자유롭게 작성해주세요."
                    value={inquiryForm.content}
                    onChange={e => setInquiryForm(p => ({ ...p, content: e.target.value }))}
                    rows={4}
                    required
                  />
                  <div className="inquiry-secret-row">
                    <label className="inquiry-secret-label">
                      <input
                        type="checkbox"
                        checked={inquiryForm.isSecret}
                        onChange={e => setInquiryForm(p => ({ ...p, isSecret: e.target.checked }))}
                      />
                      🔒 비밀글로 등록
                    </label>
                    <button type="submit" className="inquiry-submit-btn">문의 등록</button>
                  </div>
                  {inquiryMsg && <p className={`form-msg ${inquiryMsg.startsWith("✅") ? "ok" : "err"}`}>{inquiryMsg}</p>}
                </form>
              ) : (
                <div className="review-login-prompt">
                  <p>문의를 작성하려면 <button onClick={() => navigate("/login")}>로그인</button>이 필요합니다.</p>
                </div>
              )}

              {/* 문의 목록 */}
              {inquiries.length === 0 ? (
                <div className="tab-empty">아직 문의가 없어요.</div>
              ) : (
                <div className="inquiry-list">
                  {inquiries.map(q => (
                    <div key={q.id} className={`inquiry-item${q.isAnswered ? " answered" : ""}`}>
                      <div className="inquiry-item-top">
                        <span className={`inquiry-status ${q.isAnswered ? "answered" : "pending"}`}>
                          {q.isAnswered ? "답변완료" : "답변대기"}
                        </span>
                        {q.isSecret && <span className="inquiry-secret">🔒</span>}
                        <span className="inquiry-title">{q.title}</span>
                        <span className="inquiry-author">{q.userNickname}</span>
                        <span className="inquiry-date">{formatDate(q.createdAt)}</span>
                        {q.myInquiry && (
                          <button className="review-del-btn" onClick={() => deleteInquiry(q.id)}>삭제</button>
                        )}
                      </div>
                      {q.content && <p className="inquiry-content">{q.content}</p>}
                      {q.isAnswered && q.answer && (
                        <div className="inquiry-answer">
                          <span className="inquiry-answer-label">💬 판매자 답변</span>
                          <p>{q.answer}</p>
                        </div>
                      )}
                      {/* 판매자 답변 입력 */}
                      {isSeller && !q.isAnswered && (
                        answerTarget?.id === q.id ? (
                          <div className="inquiry-answer-form">
                            <textarea
                              className="inquiry-textarea"
                              placeholder="답변을 입력하세요..."
                              value={answerText}
                              onChange={e => setAnswerText(e.target.value)}
                              rows={3}
                            />
                            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                              <button className="inquiry-submit-btn" onClick={() => submitAnswer(q.id)}>답변 등록</button>
                              <button className="inquiry-cancel-btn" onClick={() => setAnswerTarget(null)}>취소</button>
                            </div>
                          </div>
                        ) : (
                          <button className="inquiry-answer-btn" onClick={() => { setAnswerTarget({ id: q.id }); setAnswerText(""); }}>
                            답변하기
                          </button>
                        )
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getCategoryEmoji(category) {
  const map = { "식물": "🌿", "꽃": "🌸", "화분": "🪴", "비료": "🌱", "도구": "🔧" };
  return map[category] || "🌼";
}

function formatDate(dt) {
  if (!dt) return "";
  const d = new Date(dt);
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")}`;
}
