import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import './PlantEncyclopediaPage.css';

const PAGE_SIZE = 12;
// Pixabay API 키 (프론트 직접 호출 - CORS 지원)
const PIXABAY_KEY = '3956381-8a0f2a1805bed555538d1bfe8';

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

  useEffect(() => { loadPlants(searchQuery, page); }, [page]);

  const loadPlants = async (q, pg) => {
    setLoading(true);
    try {
      const params = { page: pg, numOfRows: PAGE_SIZE };
      if (q && q.trim()) params.searchWord = q.trim();  // 산림청 API 파라미터

      const res = await api.get('/api/external/plants', { params });
      const items = res.data.items || [];
      setPlants(items);
      setTotalCount(res.data.totalCount || 0);

      // Pixabay 이미지 병렬 로딩 (상위 8개)
      items.slice(0, 8).forEach(plant => {
        const name = plant.korName || plant.scientificName;
        if (name) loadPlantImage(name, plant.engName);
      });
    } catch (e) {
      console.error('식물 목록 로딩 실패:', e);
      setPlants([]);
    } finally {
      setLoading(false);
    }
  };

  // Pixabay 프론트 직접 호출 (백엔드 우회)
  const loadPlantImage = useCallback(async (korName, engName) => {
    if (!korName || pixabayImages[korName]) return;
    try {
      const query = encodeURIComponent(
        engName && engName.trim() ? `${engName} flower` : `${korName} flower`
      );
      const url = `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${query}&image_type=photo&per_page=3&safesearch=true`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.hits?.length > 0) {
        setPixabayImages(prev => ({ ...prev, [korName]: data.hits[0].webformatURL }));
      }
    } catch (e) {
      console.warn('Pixabay 이미지 로딩 실패:', korName, e.message);
    }
  }, [pixabayImages]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadPlants(searchQuery, 1);
  };

  const handleCardClick = async (plant) => {
    setSelectedPlant(plant);
    setDetailData(null);

    // 이미지 로딩
    const name = plant.korName;
    if (name && !pixabayImages[name]) {
      loadPlantImage(name, plant.engName);
    }

    // 상세 정보 조회
    if (plant.taxonId) {
      setDetailLoading(true);
      try {
        const res = await api.get(`/api/external/plants/${plant.taxonId}`);
        setDetailData(res.data);
      } catch (e) {
        console.error('상세 정보 조회 실패', e);
      } finally {
        setDetailLoading(false);
      }
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const detail = detailData || selectedPlant;

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
              placeholder="식물 이름 검색 (예: 장미, 튤립, 벚나무)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="encyclopedia-search-input"
            />
            <button type="submit" className="encyclopedia-search-btn">🔍 검색</button>
          </form>
        </div>
      </div>

      {/* 결과 수 */}
      {!loading && (
        <div className="encyclopedia-result-info">
          총 <strong>{totalCount.toLocaleString()}</strong>종의 식물
          {searchQuery && <span> · "<strong>{searchQuery}</strong>" 검색 결과</span>}
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
          <button onClick={() => { setSearchQuery(''); loadPlants('', 1); }}>전체 목록 보기</button>
        </div>
      ) : (
        <div className="encyclopedia-grid">
          {plants.map((plant, i) => {
            const korName = plant.korName || '미상';
            const imgUrl  = pixabayImages[korName];
            return (
              <div
                key={plant.taxonId || i}
                className="plant-card"
                onClick={() => handleCardClick(plant)}
              >
                <div className="plant-card-img">
                  {imgUrl ? (
                    <img src={imgUrl} alt={korName} loading="lazy" />
                  ) : (
                    <div className="plant-card-img-placeholder">🌿</div>
                  )}
                  {plant.nameStatus && (
                    <span className={`plant-name-badge ${plant.nameStatus === '정명' ? 'official' : 'synonym'}`}>
                      {plant.nameStatus}
                    </span>
                  )}
                </div>
                <div className="plant-card-body">
                  <h3 className="plant-card-kor">{korName}</h3>
                  {plant.scientificName && (
                    <p className="plant-card-sci">{plant.scientificName}</p>
                  )}
                  <div className="plant-card-tags">
                    {plant.familyKorName && (
                      <span className="plant-tag">🌱 {plant.familyKorName}</span>
                    )}
                    {plant.orderKorName && (
                      <span className="plant-tag">📂 {plant.orderKorName}</span>
                    )}
                  </div>
                  {plant.engName && (
                    <p className="plant-card-eng">{plant.engName}</p>
                  )}
                </div>
              </div>
            );
          })}
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
              {/* 왼쪽: 이미지 */}
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

              {/* 오른쪽: 정보 */}
              <div className="modal-info">
                <div className="modal-header">
                  {detail.nameStatus && (
                    <span className={`modal-badge ${detail.nameStatus === '정명' ? 'official' : 'synonym'}`}>
                      {detail.nameStatus}
                    </span>
                  )}
                  <h2 className="modal-kor">{detail.korName || '미상'}</h2>
                  {detail.scientificName && (
                    <p className="modal-sci">{detail.scientificName}</p>
                  )}
                  {detail.engName && (
                    <p className="modal-eng">{detail.engName}</p>
                  )}
                </div>

                {detailLoading ? (
                  <div className="modal-loading">
                    <div className="enc-spinner small" />
                    상세 정보 불러오는 중...
                  </div>
                ) : (
                  <div className="modal-details">
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
    </div>
  );
}
