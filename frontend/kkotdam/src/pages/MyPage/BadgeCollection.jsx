import { useState } from 'react';

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

const BADGE_KUDOS = {
  1: '첫 걸음이 가장 어렵습니다. 당신의 초록 여정이 시작됐어요!',
  2: '꾸준함이 최고의 돌봄입니다. 식물들이 당신을 사랑해요!',
  3: '새로운 공간에서 더 크게 자랄 거예요. 훌륭한 돌봄이에요!',
  4: '매일매일 식물과 함께하는 당신은 진정한 가드너입니다!',
  5: '지식이 곧 사랑입니다. 당신의 식물들은 행복합니다!',
  6: '다양한 식물들과 함께하는 당신의 정원이 아름답습니다!',
  7: '당신은 이제 진정한 그린 마스터입니다!',
  8: '끝까지 해내는 당신의 열정에 박수를 보냅니다!',
};

export default function BadgeCollection({ selectedBadge, onSelectBadge }) {
  const [modalBadge, setModalBadge] = useState(null);
  const earned = ALL_BADGES.filter(b => b.earned);

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
            onClick={() => setModalBadge(badge)}
            title={badge.earned ? badge.desc : `🔒 ${badge.desc}`}
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
        뱃지를 클릭하면 획득 조건과 덕담을 볼 수 있어요
        {selectedBadge && <span className="badge-selected-info"> · 선택됨: {selectedBadge.icon} {selectedBadge.name}</span>}
      </p>

      {modalBadge && (
        <div className="modal-overlay" onClick={() => setModalBadge(null)}>
          <div className="modal badge-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="badge-modal-header">
              <span className="badge-modal-big-icon">{modalBadge.icon}</span>
              <div className="badge-modal-title-wrap">
                <h3 className="modal-title" style={{ marginBottom: 4 }}>{modalBadge.name}</h3>
                {modalBadge.earned && selectedBadge?.id === modalBadge.id && (
                  <span className="badge-in-use-chip">명함에 사용 중</span>
                )}
                {!modalBadge.earned && <span className="badge-locked-chip">🔒 미획득</span>}
              </div>
              <button className="badge-modal-close" onClick={() => setModalBadge(null)}>✕</button>
            </div>

            <div className="badge-condition-box">
              <span className="badge-condition-label">획득 조건</span>
              <span className="badge-condition-text">{modalBadge.desc}</span>
            </div>

            {modalBadge.earned ? (
              <div className="badge-kudos-box">
                <span className="badge-kudos-icon">🌿</span>
                <p className="badge-kudos-text">{BADGE_KUDOS[modalBadge.id]}</p>
              </div>
            ) : (
              <div className="badge-locked-box">
                아직 획득하지 못한 뱃지예요. 조건을 채워서 뱃지를 획득해 보세요!
              </div>
            )}

            <div className="badge-modal-actions">
              {modalBadge.earned && (
                <button
                  className="btn-primary"
                  onClick={() => {
                    onSelectBadge(modalBadge);
                    setModalBadge(null);
                  }}
                >
                  {selectedBadge?.id === modalBadge.id ? '✓ 명함에 사용 중' : '명함 뱃지 바꾸기'}
                </button>
              )}
              <button className="btn-secondary" onClick={() => setModalBadge(null)}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
