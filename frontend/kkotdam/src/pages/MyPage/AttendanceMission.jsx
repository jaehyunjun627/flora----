import { useState } from 'react';

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
  { id: 'calendar', text: '캘린더 일정 체크하기', icon: '📅', desc: '다가오는 일정이나 오늘 일정을 확인하세요' },
  { id: 'quiz', text: '식물 퀴즈 풀기', icon: '❓', desc: '메인화면의 오늘의 퀴즈를 풀어보세요' },
];

function getStreak(attendance, todayStr) {
  let streak = 0;
  const current = new Date(todayStr);
  while (true) {
    const dateStr = current.toISOString().split('T')[0];
    if (attendance.includes(dateStr)) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else break;
  }
  return streak;
}

function getMaxStreak(attendance) {
  if (attendance.length === 0) return 0;
  const sorted = [...attendance].sort();
  let max = 1, cur = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const next = new Date(sorted[i]);
    const diff = (next - prev) / 86400000;
    if (diff === 1) { cur++; max = Math.max(max, cur); }
    else cur = 1;
  }
  return max;
}

export default function AttendanceMission() {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const [attendance, setAttendance] = useState(() => {
    try { return JSON.parse(localStorage.getItem('flora-attendance') || '[]'); }
    catch { return []; }
  });

  const [showModal, setShowModal] = useState(false);
  const [completedMissions, setCompletedMissions] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`flora-missions-${todayStr}`) || '[]'); }
    catch { return []; }
  });

  const hasTodayAttendance = attendance.includes(todayStr);
  const missionCount = completedMissions.length;
  const allMissionsDone = hasTodayAttendance && missionCount >= 3;
  const missionInProgress = hasTodayAttendance && missionCount < 3;
  const streak = getStreak(attendance, todayStr);
  const maxStreak = getMaxStreak(attendance);
  const nextGoal = Math.ceil((streak + 1) / 7) * 7;

  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  const specialMission = SPECIAL_MISSIONS[dayOfYear % SPECIAL_MISSIONS.length];

  // 최근 28일 표시
  const recentDays = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (27 - i));
    return d.toISOString().split('T')[0];
  });

  const handleCheckIn = () => {
    if (!hasTodayAttendance) {
      const updated = [...attendance, todayStr];
      setAttendance(updated);
      localStorage.setItem('flora-attendance', JSON.stringify(updated));
    }
    setShowModal(true);
  };

  const toggleMission = (id) => {
    const updated = completedMissions.includes(id)
      ? completedMissions.filter(m => m !== id)
      : [...completedMissions, id];
    setCompletedMissions(updated);
    localStorage.setItem(`flora-missions-${todayStr}`, JSON.stringify(updated));
  };

  return (
    <div className="streak-section">
      <div className="streak-header">
        <span className="section-title">🔥 출석 스트릭</span>
        <button
          className={`btn-checkin${allMissionsDone ? ' done' : missionInProgress ? ' inprogress' : ''}`}
          onClick={handleCheckIn}
        >
          {allMissionsDone ? '✅ 출석완료' : missionInProgress ? `미션 진행 중 ${missionCount}/3` : '출석하기'}
        </button>
      </div>

      {/* 스트릭 수 */}
      <div className="streak-count-row">
        <span className="streak-big">{streak}</span>
        <span className="streak-unit">일 연속 🔥</span>
      </div>

      {/* 최근 28일 도트 */}
      <div className="streak-dots">
        {recentDays.map((d, i) => {
          const checked = attendance.includes(d);
          const isToday = d === todayStr;
          return (
            <span
              key={i}
              className={`streak-dot${checked ? ' checked' : ''}${isToday ? ' today' : ''}`}
              title={d}
            />
          );
        })}
      </div>

      {/* 기록 */}
      <div className="streak-meta">
        <span>최고 기록 <strong>{maxStreak}일</strong> 🏆</span>
        <span>다음 목표 <strong>{nextGoal}일</strong> 🎯</span>
      </div>

      {/* 미션 모달 */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
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
                  {m.id === 'quiz' && (
                    <a href="/#quiz" className="mission-goto-btn">퀴즈 풀러가기</a>
                  )}
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

            <button className="btn-primary" style={{ marginTop: 8 }} onClick={() => setShowModal(false)}>
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
