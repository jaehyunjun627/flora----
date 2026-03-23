import { useState } from 'react';

const ALL_BADGES = [
  { id: 1,  name: '첫 발걸음',     icon: '🌱', description: '처음으로 출석 체크를 했어요!',        category: 'ATTENDANCE', condition: '출석 1일 달성' },
  { id: 2,  name: '일주일 집사',   icon: '🌿', description: '7일 연속 출석했어요!',               category: 'ATTENDANCE', condition: '7일 연속 출석' },
  { id: 3,  name: '한달 집사',     icon: '🌳', description: '30일 출석을 달성했어요!',             category: 'ATTENDANCE', condition: '누적 출석 30일' },
  { id: 4,  name: '100일의 기적',  icon: '🏆', description: '100일 출석을 달성한 전설!',           category: 'ATTENDANCE', condition: '누적 출석 100일' },
  { id: 5,  name: '첫 식물 등록',  icon: '🪴', description: '첫 번째 식물을 등록했어요!',          category: 'PLANT',      condition: '식물 1개 등록' },
  { id: 6,  name: '작은 정원',     icon: '🌻', description: '식물을 5개 이상 기르고 있어요!',      category: 'PLANT',      condition: '식물 5개 이상 보유' },
  { id: 7,  name: '식물 집사',     icon: '🌺', description: '식물을 10개 이상 기르는 집사!',       category: 'PLANT',      condition: '식물 10개 이상 보유' },
  { id: 8,  name: '미션 입문자',   icon: '⭐', description: '처음으로 미션을 완료했어요!',         category: 'MISSION',    condition: '미션 1회 완료' },
  { id: 9,  name: '미션 마스터',   icon: '🌟', description: '미션을 50회 이상 완료했어요!',        category: 'MISSION',    condition: '미션 50회 완료' },
  { id: 10, name: '레벨5 달성',    icon: '🥈', description: '레벨 5 꽃봉오리에 도달했어요!',      category: 'LEVEL',      condition: '레벨 5 달성' },
  { id: 11, name: '전설의 정원사', icon: '👑', description: '최고 레벨 10에 도달한 전설!',        category: 'LEVEL',      condition: '레벨 10 달성' },
  { id: 12, name: '얼리버드',      icon: '🐦', description: '서비스 초기에 가입한 특별 멤버!',    category: 'SPECIAL',    condition: '베타 기간 가입' },
];

// 획득한 뱃지 (실제는 API 연동)
const EARNED_IDS = new Set([1, 5, 8, 12]);

const CATEGORY_LABELS = {
  ALL: '전체', ATTENDANCE: '출석', PLANT: '식물', MISSION: '미션', LEVEL: '레벨', SPECIAL: '특별',
};

export default function BadgeCollection() {
  const [filter, setFilter] = useState('ALL');
  const [selectedBadge, setSelectedBadge] = useState(null);

  const filtered = filter === 'ALL' ? ALL_BADGES : ALL_BADGES.filter(b => b.category === filter);
  const earnedCount = ALL_BADGES.filter(b => EARNED_IDS.has(b.id)).length;

  return (
    <div className="badge-collection">
      <div className="section-header">
        <h2>뱃지 컬렉션</h2>
        <span className="badge-count">{earnedCount} / {ALL_BADGES.length}</span>
      </div>

      <div className="badge-filter">
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <button
            key={key}
            className={`filter-btn${filter === key ? ' active' : ''}`}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="badge-grid">
        {filtered.map(badge => {
          const earned = EARNED_IDS.has(badge.id);
          return (
            <div
              key={badge.id}
              className={`badge-item${earned ? ' earned' : ' locked'}`}
              onClick={() => setSelectedBadge(badge)}
            >
              <span className="badge-icon">{earned ? badge.icon : '🔒'}</span>
              <span className="badge-name">{badge.name}</span>
            </div>
          );
        })}
      </div>

      {selectedBadge && (
        <div className="modal-overlay" onClick={() => setSelectedBadge(null)}>
          <div className="modal badge-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="badge-detail-icon">
              {EARNED_IDS.has(selectedBadge.id) ? selectedBadge.icon : '🔒'}
            </div>
            <h3>{selectedBadge.name}</h3>
            <p>{selectedBadge.description}</p>
            <p className="badge-condition">획득 조건: <strong>{selectedBadge.condition}</strong></p>
            {EARNED_IDS.has(selectedBadge.id)
              ? <p className="badge-earned-label">✅ 획득 완료!</p>
              : <p className="badge-locked-label">아직 획득하지 못했어요.</p>
            }
            <button onClick={() => setSelectedBadge(null)}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}
