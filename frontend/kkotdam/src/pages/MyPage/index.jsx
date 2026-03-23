import { useState } from 'react';
import MyCalendar from './MyCalendar';
import AttendanceMission from './AttendanceMission';
import BadgeCollection from './BadgeCollection';
import PointLevel from './PointLevel';
import PlantCard from './PlantCard';
import '../../css/MyPage.css';

const TABS = [
  { id: 'activity', label: '내 활동' },
  { id: 'card', label: '식물 명함' },
];

const INITIAL_PLANTS = [
  { id: 1, name: '몬스테라', nickname: '몬이', plantType: '관엽식물' },
  { id: 2, name: '선인장', nickname: '선이', plantType: '선인장' },
];

// mock user info
const USER = {
  name: '초희',
  email: 'flora@example.com',
  joinDate: '2025.01.01',
  streak: 14,
  plants: 3,
  journals: 5,
  posts: 23,
};

export default function MyPage() {
  const [activeTab, setActiveTab] = useState('activity');
  const [plants, setPlants] = useState(INITIAL_PLANTS);
  const [selectedBadge, setSelectedBadge] = useState(null);

  return (
    <div className="mypage-wrap">
      {/* 상단 타이틀 */}
      <div className="mypage-top-label">MY PAGE</div>
      <div className="mypage-header">
        <h1 className="mypage-title">🧑 마이페이지</h1>
        <p className="mypage-sub">나의 식물 활동, 스트릭, 뱃지, 명함, 획득을 한 눈에 파악하세요.</p>
      </div>

      {/* 유저 프로필 배너 */}
      <div className="profile-banner">
        <div className="profile-avatar">🌿</div>
        <div className="profile-info">
          <div className="profile-name">{USER.name}</div>
          <div className="profile-meta">{USER.email} · {USER.joinDate} 가입</div>
          <div className="profile-stats">
            <div className="profile-stat">
              <span className="pstat-num">{USER.streak}일</span>
              <span className="pstat-label">출석 스트릭</span>
            </div>
            <div className="profile-stat">
              <span className="pstat-num">{USER.plants}종</span>
              <span className="pstat-label">키우는 식물</span>
            </div>
            <div className="profile-stat">
              <span className="pstat-num">{USER.journals}개</span>
              <span className="pstat-label">교육 일지</span>
            </div>
            <div className="profile-stat">
              <span className="pstat-num">{USER.posts}개</span>
              <span className="pstat-label">작성 일지</span>
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

      {/* 탭 콘텐츠 */}
      <div className="mypage-content">
        {activeTab === 'activity' && (
          <div className="activity-tab">
            {/* 캘린더 - 풀폭 */}
            <MyCalendar plants={plants} setPlants={setPlants} />

            {/* 2컬럼: 출석 스트릭 + 뱃지 컬렉션 */}
            <div className="two-col-grid">
              <AttendanceMission />
              <BadgeCollection selectedBadge={selectedBadge} onSelectBadge={setSelectedBadge} />
            </div>

            {/* 포인트 & 레벨 - 풀폭 */}
            <PointLevel />
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
