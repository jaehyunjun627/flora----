import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './LocalTradePage.css';

const CATEGORIES = [
  { value: '', label: '전체' },
  { value: '씨앗', label: '씨앗/모종' },
  { value: '식물', label: '식물' },
  { value: '도구', label: '원예도구' },
  { value: '기타', label: '기타' },
];

const EMOJIS = ['🌿','🌵','🌸','🌳','🍅','🌻','🌺','🍃','🔧','🏺','💡','🌱','🫙','🍉','📦','🌷'];

const STATUS_MAP = {
  SALE:     { label: '판매중',   cls: 'badge-sale' },
  RESERVED: { label: '예약중',   cls: 'badge-reserved' },
  DONE:     { label: '거래완료', cls: 'badge-done' },
};

const MOCK_POSTS = [
  { id:1, title:'몬스테라 델리시오사 대형', category:'식물', price:35000, status:'SALE',
    description:'2년 키운 몬스테라예요.\n• 화분 포함 약 60cm\n• 반그늘 좋아요',
    location:'마포구 합정동', lat:37.5499, lng:126.9138, emoji:'🌿',
    authorNickname:'초록손', createdAt: new Date(Date.now()-600000).toISOString(), likeCount:12 },
  { id:2, title:'원예 도구 세트 (새것)', category:'도구', price:18000, status:'SALE',
    description:'선물받은 도구 세트, 한 번도 안 썼어요.\n• 모종삽·갈퀴·물뿌리개 포함',
    location:'서대문구 연희동', lat:37.5735, lng:126.9285, emoji:'🔧',
    authorNickname:'텃밭농부', createdAt: new Date(Date.now()-3600000).toISOString(), likeCount:5 },
  { id:3, title:'방울토마토 모종 10개', category:'씨앗', price:5000, status:'SALE',
    description:'씨앗부터 직접 키운 방울토마토 모종이에요.\n• 10개 묶음, 흙 포함 포트 제공',
    location:'은평구 불광동', lat:37.6099, lng:126.9223, emoji:'🍅',
    authorNickname:'주말농부', createdAt: new Date(Date.now()-10800000).toISOString(), likeCount:8 },
  { id:4, title:'고급 도예 화분 3개 세트', category:'도구', price:22000, status:'RESERVED',
    description:'직접 만든 도예 화분 세트입니다.\n• 소 9cm / 중 14cm / 대 20cm',
    location:'용산구 이태원동', lat:37.5344, lng:126.9940, emoji:'🏺',
    authorNickname:'도예공방', createdAt: new Date(Date.now()-86400000).toISOString(), likeCount:15 },
  { id:5, title:'다육이 컬렉션 20종 분양', category:'식물', price:30000, status:'SALE',
    description:'이사 때문에 3년 모은 다육이 정리해요 😢\n• 20종 각 1~2개씩 포함',
    location:'마포구 망원동', lat:37.5556, lng:126.9027, emoji:'🌵',
    authorNickname:'다육마니아', createdAt: new Date(Date.now()-172800000).toISOString(), likeCount:23 },
  { id:6, title:'허브 씨앗 모음 (바질·로즈마리 외)', category:'씨앗', price:3000, status:'SALE',
    description:'봄 파종용 씨앗 팔아요.\n• 바질, 로즈마리, 상추, 당근 포함\n• 밀봉 보관',
    location:'은평구 녹번동', lat:37.5991, lng:126.9282, emoji:'🌱',
    authorNickname:'씨앗나눔이', createdAt: new Date(Date.now()-259200000).toISOString(), likeCount:7 },
  { id:7, title:'LED 식물 성장등', category:'도구', price:45000, status:'SALE',
    description:'6개월 사용한 풀스펙트럼 LED 성장등이에요.\n• 타이머 기능, 높이 조절 가능',
    location:'노원구 공릉동', lat:37.6268, lng:127.0739, emoji:'💡',
    authorNickname:'식물공장장', createdAt: new Date(Date.now()-345600000).toISOString(), likeCount:6 },
  { id:8, title:'페페로미아 워터멜론 소분', category:'식물', price:8000, status:'DONE',
    description:'페페로미아 워터멜론 소분해요.\n• 잎 7~8장, 직거래 합정역 근처',
    location:'마포구 합정동', lat:37.5488, lng:126.9141, emoji:'🍉',
    authorNickname:'잎새마당', createdAt: new Date(Date.now()-432000000).toISOString(), likeCount:11 },
];

