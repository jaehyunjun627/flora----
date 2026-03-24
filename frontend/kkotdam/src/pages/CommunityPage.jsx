import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './CommunityPage.css';

const CATEGORIES = [
  { value: '',     label: '전체',       icon: '📋' },
  { value: '공지', label: '공지사항',   icon: '📢' },
  { value: '자유', label: '자유게시판', icon: '💬' },
  { value: '나눔', label: '교환/나눔',  icon: '🤝' },
  { value: '질문', label: '질문/답변',  icon: '❓' },
  { value: '자랑', label: '식물 자랑',  icon: '🌿' },
];

const CAT_COLORS = {
  '공지': { bg: '#fdeaea', color: '#c04040' },
  '자유': { bg: '#eef6ef', color: '#4a7c59' },
  '나눔': { bg: '#fff3e0', color: '#c8956a' },
  '질문': { bg: '#e8f0fe', color: '#4a7cc8' },
  '자랑': { bg: '#f5f0fa', color: '#8b6fc0' },
};

export default function CommunityPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [notices, setNotices] = useState([]);
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category: '자유' });

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => { loadPosts(); }, [page, category]);

  // 공지사항은 항상 따로 로드
  useEffect(() => { loadNotices(); }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/community/posts', { params: { category, page, size: 15 } });
      const allPosts = res.data.content || [];
      // 공지를 제외한 일반 글만 표시 (공지 카테고리 볼 때는 전부 표시)
      if (category === '공지') {
        setPosts(allPosts);
      } else {
        setPosts(allPosts.filter(p => p.category !== '공지'));
      }
      setTotalPages(res.data.totalPages || 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadNotices = async () => {
    try {
      const res = await api.get('/api/community/posts', { params: { category: '공지', page: 0, size: 5 } });
      setNotices(res.data.content || []);
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    try {
      await api.post('/api/community/posts', form);
      setShowWriteModal(false);
      setForm({ title: '', content: '', category: '자유' });
      loadPosts();
      if (form.category === '공지') loadNotices();
    } catch (e) {
      const msg = e.response?.data?.message || e.response?.data || e.message || '알 수 없는 오류';
      alert(`게시글 등록 실패: ${msg}`);
    }
  };

  const formatDate = (dt) => {
    if (!dt) return '';
    const d = new Date(dt);
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 60) return '방금 전';
    if (diff < 3600) return `${Math.floor(diff/60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff/3600)}시간 전`;
    return `${d.getMonth()+1}.${d.getDate()}`;
  };

  const isNew = (dt) => {
    if (!dt) return false;
    return (new Date() - new Date(dt)) < 86400000; // 24시간 이내
  };

  // 글쓰기 가능한 카테고리
  const writableCategories = isAdmin
    ? CATEGORIES.filter(c => c.value)
    : CATEGORIES.filter(c => c.value && c.value !== '공지');

  return (
    <div className="community-page">
      {/* 카페 헤더 */}
      <div className="cafe-header">
        <div className="cafe-header-inner">
          <div className="cafe-brand">
            <span className="cafe-brand-icon">🌿</span>
            <div>
              <h1 className="cafe-name">꽃담 커뮤니티</h1>
              <p className="cafe-desc">식물을 사랑하는 사람들의 공간</p>
            </div>
          </div>
          <div className="cafe-header-stats">
            <div className="cafe-stat"><span className="cafe-stat-num">{(notices.length + posts.length)}</span><span className="cafe-stat-label">게시글</span></div>
          </div>
        </div>
      </div>

      <div className="cafe-body">
        {/* 사이드바 */}
        <aside className="cafe-sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title">게시판</h3>
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                className={`sidebar-cat${category === cat.value ? ' active' : ''}`}
                onClick={() => { setCategory(cat.value); setPage(0); }}
              >
                <span className="sidebar-cat-icon">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {user && (
            <button className="write-btn" onClick={() => setShowWriteModal(true)}>
              ✏️ 글쓰기
            </button>
          )}
        </aside>

        {/* 메인 */}
        <main className="cafe-main">
          {/* 공지 영역 (전체 또는 비공지 카테고리일 때만 표시) */}
          {category !== '공지' && notices.length > 0 && (
            <div className="notice-pin-area">
              {notices.slice(0, 3).map(n => (
                <div
                  key={n.id}
                  className="notice-pin-row"
                  onClick={() => navigate(`/community/${n.id}`)}
                >
                  <span className="notice-pin-badge">📢 공지</span>
                  <span className="notice-pin-title">{n.title}</span>
                  <span className="notice-pin-date">{formatDate(n.createdAt)}</span>
                </div>
              ))}
            </div>
          )}

          {/* 게시글 목록 테이블 */}
          {loading ? (
            <div className="cafe-loading">불러오는 중...</div>
          ) : posts.length === 0 ? (
            <div className="cafe-empty">
              <span className="cafe-empty-icon">💬</span>
              <p>아직 게시글이 없어요</p>
              <p className="cafe-empty-sub">첫 번째 게시글을 작성해보세요!</p>
              {user && <button className="cafe-empty-btn" onClick={() => setShowWriteModal(true)}>글쓰기</button>}
            </div>
          ) : (
            <div className="post-table">
              <div className="post-table-header">
                <span className="pt-col-cat">분류</span>
                <span className="pt-col-title">제목</span>
                <span className="pt-col-author">작성자</span>
                <span className="pt-col-date">날짜</span>
                <span className="pt-col-views">조회</span>
                <span className="pt-col-likes">좋아요</span>
              </div>
              {posts.map(post => {
                const catStyle = CAT_COLORS[post.category] || { bg: '#f5f2ed', color: '#7a7a7a' };
                return (
                  <div
                    key={post.id}
                    className={`post-table-row${post.category === '공지' ? ' notice-row' : ''}`}
                    onClick={() => navigate(`/community/${post.id}`)}
                  >
                    <span className="pt-col-cat">
                      <span className="pt-cat-chip" style={{ background: catStyle.bg, color: catStyle.color }}>
                        {post.category || '자유'}
                      </span>
                    </span>
                    <span className="pt-col-title">
                      <span className="pt-title-text">{post.title}</span>
                      {post.commentCount > 0 && <span className="pt-comment-count">[{post.commentCount}]</span>}
                      {isNew(post.createdAt) && <span className="pt-new-badge">N</span>}
                    </span>
                    <span className="pt-col-author">{post.authorNickname}</span>
                    <span className="pt-col-date">{formatDate(post.createdAt)}</span>
                    <span className="pt-col-views">{post.viewCount}</span>
                    <span className="pt-col-likes">{post.likeCount > 0 ? post.likeCount : '-'}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="cafe-pagination">
              <button className="page-arrow" disabled={page === 0} onClick={() => setPage(p => p - 1)}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} className={`page-num${i === page ? ' active' : ''}`} onClick={() => setPage(i)}>
                  {i + 1}
                </button>
              ))}
              <button className="page-arrow" disabled={page === totalPages - 1} onClick={() => setPage(p => p + 1)}>›</button>
            </div>
          )}
        </main>
      </div>

      {/* 글쓰기 모달 */}
      {showWriteModal && (
        <div className="modal-overlay" onClick={() => setShowWriteModal(false)}>
          <div className="write-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✏️ 글쓰기</h3>
              <button onClick={() => setShowWriteModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="write-form">
              <div className="write-form-row">
                <label className="write-label">게시판</label>
                <select
                  value={form.category}
                  onChange={e => setForm(p => ({...p, category: e.target.value}))}
                  className="write-select"
                >
                  {writableCategories.map(c => (
                    <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                  ))}
                </select>
              </div>
              <div className="write-form-row">
                <label className="write-label">제목</label>
                <input
                  type="text"
                  placeholder="제목을 입력하세요"
                  value={form.title}
                  onChange={e => setForm(p => ({...p, title: e.target.value}))}
                  required
                  className="write-input"
                />
              </div>
              <div className="write-form-row">
                <label className="write-label">내용</label>
                <textarea
                  placeholder="내용을 입력하세요..."
                  value={form.content}
                  onChange={e => setForm(p => ({...p, content: e.target.value}))}
                  required
                  className="write-textarea"
                  rows={10}
                />
              </div>
              <div className="write-actions">
                <button type="button" onClick={() => setShowWriteModal(false)} className="write-cancel">취소</button>
                <button type="submit" className="write-submit">등록</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
