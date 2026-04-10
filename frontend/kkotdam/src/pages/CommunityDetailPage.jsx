import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import './CommunityDetailPage.css';

const CAT_COLORS = {
  '공지':     { bg: '#fdeaea', color: '#c04040' },
  '자유':     { bg: '#eef6ef', color: '#4a7c59' },
  '질문':     { bg: '#e8f0fe', color: '#4a7cc8' },
  '정보':     { bg: '#e8f5e9', color: '#2e7d32' },
  '지역거래': { bg: '#fff3e0', color: '#e65100' },
  '후기':     { bg: '#fff8e1', color: '#f57f17' },
  '식물자랑': { bg: '#f5f0fa', color: '#8b6fc0' },
  '나눔':     { bg: '#fce4ec', color: '#c2185b' },
};

export default function CommunityDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // 좋아요 라커 모달
  const [showLikers, setShowLikers] = useState(false);
  const [likers, setLikers] = useState([]);
  const [loadingLikers, setLoadingLikers] = useState(false);

  // 댓글 입력
  const [comment, setComment] = useState('');
  const [replyTo, setReplyTo] = useState(null); // { id, nickname }
  const [replyContent, setReplyContent] = useState('');

  // 게시글 수정 상태
  const [editingPost, setEditingPost] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [savingPost, setSavingPost] = useState(false);

  // 댓글 수정 상태 (commentId → 편집 중인 내용)
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  const [savingComment, setSavingComment] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => { loadPost(); }, [id]);

  const loadPost = async () => {
    try {
      const res = await api.get(`/api/community/posts/${id}`);
      setPost(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  /* ── 좋아요 토글 ── */
  const handleLike = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      const res = await api.post(`/api/community/posts/${id}/like`);
      setPost(p => ({ ...p, liked: res.data.liked, likeCount: res.data.likeCount }));
    } catch (e) { alert('좋아요 실패'); }
  };

  /* ── 라커 목록 조회 ── */
  const handleShowLikers = async () => {
    if ((post?.likeCount || 0) === 0) return;
    setLoadingLikers(true);
    setShowLikers(true);
    try {
      const res = await api.get(`/api/community/posts/${id}/likes`);
      setLikers(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setLikers([]);
    } finally {
      setLoadingLikers(false);
    }
  };

  /* ── 게시글 수정 ── */
  const startEditPost = () => {
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditingPost(true);
  };

  const cancelEditPost = () => setEditingPost(false);

  const handleSavePost = async () => {
    if (!editTitle.trim() || !editContent.trim()) return;
    setSavingPost(true);
    try {
      await api.put(`/api/community/posts/${id}`, { title: editTitle, content: editContent });
      setPost(p => ({ ...p, title: editTitle, content: editContent }));
      setEditingPost(false);
    } catch (e) {
      const msg = e.response?.data?.message || e.message || '알 수 없는 오류';
      alert('수정 실패: ' + msg);
    } finally { setSavingPost(false); }
  };

  /* ── 게시글 삭제 ── */
  const handleDeletePost = async () => {
    if (!confirm('정말 이 게시글을 삭제하시겠습니까?')) return;
    setDeleting(true);
    try {
      await api.delete(`/api/community/posts/${id}`);
      navigate('/community');
    } catch (e) {
      const msg = e.response?.data?.message || e.message || '알 수 없는 오류';
      alert('삭제 실패: ' + msg);
      setDeleting(false);
    }
  };

  /* ── 댓글 등록 ── */
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

  /* ── 대댓글 등록 ── */
  const handleReply = async (e) => {
    e.preventDefault();
    if (!user || !replyTo || !replyContent.trim()) return;
    try {
      await api.post(`/api/community/posts/${id}/comments`, {
        content: replyContent,
        parentCommentId: replyTo.id,
      });
      setReplyTo(null);
      setReplyContent('');
      loadPost();
    } catch (e) { alert('대댓글 등록 실패'); }
  };

  /* ── 댓글 수정 ── */
  const startEditComment = (c) => {
    setEditingCommentId(c.id);
    setEditCommentContent(c.content);
    setReplyTo(null); // 답글 폼 닫기
  };

  const cancelEditComment = () => {
    setEditingCommentId(null);
    setEditCommentContent('');
  };

  const handleSaveComment = async (commentId) => {
    if (!editCommentContent.trim()) return;
    setSavingComment(true);
    try {
      await api.put(`/api/community/comments/${commentId}`, { content: editCommentContent });
      setEditingCommentId(null);
      loadPost();
    } catch (e) {
      const msg = e.response?.data?.message || e.message || '알 수 없는 오류';
      alert('수정 실패: ' + msg);
    } finally { setSavingComment(false); }
  };

  /* ── 댓글 삭제 ── */
  const handleDeleteComment = async (commentId) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;
    try {
      await api.delete(`/api/community/comments/${commentId}`);
      loadPost();
    } catch (e) {
      const msg = e.response?.data?.message || e.message || '알 수 없는 오류';
      alert('댓글 삭제 실패: ' + msg);
    }
  };

  /* ── 날짜 포맷 ── */
  const formatDate = (dt) => {
    if (!dt) return '';
    const d = new Date(dt);
    return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  };

  const timeAgo = (dt) => {
    if (!dt) return '';
    const diff = (new Date() - new Date(dt)) / 1000;
    if (diff < 60) return '방금 전';
    if (diff < 3600) return `${Math.floor(diff/60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff/3600)}시간 전`;
    return formatDate(dt);
  };

  if (loading) return <div className="cd-loading"><div className="cd-spinner" /><p>불러오는 중...</p></div>;
  if (!post) return <div className="cd-loading"><p>게시글을 찾을 수 없습니다</p></div>;

  const catStyle = CAT_COLORS[post.category] || { bg: '#f5f2ed', color: '#7a7a7a' };
  const canEditPost = user && user.id === post.authorId;
  const canDeletePost = user && (user.id === post.authorId || isAdmin);

  const rootComments = (post.comments || []).filter(c => !c.parentCommentId);
  const getReplies = (parentId) => (post.comments || []).filter(c => c.parentCommentId === parentId);

  return (
    <div className="cd-page">
      {/* 네비게이션 */}
      <div className="cd-nav">
        <button className="cd-back-btn" onClick={() => navigate('/community')}>
          ← 목록으로
        </button>
        <div className="cd-nav-breadcrumb">
          <span onClick={() => navigate('/community')}>커뮤니티</span>
          <span className="cd-sep">&gt;</span>
          <span className="cd-crumb-current">{post.category || '자유'}</span>
        </div>
      </div>

      {/* 게시글 */}
      <article className="cd-article">
        {/* 헤더 */}
        <div className="cd-article-header">
          <div className="cd-cat-row">
            <span className="cd-cat-chip" style={{ background: catStyle.bg, color: catStyle.color }}>
              {post.category || '자유'}
            </span>
            {post.category === '공지' && <span className="cd-pin-badge">📌 고정</span>}
          </div>

          {/* 제목 - 수정 모드 */}
          {editingPost ? (
            <input
              className="cd-edit-title-input"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              maxLength={100}
            />
          ) : (
            <h1 className="cd-title">{post.title}</h1>
          )}

          <div className="cd-meta">
            <div className="cd-author-info">
              <span className="cd-author-emoji">{post.authorProfileEmoji || '🌿'}</span>
              <div className="cd-author-detail">
                <span className="cd-author-name">
                  {post.authorNickname}
                  {post.authorRole === 'ADMIN' && <span className="cd-admin-badge">관리자</span>}
                </span>
                <span className="cd-meta-date">{formatDate(post.createdAt)}</span>
              </div>
            </div>
            <div className="cd-meta-stats">
              <span>조회 {post.viewCount}</span>
              <span>좋아요 {post.likeCount}</span>
              <span>댓글 {post.comments?.length || 0}</span>
            </div>
          </div>
        </div>

        {/* 본문 - 수정 모드 */}
        {editingPost ? (
          <div className="cd-edit-body">
            <textarea
              className="cd-edit-content-textarea"
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              rows={10}
            />
            <div className="cd-edit-actions">
              <button className="cd-edit-save-btn" onClick={handleSavePost} disabled={savingPost}>
                {savingPost ? '저장 중...' : '저장'}
              </button>
              <button className="cd-edit-cancel-btn" onClick={cancelEditPost}>취소</button>
            </div>
          </div>
        ) : (
          <div className="cd-content">{post.content}</div>
        )}

        {/* 액션 바 */}
        {!editingPost && (
          <div className="cd-action-bar">
            <div className="cd-action-left">
              <button
                className={`cd-like-btn${post.liked ? ' liked' : ''}`}
                onClick={handleLike}
              >
                {post.liked ? '❤️' : '🤍'} 좋아요
              </button>
              {post.likeCount > 0 && (
                <button className="cd-like-count-btn" onClick={handleShowLikers}>
                  {post.likeCount}명
                </button>
              )}
              <button className="cd-share-btn" onClick={() => {
                navigator.clipboard?.writeText(window.location.href)
                  .then(() => alert('링크가 복사되었습니다!'))
                  .catch(() => {});
              }}>
                🔗 공유
              </button>
            </div>
            <div className="cd-action-right">
              {canEditPost && (
                <button className="cd-edit-btn" onClick={startEditPost}>✏️ 수정</button>
              )}
              {canDeletePost && (
                <button className="cd-delete-btn" onClick={handleDeletePost} disabled={deleting}>
                  🗑️ 삭제
                </button>
              )}
            </div>
          </div>
        )}
      </article>

      {/* 댓글 섹션 */}
      <section className="cd-comments">
        <div className="cd-comments-header">
          <h3>💬 댓글 {post.comments?.length || 0}개</h3>
        </div>

        <div className="cd-comment-list">
          {rootComments.length === 0 && (
            <div className="cd-no-comments">
              <p>아직 댓글이 없어요. 첫 댓글을 남겨보세요!</p>
            </div>
          )}

          {rootComments.map(c => {
            const replies = getReplies(c.id);
            const canEditComment = user && user.id === c.authorId;
            const canDeleteComment = user && (user.id === c.authorId || isAdmin);
            const isEditingThis = editingCommentId === c.id;

            return (
              <div key={c.id} className="cd-comment-group">
                {/* 원댓글 */}
                <div className="cd-comment">
                  <div className="cd-comment-left">
                    <span className="cd-comment-emoji">{c.authorProfileEmoji || '🌿'}</span>
                  </div>
                  <div className="cd-comment-body">
                    <div className="cd-comment-top">
                      <span className="cd-comment-author">
                        {c.authorNickname}
                        {c.authorRole === 'ADMIN' && <span className="cd-admin-tag">관리자</span>}
                      </span>
                      <span className="cd-comment-time">{timeAgo(c.createdAt)}</span>
                    </div>

                    {/* 댓글 내용 - 수정 모드 */}
                    {isEditingThis ? (
                      <div className="cd-comment-edit">
                        <textarea
                          className="cd-comment-edit-textarea"
                          value={editCommentContent}
                          onChange={e => setEditCommentContent(e.target.value)}
                          rows={3}
                          autoFocus
                        />
                        <div className="cd-comment-edit-actions">
                          <button
                            className="cd-comment-edit-save"
                            onClick={() => handleSaveComment(c.id)}
                            disabled={savingComment}
                          >
                            {savingComment ? '저장 중...' : '저장'}
                          </button>
                          <button className="cd-comment-edit-cancel" onClick={cancelEditComment}>취소</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="cd-comment-text">{c.content}</p>
                        <div className="cd-comment-actions">
                          {user && (
                            <button
                              className="cd-reply-btn"
                              onClick={() => setReplyTo(replyTo?.id === c.id ? null : { id: c.id, nickname: c.authorNickname })}
                            >
                              답글
                            </button>
                          )}
                          {canEditComment && (
                            <button className="cd-comment-edit-btn" onClick={() => startEditComment(c)}>수정</button>
                          )}
                          {canDeleteComment && (
                            <button className="cd-comment-del" onClick={() => handleDeleteComment(c.id)}>삭제</button>
                          )}
                        </div>
                      </>
                    )}

                    {/* 대댓글 입력 */}
                    {replyTo?.id === c.id && (
                      <form onSubmit={handleReply} className="cd-reply-form">
                        <div className="cd-reply-to-label">
                          ↳ <strong>{replyTo.nickname}</strong>님에게 답글
                        </div>
                        <div className="cd-reply-input-row">
                          <input
                            value={replyContent}
                            onChange={e => setReplyContent(e.target.value)}
                            placeholder="답글을 입력하세요..."
                            className="cd-reply-input"
                            autoFocus
                          />
                          <button type="submit" className="cd-reply-submit">등록</button>
                          <button type="button" className="cd-reply-cancel" onClick={() => setReplyTo(null)}>취소</button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>

                {/* 대댓글 */}
                {replies.map(r => {
                  const canEditReply = user && user.id === r.authorId;
                  const canDeleteReply = user && (user.id === r.authorId || isAdmin);
                  const isEditingReply = editingCommentId === r.id;

                  return (
                    <div key={r.id} className="cd-comment reply">
                      <div className="cd-reply-arrow">↳</div>
                      <div className="cd-comment-left">
                        <span className="cd-comment-emoji">{r.authorProfileEmoji || '🌿'}</span>
                      </div>
                      <div className="cd-comment-body">
                        <div className="cd-comment-top">
                          <span className="cd-comment-author">
                            {r.authorNickname}
                            {r.authorRole === 'ADMIN' && <span className="cd-admin-tag">관리자</span>}
                          </span>
                          <span className="cd-comment-time">{timeAgo(r.createdAt)}</span>
                        </div>

                        {isEditingReply ? (
                          <div className="cd-comment-edit">
                            <textarea
                              className="cd-comment-edit-textarea"
                              value={editCommentContent}
                              onChange={e => setEditCommentContent(e.target.value)}
                              rows={2}
                              autoFocus
                            />
                            <div className="cd-comment-edit-actions">
                              <button
                                className="cd-comment-edit-save"
                                onClick={() => handleSaveComment(r.id)}
                                disabled={savingComment}
                              >
                                {savingComment ? '저장 중...' : '저장'}
                              </button>
                              <button className="cd-comment-edit-cancel" onClick={cancelEditComment}>취소</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="cd-comment-text">{r.content}</p>
                            <div className="cd-comment-actions">
                              {canEditReply && (
                                <button className="cd-comment-edit-btn" onClick={() => startEditComment(r)}>수정</button>
                              )}
                              {canDeleteReply && (
                                <button className="cd-comment-del" onClick={() => handleDeleteComment(r.id)}>삭제</button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* 댓글 입력 */}
        {user ? (
          <form onSubmit={handleComment} className="cd-comment-form">
            <div className="cd-comment-form-header">
              <span className="cd-comment-form-emoji">{user.profileEmoji || '🌿'}</span>
              <span className="cd-comment-form-name">{user.nickname}</span>
            </div>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="댓글을 입력하세요..."
              className="cd-comment-textarea"
              rows={3}
            />
            <div className="cd-comment-form-actions">
              <span className="cd-comment-form-hint">Shift+Enter로 줄바꿈</span>
              <button type="submit" className="cd-comment-submit" disabled={!comment.trim()}>
                댓글 등록
              </button>
            </div>
          </form>
        ) : (
          <div className="cd-login-prompt">
            <p>댓글을 작성하려면 <button onClick={() => navigate('/login')}>로그인</button>이 필요합니다.</p>
          </div>
        )}
      </section>

      {/* 좋아요 누른 사람 모달 */}
      {showLikers && (
        <div className="cd-likers-overlay" onClick={() => setShowLikers(false)}>
          <div className="cd-likers-modal" onClick={e => e.stopPropagation()}>
            <div className="cd-likers-header">
              <h3>❤️ 좋아요 누른 사람</h3>
              <button className="cd-likers-close" onClick={() => setShowLikers(false)}>✕</button>
            </div>
            <div className="cd-likers-body">
              {loadingLikers ? (
                <div className="cd-likers-loading">불러오는 중...</div>
              ) : likers.length === 0 ? (
                <div className="cd-likers-empty">아직 좋아요를 누른 사람이 없어요</div>
              ) : (
                <ul className="cd-likers-list">
                  {likers.map((liker, i) => (
                    <li key={i} className="cd-liker-item">
                      <span className="cd-liker-emoji">{liker.profileEmoji || '🌿'}</span>
                      <span className="cd-liker-nickname">{liker.nickname}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
