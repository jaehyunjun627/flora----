// 레벨 설정 (DB level_config 테이블과 동기화)
const LEVEL_CONFIG = [
  { level: 1,  name: '새싹',           min: 0,     max: 499,   benefit: '가입 환영! 식물 일지 작성 기능 해금',              discount: 0 },
  { level: 2,  name: '초록이',         min: 500,   max: 1199,  benefit: '식물 구매 3% 할인 쿠폰 지급',                     discount: 3 },
  { level: 3,  name: '잎새',           min: 1200,  max: 2499,  benefit: '식물 구매 5% 할인 + 무료 배송 쿠폰',              discount: 5 },
  { level: 4,  name: '가지',           min: 2500,  max: 4499,  benefit: '식물 구매 7% 할인 + 월 1회 무료 분갈이 상담',     discount: 7 },
  { level: 5,  name: '꽃봉오리',       min: 4500,  max: 7499,  benefit: '식물 구매 10% 할인 + 프리미엄 식물 조기 접근',    discount: 10 },
  { level: 6,  name: '만개한 꽃',      min: 7500,  max: 11499, benefit: '식물 구매 12% 할인 + 월간 케어 키트 50% 할인',    discount: 12 },
  { level: 7,  name: '열매',           min: 11500, max: 16999, benefit: '식물 구매 15% 할인 + VIP 식물 상담 서비스',       discount: 15 },
  { level: 8,  name: '고목',           min: 17000, max: 23999, benefit: '식물 구매 18% 할인 + 한정판 식물 선구매 권한',    discount: 18 },
  { level: 9,  name: '숲의 수호자',    min: 24000, max: 31999, benefit: '식물 구매 20% 할인 + 맞춤 식물 케어 플랜 제공',   discount: 20 },
  { level: 10, name: '전설의 정원사',  min: 32000, max: Infinity, benefit: '식물 구매 25% 할인 + 모든 혜택 + 명예의 전당 등재', discount: 25 },
];

// 현재 유저 데이터 (실제는 API 연동)
const USER_DATA = {
  points: 820,
  level: 2,
};

export default function PointsLevel() {
  const { points, level } = USER_DATA;
  const currentLevelInfo = LEVEL_CONFIG[level - 1];
  const nextLevelInfo = LEVEL_CONFIG[level] || null;

  const pointsToNext = nextLevelInfo ? nextLevelInfo.min - points : 0;
  const progressPercent = nextLevelInfo
    ? Math.round(((points - currentLevelInfo.min) / (nextLevelInfo.min - currentLevelInfo.min)) * 100)
    : 100;

  return (
    <div className="points-level">
      <div className="section-header">
        <h2>포인트 & 레벨</h2>
      </div>

      {/* 현재 레벨 */}
      <div className="level-card">
        <div className="level-badge">Lv.{level}</div>
        <div className="level-info">
          <p className="level-name">{currentLevelInfo.name}</p>
          <p className="level-points">{points.toLocaleString()} P</p>
        </div>
      </div>

      {/* 레벨 진행 바 */}
      {nextLevelInfo && (
        <div className="level-progress">
          <div className="progress-labels">
            <span>Lv.{level} {currentLevelInfo.name}</span>
            <span>Lv.{level + 1} {nextLevelInfo.name}</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="points-to-next">
            다음 레벨까지 <strong>{pointsToNext.toLocaleString()}P</strong> 남았어요!
          </p>
        </div>
      )}

      {/* 현재 레벨 혜택 */}
      <div className="level-benefit">
        <h3>현재 레벨 혜택</h3>
        <p>
          {currentLevelInfo.discount > 0 && (
            <span className="discount-badge">{currentLevelInfo.discount}% 할인</span>
          )}
          {currentLevelInfo.benefit}
        </p>
      </div>

      {/* 다음 레벨 혜택 미리보기 */}
      {nextLevelInfo && (
        <div className="next-level-preview">
          <h3>다음 레벨 혜택 미리보기 (Lv.{level + 1} {nextLevelInfo.name})</h3>
          <p>
            {nextLevelInfo.discount > 0 && (
              <span className="discount-badge next">{nextLevelInfo.discount}% 할인</span>
            )}
            {nextLevelInfo.benefit}
          </p>
        </div>
      )}

      {/* 전체 레벨 로드맵 */}
      <div className="level-roadmap">
        <h3>레벨 로드맵</h3>
        <div className="roadmap-list">
          {LEVEL_CONFIG.map(lv => (
            <div
              key={lv.level}
              className={`roadmap-item${lv.level === level ? ' current' : ''}${lv.level < level ? ' cleared' : ''}`}
            >
              <span className="roadmap-level">Lv.{lv.level}</span>
              <span className="roadmap-name">{lv.name}</span>
              <span className="roadmap-points">{lv.min === 0 ? '0' : lv.min.toLocaleString()}P~</span>
              {lv.discount > 0 && <span className="roadmap-discount">{lv.discount}% 할인</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
