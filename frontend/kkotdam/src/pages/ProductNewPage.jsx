import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './ProductNewPage.css';

const CATEGORIES = ['식물', '꽃', '화분', '비료', '도구'];

export default function ProductNewPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    price: '',
    originalPrice: '',
    category: '식물',
    description: '',
    imageUrl: '',
    stockQuantity: '10',
  });

  const [pixabayQuery, setPixabayQuery] = useState('');
  const [pixabayImages, setPixabayImages] = useState([]);
  const [pixabayLoading, setPixabayLoading] = useState(false);
  const [showImageSearch, setShowImageSearch] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const searchPixabay = async () => {
    if (!pixabayQuery.trim()) return;
    setPixabayLoading(true);
    try {
      const res = await api.get('/api/external/pixabay', {
        params: { q: pixabayQuery, perPage: 20 }
      });
      setPixabayImages(res.data.hits || []);
    } catch (e) {
      console.error('Pixabay 검색 실패:', e);
    } finally {
      setPixabayLoading(false);
    }
  };

  const selectImage = (url) => {
    setForm(prev => ({ ...prev, imageUrl: url }));
    setShowImageSearch(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.price) {
      setError('상품명과 가격은 필수입니다.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/api/products', {
        name: form.name,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        category: form.category,
        description: form.description,
        imageUrl: form.imageUrl,
        stockQuantity: Number(form.stockQuantity),
      });
      navigate('/products');
    } catch (e) {
      setError(e.response?.data?.message || '상품 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="pnew-page">
        <div className="pnew-container">
          <div className="pnew-auth-msg">
            <p>로그인이 필요합니다.</p>
            <button onClick={() => navigate('/login')}>로그인하기</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pnew-page">
      <div className="pnew-container">
        <h1 className="pnew-title">상품 등록</h1>
        <p className="pnew-subtitle">판매할 식물/꽃 상품을 등록하세요</p>

        <form className="pnew-form" onSubmit={handleSubmit}>
          {/* 이미지 선택 */}
          <div className="pnew-image-section">
            <label className="pnew-label">상품 이미지</label>
            <div className="pnew-image-preview" onClick={() => setShowImageSearch(true)}>
              {form.imageUrl ? (
                <img src={form.imageUrl} alt="상품 이미지" />
              ) : (
                <div className="pnew-image-placeholder">
                  <span>📷</span>
                  <p>클릭하여 이미지 검색</p>
                </div>
              )}
            </div>
            {form.imageUrl && (
              <button
                type="button"
                className="pnew-image-change"
                onClick={() => setShowImageSearch(true)}
              >
                이미지 변경
              </button>
            )}
          </div>

          {/* Pixabay 검색 모달 */}
          {showImageSearch && (
            <div className="pnew-modal-overlay" onClick={() => setShowImageSearch(false)}>
              <div className="pnew-modal" onClick={(e) => e.stopPropagation()}>
                <div className="pnew-modal-header">
                  <h3>이미지 검색</h3>
                  <button
                    type="button"
                    className="pnew-modal-close"
                    onClick={() => setShowImageSearch(false)}
                  >
                    &times;
                  </button>
                </div>
                <div className="pnew-modal-search">
                  <input
                    type="text"
                    placeholder="예: 장미, 튤립, 선인장..."
                    value={pixabayQuery}
                    onChange={(e) => setPixabayQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchPixabay())}
                  />
                  <button type="button" onClick={searchPixabay} disabled={pixabayLoading}>
                    {pixabayLoading ? '검색 중...' : '검색'}
                  </button>
                </div>
                <div className="pnew-modal-grid">
                  {pixabayImages.map(img => (
                    <div
                      key={img.id}
                      className={`pnew-modal-img ${form.imageUrl === img.webformatURL ? 'selected' : ''}`}
                      onClick={() => selectImage(img.webformatURL)}
                    >
                      <img src={img.previewURL} alt={img.tags} />
                      {form.imageUrl === img.webformatURL && (
                        <div className="pnew-modal-img-check">&#10003;</div>
                      )}
                    </div>
                  ))}
                  {pixabayImages.length === 0 && !pixabayLoading && (
                    <p className="pnew-modal-empty">꽃이나 식물 이름을 검색해보세요</p>
                  )}
                </div>
                <p className="pnew-modal-credit">Images provided by Pixabay</p>
              </div>
            </div>
          )}

          {/* 기본 정보 */}
          <div className="pnew-field-group">
            <div className="pnew-field">
              <label className="pnew-label">상품명 *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="예: 몬스테라 델리시오사"
                className="pnew-input"
              />
            </div>

            <div className="pnew-field">
              <label className="pnew-label">카테고리</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="pnew-select"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pnew-field-group">
            <div className="pnew-field">
              <label className="pnew-label">판매가 (원) *</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="15000"
                className="pnew-input"
              />
            </div>

            <div className="pnew-field">
              <label className="pnew-label">원래가 (원)</label>
              <input
                type="number"
                name="originalPrice"
                value={form.originalPrice}
                onChange={handleChange}
                placeholder="할인 전 가격 (선택)"
                className="pnew-input"
              />
            </div>

            <div className="pnew-field">
              <label className="pnew-label">재고 수량</label>
              <input
                type="number"
                name="stockQuantity"
                value={form.stockQuantity}
                onChange={handleChange}
                className="pnew-input"
              />
            </div>
          </div>

          <div className="pnew-field">
            <label className="pnew-label">상품 설명</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="상품에 대한 상세 설명을 입력하세요..."
              className="pnew-textarea"
              rows={5}
            />
          </div>

          {error && <div className="pnew-error">{error}</div>}

          <div className="pnew-actions">
            <button
              type="button"
              className="pnew-cancel"
              onClick={() => navigate('/products')}
            >
              취소
            </button>
            <button
              type="submit"
              className="pnew-submit"
              disabled={submitting}
            >
              {submitting ? '등록 중...' : '상품 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
