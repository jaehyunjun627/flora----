// 전체 뱃지 목록 (earned는 API 데이터로 동적 업데이트)
export const ALL_BADGES = [
  { id: 1, badgeCode: 'SPROUT',    name: '새싹 가드너',   icon: '🌱', desc: '첫 식물 등록' },
  { id: 2, badgeCode: 'WATERING',  name: '물주기 달인',   icon: '💧', desc: '물주기 10회 완료' },
  { id: 3, badgeCode: 'REPOT',     name: '분갈이 전문가', icon: '🌸', desc: '분갈이 3회 완료' },
  { id: 4, badgeCode: 'STREAK_7',  name: '출석왕',        icon: '🏆', desc: '7일 연속 출석' },
  { id: 5, badgeCode: 'QUIZ_5',    name: '식물 박사',     icon: '🎓', desc: '퀴즈 5회 완료' },
  { id: 6, badgeCode: 'COLLECT_5', name: '식물 수집가',   icon: '🪴', desc: '식물 5종 등록' },
  { id: 7, badgeCode: 'LEVEL_5',   name: '그린 마스터',   icon: '🌿', desc: '레벨 5 달성' },
  { id: 8, badgeCode: 'MISSION_30',name: '미션 완료왕',   icon: '⭐', desc: '미션 30회 완료' },
];

/**
 * @param {object}   selectedBadge  - 현재 선택된 뱃지
 * @param {function} onSelectBadge  - 뱃지 선택 핸들러
 * @param {Array}    apiBadges      - API에서 가져온 획득 뱃지 목록 [{badgeCode, badgeName, ...}]
 *                                    null이면 기본 earned 상태 사용
 */
export default function BadgeCollection({ selectedBadge, onSelectBadge, apiBadges = null }) {
  // API 뱃지 데이터가 있으면 earned 상태를 동적으로 설정
  const badges = ALL_BADGES.map(b => ({
    ...b,
    earned: apiBadges
      ? apiBadges.some(ab =>
          ab.badgeCode === b.badgeCode ||
          ab.badgeName === b.name
        )
      : (b.id <= 1), // API 없을 때: 첫 번째만 기본 획득
  }));

  const earned = badges.filter(b => b.earned);

  return (
    <div className="badge-section">
      <div className="section-header">
        <h3 className="section-title">🏅 뱃지 컬렉션</h3>
        <span className="badge-count-chip">{earned.length} / {badges.length} 획득</span>
      </div>

      <div className="badge-grid-mp">
        {badges.map(badge => (
          <div
            key={badge.id}
            className={[
              'badge-card',
              badge.earned ? 'earned' : 'locked',
              selectedBadge?.id === badge.id ? 'selected' : '',
            ].filter(Boolean).join(' ')}
            onClick={() => badge.earned && onSelectBadge(badge)}
            title={badge.earned ? `${badge.desc} (클릭해서 명함에 사용)` : `🔒 ${badge.desc}`}
          >
            <span className="badge-icon-mp">{badge.icon}</span>
            <span className="badge-name-mp">{badge.name}</span>
            {badge.earned && selectedBadge?.id === badge.id && (
              <span className="badge-selected-mark">✓</span>
            )}
            {!badge.earned && <span className="badge-lock-overlay">🔒</span>}
          </div>
        ))}
      </div>

      <p className="badge-hint">
        획득한 뱃지를 클릭하면 식물명함에 사용할 수 있어요
        {selectedBadge && (
          <span className="badge-selected-info"> · 선택됨: {selectedBadge.icon} {selectedBadge.name}</span>
        )}
      </p>
    </div>
  );
}
