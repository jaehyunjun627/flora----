import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './MyPage.css';

const GRADE_INFO = {
  '씨앗': { icon: '🌰', color: '#8B6914', next: '새싹', desc: '출석 10일 + 구매 1건' },
  '새싹': { icon: '🌱', color: '#4CAF50', next: '꽃봉오리', desc: '출석 30일 + 구매 5건' },
  '꽃봉오리': { icon: '🌸', color: '#E91E8E', next: '만개', desc: '출석 60일 + 구매 10건' },
  '만개': { icon: '🌺', color: '#FF5722', next: null, desc: '최고 등급!' },
};

const BADGE_ICONS = { 'SPROUT': '🌱', 'BUD': '🌸', 'BLOOM': '🌺', 'SEED': '🌰' };

export default function MyPage() {
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();
  const [myData, setMyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ nickname: '', phone: '', profileEmoji: '' });

  useEffect(() => {
    if (!authUser) { navigate('/login'); return; }
    loadMyPage();
  }, [authUser]);

  const loadMyPage = async () => {
    try {
      const res = await api.get('/api/mypage');
      setMyData(res.data);
      setEditForm({ nickname: res.data.nickname || '', phone: res.data.phone || '', profileEmoji: res.data.profileEmoji || '🌿' });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      const res = await api.post('/api/mypage/checkin');
      if (res.data.alreadyCheckedIn) {
        alert('오늘 이미 출석했어요! 내일 또 오세요 🌱');
      } else {
        alert(`출석 완료! 🎉 +5 포인트\n연속 ${res.data.streakDays}일 출석 중!`);
        loadMyPage();
      }
    } catch (e) { alert('출석 체크 실패'); }
    finally { setCheckingIn(false); }
  };

  const handleSaveProfile = async () => {
    try {
      await api.patch('/api/mypage/profile', editForm);
      setEditMode(false);
      loadMyPage();
    } catch (e) { alert('프로필 수정 실패'); }
  };

  const EMOJIS = ['🌿', '🌸', '🌺', '🌻', '🌹', '🌷', '🪴', '🌱', '🍀', '🌼'];

  if (loading) return <div className="loading">불러오는 중...</div>;
  if (!myData) return <div className="loading">데이터를 불러올 수 없습니다</div>;

  const grade = GRADE_INFO[myData.grade] || GRADE_INFO['씨앗'];
  const today = new Date().toISOString().split('T')[0];
  const alreadyCheckedIn = myData.lastCheckIn === today;

  return (
    <div className="mypage">
      {/* Profile Card */}
      <div className="mypage-profile-card">
        <div className="profile-emoji-wrap">
          {editMode ? (
            <div className="emoji-picker">
              {EMOJIS.map(e => (
                <button
                  key={e}
                  className={`emoji-option ${editForm.profileEmoji === e ? 'selected' : ''}`}
                  onClick={() => setEditForm(p => ({...p, profileEmoji: e}))}
                >{e}</button>
              ))}
            </div>
          ) : (
            <span className="profile-emoji">{myData.profileEmoji}</span>
          )}
        </div>

        <div className="profile-info">
          {editMode ? (
            <div className="edit-fields">
              <input
                value={editForm.nickname}
                onChange={e => setEditForm(p => ({...p, nickname: e.target.value}))}
                placeholder="닉네임"
                className="edit-input"
              />
              <input
                value={editForm.phone}
                onChange={e => setEditForm(p => ({...p, phone: e.target.value}))}
                placeholder="전화번호"
                className="edit-input"
              />
              <div className="edit-actions">
                <button onClick={handleSaveProfile} className="save-btn">저장</button>
                <button onClick={() => setEditMode(false)} className="cancel-btn">취소</button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="profile-name">{myData.nickname}</h2>
              <p className="profile-email">{myData.email}</p>
              <div className="profile-grade">
                <span style={{color: grade.color}}>{grade.icon} {myData.grade}</span>
              </div>
            </>
          )}
        </div>

        {!editMode && (
          <button className="profile-edit-btn" onClick={() => setEditMode(true)}>
            프로필 수정
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="mypage-stats">
        <div className="stat-card">
          <span className="stat-icon">🔥</span>
          <span className="stat-value">{myData.streakDays}</span>
          <span className="stat-label">연속 출석</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">💰</span>
          <span className="stat-value">{(myData.points || 0).toLocaleString()}</span>
          <span className="stat-label">포인트</span>
        </div>
        <div className="stat-card checkin-card" onClick={handleCheckIn}>
          <span className="stat-icon">{alreadyCheckedIn ? '✅' : '📅'}</span>
          <span className="stat-value">{alreadyCheckedIn ? '완료' : '+5P'}</span>
          <span className="stat-label">{alreadyCheckedIn ? '출석 완료' : '출석 체크'}</span>
        </div>
      </div>

      {/* Grade Progress */}
      <div className="mypage-section">
        <h3>등급 현황</h3>
        <div className="grade-progress">
          {Object.entries(GRADE_INFO).map(([g, info]) => (
            <div key={g} className={`grade-item ${myData.grade === g ? 'current' : ''}`}>
              <span className="grade-icon">{info.icon}</span>
              <span className="grade-name">{g}</span>
              {myData.grade === g && <span className="grade-current-badge">현재</span>}
            </div>
          ))}
        </div>
        {grade.next && (
          <p className="grade-next-hint">다음 등급({grade.next}): {grade.desc}</p>
        )}
      </div>

      {/* Badges */}
      <div className="mypage-section">
        <h3>획득 뱃지</h3>
        {myData.badges?.length > 0 ? (
          <div className="badge-grid">
            {myData.badges.map((b, i) => (
              <div key={i} className="badge-item">
                <span className="badge-icon">{BADGE_ICONS[b.badgeCode] || '🏅'}</span>
                <span className="badge-name">{b.badgeName}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="section-empty">아직 획득한 뱃지가 없어요. 출석 체크로 시작해보세요!</p>
        )}
      </div>

      {/* Quick Links */}
      <div className="mypage-section">
        <h3>내 활동</h3>
        <div className="mypage-links">
          <button onClick={() => navigate('/orders')} className="mypage-link-btn">
            📦 주문 내역
          </button>
          <button onClick={() => navigate('/calendar')} className="mypage-link-btn">
            🌱 식물 캘린더
          </button>
          <button onClick={() => navigate('/community')} className="mypage-link-btn">
            💬 커뮤니티
          </button>
          <button onClick={() => { logout(); navigate('/'); }} className="mypage-link-btn logout">
            🚪 로그아웃
          </button>
        </div>
      </div>
    </div>
  );
}
