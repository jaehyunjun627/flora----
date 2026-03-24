import { useState, useEffect } from 'react';
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

const AI_SCHEDULE_BY_TYPE = {
  '관엽식물': { wateringInterval: 7,  repottingInterval: 180, fertilizingInterval: 21 },
  '다육식물': { wateringInterval: 14, repottingInterval: 365, fertilizingInterval: 30 },
  '선인장':   { wateringInterval: 21, repottingInterval: 365 },
  '허브':     { wateringInterval: 4,  repottingInterval: 150, fertilizingInterval: 14 },
  '난초':     { wateringInterval: 7,  repottingInterval: 365, fertilizingInterval: 21 },
  '관목':     { wateringInterval: 5,  repottingInterval: 180, fertilizingInterval: 21, pruningInterval: 60 },
  '기타':     { wateringInterval: 7,  repottingInterval: 180, fertilizingInterval: 21 },
};

const EVENT_TYPE_OPTIONS = [
  { value: 'WATERING',    label: '💧 물주기' },
  { value: 'REPOTTING',   label: '🪴 분갈이' },
  { value: 'FERTILIZING', label: '🌱 비료주기' },
  { value: 'CUSTOM',      label: '📌 기타' },
];

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

// 초기 이벤트 mock 데이터
function getInitialEvents() {
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
}

