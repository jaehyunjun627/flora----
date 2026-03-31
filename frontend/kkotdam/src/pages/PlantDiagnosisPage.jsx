import React, { useState } from 'react';
import api from '../api';
import './PlantDiagnosisPage.css';

const SYMPTOM_OPTIONS = [
  { id: 'yellow_leaves', label: '잎이 노랗게 변함', emoji: '🟡' },
  { id: 'brown_spots', label: '갈색 반점이 생김', emoji: '🟤' },
  { id: 'wilting', label: '시들거나 처짐', emoji: '😵' },
  { id: 'white_powder', label: '하얀 가루 같은 것이 있음', emoji: '⚪' },
  { id: 'sticky_leaves', label: '잎이 끈적끈적함', emoji: '💧' },
  { id: 'small_bugs', label: '작은 벌레가 보임', emoji: '🐛' },
  { id: 'leaf_holes', label: '잎에 구멍이 남', emoji: '🕳️' },
  { id: 'root_rot', label: '뿌리가 검게 썩음', emoji: '⬛' },
  { id: 'mold', label: '곰팡이가 보임', emoji: '🍄' },
  { id: 'leaf_curl', label: '잎이 말림', emoji: '🌀' },
  { id: 'slow_growth', label: '성장이 멈춤', emoji: '⏸️' },
  { id: 'dropping_leaves', label: '잎이 떨어짐', emoji: '🍂' },
];

const DISEASE_DB = [
  {
    symptoms: ['yellow_leaves', 'wilting', 'root_rot'],
    name: '과습으로 인한 뿌리 부패',
    emoji: '💦',
    severity: '높음',
    description: '과도한 물주기나 배수가 안 되는 토양으로 인해 뿌리가 산소 부족으로 썩는 증상입니다.',
    treatment: '물주기를 즉시 중단하고, 흙을 말린 뒤 배수가 잘 되는 새 흙으로 분갈이하세요. 썩은 뿌리는 깨끗한 가위로 잘라내고 과산화수소 희석액으로 소독해주세요.',
    prevention: '화분 바닥에 배수구멍이 있는지 확인하고, 흙 표면이 마를 때까지 기다린 후 물을 주세요. 받침접시에 고인 물은 버려주세요.',
  },
  {
    symptoms: ['white_powder'],
    name: '흰가루병 (Powdery Mildew)',
    emoji: '⚪',
    severity: '중간',
    description: '곰팡이균에 의해 잎 표면에 하얀 가루 같은 반점이 생기는 병입니다. 통풍이 안 되고 습한 환경에서 자주 발생합니다.',
    treatment: '감염된 잎을 제거하고, 베이킹소다 1티스푼 + 물 1리터 용액을 분무하세요. 심한 경우 식물용 살균제를 사용하세요.',
    prevention: '통풍을 좋게 하고, 식물 사이 간격을 유지하세요. 잎에 직접 물을 주지 말고 흙에 주세요.',
  },
  {
    symptoms: ['small_bugs', 'sticky_leaves'],
    name: '진딧물 (Aphid) 감염',
    emoji: '🐛',
    severity: '중간',
    description: '작고 부드러운 몸을 가진 진딧물이 식물의 즙을 빨아먹어 끈적한 분비물(감로)을 남깁니다.',
    treatment: '물로 세척하거나 비눗물(주방세제 희석)을 뿌려주세요. 무당벌레를 이용한 천적 방제도 효과적입니다. 심한 경우 님오일을 사용하세요.',
    prevention: '정기적으로 잎 뒷면을 확인하고, 질소 비료를 과하게 주지 마세요. 새로 구입한 식물은 격리 관찰 후 합류시키세요.',
  },
  {
    symptoms: ['brown_spots', 'leaf_holes'],
    name: '세균성 점무늬병',
    emoji: '🟤',
    severity: '중간',
    description: '세균 감염으로 잎에 갈색 또는 검은 반점이 생기며, 진행되면 구멍이 나기도 합니다.',
    treatment: '감염된 잎을 즉시 제거하고, 구리 살균제를 뿌려주세요. 도구는 알코올로 소독 후 사용하세요.',
    prevention: '잎에 직접 물이 닿지 않게 하고, 통풍이 잘 되는 환경을 유지하세요.',
  },
  {
    symptoms: ['mold', 'root_rot'],
    name: '곰팡이성 뿌리 감염',
    emoji: '🍄',
    severity: '높음',
    description: '과습 환경에서 곰팡이가 뿌리와 줄기 아래쪽에 번식하는 증상입니다.',
    treatment: '식물을 꺼내 뿌리를 검사하고, 감염 부위를 제거하세요. 새 화분과 멸균된 흙으로 분갈이하고, 살균제를 뿌려주세요.',
    prevention: '배수가 잘 되는 흙을 사용하고, 화분 밑에 물이 고이지 않게 하세요.',
  },
  {
    symptoms: ['leaf_curl', 'small_bugs'],
    name: '잎말림 바이러스 / 응애 감염',
    emoji: '🌀',
    severity: '중간',
    description: '바이러스 감염이나 응애(거미진드기) 때문에 잎이 안쪽으로 말리는 증상입니다.',
    treatment: '응애인 경우 물로 세척하고 님오일이나 살비제를 뿌려주세요. 바이러스인 경우 감염된 부분을 제거하세요.',
    prevention: '습도를 적절히 유지하고, 잎 뒷면을 정기적으로 확인하세요.',
  },
  {
    symptoms: ['yellow_leaves', 'slow_growth'],
    name: '영양 결핍 (비료 부족)',
    emoji: '🟡',
    severity: '낮음',
    description: '질소, 철분 등 필수 영양소 부족으로 잎이 노랗게 변하고 성장이 둔화됩니다.',
    treatment: '균형 잡힌 액체 비료를 희석하여 2주에 한 번 주세요. 철분 결핍이면 철분 킬레이트 비료를 사용하세요.',
    prevention: '성장기(봄~가을)에 정기적으로 비료를 주고, 분갈이 시 영양토를 섞어주세요.',
  },
  {
    symptoms: ['dropping_leaves', 'wilting'],
    name: '환경 스트레스 (온도/광량 변화)',
    emoji: '🍂',
    severity: '낮음',
    description: '급격한 온도 변화, 위치 이동, 광량 변화 등으로 식물이 스트레스를 받아 잎이 떨어지는 증상입니다.',
    treatment: '안정적인 환경을 유지해주세요. 갑작스러운 이동을 피하고, 적절한 온도(15~25도)와 간접광을 제공하세요.',
    prevention: '식물 위치를 자주 바꾸지 말고, 에어컨·히터 바람이 직접 닿지 않게 하세요.',
  },
];

