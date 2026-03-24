import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './LocalFestivalPage.css';

const CATEGORIES = ['전체', '꽃축제', '수목원', '마켓', '체험'];

const CAT_COLOR = {
  '꽃축제': { bg: '#ffebee', color: '#c62828' },
  '수목원':  { bg: '#e8f5e9', color: '#2e7d32' },
  '마켓':    { bg: '#fff3e0', color: '#e65100' },
  '체험':    { bg: '#e3f2fd', color: '#1565c0' },
};

const MOCK_FESTIVALS = [
  {
    id: 201, name: '고양 국제 꽃박람회', emoji: '🌸', category: '꽃축제',
    description: '경기 북부 최대 규모의 꽃 축제입니다. 튤립, 장미, 수국 등 100여 종의 꽃이 전시되며, 희귀 식물 판매 부스와 플로리스트 체험 프로그램도 운영해요.',
    location: '경기 고양시 일산서구', lat: 37.6584, lng: 126.7756,
    startDate: '2026-04-25', endDate: '2026-05-10',
    organizer: '고양시', tags: ['봄꽃', '가족', '체험'], bgColor: '#fce4ec',
  },
  {
    id: 202, name: '서울 식물원 봄꽃 페스타', emoji: '🌿', category: '수목원',
    description: '마곡 서울식물원에서 열리는 봄꽃 페스타입니다. 온실 특별 전시와 야외 정원 프로그램을 즐길 수 있어요. 주말마다 원예 워크숍도 진행됩니다.',
    location: '서울 강서구 마곡동', lat: 37.5707, lng: 126.8269,
    startDate: '2026-04-05', endDate: '2026-04-27',
    organizer: '서울시', tags: ['온실', '워크숍', '봄'], bgColor: '#e8f5e9',
  },
  {
    id: 203, name: '함평 나비·곤충 축제', emoji: '🦋', category: '체험',
    description: '전남 함평에서 열리는 생태 축제입니다. 나비와 식물이 공존하는 생태 정원을 관람하고 자연 관찰 체험 프로그램에 참여할 수 있어요.',
    location: '전남 함평군', lat: 35.0661, lng: 126.5169,
    startDate: '2026-05-01', endDate: '2026-05-10',
    organizer: '함평군', tags: ['나비', '생태', '체험'], bgColor: '#f3e5f5',
  },
  {
    id: 204, name: '보성 녹차밭 봄 축제', emoji: '🍵', category: '체험',
    description: '싱그러운 녹차밭에서 즐기는 봄 축제입니다. 차 시음, 녹차 비누 만들기, 트레킹 코스 등 다양한 체험 프로그램이 운영됩니다.',
    location: '전남 보성군', lat: 34.7716, lng: 127.0804,
    startDate: '2026-04-20', endDate: '2026-05-04',
    organizer: '보성군', tags: ['녹차', '트레킹', '체험'], bgColor: '#e8f5e9',
  },
  {
    id: 205, name: '과천 벚꽃 식물 플리마켓', emoji: '🌺', category: '마켓',
    description: '과천 서울랜드 인근 벚꽃길에서 열리는 식물·원예 플리마켓입니다. 개인 셀러들의 희귀 식물, 수제 화분, 씨앗 패킷 등을 만나볼 수 있어요!',
    location: '경기 과천시', lat: 37.4275, lng: 126.9887,
    startDate: '2026-04-05', endDate: '2026-04-06',
    organizer: '과천시', tags: ['플리마켓', '벚꽃', '식물'], bgColor: '#fff3e0',
  },
  {
    id: 206, name: '용인 허브빌리지 허브 축제', emoji: '🌿', category: '체험',
    description: '허브빌리지에서 열리는 허브 테마 축제입니다. 라벤더, 로즈마리, 민트 등 다양한 허브를 직접 만져보고 허브오일 만들기 체험도 가능해요.',
    location: '경기 용인시', lat: 37.2411, lng: 127.1775,
    startDate: '2026-05-15', endDate: '2026-06-01',
    organizer: '허브빌리지', tags: ['허브', 'DIY', '아로마'], bgColor: '#e8f5e9',
  },
  {
    id: 207, name: '태안 세계 튤립 축제', emoji: '🌷', category: '꽃축제',
    description: '서해안 최대 규모 튤립 축제입니다! 300만 송이의 튤립 물결과 함께 야간 조명 이벤트, 인생 사진 포토존 등이 준비되어 있어요.',
    location: '충남 태안군', lat: 36.7455, lng: 126.2982,
    startDate: '2026-04-10', endDate: '2026-04-26',
    organizer: '태안군', tags: ['튤립', '야간', '포토존'], bgColor: '#fce4ec',
  },
  {
    id: 208, name: '서울 성수 식물 마켓위크', emoji: '🛍️', category: '마켓',
    description: '성수동 팝업 단지에서 열리는 식물 마켓 위크입니다. 국내외 인디 식물 브랜드와 희귀 식물 딜러들이 한 자리에 모여요.',
    location: '서울 성동구 성수동', lat: 37.5445, lng: 127.0558,
    startDate: '2026-05-22', endDate: '2026-05-25',
    organizer: '성수 팝업파크', tags: ['팝업', '인디브랜드', '희귀식물'], bgColor: '#fff3e0',
  },
];