export default function MyCalendar({ plants, setPlants }) {
  const today    = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const [currentYear,  setCurrentYear]  = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  // 이벤트 - localStorage 영속 저장 (식물 삭제 전까지 월 넘어가도 유지)
  const [events, setEvents] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('flora-events') || 'null');
      return saved || getInitialEvents();
    } catch { return getInitialEvents(); }
  });

  useEffect(() => {
    localStorage.setItem('flora-events', JSON.stringify(events));
  }, [events]);

  // 출석 데이터
  const [attendance, setAttendance] = useState(() => {
    try { return JSON.parse(localStorage.getItem('flora-attendance') || '[]'); }
    catch { return []; }
  });

  const [showAddPlant,      setShowAddPlant]      = useState(false);
  const [showMission,       setShowMission]       = useState(false);
  const [selectedDay,       setSelectedDay]       = useState(null);
  const [newPlant,          setNewPlant]          = useState({ name: '', nickname: '', plantType: '관엽식물' });
  const [isAnalyzing,       setIsAnalyzing]       = useState(false);
  const [aiCareNotes,       setAiCareNotes]       = useState('');
  const [deletePlantTarget, setDeletePlantTarget] = useState(null); // 삭제 확인 모달용
  const [showAddEvent,      setShowAddEvent]      = useState(false);
  const [newEvent,          setNewEvent]          = useState({ title: '', type: 'CUSTOM', date: '' });

  const [completedMissions, setCompletedMissions] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`flora-missions-${todayStr}`) || '[]'); }
    catch { return []; }
  });

  // 오늘 일정
  const todayAllEvents = events.filter(e => e.date === todayStr);
  const todayDoneEvents = todayAllEvents.filter(e => e.isCompleted);

  // 퀴즈 완료 여부 (메인페이지에서 localStorage에 저장)
  const [quizDoneToday, setQuizDoneToday] = useState(
    () => !!localStorage.getItem(`flora-quiz-done-${todayStr}`)
  );

  // 탭 포커스 시 퀴즈 완료 재확인
  useEffect(() => {
    const check = () => setQuizDoneToday(!!localStorage.getItem(`flora-quiz-done-${todayStr}`));
    window.addEventListener('focus', check);
    return () => window.removeEventListener('focus', check);
  }, [todayStr]);

  // 퀴즈 완료 감지 → 미션 자동 체크
  useEffect(() => {
    if (quizDoneToday && !completedMissions.includes('quiz')) {
      const updated = [...completedMissions, 'quiz'];
      setCompletedMissions(updated);
      localStorage.setItem(`flora-missions-${todayStr}`, JSON.stringify(updated));
    }
  }, [quizDoneToday]); // eslint-disable-line

  // 오늘 일정 전부 완료 → 캘린더 미션 자동 체크
  useEffect(() => {
    if (
      todayAllEvents.length > 0 &&
      todayDoneEvents.length === todayAllEvents.length &&
      !completedMissions.includes('calendar')
    ) {
      const updated = [...completedMissions, 'calendar'];
      setCompletedMissions(updated);
      localStorage.setItem(`flora-missions-${todayStr}`, JSON.stringify(updated));
    }
  }, [todayDoneEvents.length, todayAllEvents.length]); // eslint-disable-line

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
  const calMissionCount = completedMissions.length;
  const calAllMissionsDone = calMissionCount >= 3;
  const calMissionInProgress = calMissionCount > 0 && calMissionCount < 3;

  // 버튼 클릭 → 미션 모달 열기
  const handleCheckIn = () => {
    setShowMission(true);
  };

  const toggleMission = (id) => {
    const updated = completedMissions.includes(id)
      ? completedMissions.filter(m => m !== id)
      : [...completedMissions, id];
    setCompletedMissions(updated);
    localStorage.setItem(`flora-missions-${todayStr}`, JSON.stringify(updated));

    // 미션 3개 완료 → 출석 자동 체크
    if (updated.length >= 3 && !attendance.includes(todayStr)) {
      const updatedAttendance = [...attendance, todayStr];
      setAttendance(updatedAttendance);
      localStorage.setItem('flora-attendance', JSON.stringify(updatedAttendance));
    }
    // 미션 취소로 3개 미만 → 출석 취소
    if (updated.length < 3 && attendance.includes(todayStr)) {
      const updatedAttendance = attendance.filter(d => d !== todayStr);
      setAttendance(updatedAttendance);
      localStorage.setItem('flora-attendance', JSON.stringify(updatedAttendance));
    }
  };

  const resetMissions = () => {
    setCompletedMissions([]);
    localStorage.removeItem(`flora-missions-${todayStr}`);
    if (attendance.includes(todayStr)) {
      const updatedAttendance = attendance.filter(d => d !== todayStr);
      setAttendance(updatedAttendance);
      localStorage.setItem('flora-attendance', JSON.stringify(updatedAttendance));
    }
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
      const fallback = AI_SCHEDULE_BY_TYPE[newPlant.plantType] || AI_SCHEDULE_BY_TYPE['기타'];
      const plant = { ...newPlant, id: Date.now() };
      setPlants(prev => [...prev, plant]);
      setEvents(prev => [...prev, ...generateScheduleFromAi(plant, fallback)]);
    } finally {
      setNewPlant({ name: '', nickname: '', plantType: '관엽식물' });
      setShowAddPlant(false);
      setIsAnalyzing(false);
    }
  };

  // 식물 삭제 (해당 식물의 이벤트도 함께 삭제)
  const confirmDeletePlant = () => {
    if (!deletePlantTarget) return;
    setPlants(prev => prev.filter(p => p.id !== deletePlantTarget.id));
    setEvents(prev => prev.filter(e => e.plantId !== deletePlantTarget.id));
    setDeletePlantTarget(null);
  };

  // 직접 일정 추가
  const openAddEvent = () => {
    const dateStr = selectedDay
      ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
      : todayStr;
    setNewEvent({ title: '', type: 'CUSTOM', date: dateStr });
    setShowAddEvent(true);
  };

  const saveCustomEvent = () => {
    if (!newEvent.title.trim()) return;
    const iconMap = { WATERING: '💧', REPOTTING: '🪴', FERTILIZING: '🌱', CUSTOM: '📌' };
    const icon = iconMap[newEvent.type] || '📌';
    const event = {
      id: Date.now(),
      plantId: null,
      plantName: '',
      type: newEvent.type,
      title: `${icon} ${newEvent.title}`,
      date: newEvent.date,
      isCompleted: false,
      isAiGenerated: false,
    };
    setEvents(prev => [...prev, event]);
    // 추가한 날짜로 선택 이동
    const parts = newEvent.date.split('-');
    const y = parseInt(parts[0]), m = parseInt(parts[1]) - 1, d = parseInt(parts[2]);
    if (y === currentYear && m === currentMonth) setSelectedDay(d);
    setShowAddEvent(false);
    setNewEvent({ title: '', type: 'CUSTOM', date: '' });
  };

  // 선택한 날의 일정
  const selectedEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  return (
    <div className="my-calendar compact">
      {/* 헤더 */}
      <div className="calendar-header">
        <h2>🌿 내 식물 캘린더</h2>
        <div className="cal-header-actions">
          <button
            className={`btn-checkin-cal${calAllMissionsDone ? ' done' : calMissionInProgress ? ' inprogress' : ''}`}
            onClick={handleCheckIn}
          >
            {calAllMissionsDone ? '✅ 출석완료' : calMissionInProgress ? `미션 진행 중 ${calMissionCount}/3` : '출석하기'}
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

      {/* 식물 칩 - 클릭 시 삭제 확인 모달 */}
      <div className="plant-list">
        {plants.map(p => (
          <button
            key={p.id}
            className="plant-chip plant-chip-btn"
            onClick={() => setDeletePlantTarget(p)}
            title="클릭해서 식물 삭제"
          >
            🌿 {p.nickname || p.name}
            <span className="plant-chip-del">✕</span>
          </button>
        ))}
      </div>

      {/* 직접 일정 추가 버튼 (항상 노출) */}
      <div className="add-event-bar">
        <button className="btn-add-event-bar" onClick={openAddEvent}>
          ✏️ 일정 직접 추가
        </button>
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
        <span className="legend-dot-item">
          <span className="legend-dot" style={{ background: EVENT_TYPE_COLOR.WATERING }} />물주기
        </span>
        <span className="legend-dot-item">
          <span className="legend-dot" style={{ background: EVENT_TYPE_COLOR.REPOTTING }} />분갈이
        </span>
        <span className="legend-dot-item">
          <span className="legend-dot" style={{ background: EVENT_TYPE_COLOR.FERTILIZING }} />비료
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
          const dateStr  = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday    = dateStr === todayStr;
          const isSelected = selectedDay === day;
          const dayEvents  = getEventsForDay(day);
          const attState   = getAttendanceState(day);
          const isPastDate = dateStr < todayStr;

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
              {/* 날짜 번호 + 출석 표시 */}
              <div className="cal-cell-top">
                <span className={`day-num${isToday ? ' today-num' : ''}`}>{day}</span>
                {attState === 'attended' && <span className="att-mark done">✓</span>}
                {attState === 'missed'   && <span className="att-mark miss">✗</span>}
              </div>

              {/* 일정 줄 표시 */}
              <div className="cal-event-lines">
                {dayEvents.slice(0, 2).map(e => {
                  const color     = EVENT_TYPE_COLOR[e.type] || '#b8b8b8';
                  const showCheck = e.isCompleted;
                  const showX     = !e.isCompleted && isPastDate;
                  return (
                    <div
                      key={e.id}
                      className="cal-event-line"
                      style={{
                        borderLeftColor: color,
                        background:      color + '28',
                      }}
                    >
                      <span className="cel-text">{e.title}</span>
                      {showCheck && <span className="cel-mark cel-done">✓</span>}
                      {showX     && <span className="cel-mark cel-miss">✗</span>}
                    </div>
                  );
                })}
                {dayEvents.length > 2 && (
                  <div className="cel-more">+{dayEvents.length - 2}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 날짜 클릭 시 일정 상세 (다가오는 일정 제거 - 선택 날짜만 표시) */}
      {selectedDay && (
        <div className="event-list">
          <div className="event-list-header">
            <h3 className="event-list-title">
              {currentMonth + 1}월 {selectedDay}일 일정
            </h3>
            <button className="btn-add-event" onClick={openAddEvent}>+ 일정 추가</button>
          </div>
          {selectedEvents.length === 0 ? (
            <p className="no-event">등록된 일정이 없습니다.</p>
          ) : (
            selectedEvents.map(e => (
              <div key={e.id} className={`event-item${e.isCompleted ? ' completed' : ''}`}>
                <span
                  className="event-color-dot"
                  style={{ background: EVENT_TYPE_COLOR[e.type] || '#b8b8b8' }}
                />
                <span className="event-title">{e.title}</span>
                {e.isAiGenerated && <span className="ai-badge-sm">AI</span>}
                <button
                  className="complete-btn"
                  onClick={ev => { ev.stopPropagation(); toggleComplete(e.id); }}
                >
                  {e.isCompleted ? '✅' : '○'}
                </button>
                <button
                  className="delete-event-btn"
                  onClick={ev => { ev.stopPropagation(); setEvents(prev => prev.filter(ev2 => ev2.id !== e.id)); }}
                  title="일정 삭제"
                >
                  🗑
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* 출석 미션 모달 */}
      {showMission && (
        <div className="modal-overlay" onClick={() => setShowMission(false)}>
          <div className="modal mission-modal" onClick={e => e.stopPropagation()}>
            <div className="mission-modal-header">
              <h3 className="modal-title">🎯 오늘의 출석 미션</h3>
              <span className="mission-date">{today.getMonth() + 1}월 {today.getDate()}일</span>
            </div>

            <div className="mission-group">
              <div className="mission-group-label">📌 기본 미션 <span className="mission-pts-label">각 +4P</span></div>

              {/* 캘린더 일정 미션 */}
              <div className={`mission-item${completedMissions.includes('calendar') ? ' done' : ''}`}>
                <span className="mission-check-static">
                  {completedMissions.includes('calendar') ? '✅' : '○'}
                </span>
                <span className="mission-item-icon">📅</span>
                <div className="mission-item-text">
                  <div className="mission-item-title">캘린더 일정 체크하기</div>
                  {completedMissions.includes('calendar') ? (
                    <div className="mission-item-desc mission-done-text">완료!</div>
                  ) : todayAllEvents.length === 0 ? (
                    <div className="mission-item-desc">
                      오늘 일정 없음
                      <button className="btn-mission-action" onClick={() => toggleMission('calendar')}>
                        완료 처리
                      </button>
                    </div>
                  ) : (
                    <div className="mission-item-desc">
                      오늘 일정 {todayAllEvents.length}개 중 {todayDoneEvents.length}개 완료
                      <span className="mission-hint"> — 캘린더에서 일정 완료 체크 시 자동 인정</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 퀴즈 미션 */}
              <div className={`mission-item${completedMissions.includes('quiz') ? ' done' : ''}`}>
                <span className="mission-check-static">
                  {completedMissions.includes('quiz') ? '✅' : '○'}
                </span>
                <span className="mission-item-icon">❓</span>
                <div className="mission-item-text">
                  <div className="mission-item-title">식물 퀴즈 풀기</div>
                  {completedMissions.includes('quiz') ? (
                    <div className="mission-item-desc mission-done-text">완료!</div>
                  ) : (
                    <div className="mission-item-desc">
                      메인 퀴즈 완료 시 자동 인정
                      <a
                        className="btn-mission-action"
                        href="/#quiz"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        퀴즈 풀러가기 →
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mission-group">
              <div className="mission-group-label special">⭐ 오늘의 특별 미션 <span className="mission-pts-label">+2P</span></div>
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
                <span className="mission-all-done">🎉 모두 완료! +10P 적립!</span>
              )}
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button className="btn-primary" onClick={() => setShowMission(false)}>
                확인
              </button>
              {completedMissions.length > 0 && (
                <button
                  className="btn-secondary"
                  style={{ fontSize: 12, padding: '11px 12px' }}
                  onClick={resetMissions}
                >
                  미션 초기화
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 식물 삭제 확인 모달 */}
      {deletePlantTarget && (
        <div className="modal-overlay" onClick={() => setDeletePlantTarget(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">🗑️ 식물 삭제</h3>
            <p className="delete-plant-desc">
              <strong>{deletePlantTarget.nickname || deletePlantTarget.name}</strong>을(를) 삭제하면
              해당 식물의 모든 캘린더 일정도 함께 삭제됩니다.<br />
              정말 삭제하시겠어요?
            </p>
            <div className="modal-actions">
              <button className="btn-danger" onClick={confirmDeletePlant}>
                삭제
              </button>
              <button className="btn-secondary" onClick={() => setDeletePlantTarget(null)}>
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 직접 일정 추가 모달 */}
      {showAddEvent && (
        <div className="modal-overlay" onClick={() => setShowAddEvent(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">📅 일정 직접 추가</h3>
            <div className="form-group">
              <label className="form-label">제목 <span className="required">*</span></label>
              <input
                className="form-input"
                value={newEvent.title}
                onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))}
                placeholder="예) 물 갈아주기, 비료 체크"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">일정 종류</label>
              <select
                className="form-input"
                value={newEvent.type}
                onChange={e => setNewEvent(p => ({ ...p, type: e.target.value }))}
              >
                {EVENT_TYPE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">날짜</label>
              <input
                type="date"
                className="form-input"
                value={newEvent.date}
                onChange={e => setNewEvent(p => ({ ...p, date: e.target.value }))}
              />
            </div>
            <div className="modal-actions">
              <button className="btn-primary" onClick={saveCustomEvent} disabled={!newEvent.title.trim()}>
                추가하기
              </button>
              <button className="btn-secondary" onClick={() => setShowAddEvent(false)}>취소</button>
            </div>
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
