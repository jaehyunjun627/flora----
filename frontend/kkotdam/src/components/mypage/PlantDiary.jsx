import React, { useState, useEffect } from 'react';
import api from '../../api';
import './PlantDiary.css';

const STORAGE_KEY = 'flora-plant-diary';

export default function PlantDiary({ plants }) {
  const [entries, setEntries] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  });
  const [showForm, setShowForm] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [form, setForm] = useState({
    plantId: '',
    plantName: '',
    date: new Date().toISOString().split('T')[0],
    title: '',
    content: '',
    imageUrl: '',
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('이미지 파일만 업로드 가능합니다.'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('파일 크기는 5MB 이하여야 합니다.'); return; }
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/api/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm(prev => ({ ...prev, imageUrl: res.data.imageUrl }));
    } catch (e) {
      // fallback: use data URL if upload fails
      const reader = new FileReader();
      reader.onload = () => setForm(prev => ({ ...prev, imageUrl: reader.result }));
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('제목을 입력해 주세요.'); return; }
    if (!form.plantName.trim()) { setError('식물을 선택해 주세요.'); return; }

    const newEntry = {
      id: Date.now(),
      ...form,
      createdAt: new Date().toISOString(),
    };
    setEntries(prev => [newEntry, ...prev]);
    setForm({ plantId: '', plantName: '', date: new Date().toISOString().split('T')[0], title: '', content: '', imageUrl: '' });
    setShowForm(false);
    setError('');
  };

  const handleDelete = (id) => {
    setEntries(prev => prev.filter(e => e.id !== id));
    setSelectedEntry(null);
  };

  const handlePlantSelect = (plant) => {
    setForm(prev => ({ ...prev, plantId: plant.id, plantName: plant.nickname || plant.name }));
  };

  return (
    <div className="diary-wrap">
      <div className="diary-header">
        <div>
          <h3 className="diary-title">식물일기</h3>
          <p className="diary-subtitle">내 식물의 성장 기록을 남겨보세요</p>
        </div>
        <button className="diary-add-btn" onClick={() => setShowForm(true)}>
          + 일기 쓰기
        </button>
      </div>

      {/* 글쓰기 모달 */}
      {showForm && (
        <div className="diary-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="diary-modal" onClick={e => e.stopPropagation()}>
            <div className="diary-modal-header">
              <h3>식물일기 쓰기</h3>
              <button onClick={() => setShowForm(false)}>&times;</button>
            </div>
            <form className="diary-form" onSubmit={handleSubmit}>
              {error && <div className="diary-error">{error}</div>}

              {/* 식물 선택 */}
              <div className="diary-field">
                <label>식물 선택</label>
                <div className="diary-plant-chips">
                  {plants.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      className={`diary-plant-chip ${form.plantId === p.id ? 'active' : ''}`}
                      onClick={() => handlePlantSelect(p)}
                    >
                      🌿 {p.nickname || p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 날짜 */}
              <div className="diary-field">
                <label>날짜</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
                  className="diary-input"
                />
              </div>

              {/* 제목 */}
              <div className="diary-field">
                <label>제목</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="오늘의 성장 기록"
                  className="diary-input"
                />
              </div>

              {/* 내용 */}
              <div className="diary-field">
                <label>내용</label>
                <textarea
                  value={form.content}
                  onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="식물의 상태, 물주기, 변화 등을 기록해 보세요..."
                  className="diary-textarea"
                  rows={4}
                />
              </div>

              {/* 이미지 업로드 */}
              <div className="diary-field">
                <label>성장 사진</label>
                {form.imageUrl ? (
                  <div className="diary-image-preview">
                    <img src={form.imageUrl} alt="미리보기" />
                    <button type="button" onClick={() => setForm(prev => ({ ...prev, imageUrl: '' }))}>✕ 제거</button>
                  </div>
                ) : (
                  <label className="diary-upload-area">
                    {uploading ? (
                      <span>업로드 중...</span>
                    ) : (
                      <>
                        <span className="diary-upload-icon">📷</span>
                        <span>클릭하여 사진 추가</span>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploading} />
                  </label>
                )}
              </div>

              <div className="diary-form-actions">
                <button type="button" onClick={() => setShowForm(false)} className="diary-cancel-btn">취소</button>
                <button type="submit" className="diary-submit-btn">저장</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 상세 보기 모달 */}
      {selectedEntry && (
        <div className="diary-modal-overlay" onClick={() => setSelectedEntry(null)}>
          <div className="diary-modal diary-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="diary-modal-header">
              <h3>{selectedEntry.title}</h3>
              <button onClick={() => setSelectedEntry(null)}>&times;</button>
            </div>
            <div className="diary-detail-body">
              {selectedEntry.imageUrl && (
                <img src={selectedEntry.imageUrl} alt={selectedEntry.title} className="diary-detail-img" />
              )}
              <div className="diary-detail-meta">
                <span>🌿 {selectedEntry.plantName}</span>
                <span>📅 {selectedEntry.date}</span>
              </div>
              {selectedEntry.content && (
                <p className="diary-detail-content">{selectedEntry.content}</p>
              )}
              <button className="diary-delete-btn" onClick={() => handleDelete(selectedEntry.id)}>
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 일기 목록 */}
      {entries.length === 0 ? (
        <div className="diary-empty">
          <span>📝</span>
          <p>아직 작성한 일기가 없습니다</p>
          <p className="diary-empty-sub">식물의 성장 기록을 남겨보세요!</p>
        </div>
      ) : (
        <div className="diary-grid">
          {entries.map(entry => (
            <div key={entry.id} className="diary-card" onClick={() => setSelectedEntry(entry)}>
              {entry.imageUrl ? (
                <div className="diary-card-img">
                  <img src={entry.imageUrl} alt={entry.title} />
                </div>
              ) : (
                <div className="diary-card-img diary-card-no-img">
                  <span>🌱</span>
                </div>
              )}
              <div className="diary-card-body">
                <div className="diary-card-date">{entry.date}</div>
                <h4 className="diary-card-title">{entry.title}</h4>
                <span className="diary-card-plant">🌿 {entry.plantName}</span>
                {entry.content && (
                  <p className="diary-card-content">{entry.content}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
