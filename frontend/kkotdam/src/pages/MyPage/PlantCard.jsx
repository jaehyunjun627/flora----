import { useState, useRef } from 'react';

// 획득한 뱃지 목록 (실제는 API 연동)
const EARNED_BADGES = [
  { id: 1,  name: '첫 발걸음',   icon: '🌱', nickname: '새싹 집사' },
  { id: 5,  name: '첫 식물 등록', icon: '🪴', nickname: '식물 등록러' },
  { id: 8,  name: '미션 입문자', icon: '⭐', nickname: '미션 도전자' },
  { id: 12, name: '얼리버드',    icon: '🐦', nickname: '얼리버드 멤버' },
];

// 기르는 식물 목록 (실제는 API 연동)
const MY_PLANTS = [
  { id: 1, name: '몬스테라', nickname: '몬이', icon: '🌿' },
  { id: 2, name: '선인장',   nickname: '선이', icon: '🌵' },
];

// 유저 기본 정보 (실제는 API 연동)
const USER_INFO = {
  name: '초록집사',
  level: 2,
  levelName: '초록이',
};

const PRESET_COLORS = [
  '#4CAF50', '#81C784', '#2196F3', '#64B5F6',
  '#FF7043', '#FFB74D', '#AB47BC', '#F06292',
  '#26C6DA', '#78909C',
];

export default function PlantCard() {
  const [cardColor, setCardColor] = useState('#4CAF50');
  const [selectedBadge, setSelectedBadge] = useState(EARNED_BADGES[0]);
  const [showBadgePicker, setShowBadgePicker] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const cardRef = useRef(null);

  const shareLink = `${window.location.origin}/card/${USER_INFO.name}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleSaveImage = () => {
    // TODO: html2canvas 라이브러리 연동 예정
    alert('이미지 저장 기능은 준비 중입니다. (html2canvas 연동 예정)');
  };

  return (
    <div className="plant-card-page">
      <h2>식물명함</h2>

      {/* 명함 미리보기 */}
      <div
        ref={cardRef}
        className="plant-card-preview"
        style={{ background: cardColor }}
      >
        <div className="card-top">
          <div className="card-badge-icon">{selectedBadge.icon}</div>
          <div className="card-user-info">
            <p className="card-username">{USER_INFO.name}</p>
            <p className="card-badge-nickname">{selectedBadge.nickname}</p>
            <p className="card-level">Lv.{USER_INFO.level} {USER_INFO.levelName}</p>
          </div>
        </div>

        <div className="card-divider" />

        <div className="card-plants-section">
          <p className="card-plants-label">기르는 식물</p>
          <div className="card-plants-list">
            {MY_PLANTS.map(p => (
              <span key={p.id} className="card-plant-chip">
                {p.icon} {p.nickname || p.name}
              </span>
            ))}
          </div>
        </div>

        <div className="card-footer">
          <span className="card-app-name">🌿 Flora</span>
        </div>
      </div>

      {/* 뱃지 닉네임 선택 */}
      <div className="card-settings">
        <div className="card-setting-row">
          <span className="setting-label">대표 뱃지</span>
          <button className="badge-select-btn" onClick={() => setShowBadgePicker(true)}>
            {selectedBadge.icon} {selectedBadge.name} — "{selectedBadge.nickname}"
          </button>
        </div>

        {showBadgePicker && (
          <div className="modal-overlay" onClick={() => setShowBadgePicker(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h3>뱃지 선택</h3>
              <p className="modal-sub">명함에 표시할 대표 뱃지를 선택하세요.</p>
              <div className="badge-picker-list">
                {EARNED_BADGES.map(badge => (
                  <div
                    key={badge.id}
                    className={`badge-picker-item${selectedBadge.id === badge.id ? ' selected' : ''}`}
                    onClick={() => { setSelectedBadge(badge); setShowBadgePicker(false); }}
                  >
                    <span className="badge-picker-icon">{badge.icon}</span>
                    <div>
                      <p className="badge-picker-name">{badge.name}</p>
                      <p className="badge-picker-nick">"{badge.nickname}"</p>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowBadgePicker(false)}>닫기</button>
            </div>
          </div>
        )}

        {/* 색상 선택 */}
        <div className="card-setting-row">
          <span className="setting-label">카드 색상</span>
          <div className="color-picker">
            {PRESET_COLORS.map(color => (
              <button
                key={color}
                className={`color-dot${cardColor === color ? ' selected' : ''}`}
                style={{ background: color }}
                onClick={() => setCardColor(color)}
              />
            ))}
            <input
              type="color"
              value={cardColor}
              onChange={e => setCardColor(e.target.value)}
              title="직접 색상 선택"
            />
          </div>
        </div>
      </div>

      {/* 저장 / 공유 버튼 */}
      <div className="card-actions">
        <button className="card-action-btn save" onClick={handleSaveImage}>
          📥 이미지 저장
        </button>
        <button className="card-action-btn share" onClick={handleCopyLink}>
          {copySuccess ? '✅ 링크 복사됨!' : '🔗 링크 공유'}
        </button>
      </div>
    </div>
  );
}
