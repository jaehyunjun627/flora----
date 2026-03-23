import { useState } from 'react';
import '../../css/MyCalendar.css';

function generateScheduleFromAi(plant, aiResult) {
  const schedules = [];
  const today = new Date();

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

const PLANT_TYPES = ['관엽식물', '다육식물', '허브', '선인장', '난초', '관목', '기타'];

const EVENT_TYPE_COLOR = {
  WATERING:    '#5b9bd5',
  REPOTTING:   '#c4a0d0',
  FERTILIZING: '#f0c050',
  PRUNING:     '#f0a080',
  CHECKUP:     '#a0c4f0',
  CUSTOM:      '#b8b8b8',
};

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

const SPECIAL_MISSIONS = [
  { text: '기르는 식물 상태 확인하기', icon: '🌿' },
  { text: '오늘의 식물 사진 찍기', icon: '📸' },
  { text: '식물 잎 닦아주기', icon: '✨' },
  { text: '화분 흙 촉촉함 확인하기', icon: '🪴' },
  { text: '식물 햇빛 위치 조절하기', icon: '☀️' },
  { text: '시든 잎 정리하기', icon: '🍂' },
  { text: '식물 성장 기록 남기기', icon: '📝' },
];

const BASIC_MISSIONS = [
  { id: 'calendar', text: '캘린더 일정 체크하기', icon: '📅', desc: '오늘 일정을 확인하세요' },
  { id: 'quiz',     text: '식물 퀴즈 풀기',       icon: '❓', desc: '메인화면의 오늘의 퀴즈를 풀어보세요' },
];

export default function MyCalendar({ plants, setPlants }) {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const [currentYear, setCurrentYear]   = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

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

  // 출석 데이터
  const [attendance, setAttendance] = useState(() => {
    try { return JSON.parse(localStorage.getItem('flora-attendance') || '[]'); }
    catch { return []; }
  });

  const [showAddPlant,  setShowAddPlant]  = useState(false);
  const [showMission,   setShowMission]   = useState(false);
  const [selectedDay,   setSelectedDay]   = useState(null);
  const [newPlant,      setNewPlant]      = useState({ name: '', nickname: '', plantType: '관엽식물' });
  const [isAnalyzing,   setIsAnalyzing]   = useState(false);
  const [aiCareNotes,   setAiCareNotes]   = useState('');

  const [completedMissions, setCompletedMissions] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`flora-missions-${todayStr}`) || '[]'); }
    catch { return []; }
  });

  const firstDay    = new Date(currentYear, currentMonth, 1).getDay();
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

  // 출석하기
  const hasTodayAttendance = attendance.includes(todayStr);

  const handleCheckIn = () => {
    if (!hasTodayAttendance) {
      const updated = [...attendance, todayStr];
      setAttendance(updated);
      localStorage.setItem('flora-attendance', JSON.stringify(updated));
    }
    setShowMission(true);
  };

  const toggleMission = (id) => {
    const updated = completedMissions.includes(id)
      ? completedMissions.filter(m => m !== id)
      : [...completedMissions, id];
    setCompletedMissions(updated);
    localStorage.setItem(`flora-missions-${todayStr}`, JSON.stringify(updated));
  };

  // 오늘의 특별 미션 (날짜 기반으로 고정)
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  const specialMission = SPECIAL_MISSIONS[dayOfYear % SPECIAL_MISSIONS.length];

  // 날짜별 출석 상태
  const getAttendanceState = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (attendance.includes(dateStr)) return 'attended';
    if (dateStr < todayStr) return 'missed';
    return 'future';
  };

  const handleAddPlant = async () => {
    if (!newPlant.name.trim()) return;
    setIsAnalyzing(true);
    setAiCareNotes('');
    try {
      const res = await fetch('/api/plants/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plantName: newPlant.name, nickname: newPlant.nickname, plantType: newPlant.plantType }),
      });
      if (!res.ok) throw new Error('AI 분석 실패');
      const aiResult = await res.json();
      const plant = { ...newPlant, id: Date.now() };
      setPlants(prev => [...prev, plant]);
      setEvents(prev => [...prev, ...generateScheduleFromAi(plant, aiResult)]);
      if (aiResult.careNotes) setAiCareNotes(aiResult.careNotes);
    } catch {
      const fallback = { wateringInterval: 7, repottingInterval: 180 };
      const plant = { ...newPlant, id: Date.now() };
      setPlants(prev => [...prev, plant]);
      setEvents(prev => [...prev, ...generateScheduleFromAi(plant, fallback)]);
    } finally {
      setNewPlant({ name: '', nickname: '', plantType: '관엽식물' });
      setShowAddPlant(false);
      setIsAnalyzing(false);
    }
  };

  const selectedEvents = selectedDay
    ? getEventsForDay(selectedDay)
    : events.filter(e => e.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);

  return (
    <div className="my-calendar compact">
      {/* 헤더 */}
      <div className="calendar-header">
        <h2>🌿 내 식물 캘린더</h2>
        <div className="cal-header-actions">
          <button
            className={`btn-checkin-cal${hasTodayAttendance ? ' done' : ''}`}
            onClick={handleCheckIn}
          >
            {hasTodayAttendance ? '✅ 출석완료' : '출석하기'}
          </button>
          <button className="btn-add-plant" onClick={() => setShowAddPlant(true)}>+ 식물 추가</button>
        </div>
      </div>

      {aiCareNotes && (
        <div className="ai-care-notes">
          <span className="ai-badge-sm">AI 팁</span>
          {aiCareNotes}
        </div>
      )}

      <div className="plant-list">
        {plants.map(p => (
          <span key={p.id} className="plant-chip">🌿 {p.nickname || p.name}</span>
        ))}
      </div>

      {/* 월 네비게이션 */}
      <div className="calendar-nav">
        <button onClick={prevMonth}>&#8249;</button>
        <span>{currentYear}년 {currentMonth + 1}월</span>
        <button onClick={nextMonth}>&#8250;</button>
      </div>

      {/* 범례 */}
      <div className="cal-legend">
        <span className="legend-item attended">✓ 출석</span>
        <span className="legend-item missed">✗ 미출석</span>
        <span className="legend-item">
          {Object.entries(EVENT_TYPE_COLOR).slice(0, 3).map(([type, color]) => (
            <span key={type} className="legend-dot-item">
              <span className="legend-dot" style={{ background: color }} />
              {type === 'WATERING' ? '물주기' : type === 'REPOTTING' ? '분갈이' : '비료'}
            </span>
          ))}
        </span>
      </div>

      {/* 캘린더 그리드 */}
      <div className="calendar-grid">
        {DAYS.map(d => (
          <div key={d} className="cal-day-header">{d}</div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`e-${i}`} className="cal-cell empty" />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
          const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday    = dateStr === todayStr;
          const isSelected = selectedDay === day;
          const dayEvents  = getEventsForDay(day);
          const attState   = getAttendanceState(day);

          return (
            <div
              key={day}
              className={[
                'cal-cell',
                isToday    ? 'today'    : '',
                isSelected ? 'selected' : '',
                attState === 'attended' ? 'att-done'   : '',
                attState === 'missed'   ? 'att-missed' : '',
              ].filter(Boolean).join(' ')}
              onClick={() => setSelectedDay(isSelected ? null : day)}
            >
              <span className={`day-num${isToday ? ' today-num' : ''}`}>{day}</span>
              {attState === 'attended' && <span className="att-mark done">✓</span>}
              {attState === 'missed'   && <span className="att-mark miss">✗</span>}
              <div className="event-dots">
                {dayEvents.slice(0, 3).map(e => (
                  <span
                    key={e.id}
                    className="event-dot"
                    style={{ background: EVENT_TYPE_COLOR[e.type] || '#b8b8b8' }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 일정 목록 */}
      <div className="event-list">
        <h3 className="event-list-title">
          {selectedDay ? `${currentMonth + 1}월 ${selectedDay}일 일정` : '다가오는 일정'}
        </h3>
        {selectedEvents.length === 0 ? (
          <p className="no-event">등록된 일정이 없습니다.</p>
        ) : (
          selectedEvents.map(e => (
            <div key={e.id} className={`event-item${e.isCompleted ? ' completed' : ''}`}>
              <span className="event-title">{e.title}</span>
              {e.isAiGenerated && <span className="ai-badge-sm">AI</span>}
              <span className="event-date">{e.date}</span>
              <button className="complete-btn" onClick={() => toggleComplete(e.id)}>
                {e.isCompleted ? '✅' : '○'}
              </button>
            </div>
          ))
        )}
      </div>

      {/* 출석 미션 모달 */}
      {showMission && (
        <div className="modal-overlay" onClick={() => setShowMission(false)}>
          <div className="modal mission-modal" onClick={e => e.stopPropagation()}>
            <div className="mission-modal-header">
              <h3 className="modal-title">🎯 오늘의 출석 미션</h3>
              <span className="mission-date">{today.getMonth() + 1}월 {today.getDate()}일</span>
            </div>

            <div className="mission-group">
              <div className="mission-group-label">📌 기본 미션</div>
              {BASIC_MISSIONS.map(m => (
                <div key={m.id} className={`mission-item${completedMissions.includes(m.id) ? ' done' : ''}`}>
                  <button className="mission-check" onClick={() => toggleMission(m.id)}>
                    {completedMissions.includes(m.id) ? '✅' : '○'}
                  </button>
                  <span className="mission-item-icon">{m.icon}</span>
                  <div className="mission-item-text">
                    <div className="mission-item-title">{m.text}</div>
                    <div className="mission-item-desc">{m.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mission-group">
              <div className="mission-group-label special">⭐ 오늘의 특별 미션</div>
              <div className={`mission-item special-item${completedMissions.includes('special') ? ' done' : ''}`}>
                <button className="mission-check" onClick={() => toggleMission('special')}>
                  {completedMissions.includes('special') ? '✅' : '○'}
                </button>
                <span className="mission-item-icon">{specialMission.icon}</span>
                <div className="mission-item-text">
                  <div className="mission-item-title">{specialMission.text}</div>
                  <div className="mission-item-desc">매일 바뀌는 특별 미션이에요!</div>
                </div>
              </div>
            </div>

            <div className="mission-progress-row">
              <span className="mission-progress-text">{completedMissions.length} / 3 완료</span>
              {completedMissions.length === 3 && (
                <span className="mission-all-done">🎉 모두 완료! +30P 적립!</span>
              )}
            </div>

            <button className="btn-primary" style={{ marginTop: 8 }} onClick={() => setShowMission(false)}>
              확인
            </button>
          </div>
        </div>
      )}

      {/* 식물 추가 모달 */}
      {showAddPlant && (
        <div className="modal-overlay" onClick={() => !isAnalyzing && setShowAddPlant(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">🌱 식물 추가하기</h3>
            <p className="modal-desc">
              식물 이름을 입력하면 AI가 물주기·분갈이·비료 등 맞춤 일정을 캘린더에 자동으로 등록해드려요!
            </p>

            {isAnalyzing ? (
              <div className="ai-analyzing">
                <div className="ai-spinner" />
                <p>AI가 <strong>{newPlant.name}</strong> 케어 일정을 분석 중입니다...</p>
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">식물 이름 <span className="required">*</span></label>
                  <input
                    className="form-input"
                    value={newPlant.name}
                    onChange={e => setNewPlant(p => ({ ...p, name: e.target.value }))}
                    placeholder="예) 몬스테라, 고무나무, 로즈마리"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">애칭</label>
                  <input
                    className="form-input"
                    value={newPlant.nickname}
                    onChange={e => setNewPlant(p => ({ ...p, nickname: e.target.value }))}
                    placeholder="예) 몬이, 고무야"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">식물 종류</label>
                  <select
                    className="form-input"
                    value={newPlant.plantType}
                    onChange={e => setNewPlant(p => ({ ...p, plantType: e.target.value }))}
                  >
                    {PLANT_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="modal-actions">
                  <button className="btn-primary" onClick={handleAddPlant} disabled={!newPlant.name.trim()}>
                    🤖 AI로 일정 자동 생성
                  </button>
                  <button className="btn-secondary" onClick={() => setShowAddPlant(false)}>취소</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
