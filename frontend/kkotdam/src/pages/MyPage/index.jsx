import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';
import MyCalendar from '../../components/mypage/MyCalendar';
import BadgeCollection, { ALL_BADGES } from '../../components/mypage/BadgeCollection';
import PointLevel from '../../components/mypage/PointLevel';
import PlantCard from '../../components/mypage/PlantCard';
import PlantDiary from '../../components/mypage/PlantDiary';
import TermsAgreement from '../../components/mypage/TermsAgreement';
import './MyPage.css';

const TABS = [
  { id: 'activity', label: '내 활동' },
  { id: 'diary',    label: '식물일기' },
  { id: 'card',     label: '식물 명함' },
  { id: 'terms',    label: '약관 동의' },
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
  const [profileBadgeTitle, setProfileBadgeTitle] = useState(null);

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

  // API 뱃지 데이터가 있으면 매칭, 없으면 첫 번째 뱃지만 기본 획득
  const apiBadges = myData?.badges || null;
  const earnedBadges = ALL_BADGES.filter(b =>
    apiBadges
      ? apiBadges.some(ab => ab.badgeCode === b.badgeCode || ab.badgeName === b.name)
      : (b.id <= 1)
  );

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

          {/* 닉네임 + 뱃지 칭호 */}
          <div className="profile-name-row">
            <span className="profile-name">{userName}</span>
            {profileBadgeTitle && (
              <span className="profile-badge-title">
                {profileBadgeTitle.icon} {profileBadgeTitle.name}
              </span>
            )}
            <button
              className="btn-badge-pick"
              onClick={() => setShowBadgePicker(v => !v)}
            >
              {profileBadgeTitle ? '변경' : '칭호 선택'}
            </button>
          </div>

          {/* 뱃지 칭호 선택 드롭다운 */}
          {showBadgePicker && (
            <div className="badge-picker-dropdown">
              {earnedBadges.map(b => (
                <button
                  key={b.id}
                  className={`badge-picker-item${profileBadgeTitle?.id === b.id ? ' active' : ''}`}
                  onClick={() => { setProfileBadgeTitle(b); setShowBadgePicker(false); }}
                >
                  {b.icon} {b.name}
                </button>
              ))}
              {profileBadgeTitle && (
                <button
                  className="badge-picker-item clear"
                  onClick={() => { setProfileBadgeTitle(null); setShowBadgePicker(false); }}
                >
                  ✕ 칭호 해제
                </button>
              )}
            </div>
          )}

          <div className="profile-meta">{userEmail}{joinDate ? ` · ${joinDate} 가입` : ''}</div>

          {/* 키우는 식물 수 (실시간 반영) */}
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
            {tab.id === 'activity' ? '🌿 ' : tab.id === 'diary' ? '📝 ' : tab.id === 'card' ? '🪪 ' : '📋 '}{tab.label}
          </button>
        ))}
      </div>

      <div className="mypage-content">
        {activeTab === 'activity' && (
          <div className="activity-tab">
            <MyCalendar plants={plants} setPlants={setPlants} />
            <div className="two-col-grid">
              <PointLevel points={userPoints} />
              <BadgeCollection selectedBadge={selectedBadge} onSelectBadge={setSelectedBadge} apiBadges={apiBadges} />
            </div>
          </div>
        )}

        {activeTab === 'diary' && (
          <div className="diary-tab">
            <PlantDiary plants={plants} />
          </div>
        )}

        {activeTab === 'card' && (
          <div className="card-tab">
            <PlantCard selectedBadge={profileBadgeTitle} plants={plants} userName={userName} />
          </div>
        )}

        {activeTab === 'terms' && (
          <div className="terms-tab">
            <TermsAgreement />
          </div>
        )}
      </div>

      {/* 빠른 링크 */}
      <div className="mypage-quick-links">
        <button onClick={() => navigate('/orders')} className="quick-link-btn">📦 주문 내역</button>
        <button onClick={() => navigate('/notice')} className="quick-link-btn">📢 공지사항</button>
        <button onClick={() => navigate('/community')} className="quick-link-btn">💬 커뮤니티</button>
        <button onClick={() => { logout(); navigate('/'); }} className="quick-link-btn logout-btn">🚪 로그아웃</button>
      </div>
    </div>
  );
}
