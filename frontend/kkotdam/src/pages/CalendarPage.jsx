import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import './CalendarPage.css';

export default function CalendarPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [calendars, setCalendars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCalendar, setSelectedCalendar] = useState(null);
  const [diaries, setDiaries] = useState([]);
  const [showDiaryModal, setShowDiaryModal] = useState(false);
  const [diaryForm, setDiaryForm] = useState({ memo: '', imageUrl: '' });
  const [addForm, setAddForm] = useState({ plantNickname: '', wateringCycleDays: 7 });

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    loadCalendars();
  }, [user]);

  const loadCalendars = async () => {
    try {
      const res = await api.get('/api/calendar');
      setCalendars(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleAddPlant = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/calendar', addForm);
      setShowAddModal(false);
      setAddForm({ plantNickname: '', wateringCycleDays: 7 });
      loadCalendars();
    } catch (e) {
      const msg = e.response?.data?.message || e.response?.data || e.message || '알 수 없는 오류';
      alert(`식물 등록 실패: ${msg}`);
    }
  };

  const handleWatering = async (calendarId) => {
    try {
      const res = await api.post(`/api/calendar/${calendarId}/watering`);
      alert(`${res.data.message}\n다음 물주기: ${res.data.nextWateringDate}`);
      loadCalendars();
    } catch (e) { alert('실패'); }
  };

  const openDiaries = async (calendar) => {
    setSelectedCalendar(calendar);
    try {
      const res = await api.get(`/api/calendar/${calendar.id}/diaries`);
      setDiaries(res.data || []);
    } catch (e) { console.error(e); }
    setShowDiaryModal(true);
  };

  const handleAddDiary = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/api/calendar/${selectedCalendar.id}/diaries`, diaryForm);
      setDiaryForm({ memo: '', imageUrl: '' });
      const res = await api.get(`/api/calendar/${selectedCalendar.id}/diaries`);
      setDiaries(res.data || []);
    } catch (e) { alert('일기 저장 실패'); }
  };

  const getDday = (dateStr) => {
    if (!dateStr) return null;
    const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return { label: `${Math.abs(diff)}일 지남`, urgent: true };
    if (diff === 0) return { label: '오늘!', urgent: true };
    return { label: `D-${diff}`, urgent: false };
  };

  if (loading) return <div className="loading">불러오는 중...</div>;

  return (
    <div className="calendar-page">
      <div className="calendar-header">
        <div>
          <h1>식물 캘린더</h1>
          <p>내 식물들의 관리 일정을 한눈에</p>
        </div>
        <button className="add-plant-btn" onClick={() => setShowAddModal(true)}>
          + 식물 추가
        </button>
      </div>

      {calendars.length === 0 ? (
        <div className="calendar-empty">
          <span>🪴</span>
          <p>아직 등록된 식물이 없어요</p>
          <button onClick={() => setShowAddModal(true)}>첫 식물 등록하기</button>
        </div>
      ) : (
        <div className="plant-grid">
          {calendars.map(cal => {
            const waterDday = getDday(cal.wateringNextDate);
            return (
              <div key={cal.id} className="plant-card">
                <div className="plant-card-top">
                  <span className="plant-emoji">🌿</span>
                  <div className="plant-info">
                    <h3>{cal.plantNickname}</h3>
                    <p>물주기 {cal.wateringCycleDays}일 주기</p>
                  </div>
                </div>

                <div className="plant-schedule">
                  <div className="schedule-item">
                    <span className="schedule-label">💧 다음 물주기</span>
                    {waterDday && (
                      <span className={`schedule-dday ${waterDday.urgent ? 'urgent' : ''}`}>
                        {waterDday.label}
                      </span>
                    )}
                  </div>
                  {cal.repotDate && (
                    <div className="schedule-item">
                      <span className="schedule-label">🪴 분갈이</span>
                      <span className="schedule-date">{cal.repotDate}</span>
                    </div>
                  )}
                  {cal.fertilizeDate && (
                    <div className="schedule-item">
                      <span className="schedule-label">🌱 비료</span>
                      <span className="schedule-date">{cal.fertilizeDate}</span>
                    </div>
                  )}
                </div>

                <div className="plant-card-actions">
                  <button
                    className="watering-btn"
                    onClick={() => handleWatering(cal.id)}
                  >
                    💧 물줬어요
                  </button>
                  <button
                    className="diary-btn"
                    onClick={() => openDiaries(cal)}
                  >
                    📖 일기 ({cal.diaryCount})
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Plant Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="cal-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>식물 추가</h3>
              <button onClick={() => setShowAddModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddPlant}>
              <div className="cal-field">
                <label>식물 이름 (닉네임)</label>
                <input
                  value={addForm.plantNickname}
                  onChange={e => setAddForm(p => ({...p, plantNickname: e.target.value}))}
                  placeholder="예: 우리집 몬스테라"
                  required
                  className="cal-input"
                />
              </div>
              <div className="cal-field">
                <label>물주기 주기 (일)</label>
                <input
                  type="number"
                  min={1} max={30}
                  value={addForm.wateringCycleDays}
                  onChange={e => setAddForm(p => ({...p, wateringCycleDays: Number(e.target.value)}))}
                  className="cal-input"
                />
              </div>
              <button type="submit" className="cal-submit">등록</button>
            </form>
          </div>
        </div>
      )}

      {/* Diary Modal */}
      {showDiaryModal && selectedCalendar && (
        <div className="modal-overlay" onClick={() => setShowDiaryModal(false)}>
          <div className="cal-modal diary-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedCalendar.plantNickname} 성장일기</h3>
              <button onClick={() => setShowDiaryModal(false)}>&times;</button>
            </div>

            <div className="diary-list">
              {diaries.length === 0 ? (
                <p className="diary-empty">아직 일기가 없어요. 첫 기록을 남겨보세요!</p>
              ) : (
                diaries.map(d => (
                  <div key={d.id} className="diary-item">
                    <span className="diary-date">{d.recordedDate}</span>
                    {d.imageUrl && <img src={d.imageUrl} alt="식물" className="diary-img" />}
                    <p>{d.memo}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddDiary} className="diary-form">
              <textarea
                value={diaryForm.memo}
                onChange={e => setDiaryForm(p => ({...p, memo: e.target.value}))}
                placeholder="오늘 식물 상태를 기록해보세요..."
                className="diary-textarea"
                rows={3}
                required
              />
              <button type="submit" className="diary-submit">기록 저장</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
