import { useState } from 'react';
import './NoticePage.css';

const NOTICES = [
  {
    id: 1,
    category: '서비스',
    title: '꽃담 서비스 오픈 안내',
    date: '2025.03.01',
    pinned: true,
    content: `안녕하세요, 꽃담입니다.

꽃담 서비스가 정식 오픈되었습니다!

식물 마켓, 식물 도감, 커뮤니티, 식물 캘린더 등 다양한 기능을 이용해 보세요.
앞으로도 더 나은 서비스로 찾아뵙겠습니다.

감사합니다.`
  },
  {
    id: 2,
    category: '이벤트',
    title: '봄맞이 정기구독 20% 할인 이벤트',
    date: '2025.03.15',
    pinned: true,
    content: `봄을 맞아 정기구독 전 플랜 20% 할인 이벤트를 진행합니다!

기간: 2025.03.15 ~ 2025.04.15
대상: 신규 구독자
혜택: 첫 달 20% 할인 + 무료 화병 증정

정기구독 페이지에서 확인해 보세요!`
  },
  {
    id: 3,
    category: '업데이트',
    title: 'AI 식물 진단 기능 업데이트',
    date: '2025.03.10',
    pinned: false,
    content: `AI 식물 진단 기능이 업데이트되었습니다.

주요 변경사항:
- 병충해 진단 정확도 향상
- 새로운 식물 종 50종 추가 지원
- 진단 결과 상세 리포트 제공

마이페이지 > 식물 캘린더에서 AI 기능을 이용해 보세요.`
  },
  {
    id: 4,
    category: '서비스',
    title: '판매자 회원 가입 기능 오픈',
    date: '2025.03.20',
    pinned: false,
    content: `판매자 계정으로 가입하여 꽃담 마켓에서 상품을 판매할 수 있습니다.

회원가입 시 '판매자' 유형을 선택하고, 사업자 정보를 입력해 주세요.

문의사항은 커뮤니티 게시판을 이용해 주세요.`
  },
  {
    id: 5,
    category: '점검',
    title: '서버 점검 안내 (3/25 02:00~06:00)',
    date: '2025.03.22',
    pinned: false,
    content: `서비스 안정화를 위한 서버 점검이 예정되어 있습니다.

일시: 2025년 3월 25일 (화) 02:00 ~ 06:00
영향: 전체 서비스 이용 불가

점검 시간 동안 서비스 이용이 어려운 점 양해 부탁드립니다.`
  },
  {
    id: 6,
    category: '이벤트',
    title: '식물 사진 콘테스트 개최',
    date: '2025.03.18',
    pinned: false,
    content: `나의 식물 자랑! 사진 콘테스트를 개최합니다.

참여 방법: 커뮤니티에 #식물자랑 태그와 함께 사진 게시
기간: 2025.03.18 ~ 2025.04.18
상품: 1등 프리미엄 구독 3개월, 2등 5만 포인트, 3등 2만 포인트

많은 참여 바랍니다!`
  },
];

const CATEGORIES = ['전체', '서비스', '이벤트', '업데이트', '점검'];

const CATEGORY_COLORS = {
  '서비스': '#4a7c59',
  '이벤트': '#c8956a',
  '업데이트': '#5b9bd5',
  '점검': '#d97070',
};

export default function NoticePage() {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [expandedId, setExpandedId] = useState(null);

  const filtered = selectedCategory === '전체'
    ? NOTICES
    : NOTICES.filter(n => n.category === selectedCategory);

  const sorted = [...filtered].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.date) - new Date(a.date);
  });

  return (
    <div className="notice-page">
      <div className="notice-header">
        <h1 className="notice-title">📢 공지사항</h1>
        <p className="notice-subtitle">꽃담의 새로운 소식과 업데이트를 확인하세요.</p>
      </div>

      <div className="notice-category-bar">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`notice-cat-btn${selectedCategory === cat ? ' active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="notice-list">
        {sorted.map(notice => {
          const expanded = expandedId === notice.id;
          const catColor = CATEGORY_COLORS[notice.category] || '#888';
          return (
            <div
              key={notice.id}
              className={`notice-card${notice.pinned ? ' pinned' : ''}${expanded ? ' expanded' : ''}`}
            >
              <div
                className="notice-card-header"
                onClick={() => setExpandedId(expanded ? null : notice.id)}
              >
                {notice.pinned && <span className="notice-pin">📌</span>}
                <span className="notice-cat-chip" style={{ background: catColor + '1a', color: catColor, borderColor: catColor + '44' }}>
                  {notice.category}
                </span>
                <span className="notice-card-title">{notice.title}</span>
                <span className="notice-card-date">{notice.date}</span>
                <span className={`notice-arrow${expanded ? ' open' : ''}`}>▾</span>
              </div>

              {expanded && (
                <div className="notice-card-body">
                  <pre className="notice-card-content">{notice.content}</pre>
                </div>
              )}
            </div>
          );
        })}

        {sorted.length === 0 && (
          <div className="notice-empty">해당 카테고리의 공지사항이 없습니다.</div>
        )}
      </div>
    </div>
  );
}
