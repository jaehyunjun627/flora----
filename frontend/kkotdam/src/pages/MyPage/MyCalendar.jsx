import { useState } from 'react';
import './MyCalendar.css';

// AI 분석 결과를 바탕으로 캘린더 이벤트 생성
function generateScheduleFromAi(plant, aiResult) {
  const schedules = [];
  const today = new Date();

  // 물주기 (4회)
  for (let i = 1; i <= 4; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + aiResult.wateringInterval * i);
    schedules.push({
      id: Date.now() + i,
      plantId: plant.id,
      plantName: plant.name,
      type: 'WATERING',
      title: `💧 ${plant.nickname || plant.name} 물주기`,
      date: date.toISOString().split('T')[0],
      isCompleted: false,
      isAiGenerated: true,
    });
  }

  // 분갈이 (1회)
  const repotDate = new Date(today);
  repotDate.setDate(today.getDate() + aiResult.repottingInterval);
  schedules.push({
    id: Date.now() + 100,
    plantId: plant.id,
    plantName: plant.name,
    type: 'REPOTTING',
    title: `🪴 ${plant.nickname || plant.name} 분갈이`,
    date: repotDate.toISOString().split('T')[0],
    isCompleted: false,
    isAiGenerated: true,
  });

  // 비료 (간격이 있을 경우 2회)
  if (aiResult.fertilizingInterval) {
    for (let i = 1; i <= 2; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + aiResult.fertilizingInterval * i);
      schedules.push({
        id: Date.now() + 200 + i,
        plantId: plant.id,
        plantName: plant.name,
        type: 'FERTILIZING',
        title: `🌱 ${plant.nickname || plant.name} 비료주기`,
        date: date.toISOString().split('T')[0],
        isCompleted: false,
        isAiGenerated: true,
      });
    }
  }

  // 가지치기 (간격이 있을 경우 1회)
  if (aiResult.pruningInterval) {
    const pruneDate = new Date(today);
    pruneDate.setDate(today.getDate() + aiResult.pruningInterval);
    schedules.push({
      id: Date.now() + 300,
      plantId: plant.id,
      plantName: plant.name,
      type: 'PRUNING',
      title: `✂️ ${plant.nickname || plant.name} 가지치기`,
      date: pruneDate.toISOString().split('T')[0],
      isCompleted: false,
      isAiGenerated: true,
    });
  }

  return schedules;
}

const PLANT_TYPES = ['다육식물', '관엽식물', '허브', '선인장', '난초', '관목', '기타'];

const EVENT_TYPE_COLOR = {
  WATERING: '#4FC3F7',
  REPOTTING: '#A5D6A7',
  FERTILIZING: '#FFD54F',
  PRUNING: '#CE93D8',
  CHECKUP: '#FFAB91',
  CUSTOM: '#B0BEC5',
};

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

