import { useState, useMemo } from 'react';

const BASIC_MISSIONS = [
  {
    id: 'basic_1',
    title: '캘린더 일정 체크',
    description: '캘린더를 눌러 오늘 일정과 다가오는 일정을 확인하세요.',
    icon: '📅',
    points: 20,
  },
  {
    id: 'basic_2',
    title: '식물 퀴즈 풀기',
    description: '메인 화면의 오늘의 식물 퀴즈를 풀어보세요. (추후 오픈 예정)',
    icon: '🌿',
    points: 20,
  },
];

const SPECIAL_MISSION_POOL = [
  { id: 'sp_0', title: '기르는 식물 상태 확인하기',    description: '오늘 기르는 식물들의 상태를 직접 확인하고 기록해보세요.', icon: '🌱', points: 30 },
  { id: 'sp_1', title: '식물 사진 업로드하기',         description: '기르는 식물의 오늘 모습을 사진으로 남겨보세요.',          icon: '📷', points: 30 },
  { id: 'sp_2', title: '이웃 식물 구경하기',            description: '다른 식물 집사의 식물을 구경하고 좋아요를 눌러보세요.',   icon: '👀', points: 30 },
  { id: 'sp_3', title: '식물 일기 작성하기',            description: '오늘 식물과 있었던 일을 짧게 기록해보세요.',             icon: '📝', points: 30 },
  { id: 'sp_4', title: '물주기 완료 체크하기',          description: '오늘 물을 준 식물의 캘린더 일정을 완료 처리해보세요.',   icon: '💧', points: 30 },
  { id: 'sp_5', title: '식물 이름 맞추기 챌린지',       description: '오늘의 식물 이름 맞추기 챌린지에 참여해보세요.',         icon: '🎯', points: 30 },
  { id: 'sp_6', title: '식물 케어 팁 읽기',             description: '오늘의 식물 케어 팁을 읽고 내 식물에 적용해보세요.',     icon: '💡', points: 30 },
];

function getTodaySpecialMission() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / 86400000);
  return SPECIAL_MISSION_POOL[dayOfYear % SPECIAL_MISSION_POOL.length];
}

function buildSampleAttendance() {
  const today = new Date();
  const attended = new Set();
  for (let i = 0; i < 5; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (d.getMonth() === today.getMonth()) attended.add(d.getDate());
  }
  return attended;
}

export default function AttendanceMission() {
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const attendedDays = useMemo(buildSampleAttendance, []);
  const todaySpecial = useMemo(getTodaySpecialMission, []);

  const [showModal, setShowModal] = useState(false);
  const [completedMissions, setCompletedMissions] = useState(new Set());
  const [isCheckedIn, setIsCheckedIn] = useState(attendedDays.has(today.getDate()));

  const handleCheckIn = () => {
    attendedDays.add(today.getDate());
    setIsCheckedIn(true);
  };

  const toggleMission = (id) => {
    setCompletedMissions(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const todayPoints = [...completedMissions].reduce((sum, id) => {
    const basic = BASIC_MISSIONS.find(m => m.id === id);
    if (basic) return sum + basic.points;
    if (id === todaySpecial.id) return sum + todaySpecial.points;
    return sum;
  }, 0);

  const consecutiveCount = (() => {
    let count = 0;
    for (let d = today.getDate(); d >= 1; d--) {
      if (attendedDays.has(d)) count++;
      else break;
    }
    return count;
  })();

  return (
    <div className="attendance-mission">
      <div className="section-header">
        <h2>출석 미션</h2>
        <button className="mission-btn" onClick={() => setShowModal(true)}>
          오늘의 출석 미션
        </button>
      </div>

      <div className="attendance-summary">
        <span>이번 달 출석 <strong>{attendedDays.size}일</strong></span>
        <span>연속 출석 <strong>{consecutiveCount}일</strong></span>
      </div>

      <div className="attendance-calendar">
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
          const isToday = day === today.getDate();
          const attended = attendedDays.has(day);
          const isFuture = day > today.getDate();
          return (
            <div
              key={day}
              className={`attendance-day${attended ? ' attended' : ''}${isToday ? ' today' : ''}${isFuture ? ' future' : ''}`}
            >
              {attended ? '🌿' : day}
            </div>
          );
        })}
      </div>

      {!isCheckedIn
        ? <button className="checkin-btn" onClick={handleCheckIn}>오늘 출석 체크하기 (+10 포인트)</button>
        : <p className="checkin-done">오늘 출석 완료! 🎉</p>
      }

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal mission-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>오늘의 출석 미션</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="mission-date">
              {today.getFullYear()}년 {today.getMonth() + 1}월 {today.getDate()}일
            </div>

            <div className="mission-section">
              <h4>기본 미션 <span className="mission-tag fixed">고정</span></h4>
              {BASIC_MISSIONS.map(mission => {
                const done = completedMissions.has(mission.id);
                return (
                  <div key={mission.id} className={`mission-item${done ? ' done' : ''}`} onClick={() => toggleMission(mission.id)}>
                    <span className="mission-icon">{mission.icon}</span>
                    <div className="mission-info">
                      <p className="mission-title">{mission.title}</p>
                      <p className="mission-desc">{mission.description}</p>
                    </div>
                    <div className="mission-right">
                      <span className="mission-points">+{mission.points}P</span>
                      <span className="mission-check">{done ? '✅' : '○'}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mission-section">
              <h4>오늘의 특별 미션 <span className="mission-tag special">매일 변경</span></h4>
              {(() => {
                const done = completedMissions.has(todaySpecial.id);
                return (
                  <div className={`mission-item special${done ? ' done' : ''}`} onClick={() => toggleMission(todaySpecial.id)}>
                    <span className="mission-icon">{todaySpecial.icon}</span>
                    <div className="mission-info">
                      <p className="mission-title">{todaySpecial.title}</p>
                      <p className="mission-desc">{todaySpecial.description}</p>
                    </div>
                    <div className="mission-right">
                      <span className="mission-points">+{todaySpecial.points}P</span>
                      <span className="mission-check">{done ? '✅' : '○'}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {todayPoints > 0 && (
              <div className="mission-total">
                오늘 획득 포인트: <strong>+{todayPoints}P</strong>
              </div>
            )}

            <button className="modal-confirm-btn" onClick={() => setShowModal(false)}>확인</button>
          </div>
        </div>
      )}
    </div>
  );
}
