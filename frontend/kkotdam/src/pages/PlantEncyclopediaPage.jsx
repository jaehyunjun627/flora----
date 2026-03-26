import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import './PlantEncyclopediaPage.css';

const PAGE_SIZE = 20;
const PIXABAY_KEY = '3956381-8a0f2a1805bed555538d1bfe8';

// Get current month and recommend plants for the season
const getCurrentMonthPlants = () => {
  const month = new Date().getMonth() + 1;
  const seasonMap = {
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
    1: { season: '겨울/봄', plants: '동백나무, 매화' },
    2: { season: '봄', plants: '매화, 동백나무' },
  };
  return seasonMap[month] || { season: '봄', plants: '벚나무, 튤립' };
};

export default function PlantEncyclopediaPage() {
  const [plants, setPlants]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage]               = useState(1);
  const [totalCount, setTotalCount]   = useState(0);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData]   = useState(null);
  const [pixabayImages, setPixabayImages] = useState({});
  const [seasonFilter, setSeasonFilter] = useState('전체');
  const [favorites, setFavorites]     = useState(() => {
    const saved = localStorage.getItem('flora-plant-favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [compareList, setCompareList] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [petSafeAgreed, setPetSafeAgreed] = useState(() => {
    return localStorage.getItem('flora-pet-safety-agreed') === 'true';
  });
  const [showPetTerms, setShowPetTerms] = useState(false);
  const [petTermsChecked, setPetTermsChecked] = useState(false);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('flora-plant-favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Load plants on page or filter change
  useEffect(() => {
    loadPlants(searchQuery, page, seasonFilter);
  }, [page, seasonFilter]);

  const loadPlants = async (q, pg, filter) => {
    setLoading(true);
    try {
      const params = { page: pg, numOfRows: PAGE_SIZE };
      if (q && q.trim()) params.searchWord = q.trim();

      const res = await api.get('/api/external/plants', { params });
      let items = res.data.items || [];
      setTotalCount(res.data.totalCount || 0);

      // Apply season filter
      items = filterByCategory(items, filter);
      setPlants(items);

      // Load images — 같은 한글명이라도 학명이 다르면 다른 이미지
      const seen = new Set();
      items.forEach(plant => {
        const key = plant.korName || plant.scientificName;
        if (key && !seen.has(key)) {
          seen.add(key);
          loadPlantImage(key, plant.engName, plant.scientificName);
        }
      });
    } catch (e) {
      console.error('식물 목록 로딩 실패:', e);
      setPlants([]);
    } finally {
      setLoading(false);
    }
  };

  const filterByCategory = (items, category) => {
    if (category === '전체') return items;
    if (category === '즐겨찾기') {
      return items.filter(p => favorites.includes(String(p.taxonId)));
    }
    if (category === '반려동물안전') {
      return items.filter(p => p.isToxicToPets === false);
    }
    // Season filtering
    const seasonMap = {
      '봄': ['봄', '봄/여름', '겨울/봄'],
      '여름': ['여름', '봄/여름', '여름/가을'],
      '가을': ['가을', '여름/가을'],
      '겨울': ['겨울', '겨울/봄'],
    };
    const targetSeasons = seasonMap[category] || [];
    return items.filter(p => {
      if (!p.season) return false;
      return targetSeasons.some(s => p.season.includes(s));
    });
  };

  // 학명에서 검색 가능한 이름 추출 (변종/명명자 정보 제거)
  const getSearchableNames = (sciName) => {
    if (!sciName) return [];
    // "Pseudostellaria palibiniana (Takeda) Ohwi var. gag..." → ["Pseudostellaria palibiniana", "Pseudostellaria"]
    const cleaned = sciName.replace(/\(.*?\)/g, '').trim(); // 명명자 괄호 제거
    const parts = cleaned.split(/\s+/);
    const names = [];
    if (parts.length >= 2) names.push(`${parts[0]} ${parts[1]}`); // 속명 + 종명
    if (parts.length >= 1) names.push(parts[0]); // 속명만
    return names;
  };

  const loadPlantImage = useCallback(async (korName, engName, sciName) => {
    if (!korName || pixabayImages[korName]) return;

    const searchNames = getSearchableNames(sciName);

    // 1순위: Wikipedia API — 속명+종명 → 속명 순서로 시도
    for (const name of searchNames) {
      try {
        const wikiTitle = encodeURIComponent(name.trim());
        const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${wikiTitle}&prop=pageimages&format=json&pithumbsize=500&origin=*`;
        const res = await fetch(wikiUrl);
        const data = await res.json();
        const pages = data.query?.pages;
        if (pages) {
          const page = Object.values(pages)[0];
          if (page?.thumbnail?.source) {
            setPixabayImages(prev => ({ ...prev, [korName]: page.thumbnail.source }));
            return;
          }
        }
      } catch (e) { /* 다음 시도 */ }
    }

    // 2순위: Pixabay — 속명 기반 검색
    try {
      let searchTerm = '';
      if (engName && engName.trim()) {
        searchTerm = engName.trim();
      } else if (searchNames.length > 0) {
        searchTerm = searchNames[0]; // 속명+종명
      } else {
        searchTerm = korName;
      }
      const query = encodeURIComponent(`${searchTerm} flower plant`);
      const url = `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${query}&image_type=photo&per_page=5&safesearch=true&category=nature`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.hits?.length > 0) {
        setPixabayImages(prev => ({ ...prev, [korName]: data.hits[0].webformatURL }));
      }
    } catch (e) {
      console.warn('이미지 로딩 실패:', korName, e.message);
    }
  }, [pixabayImages]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadPlants(searchQuery, 1, seasonFilter);
  };

  const handleCardClick = async (plant) => {
    setSelectedPlant(plant);
    setDetailData(null);
    const name = plant.korName;
    if (name && !pixabayImages[name]) {
      loadPlantImage(name, plant.engName, plant.scientificName);
    }
    if (plant.taxonId) {
      setDetailLoading(true);
      try {
        const res = await api.get(`/api/external/plants/${plant.taxonId}`);
        // 에러 응답이 아닌 경우에만 상세 데이터 설정 (목록 데이터와 병합)
        if (res.data && !res.data.error && res.data.korName) {
          setDetailData({ ...plant, ...res.data });
        } else {
          // 상세 API 실패해도 목록 데이터는 유지
          setDetailData(plant);
        }
      } catch (e) {
        console.error('상세 정보 조회 실패', e);
        setDetailData(plant); // 목록 데이터로 표시
      } finally {
        setDetailLoading(false);
      }
    }
  };

  const toggleFavorite = (e, taxonId) => {
    e.stopPropagation();
    const id = String(taxonId);
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    );
  };

  const toggleCompare = (e, plant) => {
    e.stopPropagation();
    if (compareList.some(p => p.taxonId === plant.taxonId)) {
      setCompareList(prev => prev.filter(p => p.taxonId !== plant.taxonId));
    } else {
      if (compareList.length < 2) {
        setCompareList(prev => [...prev, plant]);
      } else {
        setCompareList([compareList[1], plant]);
      }
    }
  };

  useEffect(() => {
    if (compareList.length === 2) {
      setShowCompareModal(true);
    }
  }, [compareList]);

  const handlePetSafeFilter = () => {
    if (!petSafeAgreed) {
      setShowPetTerms(true);
    } else {
      setSeasonFilter('반려동물안전');
    }
  };

  const handlePetTermsAgree = () => {
    localStorage.setItem('flora-pet-safety-agreed', 'true');
    setPetSafeAgreed(true);
    setShowPetTerms(false);
    setSeasonFilter('반려동물안전');
  };

  // API 응답에서 직접 extra 정보를 추출 (MongoDB에서 오는 필드)
  const getPlantExtra = (plant) => {
    if (!plant) return {};
    return {
      season: plant.season || '',
      flowerLang: plant.flowerLanguage || '',
      sunlight: plant.sunlight || '',
      watering: plant.watering || '',
      soil: plant.soil || '',
      petSafe: plant.isToxicToPets === false,
    };
  };
  const getSafetyBadge = (plant) => {
    if (plant.toxicity && plant.toxicity.startsWith('있음')) {
      return { icon: '⚠', label: '독성', type: 'toxic' };
    }
    return { icon: '🌿', label: '안전', type: 'safe' };
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  // 상세 데이터와 선택된 식물 데이터를 병합 (상세 API가 실패해도 기본 정보 표시)
  const detail = detailData
    ? { ...selectedPlant, ...detailData }
    : selectedPlant;
  const currentSeasonInfo = getCurrentMonthPlants();

  return (
    <div className="encyclopedia-page">
      {/* 헤더 */}
      <div className="encyclopedia-header">
        <div className="encyclopedia-header-inner">
          <div className="encyclopedia-header-text">
            <span className="encyclopedia-badge">PLANT ENCYCLOPEDIA</span>
            <h1>식물 도감</h1>
            <p>산림청 국가표준식물목록 기반 식물 정보</p>
          </div>
          <form onSubmit={handleSearch} className="encyclopedia-search">
            <input
              type="text"
              placeholder="🔍 식물 이름, 꽃말, 태그 검색..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="encyclopedia-search-input"
            />
            <button type="submit" className="encyclopedia-search-btn">🔍 검색</button>
          </form>
        </div>
      </div>

      {/* 계절 추천 배너 */}
      <div className="enc-season-banner">
        <span>🌸 {currentSeasonInfo.season} 계절 추천 — {currentSeasonInfo.plants}</span>
      </div>

      {/* 필터 탭 */}
      <div className="enc-filter-tabs">
        {['전체', '봄', '여름', '가을', '겨울', '즐겨찾기', '반려동물안전'].map(cat => (
          <button
            key={cat}
            className={`enc-filter-btn ${seasonFilter === cat ? 'active' : ''}`}
            onClick={() => cat === '반려동물안전' ? handlePetSafeFilter() : setSeasonFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 결과 수 */}
      {!loading && (
        <div className="encyclopedia-result-info">
          총 <strong>{totalCount.toLocaleString()}</strong>종의 식물
          {searchQuery && <span> · "<strong>{searchQuery}</strong>" 검색 결과</span>}
          {seasonFilter !== '전체' && <span> · {seasonFilter} 필터 적용</span>}
        </div>
      )}

      {/* 식물 그리드 */}
      {loading ? (
        <div className="encyclopedia-loading">
          <div className="enc-spinner" />
          <p>식물 정보를 불러오는 중...</p>
        </div>
      ) : plants.length === 0 ? (
        <div className="encyclopedia-empty">
          <span>🌿</span>
          <p>검색 결과가 없습니다</p>
          <button onClick={() => { setSearchQuery(''); setSeasonFilter('전체'); loadPlants('', 1, '전체'); }}>전체 목록 보기</button>
        </div>
      ) : (
        <div className="encyclopedia-grid">
          {plants.map((plant, i) => {
            const korName = plant.korName || '미상';
            const imgUrl  = pixabayImages[korName];
            const extra = getPlantExtra(plant);
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
                    <img src={imgUrl} alt={korName} loading="lazy" />
                  ) : (
                    <div className="plant-card-img-placeholder">🌿</div>
                  )}
                  <div className="plant-card-badges">
                    <span className={`plant-name-badge ${safety.type}`}>
                      {safety.icon} {safety.label}
                    </span>
                  </div>
                  {extra.season && (
                    <div className="plant-card-season">{extra.season}</div>
                  )}
                  <div className="plant-card-actions">
                    <button
                      className={`plant-card-compare ${isInCompare ? 'active' : ''}`}
                      onClick={(e) => toggleCompare(e, plant)}
                      title="비교하기"
                    >
                      ⚖️
                    </button>
                    <button
                      className={`plant-card-fav ${isFavorited ? 'active' : ''}`}
                      onClick={(e) => toggleFavorite(e, plant.taxonId)}
                      title={isFavorited ? '즐겨찾기 해제' : '즐겨찾기'}
                    >
                      {isFavorited ? '❤️' : '🤍'}
                    </button>
                  </div>
                </div>
                <div className="plant-card-body">
                  <h3 className="plant-card-kor">{korName}</h3>
                  {plant.scientificName && (
                    <p className="plant-card-sci" title={plant.scientificName}>
                      {plant.scientificName.length > 40
                        ? plant.scientificName.substring(0, 37) + '...'
                        : plant.scientificName}
                    </p>
                  )}
                  {plant.nameStatus && (
                    <span className="plant-card-status">{plant.nameStatus}</span>
                  )}
                  <div className="plant-card-tags">
                    {plant.familyKorName && (
                      <span className="plant-tag">🌱 {plant.familyKorName}</span>
                    )}
                    {plant.orderKorName && (
                      <span className="plant-tag">📂 {plant.orderKorName}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 비교 플로팅 바 */}
      {compareList.length > 0 && (
        <div className="compare-bar">
          <div className="compare-bar-content">
            <span>⚖️ 식물 비교 ({compareList.length}/2)</span>
            <div className="compare-bar-plants">
              {compareList.map((p, idx) => (
                <div key={idx} className="compare-bar-item">
                  {p.korName}
                  <button onClick={() => toggleCompare({ stopPropagation: () => {} }, p)}>✕</button>
                </div>
              ))}
            </div>
          </div>
          <button
            className="compare-bar-btn"
            onClick={() => setShowCompareModal(true)}
            disabled={compareList.length < 2}
          >
            비교하기
          </button>
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="encyclopedia-pagination">
          <button
            className="page-btn"
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            &lt; 이전
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const start = Math.max(1, Math.min(page - 2, totalPages - 4));
            const p = start + i;
            return (
              <button
                key={p}
                className={`page-btn ${p === page ? 'active' : ''}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            );
          })}
          <button
            className="page-btn"
            disabled={page >= totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            다음 &gt;
          </button>
        </div>
      )}

      {/* 상세 모달 */}
      {selectedPlant && (
        <div className="modal-overlay" onClick={() => setSelectedPlant(null)}>
          <div className="plant-detail-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedPlant(null)}>✕</button>

            <div className="modal-inner">
              <div className="modal-img-wrap">
                {pixabayImages[selectedPlant.korName] ? (
                  <img
                    src={pixabayImages[selectedPlant.korName]}
                    alt={selectedPlant.korName}
                  />
                ) : (
                  <div className="modal-img-placeholder">🌿</div>
                )}
              </div>

              <div className="modal-info">
                <div className="modal-header">
                  {(() => {
                    const safety = getSafetyBadge(detail);
                    return (
                      <span className={`modal-badge ${safety.type}`}>
                        {safety.icon} {safety.label}
                      </span>
                    );
                  })()}
                  <h2 className="modal-kor">{detail?.korName || '미상'}</h2>
                  {detail?.scientificName && (
                    <p className="modal-sci">{detail.scientificName}</p>
                  )}
                  {detail?.engName && (
                    <p className="modal-eng">{detail.engName}</p>
                  )}
                  {detail?.nameStatus && (
                    <span className="modal-name-status">{detail.nameStatus}</span>
                  )}
                </div>

                {detailLoading ? (
                  <div className="modal-loading">
                    <div className="enc-spinner small" />
                    상세 정보 불러오는 중...
                  </div>
                ) : (
                  <div className="modal-details">
                    {/* 꽃말/계절 정보 */}
                    {(() => {
                      const extra = getPlantExtra(detail);
                      if (Object.keys(extra).length > 0) {
                        return (
                          <>
                            {extra.flowerLang && (
                              <div className="modal-description">
                                <strong>꽃말</strong>
                                <p>{extra.flowerLang}</p>
                              </div>
                            )}
                            {extra.season && (
                              <div className="modal-description">
                                <strong>계절</strong>
                                <p>{extra.season}</p>
                              </div>
                            )}
                          </>
                        );
                      }
                      return null;
                    })()}

                    {/* 분류 정보 — 항상 표시 */}
                    <div className="modal-detail-grid">
                      {detail.familyKorName && (
                        <div className="modal-detail-item">
                          <strong>과명</strong>
                          <span>{detail.familyKorName}</span>
                        </div>
                      )}
                      {detail.orderKorName && (
                        <div className="modal-detail-item">
                          <strong>목명</strong>
                          <span>{detail.orderKorName}</span>
                        </div>
                      )}
                      {detail.classKorName && (
                        <div className="modal-detail-item">
                          <strong>강명</strong>
                          <span>{detail.classKorName}</span>
                        </div>
                      )}
                      {detail.divisionKorName && (
                        <div className="modal-detail-item">
                          <strong>문명</strong>
                          <span>{detail.divisionKorName}</span>
                        </div>
                      )}
                      {detail.genusKorName && (
                        <div className="modal-detail-item">
                          <strong>속명</strong>
                          <span>{detail.genusKorName}</span>
                        </div>
                      )}
                    </div>

                    {detail.description && (
                      <div className="modal-description">
                        <strong>설명</strong>
                        <p>{detail.description}</p>
                      </div>
                    )}
                    {detail.habitat && (
                      <div className="modal-description">
                        <strong>서식지</strong>
                        <p>{detail.habitat}</p>
                      </div>
                    )}
                    {detail.toxicity && (
                      <div className="modal-description">
                        <strong>독성 정보</strong>
                        <p className={detail.toxicity.startsWith('있음') ? 'toxicity-warning' : 'toxicity-safe'}>
                          {detail.toxicity.startsWith('있음') ? '⚠️ ' : '✅ '}{detail.toxicity}
                        </p>
                      </div>
                    )}
                    {detail.remark && (
                      <div className="modal-description">
                        <strong>비고</strong>
                        <p>{detail.remark}</p>
                      </div>
                    )}

                    <div className="modal-source">
                      📋 출처: 산림청 국립수목원 국가표준식물목록
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 비교 모달 */}
      {showCompareModal && compareList.length === 2 && (
        <div className="modal-overlay" onClick={() => setShowCompareModal(false)}>
          <div className="compare-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowCompareModal(false)}>✕</button>

            <div className="compare-modal-header">
              <h2>⚖️ 식물 비교</h2>
            </div>

            <div className="compare-cards">
              {compareList.map((plant, idx) => {
                const extra = getPlantExtra(plant);
                const safety = getSafetyBadge(plant);
                const imgUrl = pixabayImages[plant.korName];

                return (
                  <div key={idx} className="compare-card">
                    <div className="compare-card-img">
                      {imgUrl ? (
                        <img src={imgUrl} alt={plant.korName} />
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

                      {extra.flowerLang && (
                        <div className="compare-row">
                          <strong>꽃말</strong>
                          <span>{extra.flowerLang}</span>
                        </div>
                      )}
                      {extra.season && (
                        <div className="compare-row">
                          <strong>계절</strong>
                          <span>{extra.season}</span>
                        </div>
                      )}
                      {extra.sunlight && (
                        <div className="compare-row">
                          <strong>햇빛</strong>
                          <span>{extra.sunlight}</span>
                        </div>
                      )}
                      {extra.watering && (
                        <div className="compare-row">
                          <strong>물주기</strong>
                          <span>{extra.watering}</span>
                        </div>
                      )}
                      {extra.soil && (
                        <div className="compare-row">
                          <strong>토양</strong>
                          <span>{extra.soil}</span>
                        </div>
                      )}
                      {plant.familyKorName && (
                        <div className="compare-row">
                          <strong>과명</strong>
                          <span>{plant.familyKorName}</span>
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

      {/* 반려동물 안전 약관 모달 */}
      {showPetTerms && (
        <div className="modal-overlay" onClick={() => setShowPetTerms(false)}>
          <div className="pet-terms-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowPetTerms(false)}>✕</button>

            <div className="pet-terms-content">
              <div className="pet-terms-icon">🐾</div>
              <h2>반려동물 안전 정보 이용약관</h2>
              <p className="pet-terms-desc">반려동물 안전 식물 정보를 이용하기 전 아래 내용을 확인해 주세요.</p>

              <div className="pet-terms-box">
                <p>본 반려동물 안전 정보는 <strong>수의학 자료를 참고한 참고용 정보</strong>입니다.</p>
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
                <span>위 내용을 모두 읽었으며, 정보 이용에 대한 책임이 본인에게 있음에 동의합니다.</span>
              </label>

              <button
                className="pet-terms-btn"
                onClick={handlePetTermsAgree}
                disabled={!petTermsChecked}
              >
                동의하고 보기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