export default function MyCalendar() {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [plants, setPlants] = useState([
    { id: 1, name: '몬스테라', nickname: '몬이', plantType: '관엽식물' },
    { id: 2, name: '선인장', nickname: '선이', plantType: '선인장' },
  ]);
  const [events, setEvents] = useState(() => {
    const t = new Date();
    return [
      {
        id: 1, plantId: 1, plantName: '몬스테라', type: 'WATERING',
        title: '💧 몬이 물주기',
        date: new Date(t.getFullYear(), t.getMonth(), t.getDate() + 2).toISOString().split('T')[0],
        isCompleted: false, isAiGenerated: true,
      },
      {
        id: 2, plantId: 2, plantName: '선인장', type: 'REPOTTING',
        title: '🪴 선이 분갈이',
        date: new Date(t.getFullYear(), t.getMonth(), t.getDate() + 5).toISOString().split('T')[0],
        isCompleted: false, isAiGenerated: true,
      },
    ];
  });

  const [showAddPlant, setShowAddPlant] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [newPlant, setNewPlant] = useState({
    name: '', nickname: '', plantType: '관엽식물',
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiCareNotes, setAiCareNotes] = useState('');

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const getEventsForDay = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const toggleComplete = (eventId) => {
    setEvents(prev => prev.map(e =>
      e.id === eventId ? { ...e, isCompleted: !e.isCompleted } : e
    ));
  };

  const handleAddPlant = async () => {
    if (!newPlant.name.trim()) return;

    setIsAnalyzing(true);
    setAiCareNotes('');

    try {
      const response = await fetch('/api/plants/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plantName: newPlant.name,
          nickname: newPlant.nickname,
          plantType: newPlant.plantType,
        }),
      });

      if (!response.ok) throw new Error('AI 분석 실패');

      const aiResult = await response.json();
      const plant = { ...newPlant, id: Date.now() };

      setPlants(prev => [...prev, plant]);
      setEvents(prev => [...prev, ...generateScheduleFromAi(plant, aiResult)]);
      setAiCareNotes(aiResult.careNotes || '');

      setNewPlant({ name: '', nickname: '', plantType: '관엽식물' });
      setShowAddPlant(false);
    } catch {
      // 백엔드 없을 때 기본값으로 fallback
      const fallback = { wateringInterval: 7, repottingInterval: 180 };
      const plant = { ...newPlant, id: Date.now() };
      setPlants(prev => [...prev, plant]);
      setEvents(prev => [...prev, ...generateScheduleFromAi(plant, fallback)]);
      setNewPlant({ name: '', nickname: '', plantType: '관엽식물' });
      setShowAddPlant(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const selectedEvents = selectedDay
    ? getEventsForDay(selectedDay)
    : events.filter(e => e.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);

  return (
    <div className="my-calendar">
      <div className="calendar-header">
        <h2>내 식물 캘린더</h2>
        <button onClick={() => setShowAddPlant(true)}>+ 식물 추가하기</button>
      </div>

      {aiCareNotes && (
        <div className="ai-care-notes">
          <span className="ai-badge">AI 팁</span> {aiCareNotes}
        </div>
      )}

      <div className="plant-list">
        {plants.map(p => (
          <span key={p.id} className="plant-chip">🌿 {p.nickname || p.name}</span>
        ))}
      </div>

      <div className="calendar-nav">
        <button onClick={prevMonth}>{'<'}</button>
        <span>{currentYear}년 {currentMonth + 1}월</span>
        <button onClick={nextMonth}>{'>'}</button>
      </div>

      <div className="calendar-grid">
        {DAYS.map(d => <div key={d} className="calendar-day-header">{d}</div>)}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="calendar-cell empty" />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
          const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = dateStr === todayStr;
          const isSelected = selectedDay === day;
          const dayEvents = getEventsForDay(day);
          return (
            <div
              key={day}
              className={`calendar-cell${isToday ? ' today' : ''}${isSelected ? ' selected' : ''}`}
              onClick={() => setSelectedDay(isSelected ? null : day)}
            >
              <span className="day-num">{day}</span>
              <div className="event-dots">
                {dayEvents.slice(0, 3).map(e => (
                  <span
                    key={e.id}
                    className="event-dot"
                    style={{ background: EVENT_TYPE_COLOR[e.type] || '#B0BEC5' }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="event-list">
        <h3>{selectedDay ? `${currentMonth + 1}월 ${selectedDay}일 일정` : '다가오는 일정'}</h3>
        {selectedEvents.length === 0
          ? <p className="no-event">일정이 없습니다.</p>
          : selectedEvents.map(e => (
            <div key={e.id} className={`event-item${e.isCompleted ? ' completed' : ''}`}>
              <span className="event-title">{e.title}</span>
              {e.isAiGenerated && <span className="ai-badge">AI</span>}
              <span className="event-date">{e.date}</span>
              <button className="complete-btn" onClick={() => toggleComplete(e.id)}>
                {e.isCompleted ? '✅' : '○'}
              </button>
            </div>
          ))
        }
      </div>

      {showAddPlant && (
        <div className="modal-overlay" onClick={() => !isAnalyzing && setShowAddPlant(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>식물 추가하기</h3>
            <p className="modal-sub">
              식물 이름을 입력하면 AI가 자동으로 물주기, 분갈이, 비료 등 맞춤 일정을 캘린더에 추가해드려요!
            </p>

            {isAnalyzing ? (
              <div className="ai-analyzing">
                <div className="ai-spinner" />
                <p>AI가 <strong>{newPlant.name}</strong> 케어 일정을 분석 중...</p>
              </div>
            ) : (
              <>
                <label>
                  식물 이름 *
                  <input
                    value={newPlant.name}
                    onChange={e => setNewPlant(p => ({ ...p, name: e.target.value }))}
                    placeholder="예) 몬스테라, 고무나무, 로즈마리"
                  />
                </label>
                <label>
                  애칭
                  <input
                    value={newPlant.nickname}
                    onChange={e => setNewPlant(p => ({ ...p, nickname: e.target.value }))}
                    placeholder="예) 몬이, 고무야"
                  />
                </label>
                <label>
                  식물 종류
                  <select
                    value={newPlant.plantType}
                    onChange={e => setNewPlant(p => ({ ...p, plantType: e.target.value }))}
                  >
                    {PLANT_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </label>
                <div className="modal-actions">
                  <button onClick={handleAddPlant} disabled={!newPlant.name.trim()}>
                    🤖 AI로 일정 자동 생성
                  </button>
                  <button onClick={() => setShowAddPlant(false)}>취소</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
