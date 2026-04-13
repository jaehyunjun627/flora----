import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import notificationApi from '../api/notificationApi';
import './NotificationBell.css';

const TYPE_ICON = {
  LIKE: '❤️',
  COMMENT: '💬',
  ORDER_STATUS: '📦',
  NEW_ORDER: '🛒',
  SUBSCRIPTION: '🌸',
};

const TYPE_LABEL = {
  LIKE: '좋아요',
  COMMENT: '댓글',
  ORDER_STATUS: '배송알림',
  NEW_ORDER: '새 주문',
  SUBSCRIPTION: '정기구독',
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return '방금 전';
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  return `${d}일 전`;
}

// localStorage 로컬 알림 헬퍼
function getLocalNotifs() {
  try { return JSON.parse(localStorage.getItem('flora-local-notifications') || '[]'); }
  catch { return []; }
}
function saveLocalNotifs(list) {
  localStorage.setItem('flora-local-notifications', JSON.stringify(list));
}

export default function NotificationBell() {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // 읽지 않은 알림 수 폴링 (30초마다)
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // 바깥 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await notificationApi.getUnreadCount();
      const serverCount = res.data.count || 0;
      // 로컬 알림 미읽음 수 합산
      const localUnread = getLocalNotifs().filter(n => !n.isRead).length;
      setUnreadCount(serverCount + localUnread);
    } catch {
      // 미로그인 시에도 로컬 알림 수 표시
      const localUnread = getLocalNotifs().filter(n => !n.isRead).length;
      setUnreadCount(localUnread);
    }
  };

  const handleOpen = async () => {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    setLoading(true);
    try {
      const res = await notificationApi.getAll();
      const serverNotifs = res.data || [];
      // 로컬 알림 + 서버 알림 합산 (로컬 먼저)
      const localNotifs = getLocalNotifs();
      setNotifications([...localNotifs, ...serverNotifs]);
    } catch {
      // 서버 오류 시 로컬 알림만 표시
      setNotifications(getLocalNotifs());
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
    } catch {}
    // 로컬 알림도 전부 읽음 처리
    const updated = getLocalNotifs().map(n => ({ ...n, isRead: true }));
    saveLocalNotifs(updated);
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleClickNotification = async (n) => {
    // 로컬 알림이면 localStorage에서 읽음 처리
    if (String(n.id).startsWith('LN-')) {
      if (!n.isRead) {
        const updated = getLocalNotifs().map(item =>
          item.id === n.id ? { ...item, isRead: true } : item
        );
        saveLocalNotifs(updated);
        setNotifications(prev => prev.map(item =>
          item.id === n.id ? { ...item, isRead: true } : item
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      if (n.relatedType === 'SUBSCRIPTION') {
        navigate('/mypage');
      }
      setOpen(false);
      return;
    }
    // 서버 알림 읽음 처리
    if (!n.isRead) {
      try {
        await notificationApi.markAsRead(n.id);
        setNotifications(prev => prev.map(item =>
          item.id === n.id ? { ...item, isRead: true } : item
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch {}
    }
    // 관련 페이지로 이동
    setOpen(false);
    if (n.relatedType === 'POST' && n.relatedId) {
      navigate(`/community/${n.relatedId}`);
    } else if (n.relatedType === 'ORDER' && n.relatedId) {
      if (n.type === 'NEW_ORDER') {
        navigate('/seller');
      } else {
        navigate('/orders');
      }
    }
  };

  return (
    <div className="nbell-wrap" ref={dropdownRef}>
      {/* 벨 버튼 */}
      <button className="nbell-btn" onClick={handleOpen} title="알림">
        <span className="nbell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="nbell-badge">
            {unreadCount > 99 ? '99+' : `+${unreadCount}`}
          </span>
        )}
      </button>

      {/* 드롭다운 */}
      {open && (
        <div className="nbell-dropdown">
          <div className="nbell-header">
            <span className="nbell-title">알림</span>
            {unreadCount > 0 && (
              <button className="nbell-read-all" onClick={handleMarkAllRead}>
                모두 읽음
              </button>
            )}
          </div>

          <div className="nbell-list">
            {loading ? (
              <div className="nbell-empty">불러오는 중...</div>
            ) : notifications.length === 0 ? (
              <div className="nbell-empty">
                <span>🔔</span>
                <p>새 알림이 없습니다</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={`nbell-item ${!n.isRead ? 'nbell-unread' : ''}`}
                  onClick={() => handleClickNotification(n)}
                >
                  <div className="nbell-item-icon">
                    {TYPE_ICON[n.type] || '🔔'}
                  </div>
                  <div className="nbell-item-body">
                    <span className={`nbell-type-tag nbell-type-${n.type?.toLowerCase()}`}>
                      {TYPE_LABEL[n.type] || n.type}
                    </span>
                    <p className="nbell-msg">{n.message}</p>
                    <span className="nbell-time">{timeAgo(n.createdAt)}</span>
                  </div>
                  {!n.isRead && <div className="nbell-dot" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
