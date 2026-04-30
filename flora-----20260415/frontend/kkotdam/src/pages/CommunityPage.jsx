import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import './CommunityPage.css';

const CATEGORIES = [
  { value: '공지',       label: '공지',       icon: '📢', gps: false },
  { value: '일반게시판', label: '일반게시판', icon: '💬', gps: false },
  { value: '지역거래',   label: '지역거래',   icon: '🤝', gps: true  },
  { value: '지역축제',   label: '지역축제',   icon: '🌸', gps: false },
];

const CAT_COLORS = {
  '공지':       { bg: '#fdeaea', color: '#c04040' },
  '일반게시판': { bg: '#eef6ef', color: '#4a7c59' },
  '지역거래':   { bg: '#fff3e0', color: '#e65100' },
  '지역축제':   { bg: '#fce4ec', color: '#ad1457' },
};

const GPS_CATEGORIES = ['지역거래'];

export default function CommunityPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [notices, setNotices] = useState([]);
  const [category, setCategory] = useState('일반게시판');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category: '일반게시판' });
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsCoords, setGpsCoords] = useState(null); // { lat, lng, city } — 글쓰기 모달용
  // 탭 전환 시 자동으로 받은 GPS (배너 표시용)
  const [tabGps, setTabGps] = useState({ loading: false, city: null, lat: null, lng: null, error: null });
  // 지역축제: 관광공사/백엔드에서 가져오는 꽃 축제 목록
  const [festivals, setFestivals] = useState([]);
  const [festivalLoading, setFestivalLoading] = useState(false);
  const [selectedFestival, setSelectedFestival] = useState(null);

  const isAdmin = user?.role === 'ADMIN';

  // Nominatim 역지오코딩 → "xx시 xx구" 형식 추출
  const reverseGeocode = async (latitude, longitude) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=ko`
    );
    const data = await res.json();
    const addr = data.address || {};
    // 시/군 레벨
    const city = addr.city || addr.county || addr.town || addr.province || '';
    // 구/동 레벨
    const district = addr.city_district || addr.suburb || addr.quarter || addr.borough || '';
    const cityStr = district ? `${city} ${district}` : city;
    return { city: cityStr || '위치 확인됨', lat: latitude, lng: longitude };
  };

  // 지역거래 탭 진입 시 자동 GPS 요청
  useEffect(() => {
    if (category === '지역거래' && !tabGps.city && !tabGps.loading) {
      if (!navigator.geolocation) {
        setTabGps(g => ({ ...g, error: 'GPS를 지원하지 않는 브라우저입니다.' }));
        return;
      }
      setTabGps(g => ({ ...g, loading: true, error: null }));
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const result = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
            setTabGps({ loading: false, city: result.city, lat: result.lat, lng: result.lng, error: null });
            // 글쓰기 모달 GPS도 자동 세팅
            setGpsCoords(result);
          } catch {
            setTabGps(g => ({ ...g, loading: false, city: '위치 확인됨', lat: pos.coords.latitude, lng: pos.coords.longitude, error: null }));
            setGpsCoords({ city: '위치 확인됨', lat: pos.coords.latitude, lng: pos.coords.longitude });
          }
        },
        (err) => {
          setTabGps(g => ({ ...g, loading: false, error: '위치 권한을 허용해주세요.' }));
        },
        { timeout: 8000 }
      );
    }
  }, [category]);

  // GPS 위치 수동 재요청 (글쓰기 모달 내 버튼)
  const requestGps = () => {
    if (!navigator.geolocation) { alert('이 브라우저는 GPS를 지원하지 않습니다.'); return; }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const result = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          setGpsCoords(result);
          setTabGps({ loading: false, city: result.city, lat: result.lat, lng: result.lng, error: null });
        } catch {
          const fallback = { city: '위치 확인됨', lat: pos.coords.latitude, lng: pos.coords.longitude };
          setGpsCoords(fallback);
          setTabGps(g => ({ ...g, loading: false, ...fallback }));
        }
        setGpsLoading(false);
      },
      () => { alert('위치 권한을 허용해주세요.'); setGpsLoading(false); },
      { timeout: 8000 }
    );
  };

  useEffect(() => {
    if (category === '지역축제') {
      loadFestivals();
    } else {
      loadPosts();
    }
  }, [page, category]);
  useEffect(() => { loadNotices(); }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/community/posts', { params: { category, page, size: 20 } });
      const allPosts = res.data.content || [];
      if (category === '공지') {
        setPosts(allPosts);
      } else {
        setPosts(allPosts.filter(p => p.category !== '공지'));
      }
      setTotalPages(res.data.totalPages || 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // 관광공사(TourAPI) 기반 꽃 축제 데이터 로드
  const loadFestivals = async () => {
    setFestivalLoading(true);
    try {
      const res = await api.get('/api/festivals');
      setFestivals(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('축제 로드 실패:', e);
      setFestivals([]);
    } finally {
      setFestivalLoading(false);
    }
  };

  // 날짜 포맷 (yyyy.mm.dd)
  const fmtFestivalDate = (dt) => {
    if (!dt) return '';
    const d = new Date(dt);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  };

  // 축제 진행 상태 표시
  const festivalStatus = (f) => {
    if (!f.startDate || !f.endDate) return { label: '예정', color: '#888' };
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const start = new Date(f.startDate);
    const end   = new Date(f.endDate);
    if (today < start) return { label: '예정', color: '#1976d2' };
    if (today > end)   return { label: '종료', color: '#999' };
    return { label: '진행중', color: '#e91e63' };
  };

  const loadNotices = async () => {
    try {
      const res = await api.get('/api/community/posts', { params: { category: '공지', page: 0, size: 5 } });
      setNotices(res.data.content || []);
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    const needsGps = GPS_CATEGORIES.includes(form.category);
    if (needsGps && !gpsCoords) {
      alert('지역 게시판은 위치 정보가 필요합니다. GPS 위치 확인 버튼을 눌러주세요.');
      return;
    }
    try {
      const payload = {
        ...form,
        ...(needsGps && gpsCoords ? {
          latitude: gpsCoords.lat,
          longitude: gpsCoords.lng,
          locationCity: gpsCoords.city,
        } : {}),
      };
      await api.post('/api/community/posts', payload);
      setShowWriteModal(false);
      setForm({ title: '', content: '', category: '일반게시판' });
      setGpsCoords(null);
      loadPosts();
      if (form.category === '공지') loadNotices();
    } catch (e) {
      const msg = e.response?.data?.message || e.response?.data || e.message || '알 수 없는 오류';
      alert(`게시글 등록 실패: ${msg}`);
    }
  };

  const formatDate = (dt) => {
    if (!dt) return '';
    const d = new Date(dt);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }
    return `${String(d.getFullYear()).slice(2)}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`;
  };

  const isNew = (dt) => {
    if (!dt) return false;
    return (new Date() - new Date(dt)) < 86400000;
  };

  const writableCategories = isAdmin
    ? CATEGORIES.filter(c => c.value)
    : CATEGORIES.filter(c => c.value && c.value !== '공지');

  const needsGps = GPS_CATEGORIES.includes(form.category);

  return (
    <div className="community-page">
      {/* 게시판 헤더 */}
      <div className="dc-header">
        <div className="dc-header-inner">
          <div className="dc-brand">
            <span className="dc-brand-icon">🌿</span>
            <div>
              <h1 className="dc-name">꽃담 커뮤니티</h1>
              <p className="dc-desc">식물을 사랑하는 사람들의 커뮤니티</p>
            </div>
          </div>
        </div>
      </div>

      {/* 말머리 탭 - 디시 스타일 */}
      <div className="dc-tab-bar">
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            className={`dc-tab${category === cat.value ? ' active' : ''}`}
            onClick={() => { setCategory(cat.value); setPage(0); }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 지역거래 GPS 배너 */}
      {category === '지역거래' && (
        <div className="dc-gps-banner">
          {tabGps.loading ? (
            <span className="dc-gps-loading">📡 내 위치 확인 중...</span>
          ) : tabGps.error ? (
            <span className="dc-gps-error">⚠️ {tabGps.error}</span>
          ) : tabGps.city ? (
            <span className="dc-gps-ok">📍 {tabGps.city} 근처 거래글</span>
          ) : null}
        </div>
      )}

      {/* 지역축제: 관광공사 API + 네이버 지도 기반 꽃 축제 뷰 */}
      {category === '지역축제' && (
        <div className="festival-section">
          <div className="festival-header">
            <span className="festival-header-icon">🌸</span>
            <div>
              <h2 className="festival-header-title">전국 꽃 축제</h2>
              <p className="festival-header-desc">
                한국관광공사 TourAPI 기반 꽃 축제 정보와 네이버 지도 위치를 확인해보세요.
              </p>
            </div>
          </div>

          {festivalLoading ? (
            <div className="dc-loading">축제 정보를 불러오는 중...</div>
          ) : festivals.length === 0 ? (
            <div className="dc-empty">
              <span>🌱</span>
              <p>현재 등록된 축제가 없습니다.</p>
            </div>
          ) : (
            <div className="festival-grid">
              {festivals.map(f => {
                const status = festivalStatus(f);
                const hasCoords = f.latitude != null && f.longitude != null;
                const naverSearchUrl = hasCoords
                  ? `https://map.naver.com/p/search/${encodeURIComponent(f.address || f.name)}/place?c=${f.longitude},${f.latitude},15,0,0,0,dh`
                  : `https://map.naver.com/p/search/${encodeURIComponent(f.name)}`;

                return (
                  <div
                    key={f.id}
                    className="festival-card"
                    style={{ background: f.bgColor || '#f7f5f0' }}
                    onClick={() => setSelectedFestival(f)}
                  >
                    <div className="festival-card-top">
                      <span className="festival-card-emoji">{f.emoji || '🌸'}</span>
                      <span className="festival-card-status" style={{ background: status.color }}>
                        {status.label}
                      </span>
                    </div>
                    <div className="festival-card-body">
                      <h3 className="festival-card-name">{f.name}</h3>
                      <p className="festival-card-region">📍 {f.region}</p>
                      <p className="festival-card-date">
                        📅 {fmtFestivalDate(f.startDate)} ~ {fmtFestivalDate(f.endDate)}
                      </p>
                      {f.description && (
                        <p className="festival-card-desc">{f.description}</p>
                      )}
                    </div>
                    <div className="festival-card-actions">
                      <button
                        className="festival-map-btn"
                        onClick={(e) => { e.stopPropagation(); setSelectedFestival(f); }}
                      >
                        🗺 지도 보기
                      </button>
                      <a
                        href={naverSearchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="festival-link-btn"
                        onClick={(e) => e.stopPropagation()}
                      >
                        네이버지도 ↗
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 축제 상세 모달 (네이버 지도 임베드) */}
          {selectedFestival && (
            <div className="modal-overlay" onClick={() => setSelectedFestival(null)}>
              <div className="festival-modal" onClick={e => e.stopPropagation()}>
                <div className="festival-modal-header">
                  <h3>
                    {selectedFestival.emoji || '🌸'} {selectedFestival.name}
                  </h3>
                  <button className="festival-modal-close" onClick={() => setSelectedFestival(null)}>✕</button>
                </div>
                <div className="festival-modal-body">
                  <div className="festival-modal-info">
                    <p><strong>📍 개최 장소</strong> {selectedFestival.address || selectedFestival.region}</p>
                    <p>
                      <strong>📅 기간</strong>{' '}
                      {fmtFestivalDate(selectedFestival.startDate)} ~ {fmtFestivalDate(selectedFestival.endDate)}
                    </p>
                    {selectedFestival.description && (
                      <p className="festival-modal-desc">{selectedFestival.description}</p>
                    )}
                  </div>
                  <div className="festival-modal-map">
                    {selectedFestival.latitude && selectedFestival.longitude ? (
                      <iframe
                        title={`${selectedFestival.name} 네이버 지도`}
                        src={`https://map.naver.com/p/search/${encodeURIComponent(selectedFestival.address || selectedFestival.name)}?c=${selectedFestival.longitude},${selectedFestival.latitude},15,0,0,0,dh`}
                        width="100%"
                        height="380"
                        style={{ border: 0, borderRadius: 8 }}
                        loading="lazy"
                      />
                    ) : (
                      <div className="festival-no-map">위치 정보가 없습니다.</div>
                    )}
                  </div>
                </div>
                <div className="festival-modal-footer">
                  {selectedFestival.detailUrl && (
                    <a
                      href={selectedFestival.detailUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="festival-official-link"
                    >
                      공식 홈페이지 →
                    </a>
                  )}
                  <a
                    href={`https://map.naver.com/p/search/${encodeURIComponent(selectedFestival.address || selectedFestival.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="festival-naver-link"
                  >
                    네이버지도에서 보기 ↗
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 공지 고정 영역 */}
      {category !== '공지' && category !== '지역축제' && notices.length > 0 && (
        <div className="dc-notice-area">
          {notices.slice(0, 3).map(n => (
            <div
              key={n.id}
              className="dc-notice-row"
              onClick={() => navigate(`/community/${n.id}`)}
            >
              <span className="dc-notice-badge">공지</span>
              <span className="dc-notice-title">{n.title}</span>
              <span className="dc-notice-date">{formatDate(n.createdAt)}</span>
            </div>
          ))}
        </div>
      )}

      {/* 게시글 테이블 (지역축제 탭은 카드 UI로 대체) */}
      {category === '지역축제' ? null : loading ? (
        <div className="dc-loading">불러오는 중...</div>
      ) : posts.length === 0 ? (
        <div className="dc-empty">
          <span>💬</span>
          <p>아직 게시글이 없어요</p>
          {user && <button className="dc-empty-btn" onClick={() => setShowWriteModal(true)}>첫 글 작성하기</button>}
        </div>
      ) : (
        <div className="dc-table">
          <div className="dc-table-head">
            <span className="dc-th dc-th-no">번호</span>
            <span className="dc-th dc-th-cat">말머리</span>
            <span className="dc-th dc-th-title">제목</span>
            <span className="dc-th dc-th-author">글쓴이</span>
            <span className="dc-th dc-th-date">작성일</span>
            <span className="dc-th dc-th-views">조회</span>
            <span className="dc-th dc-th-likes">추천</span>
          </div>
          {posts.map(post => {
            const catStyle = CAT_COLORS[post.category] || { bg: '#f5f2ed', color: '#7a7a7a' };
            return (
              <div
                key={post.id}
                className={`dc-table-row${post.category === '공지' ? ' dc-row-notice' : ''}`}
                onClick={() => navigate(`/community/${post.id}`)}
              >
                <span className="dc-td dc-td-no">
                  {post.category === '공지' ? '공지' : post.id}
                </span>
                <span className="dc-td dc-td-cat">
                  <span className="dc-cat-chip" style={{ background: catStyle.bg, color: catStyle.color }}>
                    {post.category || '자유'}
                  </span>
                </span>
                <span className="dc-td dc-td-title">
                  <span className="dc-title-text">{post.title}</span>
                  {post.commentCount > 0 && <span className="dc-comment-cnt">[{post.commentCount}]</span>}
                  {isNew(post.createdAt) && <span className="dc-new">N</span>}
                  {post.locationCity && <span className="dc-location">📍{post.locationCity}</span>}
                </span>
                <span className="dc-td dc-td-author">
                  <span className="dc-author-nick">{post.authorNickname}</span>
                </span>
                <span className="dc-td dc-td-date">{formatDate(post.createdAt)}</span>
                <span className="dc-td dc-td-views">{post.viewCount}</span>
                <span className="dc-td dc-td-likes">{post.likeCount > 0 ? post.likeCount : '-'}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* 페이지네이션 */}
      {category !== '지역축제' && totalPages > 1 && (
        <div className="dc-pagination">
          <button className="dc-pg-btn" disabled={page === 0} onClick={() => setPage(p => p - 1)}>‹ 이전</button>
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
            const startPage = Math.max(0, Math.min(page - 4, totalPages - 10));
            const pageNum = startPage + i;
            if (pageNum >= totalPages) return null;
            return (
              <button key={pageNum} className={`dc-pg-num${pageNum === page ? ' active' : ''}`} onClick={() => setPage(pageNum)}>
                {pageNum + 1}
              </button>
            );
          })}
          <button className="dc-pg-btn" disabled={page === totalPages - 1} onClick={() => setPage(p => p + 1)}>다음 ›</button>
        </div>
      )}

      {/* 하단 글쓰기 + 검색 (지역축제는 글쓰기 없음 - 관광공사 API 기반) */}
      <div className="dc-bottom-bar">
        {user && category !== '지역축제' && (
          <button className="dc-write-btn-bottom" onClick={() => {
            // 지역거래 탭에서 글쓰기 열면 GPS 자동 세팅
            if (category === '지역거래' && tabGps.city) {
              setGpsCoords({ city: tabGps.city, lat: tabGps.lat, lng: tabGps.lng });
              setForm(p => ({ ...p, category: '지역거래' }));
            } else {
              setForm(p => ({ ...p, category: category || '일반게시판' }));
            }
            setShowWriteModal(true);
          }}>
            ✏️ 글쓰기
          </button>
        )}
      </div>

      {/* 글쓰기 모달 */}
      {showWriteModal && (
        <div className="modal-overlay" onClick={() => setShowWriteModal(false)}>
          <div className="write-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>글쓰기</h3>
              <button onClick={() => setShowWriteModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="write-form">
              <div className="write-top-row">
                <div className="write-form-row write-cat-row">
                  <label className="write-label">말머리</label>
                  <div className="write-cat-btns">
                    {writableCategories.map(c => (
                      <button
                        key={c.value}
                        type="button"
                        className={`write-cat-btn${form.category === c.value ? ' active' : ''}`}
                        onClick={() => setForm(p => ({...p, category: c.value}))}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {/* GPS 위치 (지역거래/지역축제) */}
              {needsGps && (
                <div className="write-form-row write-gps-row">
                  <label className="write-label">📍 내 위치</label>
                  <div className="write-gps-area">
                    {gpsCoords ? (
                      <span className="write-gps-ok">✅ {gpsCoords.city} ({gpsCoords.lat.toFixed(4)}, {gpsCoords.lng.toFixed(4)})</span>
                    ) : (
                      <span className="write-gps-none">위치 정보 없음</span>
                    )}
                    <button type="button" className="write-gps-btn" onClick={requestGps} disabled={gpsLoading}>
                      {gpsLoading ? '위치 확인 중...' : 'GPS 위치 확인'}
                    </button>
                  </div>
                  <p className="write-gps-hint">지역거래/축제 게시판은 위치 정보가 필요합니다.</p>
                </div>
              )}
              <div className="write-form-row">
                <input
                  type="text"
                  placeholder="제목을 입력해 주세요."
                  value={form.title}
                  onChange={e => setForm(p => ({...p, title: e.target.value}))}
                  required
                  className="write-input"
                />
              </div>
              <div className="write-form-row">
                <textarea
                  placeholder="내용을 입력하세요..."
                  value={form.content}
                  onChange={e => setForm(p => ({...p, content: e.target.value}))}
                  required
                  className="write-textarea"
                  rows={12}
                />
              </div>
              <div className="write-actions">
                <button type="button" onClick={() => setShowWriteModal(false)} className="write-cancel">취소</button>
                <button type="submit" className="write-submit">등록</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
