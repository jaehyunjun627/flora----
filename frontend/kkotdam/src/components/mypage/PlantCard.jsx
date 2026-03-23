import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const CARD_COLORS = [
  { name: '세이지 그린', bg: '#eef6ef', accent: '#35A865', text: '#2a2a2a' },
  { name: '크림 베이지', bg: '#faf7f2', accent: '#c8956a', text: '#2a2a2a' },
  { name: '라벤더',     bg: '#f5f0fa', accent: '#8b6fc0', text: '#2a2a2a' },
  { name: '스카이 블루', bg: '#f0f6ff', accent: '#4a7cc8', text: '#2a2a2a' },
  { name: '피치 핑크',  bg: '#fff5f0', accent: '#c87860', text: '#2a2a2a' },
];

export default function PlantCard({ selectedBadge, plants = [] }) {
  const { user } = useAuth();
  const [colorIdx, setColorIdx] = useState(0);
  const color    = CARD_COLORS[colorIdx];
  const userName = user?.nickname || user?.name || '가드너';

  const handleSaveImage = () => {
    const win = window.open('', '_blank');
    if (!win) { alert('팝업이 차단되었습니다. 팝업을 허용해주세요.'); return; }

    const plantsHtml = plants.length > 0
      ? plants.map(p =>
          `<span style="display:inline-block;background:${color.accent}22;color:${color.accent};border:1px solid ${color.accent}55;border-radius:20px;padding:3px 10px;font-size:12px;margin:2px;">🪴 ${p.nickname || p.name}</span>`
        ).join(' ')
      : '<span style="font-size:13px;color:#aaa;">식물을 추가해보세요</span>';

    win.document.write(`
      <!DOCTYPE html>
      <html><head><meta charset="UTF-8"><title>식물명함 - 꽃담</title>
      <style>
        body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f0f0f0; font-family: 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif; }
        .card { background: ${color.bg}; border: 2px solid ${color.accent}; border-radius: 20px; padding: 32px 28px; width: 320px; box-shadow: 0 8px 30px rgba(0,0,0,0.12); }
        .logo { font-size: 12px; color: ${color.accent}; opacity: 0.7; margin-bottom: 16px; font-weight: 600; }
        .name { font-size: 26px; font-weight: 700; color: ${color.text}; margin-bottom: 4px; }
        .badge-nick { font-size: 14px; color: ${color.accent}; margin-bottom: 18px; font-weight: 500; }
        .divider { border: none; border-top: 1px solid ${color.accent}44; margin: 12px 0 16px; }
        .plants-label { font-size: 11px; color: #9a9a9a; margin-bottom: 8px; font-weight: 600; letter-spacing: 0.5px; }
        .plants { display: flex; flex-wrap: wrap; gap: 4px; }
        .footer { margin-top: 20px; font-size: 11px; color: ${color.accent}; opacity: 0.6; text-align: right; }
        @media print { body { background: white; } }
      </style></head>
      <body>
        <div class="card">
          <div class="logo">🌿 꽃담 Flora</div>
          <div class="name">${userName}</div>
          <div class="badge-nick">${selectedBadge ? `${selectedBadge.icon} ${selectedBadge.name}` : '🌱 식물 애호가'}</div>
          <hr class="divider"/>
          <div class="plants-label">기르는 식물</div>
          <div class="plants">${plantsHtml}</div>
          <div class="footer">꽃담 · flora.app</div>
        </div>
        <script>setTimeout(() => { window.print(); }, 300);</script>
      </body></html>
    `);
    win.document.close();
  };

  const handleShareLink = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url)
        .then(() => alert('링크가 클립보드에 복사되었습니다! 🔗'))
        .catch(() => prompt('아래 링크를 복사하세요:', url));
    } else {
      prompt('아래 링크를 복사하세요:', url);
    }
  };

  return (
    <div className="plant-card-section">
      <div className="section-header">
        <h3 className="section-title">🪪 식물 명함</h3>
      </div>

      {/* 카드 미리보기 */}
      <div
        className="plant-card-preview"
        style={{ background: color.bg, borderColor: color.accent }}
      >
        <div className="pc-logo" style={{ color: color.accent }}>🌿 꽃담 Flora</div>
        <div className="pc-name" style={{ color: color.text }}>{userName}</div>
        <div className="pc-badge-nick" style={{ color: color.accent }}>
          {selectedBadge ? `${selectedBadge.icon} ${selectedBadge.name}` : '🌱 식물 애호가'}
        </div>
        <div className="pc-divider" style={{ borderColor: `${color.accent}44` }} />
        <div className="pc-plants-label">기르는 식물</div>
        <div className="pc-plants">
          {plants.length > 0 ? plants.map(p => (
            <span
              key={p.id}
              className="pc-plant-chip"
              style={{
                background: `${color.accent}22`,
                color: color.accent,
                borderColor: `${color.accent}55`,
              }}
            >
              🪴 {p.nickname || p.name}
            </span>
          )) : (
            <span className="pc-no-plants">식물을 추가하면 여기에 표시돼요</span>
          )}
        </div>
        <div className="pc-footer" style={{ color: color.accent }}>꽃담 · flora.app</div>
      </div>

      {/* 색상 선택 */}
      <div className="color-picker-row">
        <span className="color-picker-label">카드 색상</span>
        <div className="color-dots">
          {CARD_COLORS.map((c, idx) => (
            <button
              key={idx}
              className={`color-dot${colorIdx === idx ? ' active' : ''}`}
              style={{ background: c.accent }}
              title={c.name}
              onClick={() => setColorIdx(idx)}
            />
          ))}
        </div>
        <span className="color-name-label">{color.name}</span>
      </div>

      {!selectedBadge && (
        <p className="card-badge-hint">
          💡 아래 뱃지 컬렉션에서 뱃지를 선택하면 명함에 칭호가 표시돼요!
        </p>
      )}

      <div className="card-action-row">
        <button className="btn-card-action" onClick={handleSaveImage}>
          📥 인쇄 / 저장
        </button>
        <button className="btn-card-action" onClick={handleShareLink}>
          🔗 링크 공유
        </button>
      </div>
    </div>
  );
}
