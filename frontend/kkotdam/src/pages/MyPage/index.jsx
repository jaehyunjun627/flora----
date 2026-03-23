import { useState } from 'react';
import MyCalendar from './MyCalendar';
import AttendanceMission from './AttendanceMission';
import BadgeCollection from './BadgeCollection';
import PointsLevel from './PointsLevel';
import PlantCard from './PlantCard';

const TABS = [
  { id: 'activity', label: '내 활동' },
  { id: 'card',     label: '식물명함' },
];

export default function MyPage() {
  const [activeTab, setActiveTab] = useState('activity');

  return (
    <div className="mypage">
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

      {activeTab === 'activity' && (
        <div className="mypage-activity">
          <MyCalendar />
          <AttendanceMission />
          <BadgeCollection />
          <PointsLevel />
        </div>
      )}

      {activeTab === 'card' && (
        <div className="mypage-card-tab">
          <PlantCard />
        </div>
      )}
    </div>
  );
}
