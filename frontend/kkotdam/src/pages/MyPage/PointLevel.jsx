const LEVELS = [
  { level: 1, name: 'USER', minPoints: 0, maxPoints: 100, benefit: null, color: '#9a9a9a' },
  { level: 2, name: '새싹', minPoints: 100, maxPoints: 300, benefit: '식물 구매 3% 할인', color: '#6db87a' },
  { level: 3, name: '새내기 가드너', minPoints: 300, maxPoints: 600, benefit: '식물 구매 5% 할인', color: '#4a7c59' },
  { level: 4, name: '식물 집사', minPoints: 600, maxPoints: 1000, benefit: '식물 구매 8% 할인', color: '#2d7a4a' },
  { level: 5, name: '그린 마스터', minPoints: 1000, maxPoints: Infinity, benefit: '식물 구매 12% 할인', color: '#1a5a38' },
];

export default function PointLevel() {
  const points = 250; // mock - 나중에 API 연동

  const currentLevel = [...LEVELS].reverse().find(l => points >= l.minPoints) || LEVELS[0];
  const nextLevel = LEVELS.find(l => l.level === currentLevel.level + 1);

  const progress = nextLevel
    ? ((points - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100
    : 100;
  const pointsToNext = nextLevel ? nextLevel.minPoints - points : 0;

  return (
    <div className="point-level-section">
      <div className="section-header">
        <h3 className="section-title">⭐ 포인트 &amp; 레벨</h3>
      </div>

      <div className="level-card">
        <div className="level-top-row">
          <div className="level-badge-circle" style={{ background: currentLevel.color }}>
            Lv.{currentLevel.level}
          </div>
          <div className="level-right">
            <div className="level-name-text">{currentLevel.name}</div>
            <div className="level-points-text">{points.toLocaleString()} <span>P</span></div>
          </div>
          {currentLevel.benefit && (
            <div className="level-benefit-chip">🎁 {currentLevel.benefit}</div>
          )}
        </div>

        {nextLevel && (
          <>
            <div className="level-bar-wrap">
              <div className="level-bar-fill" style={{ width: `${progress}%`, background: currentLevel.color }} />
            </div>
            <div className="level-bar-labels">
              <span>다음 레벨까지 <strong>{pointsToNext}P</strong></span>
              <span className="level-bar-range">{currentLevel.minPoints}P ~ {nextLevel.minPoints}P</span>
            </div>
            <div className="level-next-info">
              다음 레벨 <strong>{nextLevel.name}</strong> 달성 시: {nextLevel.benefit}
            </div>
          </>
        )}
      </div>

      {/* 레벨 로드맵 */}
      <div className="level-roadmap">
        {LEVELS.map((lv) => {
          const reached = lv.level <= currentLevel.level;
          return (
            <div key={lv.level} className={`roadmap-step${reached ? ' reached' : ''}`}>
              <div className="roadmap-dot" style={reached ? { background: lv.color, borderColor: lv.color } : {}} />
              <div className="roadmap-info">
                <div className="roadmap-name">{lv.name}</div>
                <div className="roadmap-pts">{lv.minPoints}P~</div>
                {lv.benefit && <div className="roadmap-benefit">{lv.benefit}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
