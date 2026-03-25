import { useState } from 'react';

const TERMS_DATA = [
  {
    id: 'service',
    title: '서비스 이용약관',
    required: true,
    desc: '플로라 서비스의 전반적인 이용 조건, 권리와 의무, 금지 행위 등을 규정합니다.',
    content: `제1조 (목적)
이 약관은 꽃담(이하 "회사")이 제공하는 식물 관련 서비스(이하 "서비스")의 이용조건 및 절차, 회사와 이용자의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.

제2조 (정의)
① "서비스"란 회사가 제공하는 식물 마켓, 식물 도감, 커뮤니티, 식물 캘린더, 구독 서비스 등 관련 제반 서비스를 의미합니다.
② "이용자"란 이 약관에 따라 서비스를 이용하는 회원 및 비회원을 말합니다.
③ "회원"이란 서비스에 회원등록을 한 자로서, 지속적으로 서비스를 이용할 수 있는 자를 말합니다.

제3조 (약관의 효력 및 변경)
① 이 약관은 서비스를 이용하고자 하는 모든 이용자에 대하여 그 효력을 발생합니다.
② 회사는 합리적인 사유가 발생할 경우 약관을 변경할 수 있으며, 변경된 약관은 공지사항을 통해 공지합니다.

제4조 (서비스의 제공)
회사는 다음과 같은 서비스를 제공합니다.
- 식물 및 원예용품 온라인 마켓
- AI 기반 식물 케어 캘린더
- 식물 백과사전 및 도감
- 커뮤니티 서비스
- 정기 꽃 구독 서비스`
  },
  {
    id: 'privacy',
    title: '개인정보처리방침',
    required: true,
    desc: '수집하는 개인정보의 항목, 이용 목적, 보유 기간, 제3자 제공 여부를 안내합니다.',
    content: `1. 개인정보 수집항목
- 필수: 이메일, 비밀번호, 닉네임
- 선택: 전화번호, 프로필 이미지
- 판매자: 사업자명, 사업자등록번호

2. 개인정보 수집 및 이용 목적
- 회원 식별 및 가입의사 확인
- 서비스 제공 및 개선
- 주문 처리 및 배송
- 고객 상담 및 불만 처리

3. 개인정보 보유 및 이용기간
- 회원 탈퇴 시까지 (탈퇴 후 30일 이내 파기)
- 관계 법령에 따라 보존 필요한 경우 해당 기간

4. 개인정보 제3자 제공
- 원칙적으로 제3자에게 제공하지 않습니다.
- 배송 업무를 위해 배송업체에 최소한의 정보를 제공할 수 있습니다.`
  },
  {
    id: 'location',
    title: '위치정보 이용 동의',
    required: false,
    desc: '주변 꽃집 찾기, 근처 축제 추천, 날씨 기반 재배 팁 제공을 위해 위치 정보를 수집합니다.',
    content: `1. 위치정보 수집 목적
- 주변 꽃집 및 화원 검색
- 지역 기반 식물 축제·행사 추천
- 날씨·기후 기반 재배 팁 제공

2. 위치정보 수집 방법
- GPS, Wi-Fi, 기지국 정보를 통해 수집

3. 위치정보 보유 기간
- 서비스 이용 중에만 일시적으로 사용하며, 별도 저장하지 않습니다.`
  },
  {
    id: 'ai',
    title: 'AI 진단 서비스 이용약관',
    required: true,
    desc: 'AI 병충해 진단 결과는 참고용이며, 결과에 따른 조치의 책임은 본인에게 있습니다.',
    content: `1. AI 진단 서비스 안내
- 본 서비스는 식물 사진 및 증상 정보를 기반으로 AI가 병충해를 분석합니다.
- 분석 결과는 참고용이며, 정확한 진단은 전문가 상담을 권장합니다.

2. 면책 조항
- AI 진단 결과의 정확성을 100% 보장하지 않습니다.
- 진단 결과에 따른 조치의 책임은 이용자에게 있습니다.
- 식물 피해에 대한 배상 책임을 지지 않습니다.`
  },
  {
    id: 'pet',
    title: '반려동물 안전 정보 이용약관',
    required: true,
    desc: '반려동물 안전 식물 정보는 수의학 자료 기반 참고용이며, 이상 증상 시 즉시 수의사에게 문의하세요.',
    content: `1. 반려동물 안전 정보 안내
- 식물 독성 정보는 수의학 문헌을 기반으로 제공됩니다.
- 개별 반려동물에 따라 반응이 다를 수 있습니다.

2. 면책 조항
- 제공되는 정보는 참고용이며, 의학적 진단을 대체하지 않습니다.
- 반려동물에 이상 증상 발생 시 즉시 수의사에게 문의하세요.`
  },
  {
    id: 'marketing',
    title: '마케팅 정보 수신 동의',
    required: false,
    desc: '신규 식물 등록, 이벤트, 할인 정보 등을 이메일 및 앱 푸시로 받아보실 수 있습니다.',
    content: `1. 마케팅 정보 수신 안내
- 신규 식물 입고 알림
- 시즌 이벤트 및 프로모션 소식
- 할인 쿠폰 및 포인트 적립 안내
- 꽃담 뉴스레터

2. 수신 방법
- 이메일, 앱 푸시 알림

3. 수신 거부
- 마이페이지에서 언제든지 수신 거부할 수 있습니다.`
  },
];

export default function TermsAgreement() {
  const [agreements, setAgreements] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('flora-terms') || 'null') || {};
    } catch { return {}; }
  });
  const [expandedId, setExpandedId] = useState(null);

  const toggleAgreement = (id) => {
    const updated = { ...agreements, [id]: !agreements[id] };
    setAgreements(updated);
    localStorage.setItem('flora-terms', JSON.stringify(updated));
  };

  const requiredTerms = TERMS_DATA.filter(t => t.required);
  const allRequiredAgreed = requiredTerms.every(t => agreements[t.id]);

  return (
    <div className="terms-section">
      {!allRequiredAgreed && (
        <div className="terms-warning-banner">
          <span className="terms-warning-icon">ℹ️</span>
          <span>필수 약관 미동의 시 일부 서비스 이용이 제한될 수 있어요.</span>
        </div>
      )}

      <div className="terms-list">
        {TERMS_DATA.map(term => {
          const agreed = !!agreements[term.id];
          const expanded = expandedId === term.id;

          return (
            <div key={term.id} className={`terms-card${agreed ? ' agreed' : ''}`}>
              <div className="terms-card-header" onClick={() => toggleAgreement(term.id)}>
                <button className={`terms-check-btn${agreed ? ' checked' : ''}`}>
                  {agreed ? '✓' : '✕'}
                </button>
                <div className="terms-card-info">
                  <div className="terms-card-title-row">
                    <span className="terms-card-title">{term.title}</span>
                    <span className={`terms-badge ${term.required ? 'required' : 'optional'}`}>
                      {term.required ? '필수' : '선택'}
                    </span>
                  </div>
                  <p className="terms-card-desc">{term.desc}</p>
                </div>
                <button
                  className="terms-view-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedId(expanded ? null : term.id);
                  }}
                >
                  전문 보기 →
                </button>
              </div>

              {expanded && (
                <div className="terms-content-box">
                  <pre className="terms-content-text">{term.content}</pre>
                  <button
                    className="terms-close-content"
                    onClick={() => setExpandedId(null)}
                  >
                    접기
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