function haversine(la1, lo1, la2, lo2) {
  const R = 6371;
  const dL = (la2 - la1) * Math.PI / 180;
  const dO = (lo2 - lo1) * Math.PI / 180;
  const a = Math.sin(dL/2)**2 + Math.cos(la1*Math.PI/180)*Math.cos(la2*Math.PI/180)*Math.sin(dO/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function formatDist(d) {
  return d < 1 ? `${Math.round(d*1000)}m` : `${d.toFixed(1)}km`;
}

function getStatus(startDate, endDate) {
  const today = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (today < start) return { label: '예정', cls: 'fest-upcoming' };
  if (today > end)   return { label: '종료', cls: 'fest-ended' };
  return { label: '진행중', cls: 'fest-ongoing' };
}

function daysLeft(endDate) {
  const diff = Math.ceil((new Date(endDate) - new Date()) / (1000*60*60*24));
  return diff;
}

export default function LocalFestivalPage() {
  const [festivals, setFestivals] = useState([]);
  const [category, setCategory] = useState('전체');
  const [loading, setLoading] = useState(true);
  const [userLoc, setUserLoc] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => { loadFestivals(); }, []);

  const applyDistance = (data, loc) => {
    if (!loc) return data;
    return data
      .map(f => ({ ...f, distance: haversine(loc.lat, loc.lng, f.lat, f.lng) }))
      .sort((a, b) => a.distance - b.distance);
  };

  const loadFestivals = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/festivals');
      setFestivals(applyDistance(res.data || [], userLoc));
    } catch {
      setFestivals(applyDistance(MOCK_FESTIVALS, userLoc));
    } finally {
      setLoading(false);
    }
  };

  const requestLocation = () => {
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLoc(loc);
        setLocLoading(false);
        setFestivals(prev => applyDistance(prev, loc));
      },
      () => {
        setLocLoading(false);
        alert('위치 권한이 거부되었습니다. 브라우저 설정에서 허용해주세요.');
      }
    );
  };

  const filtered = festivals.filter(f => category === '전체' || f.category === category);

  return (
    <div className="fest-page">
      <div className="fest-header">
        <div>
          <h1>지역축제 🎪</h1>
          <p>내 주변 식물·꽃 관련 축제를 한눈에 모아봐요</p>
        </div>
        <button
          className={`fest-loc-btn ${userLoc ? 'active' : ''}`}
          onClick={requestLocation}
          disabled={locLoading}
        >
          {locLoading ? <><span className="fest-spinner"/>위치 불러오는 중...</> : userLoc ? <>📍 위치 설정됨</> : <>📍 내 위치 설정</>}
        </button>
      </div>

      {/* 카테고리 탭 */}
      <div className="fest-cat-tabs">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`fest-cat-tab ${category === cat ? 'active' : ''}`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {userLoc && (
        <div className="fest-loc-note">
          📍 현재 위치 기준 가까운 순으로 정렬 중
        </div>
      )}

      {/* 축제 목록 */}
      {loading ? (
        <div className="fest-loading">불러오는 중...</div>
      ) : filtered.length === 0 ? (
        <div className="fest-empty">
          <span>🎪</span>
          <p>해당 카테고리 축제가 없어요</p>
        </div>
      ) : (
        <div className="fest-list">
          {filtered.map(f => {
            const status = getStatus(f.startDate, f.endDate);
            const catColor = CAT_COLOR[f.category] || { bg: '#f5f5f5', color: '#666' };
            const left = daysLeft(f.endDate);

            return (
              <div key={f.id} className="fest-card" onClick={() => setSelected(f)}>
                {/* 이모지 박스 */}
                <div className="fest-emoji-box" style={{ background: f.bgColor || '#e8f5e9' }}>
                  {f.emoji}
                </div>

                <div className="fest-card-body">
                  <div className="fest-card-top">
                    <span className={`fest-status ${status.cls}`}>{status.label}</span>
                    <span
                      className="fest-cat-badge"
                      style={{ background: catColor.bg, color: catColor.color }}
                    >
                      {f.category}
                    </span>
                    {status.label === '진행중' && left >= 0 && (
                      <span className="fest-dday">D-{left}</span>
                    )}
                  </div>

                  <h3 className="fest-name">{f.name}</h3>

                  <div className="fest-meta">
                    <span>📍 {f.location}</span>
                    {userLoc && f.distance != null && (
                      <span className="fest-dist">· {formatDist(f.distance)}</span>
                    )}
                  </div>

                  <div className="fest-date-row">
                    <span className="fest-date-badge">
                      📅 {f.startDate} ~ {f.endDate}
                    </span>
                  </div>

                  <div className="fest-tags">
                    {(f.tags || []).map(t => (
                      <span key={t} className="fest-tag"># {t}</span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 상세 모달 ── */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="fest-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>축제 상세</h3>
              <button onClick={() => setSelected(null)}>&times;</button>
            </div>

            <div className="fest-detail-body">
              {/* 히어로 */}
              <div
                className="fest-detail-hero"
                style={{ background: selected.bgColor || '#e8f5e9' }}
              >
                {selected.emoji}
              </div>

              <div className="fest-detail-content">
                {/* 상태 배지 */}
                <div className="fest-detail-badges">
                  {(() => {
                    const st = getStatus(selected.startDate, selected.endDate);
                    const cc = CAT_COLOR[selected.category] || { bg: '#f5f5f5', color: '#666' };
                    const left = daysLeft(selected.endDate);
                    return (
                      <>
                        <span className={`fest-status ${st.cls}`}>{st.label}</span>
                        <span className="fest-cat-badge" style={{ background: cc.bg, color: cc.color }}>
                          {selected.category}
                        </span>
                        {st.label === '진행중' && left >= 0 && (
                          <span className="fest-dday">D-{left}</span>
                        )}
                      </>
                    );
                  })()}
                </div>

                <h2 className="fest-detail-title">{selected.name}</h2>

                {/* 기본 정보 */}
                <div className="fest-detail-info">
                  <div className="fest-info-row">
                    <span className="fest-info-icon">📍</span>
                    <span>
                      {selected.location}
                      {userLoc && selected.distance != null && (
                        <span className="fest-dist"> ({formatDist(selected.distance)})</span>
                      )}
                    </span>
                  </div>
                  <div className="fest-info-row">
                    <span className="fest-info-icon">📅</span>
                    <span>{selected.startDate} ~ {selected.endDate}</span>
                  </div>
                  <div className="fest-info-row">
                    <span className="fest-info-icon">🏛️</span>
                    <span>{selected.organizer} 주최</span>
                  </div>
                </div>

                {/* 설명 */}
                <p className="fest-detail-desc">{selected.description}</p>

                {/* 태그 */}
                <div className="fest-tags" style={{ marginBottom: 20 }}>
                  {(selected.tags || []).map(t => (
                    <span key={t} className="fest-tag"># {t}</span>
                  ))}
                </div>

                <button
                  className="fest-map-btn"
                  onClick={() => alert('지도 연동 기능은 준비 중이에요 🗺️')}
                >
                  🗺️ 지도에서 보기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
