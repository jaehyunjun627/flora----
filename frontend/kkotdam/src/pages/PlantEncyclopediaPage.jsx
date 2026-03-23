import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './PlantEncyclopediaPage.css';

export default function PlantEncyclopediaPage() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [pixabayImages, setPixabayImages] = useState({});

  useEffect(() => { loadPlants(); }, [page]);

  const loadPlants = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/external/plants', { params: { page, numOfRows: 12 } });
      const items = res.data.items || [];
      setPlants(items);
      setTotalCount(res.data.totalCount || 0);
      // 각 식물의 Pixabay 이미지 로딩
      items.slice(0, 6).forEach(plant => loadPlantImage(plant.distbNm || plant.cntntsSj));
    } catch (e) {
      console.error('식물 목록 로딩 실패:', e);
      // API 실패시 더미 데이터
      setPlants(getDummyPlants());
    } finally { setLoading(false); }
  };

  const loadPlantImage = async (name) => {
    if (!name || pixabayImages[name]) return;
    try {
      const res = await api.get('/api/external/pixabay', { params: { q: name, perPage: 1 } });
      if (res.data.hits?.length > 0) {
        setPixabayImages(prev => ({ ...prev, [name]: res.data.hits[0].webformatURL }));
      }
    } catch (e) {}
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.get('/api/external/plants', { params: { q: searchQuery, page: 1, numOfRows: 12 } });
      setPlants(res.data.items || []);
      setTotalCount(res.data.totalCount || 0);
      setPage(1);
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  };

  const getDummyPlants = () => [
    { distbNm: '장미', cntntsSj: '장미', stle: '장미목', fncltyInfo: '관상용, 향수 원료', lighttCondtn: '양지', watercycleSpring: '2~3일', toxicity: '없음' },
    { distbNm: '튤립', cntntsSj: '튤립', stle: '백합목', fncltyInfo: '관상용', lighttCondtn: '양지', watercycleSpring: '3~4일', toxicity: '약한 독성' },
    { distbNm: '몬스테라', cntntsSj: '몬스테라', stle: '천남성목', fncltyInfo: '공기정화', lighttCondtn: '반음지', watercycleSpring: '5~7일', toxicity: '독성있음' },
    { distbNm: '선인장', cntntsSj: '선인장', stle: '석죽목', fncltyInfo: '관상용', lighttCondtn: '양지', watercycleSpring: '10~14일', toxicity: '없음' },
    { distbNm: '스파티필럼', cntntsSj: '스파티필럼', stle: '천남성목', fncltyInfo: '공기정화', lighttCondtn: '반음지', watercycleSpring: '3~5일', toxicity: '독성있음' },
    { distbNm: '행운목', cntntsSj: '행운목', stle: '백합목', fncltyInfo: '공기정화, 행운의 상징', lighttCondtn: '반음지', watercycleSpring: '7~10일', toxicity: '없음' },
  ];

  return (
    <div className="encyclopedia-page">
      <div className="encyclopedia-header">
        <h1>식물 도감</h1>
        <p>산림청 데이터 기반 식물 정보</p>

        <form onSubmit={handleSearch} className="encyclopedia-search">
          <input
            type="text"
            placeholder="식물 이름으로 검색..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="encyclopedia-search-input"
          />
          <button type="submit">검색</button>
        </form>
      </div>

      {loading ? (
        <div className="loading">식물 정보를 불러오는 중...</div>
      ) : (
        <div className="encyclopedia-grid">
          {plants.map((plant, i) => {
            const name = plant.distbNm || plant.cntntsSj || '식물';
            const imgUrl = pixabayImages[name];
            return (
              <div
                key={i}
                className="plant-encyclopedia-card"
                onClick={() => setSelectedPlant(plant)}
              >
                <div className="plant-enc-img">
                  {imgUrl ? (
                    <img src={imgUrl} alt={name} />
                  ) : (
                    <span className="plant-enc-emoji">🌿</span>
                  )}
                </div>
                <div className="plant-enc-body">
                  <h3>{name}</h3>
                  {plant.stle && <p className="plant-order">{plant.stle}</p>}
                  {plant.fncltyInfo && (
                    <p className="plant-function">{plant.fncltyInfo.substring(0, 30)}...</p>
                  )}
                  <div className="plant-tags">
                    {plant.lighttCondtn && (
                      <span className="plant-tag">☀️ {plant.lighttCondtn}</span>
                    )}
                    {plant.toxicity === '없음' && (
                      <span className="plant-tag safe">🐾 반려동물 안전</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedPlant && (
        <div className="modal-overlay" onClick={() => setSelectedPlant(null)}>
          <div className="plant-detail-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedPlant(null)}>&times;</button>
            <h2>{selectedPlant.distbNm || selectedPlant.cntntsSj}</h2>
            {selectedPlant.stle && <p className="detail-order">{selectedPlant.stle}</p>}

            <div className="plant-detail-grid">
              {selectedPlant.fncltyInfo && (
                <div className="detail-item">
                  <strong>효능/용도</strong>
                  <span>{selectedPlant.fncltyInfo}</span>
                </div>
              )}
              {selectedPlant.lighttCondtn && (
                <div className="detail-item">
                  <strong>빛 조건</strong>
                  <span>{selectedPlant.lighttCondtn}</span>
                </div>
              )}
              {selectedPlant.watercycleSpring && (
                <div className="detail-item">
                  <strong>물주기 (봄/여름)</strong>
                  <span>{selectedPlant.watercycleSpring}</span>
                </div>
              )}
              {selectedPlant.toxicity && (
                <div className="detail-item">
                  <strong>독성 여부</strong>
                  <span className={selectedPlant.toxicity === '없음' ? 'safe-text' : 'warn-text'}>
                    {selectedPlant.toxicity}
                  </span>
                </div>
              )}
              {selectedPlant.postngplaceInfo && (
                <div className="detail-item">
                  <strong>배치 장소</strong>
                  <span>{selectedPlant.postngplaceInfo}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
