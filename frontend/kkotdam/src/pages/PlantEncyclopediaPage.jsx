import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import './PlantEncyclopediaPage.css';
import rawPlants from '../data/plants.json';

const PAGE_SIZE = 20;

/* ── Wikimedia Commons 이미지 URL (1차 시도) ── */
function getWikiImageUrl(wikiName, size = 400) {
  if (!wikiName) return null;
  const encoded = encodeURIComponent(wikiName.replace(/ /g, '_'));
  // 확장자 없이 요청하면 Wikimedia가 실제 파일로 리다이렉트
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encoded}?width=${size}`;
}

/* ── 학명에서 속명+종명 추출 ── */
function parseSciName(sciName) {
  if (!sciName) return [];
  const cleaned = sciName.replace(/\(.*?\)/g, '').trim();
  const parts = cleaned.split(/\s+/);
  const results = [];
  if (parts.length >= 2) results.push(`${parts[0]} ${parts[1]}`);
  if (parts.length >= 1) results.push(parts[0]);
  return results;
}

/* ── JSON 데이터 → 컴포넌트 내부 포맷 변환 ── */
function mapPlant(p) {
  const seasonArr = Array.isArray(p.season) ? p.season : (p.season ? [p.season] : []);
  return {
    taxonId: p.id,
    korName: p.nameKo || '',
    engName: p.nameEn || '',
    scientificName: p.nameLatin || '',
    familyKorName: p.family || '',
    category: p.category || '',
    description: p.description || '',
    flowerLanguage: p.flowerLanguage || '',
    seasonArr,
    season: seasonArr.join('/'),
    petToxicity: p.petToxicity || 'safe',
    wikiImage: p.wikiImage || '',
    directImage: (p.image && p.image.includes('Special:FilePath')) ? p.image : '',   // Special:FilePath URL만 최우선 적용
  };
}

/* ── 계절 추천 배너 ── */
const getCurrentMonthPlants = () => {
  const month = new Date().getMonth() + 1;
  const map = {
    3: { season: '봄', plants: '히아신스, 수선화, 튤립' },
    4: { season: '봄', plants: '튤립, 진달래, 팬지' },
    5: { season: '봄/여름', plants: '장미, 카네이션, 작약' },
    6: { season: '여름', plants: '라벤더, 해바라기, 수국' },
    7: { season: '여름', plants: '해바라기, 거베라, 피튜니아' },
    8: { season: '여름/가을', plants: '무궁화, 글라디올러스, 백일홍' },
    9: { season: '가을', plants: '국화, 코스모스, 달리아' },
    10: { season: '가을', plants: '은행나무, 단풍나무, 코스모스' },
    11: { season: '겨울/봄', plants: '동백나무, 매화' },
    12: { season: '겨울', plants: '동백나무, 매화' },
    1:  { season: '겨울/봄', plants: '동백나무, 매화' },
    2:  { season: '봄', plants: '매화, 동백나무' },
  };
  return map[month] || { season: '봄', plants: '벚나무, 튤립' };
};

const CATEGORY_TABS = ['전체', '꽃', '나무', '허브', '다육식물', '관엽식물', '야생화', '수생식물', '즐겨찾기'];
const SEASON_TABS   = ['전체', '봄', '여름', '가을', '겨울'];

export default function PlantEncyclopediaPage() {
  /* ── 전체 식물 (한 번만 변환) ── */
  const allPlants = useMemo(() => rawPlants.map(mapPlant), []);

  /* ── 상태 ── */
  const [searchQuery,  setSearchQuery]  = useState('');
  const [page,         setPage]         = useState(1);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('전체');
  const [seasonFilter,   setSeasonFilter]   = useState('전체');
  const [favorites,    setFavorites]    = useState(() => {
    try { return JSON.parse(localStorage.getItem('flora-plant-favorites') || '[]'); }
    catch { return []; }
  });
  const [compareList, setCompareList] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [petSafeAgreed,  setPetSafeAgreed]  = useState(() =>
    localStorage.getItem('flora-pet-safety-agreed') === 'true'
  );
  const [showPetTerms, setShowPetTerms] = useState(false);
  const [petTermsChecked, setPetTermsChecked] = useState(false);
  const [imgCache,  setImgCache]  = useState({});  // taxonId → URL (Wikipedia 결과)
  const [wikiErrors, setWikiErrors] = useState({}); // taxonId → true (Wikimedia Commons 실패)
  const loadingSet = useRef(new Set());              // 중복 요청 방지

  /* ── 즐겨찾기 저장 ── */
  useEffect(() => {
    localStorage.setItem('flora-plant-favorites', JSON.stringify(favorites));
  }, [favorites]);

  /* ── 클라이언트 필터링 ── */
  const filtered = useMemo(() => {
    let items = allPlants;

    // 검색
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      items = items.filter(p =>
        [p.korName, p.engName, p.scientificName, p.familyKorName, p.category]
          .some(v => v && v.toLowerCase().includes(q))
      );
    }

    // 카테고리 필터
    if (categoryFilter === '즐겨찾기') {
      items = items.filter(p => favorites.includes(String(p.taxonId)));
    } else if (categoryFilter !== '전체') {
      items = items.filter(p => p.category === categoryFilter);
    }

    // 계절 필터
    if (seasonFilter !== '전체') {
      items = items.filter(p => p.seasonArr.includes(seasonFilter));
    }

    return items;
  }, [allPlants, searchQuery, categoryFilter, seasonFilter, favorites]);

  /* ── 페이지 초기화 (필터 변경 시) ── */
  useEffect(() => { setPage(1); }, [searchQuery, categoryFilter, seasonFilter]);

  /* ── 페이지네이션 ── */
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* ── 독성 배지 ── */
  const getSafetyBadge = (plant) => {
    if (plant?.petToxicity === 'toxic') {
      return { icon: '⚠', label: '독성', type: 'toxic' };
    }
    return { icon: '🌿', label: '안전', type: 'safe' };
  };

  /* ── 이벤트 핸들러 ── */
  const handleCardClick = (plant) => setSelectedPlant(plant);

  const toggleFavorite = (e, taxonId) => {
    e.stopPropagation();
    const id = String(taxonId);
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const toggleCompare = (e, plant) => {
    e.stopPropagation();
    if (compareList.some(p => p.taxonId === plant.taxonId)) {
      setCompareList(prev => prev.filter(p => p.taxonId !== plant.taxonId));
    } else {
      setCompareList(prev => prev.length < 2 ? [...prev, plant] : [prev[1], plant]);
    }
  };

  useEffect(() => {
    if (compareList.length === 2) setShowCompareModal(true);
  }, [compareList]);

  const handlePetDangerFilter = () => {
    if (!petSafeAgreed) setShowPetTerms(true);
    else setCategoryFilter('__pet_danger__');
  };

  const handlePetTermsAgree = () => {
    localStorage.setItem('flora-pet-safety-agreed', 'true');
    setPetSafeAgreed(true);
    setShowPetTerms(false);
    setPetTermsChecked(false);
    setCategoryFilter('__pet_danger__');
  };

  /* ── Wikipedia pageimages API로 이미지 로드 (1순위) ── */
  // loadingSet(ref)으로 중복 방지하므로 deps 불필요
  const loadWikiImage = useCallback(async (plant) => {
    const key = plant.taxonId;
    if (loadingSet.current.has(key)) return;
    loadingSet.current.add(key);

    // 검색어: 영문명 → 속명+종명 → 속명
    const terms = [];
    if (plant.engName) terms.push(plant.engName);
    parseSciName(plant.scientificName).forEach(t => terms.push(t));

    for (const term of terms) {
      try {
        const url =
          `https://en.wikipedia.org/w/api.php?action=query` +
          `&titles=${encodeURIComponent(term)}&prop=pageimages` +
          `&format=json&pithumbsize=500&origin=*`;
        const res  = await fetch(url);
        const data = await res.json();
        const page = Object.values(data.query?.pages || {})[0];
        if (page?.pageid > 0 && page?.thumbnail?.source) {
          setImgCache(prev => ({ ...prev, [key]: page.thumbnail.source }));
          return;
        }
      } catch (_) { /* 다음 검색어 */ }
    }
    setImgCache(prev => ({ ...prev, [key]: '__failed__' }));
  }, []); // eslint-disable-line

  /* ── 최종 이미지 URL 결정: directImage(최우선) → Wikipedia → Wikimedia Commons → null ── */
  const getImgSrc = useCallback((plant, size = 400) => {
    if (plant.directImage) return plant.directImage;            // JSON에 직접 지정된 URL 최우선
    const cached = imgCache[plant.taxonId];
    if (cached && cached !== '__failed__') return cached;       // Wikipedia 성공
    if (!wikiErrors[plant.taxonId] && plant.wikiImage)         // Wikipedia 로딩 중/실패시 Wikimedia 임시 표시
      return getWikiImageUrl(plant.wikiImage, size);
    return null;
  }, [imgCache, wikiErrors]);

  /* ── Wikimedia Commons 로드 실패 마킹 ── */
  const handleImgError = useCallback((plant) => {
    setWikiErrors(prev => ({ ...prev, [plant.taxonId]: true }));
  }, []);

  /* ── 반려동물 위험 필터 (독성 식물만) ── */
  const filteredWithPetDanger = useMemo(() => {
    if (categoryFilter === '__pet_danger__') {
      let items = allPlants;
      const q = searchQuery.trim().toLowerCase();
      if (q) items = items.filter(p =>
        [p.korName, p.engName, p.scientificName, p.familyKorName].some(v => v && v.toLowerCase().includes(q))
      );
      items = items.filter(p => p.petToxicity === 'toxic');
      if (seasonFilter !== '전체') items = items.filter(p => p.seasonArr.includes(seasonFilter));
      return items;
    }
    return filtered;
  }, [filtered, categoryFilter, allPlants, searchQuery, seasonFilter]);

  const displayList = filteredWithPetDanger;
  const totalPagesDisplay = Math.ceil(displayList.length / PAGE_SIZE);
  const paginatedDisplay  = displayList.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const currentSeasonInfo = getCurrentMonthPlants();
  const isPetDangerActive = categoryFilter === '__pet_danger__';

  /* ── 현재 페이지 식물 이미지 Wikipedia API로 선로드 ── */
  useEffect(() => {
    paginatedDisplay.forEach(p => loadWikiImage(p));
  }, [paginatedDisplay]); // eslint-disable-line

  useEffect(() => {
    if (selectedPlant) loadWikiImage(selectedPlant);
  }, [selectedPlant]); // eslint-disable-line

  return (
    <div className="encyclopedia-page">

      {/* ── 헤더 ── */}
      <div className="encyclopedia-header">
        <div className="encyclopedia-header-inner">
          <div className="encyclopedia-header-text">
            <span className="encyclopedia-badge">PLANT ENCYCLOPEDIA</span>
            <h1>식물 도감</h1>
            <p>총 {allPlants.length}종의 식물 정보</p>
          </div>
          <form
            onSubmit={e => { e.preventDefault(); setPage(1); }}
            className="encyclopedia-search"
          >
            <input
              type="text"
              placeholder="🔍 식물 이름, 학명으로 검색..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="encyclopedia-search-input"
            />
            <button type="submit" className="encyclopedia-search-btn">🔍 검색</button>
          </form>
        </div>
      </div>

      {/* ── 계절 추천 배너 ── */}
      <div className="enc-season-banner">
        <span>🌸 {currentSeasonInfo.season} 계절 추천 — {currentSeasonInfo.plants}</span>
      </div>

      {/* ── 카테고리 필터 ── */}
      <div className="enc-filter-tabs">
        {CATEGORY_TABS.map(cat => (
          <button
            key={cat}
            className={`enc-filter-btn ${categoryFilter === cat ? 'active' : ''}`}
            onClick={() => setCategoryFilter(cat)}
          >
            {cat}
          </button>
        ))}
        <button
          className={`enc-filter-btn pet-danger-btn ${isPetDangerActive ? 'active' : ''}`}
          onClick={handlePetDangerFilter}
        >
          ⚠️ 반려동물위험
        </button>
      </div>

      {/* ── 계절 필터 ── */}
      <div className="enc-filter-tabs" style={{ paddingTop: 0, borderTop: 'none' }}>
        {SEASON_TABS.map(s => (
          <button
            key={s}
            className={`enc-filter-btn ${seasonFilter === s ? 'active' : ''}`}
            onClick={() => setSeasonFilter(s)}
          >
            {s === '봄' ? '🌸 봄' : s === '여름' ? '☀️ 여름' : s === '가을' ? '🍂 가을' : s === '겨울' ? '❄️ 겨울' : s}
          </button>
        ))}
      </div>

      {/* ── 결과 수 ── */}
      <div className="encyclopedia-result-info">
        <strong>{displayList.length.toLocaleString()}</strong>종의 식물
        {searchQuery && <span> · "<strong>{searchQuery}</strong>" 검색 결과</span>}
        {categoryFilter !== '전체' && !isPetDangerActive && (
          <span> · {categoryFilter} 분류</span>
        )}
        {isPetDangerActive && <span> · ⚠️ 반려동물 위험 식물</span>}
        {seasonFilter !== '전체' && <span> · {seasonFilter} 계절</span>}
      </div>

      {/* ── 식물 그리드 ── */}
      {paginatedDisplay.length === 0 ? (
        <div className="encyclopedia-empty">
          <span>🌿</span>
          <p>검색 결과가 없습니다</p>
          <button onClick={() => { setSearchQuery(''); setCategoryFilter('전체'); setSeasonFilter('전체'); }}>
            전체 목록 보기
          </button>
        </div>
      ) : (
        <div className="encyclopedia-grid">
          {paginatedDisplay.map((plant, i) => {
            const imgUrl = getImgSrc(plant, 400);
            const safety = getSafetyBadge(plant);
            const isFavorited = favorites.includes(String(plant.taxonId));
            const isInCompare = compareList.some(p => p.taxonId === plant.taxonId);

            return (
              <div
                key={plant.taxonId || i}
                className={`plant-card ${isInCompare ? 'comparing' : ''}`}
                onClick={() => handleCardClick(plant)}
              >
                <div className="plant-card-img">
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={plant.korName}
                      loading="lazy"
                      onError={() => handleImgError(plant)}
                    />
                  ) : (
                    <div className="plant-card-img-placeholder">🌿</div>
                  )}
                  <div className="plant-card-badges">
                    <span className={`plant-name-badge ${safety.type}`}>
                      {safety.icon} {safety.label}
                    </span>
                  </div>
                  {plant.season && (
                    <div className="plant-card-season">{plant.season}</div>
                  )}
                  <div className="plant-card-actions">
                    <button
                      className={`plant-card-compare ${isInCompare ? 'active' : ''}`}
                      onClick={e => toggleCompare(e, plant)}
                      title="비교하기"
                    >⚖️</button>
                    <button
                      className={`plant-card-fav ${isFavorited ? 'active' : ''}`}
                      onClick={e => toggleFavorite(e, plant.taxonId)}
                      title={isFavorited ? '즐겨찾기 해제' : '즐겨찾기'}
                    >{isFavorited ? '❤️' : '🤍'}</button>
                  </div>
                </div>
                <div className="plant-card-body">
                  <h3 className="plant-card-kor">{plant.korName}</h3>
                  {plant.scientificName && (
                    <p className="plant-card-sci">{plant.scientificName}</p>
                  )}
                  <div className="plant-card-tags">
                    {plant.familyKorName && <span className="plant-tag">🌱 {plant.familyKorName}</span>}
                    {plant.category && <span className="plant-tag">📂 {plant.category}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 비교 플로팅 바 ── */}
      {compareList.length > 0 && (
        <div className="compare-bar">
          <div className="compare-bar-content">
            <span>⚖️ 식물 비교 ({compareList.length}/2)</span>
            <div className="compare-bar-plants">
              {compareList.map((p, idx) => (
                <div key={idx} className="compare-bar-item">
                  {p.korName}
                  <button onClick={e => { e.stopPropagation(); toggleCompare({ stopPropagation: () => {} }, p); }}>✕</button>
                </div>
              ))}
            </div>
          </div>
          <button
            className="compare-bar-btn"
            onClick={() => setShowCompareModal(true)}
            disabled={compareList.length < 2}
          >비교하기</button>
        </div>
      )}

      {/* ── 페이지네이션 ── */}
      {totalPagesDisplay > 1 && (
        <div className="encyclopedia-pagination">
          <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
            &lt; 이전
          </button>
          {Array.from({ length: Math.min(5, totalPagesDisplay) }, (_, i) => {
            const start = Math.max(1, Math.min(page - 2, totalPagesDisplay - 4));
            const p = start + i;
            return (
              <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>
                {p}
              </button>
            );
          })}
          <button className="page-btn" disabled={page >= totalPagesDisplay} onClick={() => setPage(p => Math.min(totalPagesDisplay, p + 1))}>
            다음 &gt;
          </button>
        </div>
      )}

      {/* ── 상세 모달 ── */}
      {selectedPlant && (
        <div className="modal-overlay" onClick={() => setSelectedPlant(null)}>
          <div className="plant-detail-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedPlant(null)}>✕</button>

            <div className="modal-inner">
              <div className="modal-img-wrap">
                {(() => {
                  const src = getImgSrc(selectedPlant, 640);
                  return src ? (
                    <img
                      src={src}
                      alt={selectedPlant.korName}
                      onError={() => handleImgError(selectedPlant)}
                    />
                  ) : (
                    <div className="modal-img-placeholder">🌿</div>
                  );
                })()}
              </div>

              <div className="modal-info">
                <div className="modal-header">
                  {(() => {
                    const safety = getSafetyBadge(selectedPlant);
                    return (
                      <span className={`modal-badge ${safety.type}`}>
                        {safety.icon} {safety.label}
                      </span>
                    );
                  })()}
                  <h2 className="modal-kor">{selectedPlant.korName}</h2>
                  {selectedPlant.scientificName && (
                    <p className="modal-sci">{selectedPlant.scientificName}</p>
                  )}
                  {selectedPlant.engName && (
                    <p className="modal-eng">{selectedPlant.engName}</p>
                  )}
                </div>

                <div className="modal-details">

                  {/* 꽃말 */}
                  {selectedPlant.flowerLanguage && (
                    <div className="modal-info-card flower-lang-card">
                      <span className="modal-info-icon">🌸</span>
                      <div>
                        <strong>꽃말</strong>
                        <p>{selectedPlant.flowerLanguage}</p>
                      </div>
                    </div>
                  )}

                  {/* 계절 */}
                  {selectedPlant.season && (
                    <div className="modal-info-card">
                      <span className="modal-info-icon">🗓️</span>
                      <div>
                        <strong>개화 계절</strong>
                        <p>{selectedPlant.season}</p>
                      </div>
                    </div>
                  )}

                  {/* 분류 정보 */}
                  <div className="modal-detail-grid">
                    {selectedPlant.familyKorName && (
                      <div className="modal-detail-item">
                        <strong>과명</strong>
                        <span>{selectedPlant.familyKorName}</span>
                      </div>
                    )}
                    {selectedPlant.category && (
                      <div className="modal-detail-item">
                        <strong>분류</strong>
                        <span>{selectedPlant.category}</span>
                      </div>
                    )}
                    {selectedPlant.scientificName && (
                      <div className="modal-detail-item">
                        <strong>학명</strong>
                        <span className="modal-latin">{selectedPlant.scientificName}</span>
                      </div>
                    )}
                    {selectedPlant.engName && (
                      <div className="modal-detail-item">
                        <strong>영명</strong>
                        <span>{selectedPlant.engName}</span>
                      </div>
                    )}
                  </div>

                  {/* 설명 */}
                  {selectedPlant.description && (
                    <div className="modal-info-card">
                      <span className="modal-info-icon">📖</span>
                      <div>
                        <strong>설명</strong>
                        <p>{selectedPlant.description}</p>
                      </div>
                    </div>
                  )}

                  {/* 반려동물 독성 */}
                  <div className={`modal-pet-badge ${selectedPlant.petToxicity === 'toxic' ? 'toxic' : 'safe'}`}>
                    {selectedPlant.petToxicity === 'toxic'
                      ? '⚠️ 반려동물에게 독성이 있습니다'
                      : '✅ 반려동물에게 안전합니다'}
                  </div>

                  <div className="modal-source">
                    📷 이미지 출처: Wikimedia Commons
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 비교 모달 ── */}
      {showCompareModal && compareList.length === 2 && (
        <div className="modal-overlay" onClick={() => setShowCompareModal(false)}>
          <div className="compare-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowCompareModal(false)}>✕</button>
            <div className="compare-modal-header"><h2>⚖️ 식물 비교</h2></div>
            <div className="compare-cards">
              {compareList.map((plant, idx) => {
                const safety = getSafetyBadge(plant);
                const imgUrl = getImgSrc(plant, 400);
                return (
                  <div key={idx} className="compare-card">
                    <div className="compare-card-img">
                      {imgUrl ? (
                        <img src={imgUrl} alt={plant.korName} onError={() => handleImgError(plant)} />
                      ) : (
                        <div className="plant-card-img-placeholder">🌿</div>
                      )}
                      <span className={`plant-name-badge ${safety.type}`}>
                        {safety.icon} {safety.label}
                      </span>
                    </div>
                    <div className="compare-card-info">
                      <h3>{plant.korName}</h3>
                      {plant.scientificName && <p className="sci">{plant.scientificName}</p>}
                      {plant.season && (
                        <div className="compare-row"><strong>계절</strong><span>{plant.season}</span></div>
                      )}
                      {plant.familyKorName && (
                        <div className="compare-row"><strong>과명</strong><span>{plant.familyKorName}</span></div>
                      )}
                      {plant.category && (
                        <div className="compare-row"><strong>분류</strong><span>{plant.category}</span></div>
                      )}
                      {plant.description && (
                        <div className="compare-row">
                          <strong>설명</strong>
                          <span>{plant.description.length > 80 ? plant.description.substring(0, 80) + '...' : plant.description}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── 반려동물 안전 약관 모달 ── */}
      {showPetTerms && (
        <div className="modal-overlay" onClick={() => setShowPetTerms(false)}>
          <div className="pet-terms-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowPetTerms(false)}>✕</button>
            <div className="pet-terms-content">
              <div className="pet-terms-icon">🐾</div>
              <h2>반려동물 위험 식물 정보 안내</h2>
              <p className="pet-terms-desc">반려동물에게 독성이 있는 식물 목록입니다. 이용 전 아래 내용을 확인해 주세요.</p>
              <div className="pet-terms-box">
                <p>본 독성 정보는 <strong>수의학 자료를 참고한 참고용 정보</strong>입니다.</p>
              </div>
              <ul className="pet-terms-list">
                <li>이 정보는 일반적인 가이드이며 개별 반려동물의 상태를 100% 반영하지 않습니다.</li>
                <li>반려동물이 식물을 섭취했을 경우 즉시 수의사의 진료를 받으시기 바랍니다.</li>
                <li>본 정보로 인한 피해에 대해 책임지지 않습니다.</li>
                <li>최신 정보는 동물 병원이나 전문가와 상담하세요.</li>
              </ul>
              <label className="pet-terms-agree">
                <input
                  type="checkbox"
                  checked={petTermsChecked}
                  onChange={e => setPetTermsChecked(e.target.checked)}
                />
                위 내용을 이해하고 동의합니다
              </label>
              <button
                className="pet-terms-confirm-btn"
                disabled={!petTermsChecked}
                onClick={handlePetTermsAgree}
              >
                동의하고 계속하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
