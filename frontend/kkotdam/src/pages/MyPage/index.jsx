import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import MyCalendar from './MyCalendar';
import BadgeCollection, { ALL_BADGES } from './BadgeCollection';
import PointLevel from './PointLevel';
import PlantCard from './PlantCard';
import './MyPage.css';

const TABS = [
  { id: 'activity', label: '내 활동' },
  { id: 'card',     label: '식물 명함' },
];

const INITIAL_PLANTS = [
  { id: 1, name: '몬스테라', nickname: '몬이', plantType: '관엽식물' },
  { id: 2, name: '선인장',   nickname: '선이', plantType: '선인장'   },
];

export default function MyPage() {
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab,       setActiveTab]       = useState('activity');
  const [myData,          setMyData]          = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [plants,          setPlants]          = useState(() => {
    try { return JSON.parse(localStorage.getItem('flora-plants') || 'null') || INITIAL_PLANTS; }
    catch { return INITIAL_PLANTS; }
  });
  const [selectedBadge,   setSelectedBadge]   = useState(null);
  const [showBadgePicker, setShowBadgePicker] = useState(false);

  useEffect(() => {
    if (!authUser) { navigate('/login'); return; }
    loadMyPage();
  }, [authUser]);

  useEffect(() => {
    localStorage.setItem('flora-plants', JSON.stringify(plants));
  }, [plants]);

  const loadMyPage = async () => {
    try {
      const res = await api.get('/api/mypage');
      setMyData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const earnedBadges = ALL_BADGES.filter(b => b.earned);

  // 유저 정보: API 데이터 우선, 없으면 authContext 사용
  const userName  = myData?.nickname || authUser?.nickname || '사용자';
  const userEmail = myData?.email    || authUser?.email    || '';
  const joinDate  = myData?.createdAt ? new Date(myData.createdAt).toLocaleDateString('ko-KR') : '';
  const userPoints = myData?.points || 0;

  if (loading) return <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>불러오는 중...</div>;

  return (
    <div className="mypage-wrap">
      <div className="mypage-top-label">MY PAGE</div>
      <div className="mypage-header">
        <h1 className="mypage-title">🧑 마이페이지</h1>
        <p className="mypage-sub">나의 식물 활동, 뱃지, 명함, 포인트를 한 눈에 파악하세요.</p>
      </div>

      {/* 유저 프로필 배너 */}
      <div className="profile-banner">
        <div className="profile-avatar">{myData?.profileEmoji || '🌿'}</div>
        <div className="profile-info">
          <div className="profile-name-row">
            <span className="profile-name">{userName}</span>
            {selectedBadge && (
              <span className="profile-badge-title">
                {selectedBadge.icon} {selectedBadge.name}
              </span>
            )}
            <button
              className="btn-badge-pick"
              onClick={() => setShowBadgePicker(v => !v)}
            >
              {selectedBadge ? '변경' : '칭호 선택'}
            </button>
          </div>

          {showBadgePicker && (
            <div className="badge-picker-dropdown">
              {earnedBadges.map(b => (
                <button
                  key={b.id}
                  className={`badge-picker-item${selectedBadge?.id === b.id ? ' active' : ''}`}
                  onClick={() => { setSelectedBadge(b); setShowBadgePicker(false); }}
                >
                  {b.icon} {b.name}
                </button>
              ))}
              {selectedBadge && (
                <button
                  className="badge-picker-item clear"
                  onClick={() => { setSelectedBadge(null); setShowBadgePicker(false); }}
                >
                  ✕ 칭호 해제
                </button>
              )}
            </div>
          )}

          <div className="profile-meta">{userEmail}{joinDate ? ` · ${joinDate} 가입` : ''}</div>

          <div className="profile-stats">
            <div className="profile-stat">
              <span className="pstat-num">{plants.length}종</span>
              <span className="pstat-label">키우는 식물</span>
            </div>
            <div className="profile-stat">
              <span className="pstat-num">{userPoints.toLocaleString()}P</span>
              <span className="pstat-label">포인트</span>
            </div>
            <div className="profile-stat">
              <span className="pstat-num">{myData?.streakDays || 0}일</span>
              <span className="pstat-label">연속 출석</span>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 */}
      <div className="mypage-tab-bar">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`mypage-tab${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.id === 'activity' ? '🌿 ' : '🪪 '}{tab.label}
          </button>
        ))}
      </div>

      <div className="mypage-content">
        {activeTab === 'activity' && (
          <div className="activity-tab">
            <MyCalendar plants={plants} setPlants={setPlants} />
            <div className="two-col-grid">
              <PointLevel points={userPoints} />
              <BadgeCollection selectedBadge={selectedBadge} onSelectBadge={setSelectedBadge} />
            </div>
          </div>
        )}

        {activeTab === 'card' && (
          <div className="card-tab">
            <PlantCard selectedBadge={selectedBadge} plants={plants} userName={userName} />
          </div>
        )}
      </div>

      {/* 빠른 링크 */}
      <div className="mypage-quick-links">
        <button onClick={() => navigate('/orders')} className="quick-link-btn">📦 주문 내역</button>
        <button onClick={() => navigate('/community')} className="quick-link-btn">💬 커뮤니티</button>
        <button onClick={() => { logout(); navigate('/'); }} className="quick-link-btn logout-btn">🚪 로그아웃</button>
      </div>
    </div>
  );
}
