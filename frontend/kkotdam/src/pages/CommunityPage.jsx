import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './CommunityPage.css';

const CATEGORIES = [
  { value: '', label: '전체' },
  { value: '자유', label: '자유게시판' },
  { value: '나눔', label: '교환/나눔' },
  { value: '질문', label: '질문/답변' },
  { value: '자랑', label: '식물 자랑' },
];

export default function CommunityPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category: '자유' });

  useEffect(() => { loadPosts(); }, [page, category]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/community/posts', { params: { category, page, size: 10 } });
      setPosts(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    try {
      await api.post('/api/community/posts', form);
      setShowWriteModal(false);
      setForm({ title: '', content: '', category: '자유' });
      loadPosts();
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
    return d.toLocaleDateString('ko-KR');
  };

  return (
    <div className="community-page">
      <div className="community-header">
        <h1>커뮤니티</h1>
        <p>식물 이야기를 나눠보세요</p>
      </div>

      <div className="community-body">
        {/* Sidebar */}
        <aside className="community-sidebar">
          <h3>게시판</h3>
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              className={`sidebar-cat ${category === cat.value ? 'active' : ''}`}
              onClick={() => { setCategory(cat.value); setPage(0); }}
            >
              {cat.label}
            </button>
          ))}
          {user && (
            <button className="write-btn" onClick={() => setShowWriteModal(true)}>
              + 글쓰기
            </button>
          )}
        </aside>

        {/* Post List */}
        <main className="community-main">
          {loading ? (
            <div className="loading">불러오는 중...</div>
          ) : posts.length === 0 ? (
            <div className="community-empty">
              <span>💬</span>
              <p>첫 번째 게시글을 작성해보세요!</p>
              {user && <button onClick={() => setShowWriteModal(true)}>글쓰기</button>}
            </div>
          ) : (
            <div className="post-list">
              {posts.map(post => (
                <div
                  key={post.id}
                  className="post-item"
                  onClick={() => navigate(`/community/${post.id}`)}
                >
                  <div className="post-item-header">
                    {post.category && <span className="post-cat-badge">{post.category}</span>}
                    <span className="post-author">{post.authorNickname}</span>
                    <span className="post-date">{formatDate(post.createdAt)}</span>
                  </div>
                  <h3 className="post-title">{post.title}</h3>
                  <p className="post-preview">{post.content}</p>
                  <div className="post-meta">
                    <span>👁 {post.viewCount}</span>
                    <span>❤️ {post.likeCount}</span>
                    <span>💬 {post.commentCount}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="community-pagination">
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} className={`page-btn ${i === page ? 'active' : ''}`} onClick={() => setPage(i)}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Write Modal */}
      {showWriteModal && (
        <div className="modal-overlay" onClick={() => setShowWriteModal(false)}>
          <div className="write-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>게시글 작성</h3>
              <button onClick={() => setShowWriteModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <select
                value={form.category}
                onChange={e => setForm(p => ({...p, category: e.target.value}))}
                className="modal-select"
              >
                {CATEGORIES.filter(c => c.value).map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="제목을 입력하세요"
                value={form.title}
                onChange={e => setForm(p => ({...p, title: e.target.value}))}
                required
                className="modal-input"
              />
              <textarea
                placeholder="내용을 입력하세요..."
                value={form.content}
                onChange={e => setForm(p => ({...p, content: e.target.value}))}
                required
                className="modal-textarea"
                rows={8}
              />
              <div className="modal-actions">
                <button type="button" onClick={() => setShowWriteModal(false)} className="modal-cancel">취소</button>
                <button type="submit" className="modal-submit">등록</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