function diagnose(selectedSymptoms) {
  if (selectedSymptoms.length === 0) return [];
  return DISEASE_DB
    .map(disease => {
      const matchCount = disease.symptoms.filter(s => selectedSymptoms.includes(s)).length;
      const score = matchCount / disease.symptoms.length;
      return { ...disease, score, matchCount };
    })
    .filter(d => d.matchCount > 0)
    .sort((a, b) => b.score - a.score || b.matchCount - a.matchCount);
}

export default function PlantDiagnosisPage() {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [results, setResults] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(() => localStorage.getItem('flora-diagnosis-terms-agreed') === 'true');
  const [termsChecked, setTermsChecked] = useState(false);

  const toggleSymptom = (id) => {
    setSelectedSymptoms(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
    setResults(null);
  };

  const handleDiagnose = () => {
    const res = diagnose(selectedSymptoms);
    setResults(res);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/api/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImageUrl(res.data.imageUrl);
    } catch {
      const reader = new FileReader();
      reader.onload = () => setImageUrl(reader.result);
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedSymptoms([]);
    setResults(null);
    setImageUrl('');
  };

  if (!termsAgreed) {
    return (
      <div className="diag-page">
        <div className="diag-terms">
          <div className="diag-terms-icon">🤖</div>
          <h2 className="diag-terms-title">AI 병충해 진단 이용약관</h2>
          <p className="diag-terms-desc">AI 진단 서비스를 이용하기 전 아래 내용을 확인해 주세요.</p>
          <div className="diag-terms-box">
            <p className="diag-terms-highlight">본 AI 진단 서비스는 <strong>참고용 정보 제공</strong>을 목적으로 합니다.</p>
            <ul className="diag-terms-list">
              <li>진단 결과는 인공지능 기반이며 100% 정확성을 보장하지 않습니다.</li>
              <li>정확한 진단은 반드시 농업 전문가에게 문의하시기 바랍니다.</li>
              <li>진단 결과에 따른 조치(약품 살포, 식물 폐기 등)의 책임은 <strong>사용자 본인에게 있습니다.</strong></li>
              <li>플로라는 본 진단 결과로 인한 손해에 대해 법적 책임을 지지 않습니다.</li>
            </ul>
          </div>
          <label className="diag-terms-check">
            <input
              type="checkbox"
              checked={termsChecked}
              onChange={e => setTermsChecked(e.target.checked)}
            />
            <span>위 내용을 모두 읽었으며, 진단 결과에 대한 책임이 본인에게 있음에 동의합니다.</span>
          </label>
          <button
            className="diag-terms-btn"
            disabled={!termsChecked}
            onClick={() => {
              localStorage.setItem('flora-diagnosis-terms-agreed', 'true');
              setTermsAgreed(true);
            }}
          >
            동의하고 시작하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="diag-page">
      <div className="diag-header">
        <span className="diag-badge">PLANT DIAGNOSIS</span>
        <h1>병충해 진단</h1>
        <p>식물의 증상을 선택하면 가능한 원인과 치료법을 알려드려요</p>
      </div>

      {/* 사진 업로드 (참고용) */}
      <div className="diag-photo-section">
        <h3>참고 사진 (선택)</h3>
        {imageUrl ? (
          <div className="diag-photo-preview">
            <img src={imageUrl} alt="증상 사진" />
            <button onClick={() => setImageUrl('')}>✕ 제거</button>
          </div>
        ) : (
          <label className="diag-photo-upload">
            {uploading ? '업로드 중...' : '📷 증상 사진 업로드'}
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploading} />
          </label>
        )}
      </div>

      {/* 증상 선택 */}
      <div className="diag-section">
        <h3>어떤 증상이 보이나요? (복수 선택 가능)</h3>
        <div className="diag-symptom-grid">
          {SYMPTOM_OPTIONS.map(s => (
            <button
              key={s.id}
              className={`diag-symptom-btn ${selectedSymptoms.includes(s.id) ? 'active' : ''}`}
              onClick={() => toggleSymptom(s.id)}
            >
              <span className="diag-symptom-emoji">{s.emoji}</span>
              <span className="diag-symptom-label">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="diag-actions">
        <button
          className="diag-submit-btn"
          onClick={handleDiagnose}
          disabled={selectedSymptoms.length === 0}
        >
          🔍 진단하기
        </button>
        {(selectedSymptoms.length > 0 || results) && (
          <button className="diag-reset-btn" onClick={handleReset}>
            초기화
          </button>
        )}
      </div>

      {/* 결과 */}
      {results && (
        <div className="diag-results">
          <h3>진단 결과</h3>
          {results.length === 0 ? (
            <div className="diag-no-result">
              <span>🤔</span>
              <p>선택한 증상으로는 정확한 진단이 어려워요.</p>
              <p>커뮤니티에 사진과 함께 질문해 보세요!</p>
            </div>
          ) : (
            <div className="diag-result-list">
              {results.map((d, i) => (
                <div key={i} className="diag-result-card">
                  <div className="diag-result-header">
                    <span className="diag-result-emoji">{d.emoji}</span>
                    <div>
                      <h4 className="diag-result-name">{d.name}</h4>
                      <span className={`diag-severity diag-severity-${d.severity === '높음' ? 'high' : d.severity === '중간' ? 'mid' : 'low'}`}>
                        위험도: {d.severity}
                      </span>
                    </div>
                    <span className="diag-match-score">
                      일치율 {Math.round(d.score * 100)}%
                    </span>
                  </div>
                  <p className="diag-result-desc">{d.description}</p>
                  <div className="diag-result-section">
                    <strong>🩹 치료법</strong>
                    <p>{d.treatment}</p>
                  </div>
                  <div className="diag-result-section">
                    <strong>🛡️ 예방법</strong>
                    <p>{d.prevention}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
