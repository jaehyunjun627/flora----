const LEVEL_BENEFITS = [
  { name: '새싹', icon: '🌱', points: 300, benefit: '식물 5% 할인쿠폰' },
  { name: '꽃비봉', icon: '🌸', points: 500, benefit: '생화 배달 10% 할인' },
  { name: '나무', icon: '🌳', points: 1000, benefit: 'VIP 농가 추천 초대' },
  { name: '목스터', icon: '🌿', points: 2500, benefit: '특별 프로모션 혜택' },
];

const LEVELS = [
  { level: 1, name: 'USER', minPoints: 0, color: '#9a9a9a' },
  { level: 2, name: '새싹', minPoints: 100, color: '#6db87a' },
  { level: 3, name: '새내기 가드너', minPoints: 300, color: '#4a7c59' },
  { level: 4, name: '식물 집사', minPoints: 600, color: '#2d7a4a' },
  { level: 5, name: '그린 마스터', minPoints: 1000, color: '#1a5a38' },
];

const CURRENT_POINTS = 120; // mock

export default function PointLevel() {
  const points = CURRENT_POINTS;
  const currentLevel = [...LEVELS].reverse().find(l => points >= l.minPoints) || LEVELS[0];
  const nextLevel = LEVELS.find(l => l.level === currentLevel.level + 1);
  const progress = nextLevel
    ? ((points - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100
    : 100;

  return (
    <div className="point-level-section">
      <div className="section-header">
        <span className="section-title">🔥 내 포인트</span>
        <span className="total-points-badge">{points.toLocaleString()}P</span>
      </div>

      {/* 레벨 + 프로그레스 */}
      <div className="level-progress-card">
        <div className="level-icon-wrap" style={{ background: currentLevel.color }}>
          🌿
        </div>
        <div className="level-progress-info">
          <div className="level-label-row">
            <span className="level-cur-name">현재 레벨: <strong>{currentLevel.name}</strong> 뱃지</span>
            {nextLevel && <span className="level-next-pts">{points} / {nextLevel.minPoints}P</span>}
          </div>
          {nextLevel && (
            <>
              <div className="level-bar-wrap">
                <div className="level-bar-fill" style={{ width: `${progress}%`, background: currentLevel.color }} />
              </div>
              <div className="level-bar-sub">다음 목표: {nextLevel.name} ({nextLevel.minPoints - points}P 남음)</div>
            </>
          )}
        </div>
      </div>

      {/* 포인트 달성 혜택 */}
      <div className="benefit-section-label">🎁 포인트 달성 혜택</div>
      <div className="benefit-grid">
        {LEVEL_BENEFITS.map(b => (
          <div key={b.name} className={`benefit-item${points >= b.points ? ' reached' : ''}`}>
            <div className="benefit-top-row">
              <span className="benefit-icon">{b.icon}</span>
              <span className="benefit-name">{b.name}</span>
              <span className="benefit-pts">{b.points.toLocaleString()}P</span>
            </div>
            <div className="benefit-desc">{b.benefit}</div>
          </div>
        ))}
      </div>

      {/* 포인트 획득 안내 */}
      <div className="point-guide">
        <span>📌 기본미션 완료 시 각 +4P</span>
        <span>⭐ 특별미션 완료 시 +2P</span>
        <span>🎯 하루 미션 모두 완료 시 +10P</span>
      </div>
    </div>
  );
}