function haversine(la1, lo1, la2, lo2) {
  const R = 6371;
  const dL = (la2 - la1) * Math.PI / 180;
  const dO = (lo2 - lo1) * Math.PI / 180;
  const a = Math.sin(dL/2)**2 + Math.cos(la1*Math.PI/180)*Math.cos(la2*Math.PI/180)*Math.sin(dO/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function formatDate(dt) {
  if (!dt) return '';
  const d = new Date(dt);
  const diff = (Date.now() - d) / 1000;
  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff/60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff/3600)}시간 전`;
  if (diff < 604800) return `${Math.floor(diff/86400)}일 전`;
  return d.toLocaleDateString('ko-KR');
}

function formatDist(d) {
  return d < 1 ? `${Math.round(d*1000)}m` : `${d.toFixed(1)}km`;
}

function formatPrice(p) {
  return Number(p).toLocaleString('ko-KR') + '원';
}

export default function LocalTradePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [userLoc, setUserLoc] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [likedIds, setLikedIds] = useState(new Set());
  const [form, setForm] = useState({
    title: '', description: '', price: '', category: '식물',
    location: '', emoji: '🌿', status: 'SALE',
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => { loadPosts(); }, [page, category]);

  const applyDistance = (data, loc) => {
    if (!loc) return data;
    return data
      .map(p => ({ ...p, distance: haversine(loc.lat, loc.lng, p.lat || 37.5665, p.lng || 126.9780) }))
      .sort((a, b) => a.distance - b.distance);
  };

  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/local-trade/posts', { params: { category, page, size: 10 } });
      const data = applyDistance(res.data.content || [], userLoc);
      setPosts(data);
      setTotalPages(res.data.totalPages || 0);
    } catch {
      const filtered = MOCK_POSTS.filter(p => !category || p.category === category);
      const data = applyDistance(filtered, userLoc);
      setPosts(data);
      setTotalPages(Math.ceil(data.length / 10));
    } finally {
      setLoading(false);
    }
  };

  const requestLocation = () => {
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLoc(loc);
        setLocLoading(false);
        setPosts(prev => applyDistance(prev, loc));
      },
      () => {
        setLocLoading(false);
        alert('위치 권한이 거부되었습니다. 브라우저 설정에서 허용해주세요.');
      }
    );
  };

  const validateForm = () => {
    const errors = {};
    if (!form.title.trim()) errors.title = '제목을 입력해주세요';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0) errors.price = '올바른 가격을 입력해주세요';
    if (!form.description.trim()) errors.description = '내용을 입력해주세요';
    if (!form.location.trim()) errors.location = '거래 지역을 입력해주세요';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (!validateForm()) return;

    const payload = { ...form, price: Number(form.price) };
    try {
      await api.post('/api/local-trade/posts', payload);
      setShowWriteModal(false);
      resetForm();
      loadPosts();
    } catch {
      // API 미연동: 로컬 상태에 추가
      const newPost = {
        id: Date.now(),
        ...payload,
        authorNickname: user?.nickname || '나',
        createdAt: new Date().toISOString(),
        likeCount: 0,
        lat: userLoc?.lat || 37.5665,
        lng: userLoc?.lng || 126.9780,
      };
      if (userLoc) newPost.distance = haversine(userLoc.lat, userLoc.lng, newPost.lat, newPost.lng);
      setPosts(prev => [newPost, ...prev]);
      setShowWriteModal(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setForm({ title:'', description:'', price:'', category:'식물', location:'', emoji:'🌿', status:'SALE' });
    setFormErrors({});
  };

  const toggleLike = async (e, post) => {
    e.stopPropagation();
    const isLiked = likedIds.has(post.id);
    setLikedIds(prev => {
      const next = new Set(prev);
      isLiked ? next.delete(post.id) : next.add(post.id);
      return next;
    });
    setPosts(prev => prev.map(p =>
      p.id === post.id ? { ...p, likeCount: (p.likeCount||0) + (isLiked ? -1 : 1) } : p
    ));
    try {
      await api.post(`/api/local-trade/posts/${post.id}/like`);
    } catch { /* 낙관적 업데이트 유지 */ }
  };

  return (
    <div className="lt-page">
      <div className="lt-header">
        <div>
          <h1>지역거래 🌿</h1>
          <p>내 주변 이웃과 식물·씨앗·도구를 직거래해요</p>
        </div>
        <button
          className={`lt-loc-btn ${userLoc ? 'active' : ''}`}
          onClick={requestLocation}
          disabled={locLoading}
        >
          {locLoading ? (
            <><span className="lt-spinner" />위치 불러오는 중...</>
          ) : userLoc ? (
            <>📍 위치 설정됨</>
          ) : (
            <>📍 내 위치 설정</>
          )}
        </button>
      </div>

      <div className="lt-body">
        {/* 사이드바 */}
        <aside className="lt-sidebar">
          <h3>카테고리</h3>
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              className={`sidebar-cat ${category === cat.value ? 'active' : ''}`}
              onClick={() => { setCategory(cat.value); setPage(0); }}
            >
              {cat.label}
            </button>
          ))}

          <div className="lt-sidebar-divider" />

          {userLoc ? (
            <p className="lt-loc-note">📍 가까운 거리 순으로 정렬 중</p>
          ) : (
            <p className="lt-loc-note">위치를 설정하면 가까운 거래글을 먼저 볼 수 있어요</p>
          )}

          {user ? (
            <button className="write-btn" onClick={() => setShowWriteModal(true)}>
              + 거래글 올리기
            </button>
          ) : (
            <button className="write-btn outline" onClick={() => navigate('/login')}>
              로그인 후 글쓰기
            </button>
          )}
        </aside>

        {/* 게시글 목록 */}
        <main className="lt-main">
          {loading ? (
            <div className="lt-loading">불러오는 중...</div>
          ) : posts.length === 0 ? (
            <div className="lt-empty">
              <span>🌱</span>
              <p>아직 거래글이 없어요</p>
              {user && <button onClick={() => setShowWriteModal(true)}>첫 거래글 올리기</button>}
            </div>
          ) : (
            <div className="lt-list">
              {posts.map(post => {
                const st = STATUS_MAP[post.status] || STATUS_MAP.SALE;
                const liked = likedIds.has(post.id);
                return (
                  <div
                    key={post.id}
                    className={`lt-item ${post.status === 'DONE' ? 'done' : ''}`}
                    onClick={() => setSelectedPost(post)}
                  >
                    <div className="lt-thumb">{post.emoji || '🌿'}</div>
                    <div className="lt-info">
                      <div className="lt-item-top">
                        <span className={`lt-status ${st.cls}`}>{st.label}</span>
                        <span className="lt-cat-badge">{post.category}</span>
                      </div>
                      <h3 className="lt-title">{post.title}</h3>
                      <div className="lt-meta">
                        <span>{post.location}</span>
                        {userLoc && post.distance != null && (
                          <span className="lt-dist">· {formatDist(post.distance)}</span>
                        )}
                        <span>· {formatDate(post.createdAt)}</span>
                      </div>
                      <div className="lt-bottom">
                        <span className="lt-price">{formatPrice(post.price)}</span>
                        <button
                          className={`lt-like-btn ${liked ? 'liked' : ''}`}
                          onClick={e => toggleLike(e, post)}
                        >
                          {liked ? '❤️' : '🤍'} {post.likeCount || 0}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="lt-pagination">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`page-btn ${i === page ? 'active' : ''}`}
                  onClick={() => setPage(i)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ── 글쓰기 모달 ── */}
      {showWriteModal && (
        <div className="modal-overlay" onClick={() => { setShowWriteModal(false); resetForm(); }}>
          <div className="lt-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🌱 거래글 올리기</h3>
              <button onClick={() => { setShowWriteModal(false); resetForm(); }}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="lt-form">
              {/* 이모지 */}
              <div className="lt-form-group">
                <label className="lt-form-label">대표 이모지</label>
                <div className="lt-emoji-picker">
                  {EMOJIS.map(em => (
                    <button
                      key={em} type="button"
                      className={`lt-emoji-opt ${form.emoji === em ? 'selected' : ''}`}
                      onClick={() => setForm(f => ({ ...f, emoji: em }))}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              {/* 카테고리 */}
              <div className="lt-form-group">
                <label className="lt-form-label">카테고리</label>
                <div className="lt-cat-select">
                  {['씨앗', '식물', '도구', '기타'].map(c => (
                    <button
                      key={c} type="button"
                      className={`lt-cat-opt ${form.category === c ? 'selected' : ''}`}
                      onClick={() => setForm(f => ({ ...f, category: c }))}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* 제목 */}
              <div className="lt-form-group">
                <label className="lt-form-label">제목 *</label>
                <input
                  className={`modal-input ${formErrors.title ? 'error' : ''}`}
                  placeholder="예: 몬스테라 중형 판매합니다"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                />
                {formErrors.title && <span className="lt-err">{formErrors.title}</span>}
              </div>

              {/* 가격 */}
              <div className="lt-form-group">
                <label className="lt-form-label">가격 *</label>
                <div className="lt-price-input">
                  <input
                    type="number" min="0"
                    className={`modal-input ${formErrors.price ? 'error' : ''}`}
                    placeholder="0"
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  />
                  <span className="lt-price-unit">원</span>
                </div>
                {formErrors.price && <span className="lt-err">{formErrors.price}</span>}
              </div>

              {/* 내용 */}
              <div className="lt-form-group">
                <label className="lt-form-label">상세 설명 *</label>
                <textarea
                  className={`modal-textarea ${formErrors.description ? 'error' : ''}`}
                  placeholder="식물 크기, 상태, 거래 방법 등을 적어주세요"
                  rows={5}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
                {formErrors.description && <span className="lt-err">{formErrors.description}</span>}
              </div>

              {/* 거래 지역 */}
              <div className="lt-form-group">
                <label className="lt-form-label">거래 지역 *</label>
                <input
                  className={`modal-input ${formErrors.location ? 'error' : ''}`}
                  placeholder="예: 마포구 합정동"
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                />
                {formErrors.location && <span className="lt-err">{formErrors.location}</span>}
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-cancel"
                  onClick={() => { setShowWriteModal(false); resetForm(); }}
                >
                  취소
                </button>
                <button type="submit" className="modal-submit">등록하기</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 상세 모달 ── */}
      {selectedPost && (
        <div className="modal-overlay" onClick={() => setSelectedPost(null)}>
          <div className="lt-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>거래 상세</h3>
              <button onClick={() => setSelectedPost(null)}>&times;</button>
            </div>
            <div className="lt-detail-body">
              <div className="lt-detail-hero">{selectedPost.emoji || '🌿'}</div>
              <div className="lt-detail-content">
                <div className="lt-item-top" style={{ marginBottom: 10 }}>
                  <span className={`lt-status ${(STATUS_MAP[selectedPost.status]||STATUS_MAP.SALE).cls}`}>
                    {(STATUS_MAP[selectedPost.status]||STATUS_MAP.SALE).label}
                  </span>
                  <span className="lt-cat-badge">{selectedPost.category}</span>
                </div>
                <h2 className="lt-detail-title">{selectedPost.title}</h2>
                <div className="lt-detail-price">{formatPrice(selectedPost.price)}</div>
                <div className="lt-seller-row">
                  <div className="lt-seller-avatar">👤</div>
                  <div>
                    <div className="lt-seller-name">{selectedPost.authorNickname}</div>
                    <div className="lt-seller-meta">
                      {selectedPost.location}
                      {userLoc && selectedPost.distance != null && (
                        <span className="lt-dist"> · {formatDist(selectedPost.distance)}</span>
                      )}
                    </div>
                  </div>
                </div>
                <pre className="lt-detail-desc">{selectedPost.description}</pre>
                <div className="lt-detail-bottom">
                  <span className="lt-meta">{formatDate(selectedPost.createdAt)}</span>
                  <button
                    className={`lt-like-btn ${likedIds.has(selectedPost.id) ? 'liked' : ''}`}
                    onClick={e => toggleLike(e, selectedPost)}
                  >
                    {likedIds.has(selectedPost.id) ? '❤️' : '🤍'} {selectedPost.likeCount || 0}
                  </button>
                </div>
                {selectedPost.status !== 'DONE' ? (
                  <button
                    className="modal-submit"
                    style={{ width: '100%', marginTop: 16, padding: '14px' }}
                    onClick={() => alert('채팅 기능은 준비 중이에요 🌿')}
                  >
                    💬 채팅으로 거래하기
                  </button>
                ) : (
                  <button className="modal-submit" style={{ width:'100%', marginTop:16, padding:14, background:'#ccc', cursor:'default' }} disabled>
                    거래가 완료된 상품이에요
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
