import { useState } from 'react';

// 식물 추가 시 AI가 자동으로 물주기/분갈이 일정을 배정
function generateAiSchedule(plant) {
  const schedules = [];
  const today = new Date();

  for (let i = 1; i <= 4; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + plant.wateringInterval * i);
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

  const repotDate = new Date(today);
  repotDate.setDate(today.getDate() + plant.repottingInterval);
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
    { id: 1, name: '몬스테라', nickname: '몬이', plantType: '관엽식물', wateringInterval: 7, repottingInterval: 180 },
    { id: 2, name: '선인장', nickname: '선이', plantType: '선인장', wateringInterval: 14, repottingInterval: 365 },
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
    wateringInterval: 7, repottingInterval: 180,
  });

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

  const handleAddPlant = () => {
    if (!newPlant.name.trim()) return;
    const plant = { ...newPlant, id: Date.now() };
    setPlants(prev => [...prev, plant]);
    setEvents(prev => [...prev, ...generateAiSchedule(plant)]);
    setNewPlant({ name: '', nickname: '', plantType: '관엽식물', wateringInterval: 7, repottingInterval: 180 });
    setShowAddPlant(false);
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
        <div className="modal-overlay" onClick={() => setShowAddPlant(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>식물 추가하기</h3>
            <p className="modal-sub">식물을 추가하면 AI가 자동으로 물주기, 분갈이 일정을 캘린더에 배정해드려요!</p>
            <label>
              식물 이름 *
              <input value={newPlant.name} onChange={e => setNewPlant(p => ({ ...p, name: e.target.value }))} placeholder="예) 몬스테라, 고무나무" />
            </label>
            <label>
              애칭
              <input value={newPlant.nickname} onChange={e => setNewPlant(p => ({ ...p, nickname: e.target.value }))} placeholder="예) 몬이, 고무야" />
            </label>
            <label>
              식물 종류
              <select value={newPlant.plantType} onChange={e => setNewPlant(p => ({ ...p, plantType: e.target.value }))}>
                {PLANT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </label>
            <label>
              물주기 주기 (일)
              <input type="number" min={1} value={newPlant.wateringInterval} onChange={e => setNewPlant(p => ({ ...p, wateringInterval: Number(e.target.value) }))} />
            </label>
            <label>
              분갈이 주기 (일)
              <input type="number" min={30} value={newPlant.repottingInterval} onChange={e => setNewPlant(p => ({ ...p, repottingInterval: Number(e.target.value) }))} />
            </label>
            <div className="modal-actions">
              <button onClick={handleAddPlant}>추가하기</button>
              <button onClick={() => setShowAddPlant(false)}>취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
