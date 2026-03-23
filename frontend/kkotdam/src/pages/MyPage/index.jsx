import { useState } from 'react';
import MyCalendar from './MyCalendar';
import AttendanceMission from './AttendanceMission';
import BadgeCollection from './BadgeCollection';
import PointLevel from './PointLevel';
import PlantCard from './PlantCard';
import '../../css/MyPage.css';

const TABS = [
  { id: 'activity', label: '🌿 내 활동' },
  { id: 'card', label: '🪪 식물 명함' },
];

const INITIAL_PLANTS = [
  { id: 1, name: '몬스테라', nickname: '몬이', plantType: '관엽식물' },
  { id: 2, name: '선인장', nickname: '선이', plantType: '선인장' },
];

export default function MyPage() {
  const [activeTab, setActiveTab] = useState('activity');
  const [plants, setPlants] = useState(INITIAL_PLANTS);
  const [selectedBadge, setSelectedBadge] = useState(null);

  return (
    <div className="mypage-wrap">
      <div className="mypage-header">
        <h1 className="mypage-title">마이페이지</h1>
        <p className="mypage-sub">내 식물을 관리하고 AI 케어 일정을 확인하세요</p>
      </div>

      <div className="mypage-tab-bar">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`mypage-tab${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mypage-content">
        {activeTab === 'activity' && (
          <div className="activity-tab">
            <MyCalendar plants={plants} setPlants={setPlants} />
            <AttendanceMission />
            <BadgeCollection selectedBadge={selectedBadge} onSelectBadge={setSelectedBadge} />
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
