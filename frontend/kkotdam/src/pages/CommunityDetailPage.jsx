import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './CommunityDetailPage.css';

export default function CommunityDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadPost(); }, [id]);

  const loadPost = async () => {
    try {
      const res = await api.get(`/api/community/posts/${id}`);
      setPost(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleLike = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      const res = await api.post(`/api/community/posts/${id}/like`);
      setPost(p => ({...p, liked: res.data.liked, likeCount: res.data.likeCount}));
    } catch (e) { alert('좋아요 실패'); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (!comment.trim()) return;
    try {
      await api.post(`/api/community/posts/${id}/comments`, { content: comment });
      setComment('');
      loadPost();
    } catch (e) { alert('댓글 등록 실패'); }
  };

  const formatDate = (dt) => dt ? new Date(dt).toLocaleDateString('ko-KR', { year:'numeric', month:'long', day:'numeric' }) : '';

  if (loading) return <div className="loading">불러오는 중...</div>;
  if (!post) return <div className="loading">게시글을 찾을 수 없습니다</div>;

  return (
    <div className="community-detail-page">
      <button className="detail-back" onClick={() => navigate('/community')}>← 목록으로</button>

      <article className="post-article">
        <div className="post-article-header">
          {post.category && <span className="post-cat-badge">{post.category}</span>}
          <h1>{post.title}</h1>
          <div className="post-article-meta">
            <span className="post-author-badge">{post.authorNickname}</span>
            <span>{formatDate(post.createdAt)}</span>
            <span>조회 {post.viewCount}</span>
          </div>
        </div>

        <div className="post-article-content">{post.content}</div>

        <div className="post-article-actions">
          <button
            className={`like-btn ${post.liked ? 'liked' : ''}`}
            onClick={handleLike}
          >
            {post.liked ? '❤️' : '🤍'} {post.likeCount}
          </button>
        </div>
      </article>

      {/* Comments */}
      <section className="comments-section">
        <h3>댓글 {post.comments?.length || 0}개</h3>

        {post.comments?.map(c => (
          <div key={c.id} className={`comment-item ${c.parentCommentId ? 'reply' : ''}`}>
            <div className="comment-header">
              <span className="comment-author">{c.authorNickname}</span>
              <span className="comment-date">{formatDate(c.createdAt)}</span>
            </div>
            <p className="comment-content">{c.content}</p>
          </div>
        ))}

        {user ? (
          <form onSubmit={handleComment} className="comment-form">
            <input
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="댓글을 입력하세요..."
              className="comment-input"
            />
            <button type="submit" className="comment-submit">등록</button>
          </form>
        ) : (
          <p className="comment-login-prompt">
            댓글을 작성하려면 <button onClick={() => navigate('/login')}>로그인</button>이 필요합니다.
          </p>
        )}
      </section>
    </div>
  );
}
