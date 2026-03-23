export const ALL_BADGES = [
  { id: 1, name: '새싹 가드너', icon: '🌱', desc: '첫 식물 등록', earned: true },
  { id: 2, name: '물주기 달인', icon: '💧', desc: '물주기 10회 완료', earned: true },
  { id: 3, name: '분갈이 전문가', icon: '🌸', desc: '분갈이 3회 완료', earned: true },
  { id: 4, name: '출석왕', icon: '🏆', desc: '7일 연속 출석', earned: false },
  { id: 5, name: '식물 박사', icon: '🎓', desc: '퀴즈 5회 완료', earned: false },
  { id: 6, name: '식물 수집가', icon: '🪴', desc: '식물 5종 등록', earned: false },
  { id: 7, name: '그린 마스터', icon: '🌿', desc: '레벨 5 달성', earned: false },
  { id: 8, name: '미션 완료왕', icon: '⭐', desc: '미션 30회 완료', earned: false },
];

export default function BadgeCollection({ selectedBadge, onSelectBadge }) {
  const earned = ALL_BADGES.filter(b => b.earned);
  const locked = ALL_BADGES.filter(b => !b.earned);

  return (
    <div className="badge-section">
      <div className="section-header">
        <h3 className="section-title">🏅 뱃지 컬렉션</h3>
        <span className="badge-count-chip">{earned.length} / {ALL_BADGES.length} 획득</span>
      </div>

      <div className="badge-grid">
        {ALL_BADGES.map(badge => (
          <div
            key={badge.id}
            className={`badge-card${badge.earned ? ' earned' : ' locked'}${selectedBadge?.id === badge.id ? ' selected' : ''}`}
            onClick={() => badge.earned && onSelectBadge(badge)}
            title={badge.earned ? `${badge.desc} (클릭해서 명함에 사용)` : `🔒 ${badge.desc}`}
          >
            <span className="badge-icon">{badge.icon}</span>
            <span className="badge-name">{badge.name}</span>
            {badge.earned && selectedBadge?.id === badge.id && (
              <span className="badge-selected-mark">✓</span>
            )}
            {!badge.earned && <span className="badge-lock-overlay">🔒</span>}
          </div>
        ))}
      </div>

      <p className="badge-hint">
        획득한 뱃지를 클릭하면 식물명함에 사용할 수 있어요
        {selectedBadge && <span className="badge-selected-info"> · 선택됨: {selectedBadge.icon} {selectedBadge.name}</span>}
      </p>
    </div>
  );
}
