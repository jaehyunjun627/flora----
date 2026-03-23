import { useState } from 'react';
import MyCalendar from './MyCalendar';
import '../../css/MyPage.css';

const TABS = [
  { id: 'calendar', label: '🌿 식물 캘린더' },
];

export default function MyPage() {
  const [activeTab, setActiveTab] = useState('calendar');

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
        {activeTab === 'calendar' && <MyCalendar />}
      </div>
    </div>
  );
}
