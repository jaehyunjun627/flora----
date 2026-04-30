import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import sellerApi from '../api/sellerApi';
import './ProductNewPage.css';

const CATEGORIES = ['식물', '꽃', '화분', '비료', '도구'];

export default function ProductNewPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEdit = !!editId;

  const [form, setForm] = useState({
    name: '',
    price: '',
    originalPrice: '',
    category: '식물',
    description: '',
    imageUrl: '',
    stockQuantity: '10',
  });

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState('');

  // 수정 모드일 때 기존 상품 데이터 로드
  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get(`/api/products/${editId}`);
        if (cancelled) return;
        const p = res.data;
        setForm({
          name: p.name || '',
          price: p.price != null ? String(p.price) : '',
          originalPrice: p.originalPrice != null ? String(p.originalPrice) : '',
          category: p.category || '식물',
          description: p.description || '',
          imageUrl: p.imageUrl || '',
          stockQuantity: p.stockQuantity != null ? String(p.stockQuantity) : '0',
        });
      } catch (e) {
        setError('상품 정보를 불러오지 못했습니다.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isEdit, editId]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('파일 크기는 5MB 이하여야 합니다.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/api/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm(prev => ({ ...prev, imageUrl: res.data.imageUrl }));
    } catch (e) {
      setError('이미지 업로드 실패: ' + (e.response?.data?.error || e.message));
    } finally {
      setUploading(false);
    }
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
      const payload = {
        name: form.name,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        category: form.category,
        description: form.description,
        imageUrl: form.imageUrl,
        stockQuantity: Number(form.stockQuantity),
      };
      if (isEdit) {
        await sellerApi.updateProduct(editId, payload);
        navigate('/seller');
      } else {
        await api.post('/api/products', payload);
        navigate('/products');
      }
    } catch (e) {
      setError(e.response?.data?.message || (isEdit ? '상품 수정에 실패했습니다.' : '상품 등록에 실패했습니다.'));
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

  if (user.role !== 'SELLER' && user.role !== 'ADMIN') {
    return (
      <div className="pnew-page">
        <div className="pnew-container">
          <div className="pnew-auth-msg">
            <p>판매자 계정만 상품을 등록할 수 있습니다.</p>
            <p style={{ fontSize: '14px', color: '#888', marginTop: '8px' }}>
              판매자 계정으로 가입하시면 상품 등록이 가능해요.
            </p>
            <button onClick={() => navigate('/products')}>마켓으로 돌아가기</button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="pnew-page">
        <div className="pnew-container">
          <p style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>
            상품 정보를 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pnew-page">
      <div className="pnew-container">
        <h1 className="pnew-title">{isEdit ? '상품 수정' : '상품 등록'}</h1>
        <p className="pnew-subtitle">
          {isEdit ? '등록된 상품 정보를 수정합니다' : '판매할 식물/꽃 상품을 등록하세요'}
        </p>

        <form className="pnew-form" onSubmit={handleSubmit}>
          {/* 이미지 선택 */}
          <div className="pnew-image-section">
            <label className="pnew-label">상품 이미지</label>
            <div className="pnew-image-preview">
              {form.imageUrl ? (
                <img src={form.imageUrl} alt="상품 이미지" />
              ) : (
                <div className="pnew-image-placeholder">
                  <span>📷</span>
                  <p>이미지를 업로드하세요</p>
                </div>
              )}
            </div>
            <div className="pnew-image-btns">
              <label className="pnew-upload-btn">
                {uploading ? '업로드 중...' : '📁 파일에서 업로드'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  disabled={uploading}
                />
              </label>
              {form.imageUrl && (
                <button
                  type="button"
                  className="pnew-image-remove"
                  onClick={() => setForm(prev => ({ ...prev, imageUrl: '' }))}
                >
                  ✕ 이미지 제거
                </button>
              )}
            </div>
          </div>

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
              onClick={() => navigate(isEdit ? '/seller' : '/products')}
            >
              취소
            </button>
            <button
              type="submit"
              className="pnew-submit"
              disabled={submitting}
            >
              {submitting
                ? (isEdit ? '수정 중...' : '등록 중...')
                : (isEdit ? '수정 저장' : '상품 등록')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
