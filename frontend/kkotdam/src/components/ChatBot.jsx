import React, { useState, useRef, useEffect } from 'react';
import './ChatBot.css';

/* ─── 병충해 진단 DB (PlantDiagnosisPage와 동일) ─── */
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
    prevention: '화분 바닥에 배수구멍이 있는지 확인하고, 흙 표면이 마를 때까지 기다린 후 물을 주세요.',
  },
  {
    symptoms: ['white_powder'],
    name: '흰가루병 (Powdery Mildew)',
    emoji: '⚪',
    severity: '중간',
    description: '곰팡이균에 의해 잎 표면에 하얀 가루 같은 반점이 생기는 병입니다.',
    treatment: '감염된 잎을 제거하고, 베이킹소다 1티스푼 + 물 1리터 용액을 분무하세요.',
    prevention: '통풍을 좋게 하고, 식물 사이 간격을 유지하세요.',
  },
  {
    symptoms: ['small_bugs', 'sticky_leaves'],
    name: '진딧물 (Aphid) 감염',
    emoji: '🐛',
    severity: '중간',
    description: '진딧물이 식물의 즙을 빨아먹어 끈적한 분비물(감로)을 남깁니다.',
    treatment: '물로 세척하거나 비눗물을 뿌려주세요. 님오일도 효과적입니다.',
    prevention: '잎 뒷면을 정기적으로 확인하고, 질소 비료를 과하게 주지 마세요.',
  },
  {
    symptoms: ['brown_spots', 'leaf_holes'],
    name: '세균성 점무늬병',
    emoji: '🟤',
    severity: '중간',
    description: '세균 감염으로 잎에 갈색 반점이 생기며, 진행되면 구멍이 나기도 합니다.',
    treatment: '감염된 잎을 즉시 제거하고, 구리 살균제를 뿌려주세요.',
    prevention: '잎에 직접 물이 닿지 않게 하고, 통풍이 잘 되는 환경을 유지하세요.',
  },
  {
    symptoms: ['mold', 'root_rot'],
    name: '곰팡이성 뿌리 감염',
    emoji: '🍄',
    severity: '높음',
    description: '과습 환경에서 곰팡이가 뿌리와 줄기 아래쪽에 번식하는 증상입니다.',
    treatment: '식물을 꺼내 뿌리를 검사하고, 감염 부위를 제거하세요. 새 화분과 멸균된 흙으로 분갈이하세요.',
    prevention: '배수가 잘 되는 흙을 사용하고, 화분 밑에 물이 고이지 않게 하세요.',
  },
  {
    symptoms: ['leaf_curl', 'small_bugs'],
    name: '잎말림 바이러스 / 응애 감염',
    emoji: '🌀',
    severity: '중간',
    description: '바이러스 감염이나 응애 때문에 잎이 안쪽으로 말리는 증상입니다.',
    treatment: '응애인 경우 물로 세척하고 님오일이나 살비제를 뿌려주세요.',
    prevention: '습도를 적절히 유지하고, 잎 뒷면을 정기적으로 확인하세요.',
  },
  {
    symptoms: ['yellow_leaves', 'slow_growth'],
    name: '영양 결핍 (비료 부족)',
    emoji: '🟡',
    severity: '낮음',
    description: '필수 영양소 부족으로 잎이 노랗게 변하고 성장이 둔화됩니다.',
    treatment: '균형 잡힌 액체 비료를 희석하여 2주에 한 번 주세요.',
    prevention: '성장기(봄~가을)에 정기적으로 비료를 주세요.',
  },
  {
    symptoms: ['dropping_leaves', 'wilting'],
    name: '환경 스트레스 (온도/광량 변화)',
    emoji: '🍂',
    severity: '낮음',
    description: '급격한 온도 변화, 위치 이동 등으로 식물이 스트레스를 받아 잎이 떨어지는 증상입니다.',
    treatment: '안정적인 환경을 유지해주세요. 적절한 온도(15~25도)와 간접광을 제공하세요.',
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

/* ─── 식물 관리 Q&A DB ─── */
const QA_DB = [
  { keywords: ['물', '물주기', '물 주기', '물줘', '물을'], answer: '일반적으로 흙 표면이 1~2cm 정도 말랐을 때 충분히 주는 것이 좋습니다. 계절에 따라 봄·여름에는 자주, 가을·겨울에는 줄여주세요. 화분 바닥으로 물이 빠져나올 때까지 주고, 받침접시에 고인 물은 버려주세요.' },
  { keywords: ['햇빛', '빛', '광량', '해'], answer: '대부분의 관엽식물은 밝은 간접광을 좋아합니다. 직사광선은 잎이 탈 수 있으니 커튼 너머로 빛을 제공하세요. 빛이 부족하면 잎이 웃자라고, 색이 옅어질 수 있습니다.' },
  { keywords: ['분갈이', '화분', '흙'], answer: '보통 1~2년에 한 번 분갈이해주면 좋습니다. 뿌리가 화분 밖으로 나오거나, 물이 잘 안 빠지면 분갈이 시기입니다. 기존 화분보다 2~3cm 큰 화분으로 옮기고, 배수가 잘 되는 흙을 사용하세요.' },
  { keywords: ['비료', '영양', '거름'], answer: '성장기(봄~가을)에 2주에 한 번 액체 비료를 희석해서 주세요. 겨울에는 비료를 쉬어도 됩니다. 비료를 과하게 주면 뿌리가 상할 수 있으니 주의하세요.' },
  { keywords: ['겨울', '추위', '온도', '난방'], answer: '대부분의 관엽식물은 15도 이상을 유지해주세요. 난방 바람이 직접 닿지 않게 하고, 창가 근처는 밤에 온도가 급격히 떨어질 수 있으니 주의하세요. 물주기는 줄이되, 완전히 건조해지지 않도록 해주세요.' },
  { keywords: ['벌레', '해충', '진딧물', '응애', '깍지벌레'], answer: '진딧물은 비눗물로 세척, 응애는 님오일 분무가 효과적입니다. 새 식물은 2주간 격리 관찰 후 합류시키세요. 정기적으로 잎 앞·뒷면을 확인하는 것이 중요합니다.' },
  { keywords: ['노랗', '노란', '황변', '누렇'], answer: '잎이 노랗게 되는 원인은 다양합니다: 과습, 영양 부족, 자연 노화, 빛 부족 등이 있어요. 아래쪽 잎만 노랗다면 자연 노화일 수 있고, 전체적이면 물주기나 영양 상태를 점검해보세요.' },
  { keywords: ['시들', '처짐', '축처'], answer: '시들음의 주요 원인은 과습 또는 건조입니다. 흙을 만져보고 건조하면 물을 주세요. 충분히 줬는데도 시들면 뿌리 상태를 확인해보세요. 뿌리가 검게 변했다면 과습으로 인한 뿌리 부패일 수 있습니다.' },
  { keywords: ['반려동물', '고양이', '강아지', '독성', '애완'], answer: '반려동물에게 위험한 식물이 있으니 주의하세요. 백합, 튤립, 수선화, 철쭉 등은 고양이에게 매우 위험합니다. 안전한 식물로는 장미, 국화, 카네이션, 안개꽃 등이 있어요. 식물도감의 "반려동물안전" 카테고리를 참고해주세요.' },
  { keywords: ['추천', '키우기 쉬운', '초보', '입문'], answer: '초보자에게 추천하는 식물은 산세베리아(공기정화, 물 적게), 스킨답서스(그늘에서도 잘 자람), 알로에(관리 쉬움), 고무나무(튼튼함) 등이 있어요. 자신의 환경(빛, 온도)에 맞는 식물을 고르는 게 중요합니다.' },
  { keywords: ['공기정화', '미세먼지', '새집'], answer: '공기정화에 좋은 식물로는 산세베리아, 스파티필럼, 아레카야자, 고무나무, 스킨답서스 등이 있습니다. NASA에서 발표한 공기정화 식물 50종을 참고해보세요. 넓은 잎의 식물이 공기정화 효과가 더 좋습니다.' },
];

function getAIResponse(userText) {
  const lower = userText.toLowerCase();

  // 인사말 처리
  if (/^(안녕|하이|헬로|hi|hello|반가)/.test(lower)) {
    return '안녕하세요! 🌿 꽃담 AI 상담사입니다. 식물 관리, 병충해 진단, 식물 추천 등에 대해 물어보세요!';
  }

  // 병충해 진단 키워드 감지
  if (/병충해|진단|질병|아프|아파|증상/.test(lower)) {
    return '__DIAGNOSIS_MODE__';
  }

  // Q&A DB에서 매칭
  let bestMatch = null;
  let bestScore = 0;
  for (const qa of QA_DB) {
    const score = qa.keywords.filter(kw => lower.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = qa;
    }
  }
  if (bestMatch) {
    return bestMatch.answer;
  }

  // 기본 응답
  const defaults = [
    '좋은 질문이에요! 🌱 식물에 대해 더 구체적으로 물어보시면 정확한 답변을 드릴 수 있어요. 예를 들어 "물 주기는 어떻게 하나요?" 또는 "잎이 노랗게 변했어요" 같이 물어보세요.',
    '식물 관리에 대해 궁금한 점이 있으시군요! 🌿 구체적인 증상이나 궁금한 점을 알려주시면 도움을 드리겠습니다. 병충해 진단이 필요하시면 "병충해 진단"이라고 말씀해주세요!',
    '식물에 관한 질문이시군요! 💚 물주기, 햇빛, 비료, 분갈이, 병충해 등에 대해 답변 가능합니다. 좀 더 자세히 알려주시면 맞춤 조언을 드릴게요.',
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
}

/* ─── 추천 질문 ─── */
const SUGGESTIONS = [
  { text: '🔍 병충해 진단하기', action: 'diagnosis' },
  { text: '💧 물주기 방법이 궁금해요', action: 'question', message: '물주기는 어떻게 하나요?' },
  { text: '🌱 초보자 추천 식물', action: 'question', message: '초보자가 키우기 쉬운 식물 추천해주세요' },
  { text: '🐾 반려동물 안전 식물', action: 'question', message: '반려동물에게 안전한 식물은 어떤 게 있나요?' },
];

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(() => localStorage.getItem('flora-chatbot-terms-agreed') === 'true');
  const [termsChecked, setTermsChecked] = useState(false);
  const [diagnosisMode, setDiagnosisMode] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [diagPhoto, setDiagPhoto] = useState(null);
  const [diagPhotoPreview, setDiagPhotoPreview] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, diagnosisMode, isTyping]);

  // 초기 인사 메시지
  useEffect(() => {
    if (termsAgreed && isOpen && messages.length === 0) {
      setMessages([{
        id: Date.now(),
        text: '안녕하세요! 🌿 꽃담 AI 상담사입니다.\n\n식물 관리, 병충해 진단, 식물 추천 등에 대해 물어보세요. 아래 추천 질문을 눌러보셔도 좋아요!',
        sender: 'bot',
        timestamp: new Date(),
      }]);
    }
  }, [termsAgreed, isOpen]);

  const addBotMessage = (text) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text,
        sender: 'bot',
        timestamp: new Date(),
      }]);
      setIsTyping(false);
    }, 600 + Math.random() * 400);
  };

  const processUserMessage = (text) => {
    const userMsg = {
      id: Date.now(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    const response = getAIResponse(text);
    if (response === '__DIAGNOSIS_MODE__') {
      addBotMessage('🔍 병충해 진단을 시작합니다!\n참고 사진을 업로드하고, 아래에서 현재 보이는 증상을 선택해주세요.');
      setTimeout(() => {
        setDiagnosisMode(true);
        setSelectedSymptoms([]);
        setDiagPhoto(null);
        setDiagPhotoPreview(null);
      }, 700);
    } else {
      addBotMessage(response);
    }
  };

  const handleSendMessage = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      processUserMessage(input.trim());
      setInput('');
    }
  };

  const handleButtonSend = () => {
    if (input.trim()) {
      processUserMessage(input.trim());
      setInput('');
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.action === 'diagnosis') {
      processUserMessage('병충해 진단해주세요');
    } else {
      processUserMessage(suggestion.message);
    }
  };

  const toggleSymptom = (id) => {
    setSelectedSymptoms(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  /* ─── 사진 업로드 ─── */
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setDiagPhoto(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setDiagPhotoPreview(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setDiagPhoto(null);
    setDiagPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /* ─── 진단 실행 ─── */
  const handleDiagnose = () => {
    setDiagnosisMode(false);
    const symptomNames = selectedSymptoms.map(id => {
      const s = SYMPTOM_OPTIONS.find(opt => opt.id === id);
      return s ? s.label : id;
    });

    // 사진이 있으면 이미지 메시지로 먼저 추가
    if (diagPhotoPreview) {
      setMessages(prev => [...prev, {
        id: Date.now() - 1,
        text: '',
        image: diagPhotoPreview,
        sender: 'user',
        timestamp: new Date(),
      }]);
    }

    // 사용자가 선택한 증상 표시
    setMessages(prev => [...prev, {
      id: Date.now(),
      text: `선택한 증상: ${symptomNames.join(', ')}`,
      sender: 'user',
      timestamp: new Date(),
    }]);

    const results = diagnose(selectedSymptoms);
    if (results.length === 0) {
      addBotMessage('🤔 선택한 증상으로는 정확한 진단이 어려워요. 더 많은 증상을 선택하거나, 커뮤니티에서 사진과 함께 질문해보세요!');
    } else {
      const top = results.slice(0, 2);
      let responseText = diagPhotoPreview
        ? '📷 사진과 증상을 분석했습니다.\n\n'
        : '';
      responseText += `📋 진단 결과 (${results.length}개 가능성)\n\n`;
      top.forEach((d, i) => {
        responseText += `${i + 1}. ${d.emoji} ${d.name}\n`;
        responseText += `   위험도: ${d.severity} | 일치율: ${Math.round(d.score * 100)}%\n`;
        responseText += `   ${d.description}\n`;
        responseText += `   🩹 치료: ${d.treatment}\n`;
        responseText += `   🛡️ 예방: ${d.prevention}\n\n`;
      });
      responseText += '더 자세한 진단은 병충해 진단 페이지를 이용해주세요!';
      addBotMessage(responseText);
    }
    setSelectedSymptoms([]);
    setDiagPhoto(null);
    setDiagPhotoPreview(null);
  };

  const cancelDiagnosis = () => {
    setDiagnosisMode(false);
    setSelectedSymptoms([]);
    setDiagPhoto(null);
    setDiagPhotoPreview(null);
    addBotMessage('진단을 취소했습니다. 다른 질문이 있으시면 말씀해주세요! 🌿');
  };

  return (
    <div className="chatbot-container">
      {/* 챗봇 아이콘 버튼 */}
      <button
        className="chatbot-icon-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="채팅 시작하기"
      >
        <img
          src="/src/assets/Group 11 1.png"
          alt="AI 상담"
          className="chatbot-icon"
        />
      </button>

      {/* 채팅 창 */}
      {isOpen && !termsAgreed ? (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>꽃담 AI 상담</h3>
            <button className="chatbot-close-btn" onClick={() => setIsOpen(false)}>✕</button>
          </div>
          <div className="chatbot-terms">
            <div className="chatbot-terms-icon">🤖</div>
            <h3 className="chatbot-terms-title">AI 병충해 진단 이용약관</h3>
            <p className="chatbot-terms-desc">AI 진단 서비스를 이용하기 전 아래 내용을 확인해 주세요.</p>
            <div className="chatbot-terms-box">
              <p className="chatbot-terms-highlight">본 AI 진단 서비스는 <strong>참고용 정보 제공</strong>을 목적으로 합니다.</p>
              <ul className="chatbot-terms-list">
                <li>진단 결과는 인공지능 기반이며 100% 정확성을 보장하지 않습니다.</li>
                <li>정확한 진단은 반드시 농업 전문가에게 문의하시기 바랍니다.</li>
                <li>진단 결과에 따른 조치(약품 살포, 식물 폐기 등)의 책임은 <strong>사용자 본인에게 있습니다.</strong></li>
                <li>플로라는 본 진단 결과로 인한 손해에 대해 법적 책임을 지지 않습니다.</li>
              </ul>
            </div>
            <label className="chatbot-terms-check">
              <input
                type="checkbox"
                checked={termsChecked}
                onChange={e => setTermsChecked(e.target.checked)}
              />
              <span>위 내용을 모두 읽었으며, 진단 결과에 대한 책임이 본인에게 있음에 동의합니다.</span>
            </label>
            <button
              className="chatbot-terms-btn"
              disabled={!termsChecked}
              onClick={() => {
                localStorage.setItem('flora-chatbot-terms-agreed', 'true');
                setTermsAgreed(true);
              }}
            >
              동의하고 시작하기
            </button>
          </div>
        </div>
      ) : isOpen ? (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>꽃담 AI 상담</h3>
            <button className="chatbot-close-btn" onClick={() => setIsOpen(false)}>✕</button>
          </div>

          {/* 추천 질문 영역 */}
          {messages.length <= 1 && !diagnosisMode && (
            <div className="chatbot-suggestions">
              <p className="suggestions-title">무엇이 궁금하세요?</p>
              <div className="suggestions-list">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    className="suggestion-btn"
                    onClick={() => handleSuggestionClick(s)}
                  >
                    {s.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 메시지 영역 */}
          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`chatbot-message ${msg.sender}`}>
                <div className="message-content">
                  {msg.image && (
                    <img src={msg.image} alt="첨부 사진" className="msg-attached-img" />
                  )}
                  {msg.text && msg.text.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < msg.text.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}

            {/* 타이핑 인디케이터 */}
            {isTyping && (
              <div className="chatbot-message bot">
                <div className="message-content typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}

            {/* ─── 병충해 진단 패널 (PlantDiagnosisPage 스타일) ─── */}
            {diagnosisMode && (
              <div className="chatbot-diagnosis-panel">
                {/* 사진 업로드 */}
                <div className="diag-panel-section">
                  <h4 className="diag-panel-label">참고 사진 (선택)</h4>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ display: 'none' }}
                  />
                  {diagPhotoPreview ? (
                    <div className="diag-photo-preview">
                      <img src={diagPhotoPreview} alt="증상 사진" />
                      <button className="diag-photo-remove" onClick={removePhoto}>✕</button>
                    </div>
                  ) : (
                    <button
                      className="diag-photo-upload-btn"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <span className="diag-upload-icon">📷</span>
                      <span>증상 사진 업로드</span>
                    </button>
                  )}
                </div>

                {/* 증상 선택 그리드 */}
                <div className="diag-panel-section">
                  <h4 className="diag-panel-label">어떤 증상이 보이나요? (복수 선택 가능)</h4>
                  <div className="diag-panel-grid">
                    {SYMPTOM_OPTIONS.map(s => (
                      <button
                        key={s.id}
                        className={`diag-panel-btn ${selectedSymptoms.includes(s.id) ? 'active' : ''}`}
                        onClick={() => toggleSymptom(s.id)}
                      >
                        <span className="diag-panel-emoji">{s.emoji}</span>
                        <span className="diag-panel-text">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 진단 버튼 */}
                <button
                  className="diag-panel-submit"
                  onClick={handleDiagnose}
                  disabled={selectedSymptoms.length === 0}
                >
                  🔍 진단하기
                  {selectedSymptoms.length > 0 && (
                    <span className="diag-panel-count">{selectedSymptoms.length}개 선택</span>
                  )}
                </button>
                <button className="diag-panel-cancel" onClick={cancelDiagnosis}>
                  취소
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 입력 영역 */}
          <div className="chatbot-input-area">
            <input
              type="text"
              className="chatbot-input"
              placeholder={diagnosisMode ? '위에서 증상을 선택해주세요...' : '메시지를 입력하세요...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleSendMessage}
              disabled={diagnosisMode}
            />
            <button
              className="chatbot-send-btn"
              onClick={handleButtonSend}
              disabled={diagnosisMode}
            >
              전송
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
