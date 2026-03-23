import { useState, useEffect } from 'react';
import MyCalendar from './MyCalendar';
import BadgeCollection, { ALL_BADGES } from './BadgeCollection';
import PointLevel from './PointLevel';
import PlantCard from './PlantCard';
import '../../css/MyPage.css';

const TABS = [
  { id: 'activity', label: '내 활동' },
  { id: 'card',     label: '식물 명함' },
];

const INITIAL_PLANTS = [
  { id: 1, name: '몬스테라', nickname: '몬이', plantType: '관엽식물' },
  { id: 2, name: '선인장',   nickname: '선이', plantType: '선인장'   },
];

const USER = {
  name:     '초희',
  email:    'flora@example.com',
  joinDate: '2025.01.01',
};

export default function MyPage() {
  const [activeTab,       setActiveTab]       = useState('activity');
  const [plants,          setPlants]          = useState(() => {
    try { return JSON.parse(localStorage.getItem('flora-plants') || 'null') || INITIAL_PLANTS; }
    catch { return INITIAL_PLANTS; }
  });
  const [selectedBadge,   setSelectedBadge]   = useState(null);
  const [showBadgePicker, setShowBadgePicker] = useState(false);

  // 식물 목록 localStorage 동기화
  useEffect(() => {
    localStorage.setItem('flora-plants', JSON.stringify(plants));
  }, [plants]);

  const earnedBadges = ALL_BADGES.filter(b => b.earned);

  return (
    <div className="mypage-wrap">
      <div className="mypage-top-label">MY PAGE</div>
      <div className="mypage-header">
        <h1 className="mypage-title">🧑 마이페이지</h1>
        <p className="mypage-sub">나의 식물 활동, 뱃지, 명함, 포인트를 한 눈에 파악하세요.</p>
      </div>

      {/* 유저 프로필 배너 */}
      <div className="profile-banner">
        <div className="profile-avatar">🌿</div>
        <div className="profile-info">

          {/* 닉네임 + 뱃지 칭호 */}
          <div className="profile-name-row">
            <span className="profile-name">{USER.name}</span>
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

          {/* 뱃지 칭호 선택 드롭다운 */}
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

          <div className="profile-meta">{USER.email} · {USER.joinDate} 가입</div>

          {/* 키우는 식물 수 (실시간 반영) */}
          <div className="profile-stats">
            <div className="profile-stat">
              <span className="pstat-num">{plants.length}종</span>
              <span className="pstat-label">키우는 식물</span>
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
              <PointLevel />
              <BadgeCollection selectedBadge={selectedBadge} onSelectBadge={setSelectedBadge} />
            </div>
          </div>
        )}

        {activeTab === 'card' && (
          <div className="card-tab">
            <PlantCard selectedBadge={selectedBadge} plants={plants} />
          </div>
        )}
      </div>
    </div>
  );
}
