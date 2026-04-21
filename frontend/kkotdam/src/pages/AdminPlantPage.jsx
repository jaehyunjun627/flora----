import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import './AdminPlantPage.css';

const STATUS_LABEL = {
  PENDING:  { text: '⏳ 검토 대기', cls: 'pending' },
  APPROVED: { text: '✅ 승인됨',    cls: 'approved' },
  REJECTED: { text: '❌ 반려됨',    cls: 'rejected' },
};

export default function AdminPlantPage() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [plants,    setPlants]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [tab,       setTab]       = useState('PENDING'); // PENDING | APPROVED | REJECTED
  const [rejectId,  setRejectId]  = useState(null);
  const [rejectMsg, setRejectMsg] = useState('');
  const [busy,      setBusy]      = useState(false);
  const [detail,    setDetail]    = useState(null); // 상세 보기용

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'ADMIN') { navigate('/'); return; }
    load();
  }, [user]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/user-plants/admin');
      setPlants(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = plants.filter(p => p.status === tab);

  const handleApprove = async (id) => {
    setBusy(true);
    try {
      await api.patch(`/api/user-plants/${id}/approve`);
      setPlants(prev => prev.map(p => p.id === id ? { ...p, status: 'APPROVED' } : p));
      if (detail?.id === id) setDetail(prev => ({ ...prev, status: 'APPROVED' }));
    } catch (e) {
      alert('승인 실패');
    } finally {
      setBusy(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectMsg.trim()) { alert('반려 사유를 입력해주세요.'); return; }
    setBusy(true);
    try {
      await api.patch(`/api/user-plants/${rejectId}/reject`, { reason: rejectMsg });
      setPlants(prev => prev.map(p =>
        p.id === rejectId ? { ...p, status: 'REJECTED', rejectionReason: rejectMsg } : p
      ));
      if (detail?.id === rejectId) setDetail(prev => ({ ...prev, status: 'REJECTED', rejectionReason: rejectMsg }));
      setRejectId(null);
      setRejectMsg('');
    } catch (e) {
      alert('반려 처리 실패');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="adm-loading">불러오는 중...</div>;

  return (
    <div className="adm-page">
      <div className="adm-header">
        <h1>🌿 식물 등록 관리</h1>
        <p>유저가 신청한 식물을 검토하고 최종 승인하세요.</p>
      </div>

      {/* 탭 */}
      <div className="adm-tabs">
        {['PENDING', 'APPROVED', 'REJECTED'].map(t => (
          <button
            key={t}
            className={`adm-tab ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {STATUS_LABEL[t].text}
            <span className="adm-tab-count">
              {plants.filter(p => p.status === t).length}
            </span>
          </button>
        ))}
      </div>

      {/* 목록 */}
      {filtered.length === 0 ? (
        <div className="adm-empty">해당 상태의 식물이 없습니다.</div>
      ) : (
        <div className="adm-list">
          {filtered.map(plant => (
            <div key={plant.id} className="adm-card" onClick={() => setDetail(plant)}>
              {/* 썸네일 */}
              <div className="adm-card-img">
                {plant.imageUrl
                  ? <img src={plant.imageUrl} alt={plant.name} />
                  : <div className="adm-card-img-placeholder">🌿</div>
                }
              </div>

              {/* 정보 */}
              <div className="adm-card-info">
                <div className="adm-card-top">
                  <strong className="adm-card-name">{plant.name}</strong>
                  {plant.scientificName && (
                    <span className="adm-card-sci">{plant.scientificName}</span>
                  )}
                  <span className={`adm-status-badge ${STATUS_LABEL[plant.status].cls}`}>
                    {STATUS_LABEL[plant.status].text}
                  </span>
                </div>

                <div className="adm-card-meta">
                  {plant.season && <span>🗓 {plant.season}</span>}
                  {plant.familyKorName && <span>🌱 {plant.familyKorName}</span>}
                  {plant.toxicity && <span>⚠️ 독성: {plant.toxicity}</span>}
                </div>

                <p className="adm-card-desc">{plant.description}</p>

                <div className="adm-card-submitter">
                  등록자: <strong>{plant.userNickname || '알 수 없음'}</strong>
                  {plant.createdAt && (
                    <span className="adm-card-date">
                      · {new Date(plant.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                  )}
                </div>

                {plant.status === 'REJECTED' && plant.rejectionReason && (
                  <p className="adm-reject-reason">반려 사유: {plant.rejectionReason}</p>
                )}
              </div>

              {/* 액션 버튼 */}
              {plant.status === 'PENDING' && (
                <div className="adm-card-actions" onClick={e => e.stopPropagation()}>
                  <button
                    className="adm-approve-btn"
                    onClick={() => handleApprove(plant.id)}
                    disabled={busy}
                  >
                    ✅ 승인
                  </button>
                  <button
                    className="adm-reject-btn"
                    onClick={() => { setRejectId(plant.id); setRejectMsg(''); }}
                    disabled={busy}
                  >
                    ❌ 반려
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 상세 모달 */}
      {detail && (
        <div className="adm-modal-overlay" onClick={() => setDetail(null)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <button className="adm-modal-close" onClick={() => setDetail(null)}>✕</button>

            {detail.imageUrl && (
              <img src={detail.imageUrl} alt={detail.name} className="adm-modal-img" />
            )}

            <div className="adm-modal-body">
              <div className="adm-modal-title-row">
                <h2>{detail.name}</h2>
                <span className={`adm-status-badge ${STATUS_LABEL[detail.status]?.cls}`}>
                  {STATUS_LABEL[detail.status]?.text}
                </span>
              </div>

              {detail.scientificName && <p className="adm-modal-sci">{detail.scientificName}</p>}
              {detail.engName && <p className="adm-modal-eng">{detail.engName}</p>}

              <div className="adm-modal-grid">
                {detail.flowerLanguage && <div><strong>꽃말</strong><span>{detail.flowerLanguage}</span></div>}
                {detail.season        && <div><strong>계절</strong><span>{detail.season}</span></div>}
                {detail.familyKorName && <div><strong>과명</strong><span>{detail.familyKorName}</span></div>}
                {detail.orderKorName  && <div><strong>목명</strong><span>{detail.orderKorName}</span></div>}
                {detail.habitat       && <div><strong>서식지</strong><span>{detail.habitat}</span></div>}
                {detail.toxicity      && <div><strong>독성</strong><span>{detail.toxicity}</span></div>}
              </div>

              {detail.description && (
                <div className="adm-modal-desc">
                  <strong>설명</strong>
                  <p>{detail.description}</p>
                </div>
              )}

              <p className="adm-modal-submitter">
                등록자: <strong>{detail.userNickname}</strong>
                {detail.createdAt && ` · ${new Date(detail.createdAt).toLocaleString('ko-KR')}`}
              </p>

              {detail.status === 'REJECTED' && detail.rejectionReason && (
                <p className="adm-reject-reason">반려 사유: {detail.rejectionReason}</p>
              )}

              {detail.status === 'PENDING' && (
                <div className="adm-modal-actions">
                  <button
                    className="adm-approve-btn large"
                    onClick={() => handleApprove(detail.id)}
                    disabled={busy}
                  >
                    ✅ 승인하기
                  </button>
                  <button
                    className="adm-reject-btn large"
                    onClick={() => { setRejectId(detail.id); setRejectMsg(''); }}
                    disabled={busy}
                  >
                    ❌ 반려하기
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 반려 사유 입력 모달 */}
      {rejectId && (
        <div className="adm-modal-overlay" onClick={() => setRejectId(null)}>
          <div className="adm-reject-modal" onClick={e => e.stopPropagation()}>
            <h3>반려 사유 입력</h3>
            <textarea
              placeholder="반려 사유를 입력하세요. 유저에게 표시됩니다."
              value={rejectMsg}
              onChange={e => setRejectMsg(e.target.value)}
              rows={4}
            />
            <div className="adm-reject-modal-actions">
              <button onClick={() => setRejectId(null)}>취소</button>
              <button className="adm-reject-btn" onClick={handleRejectSubmit} disabled={busy}>
                {busy ? '처리 중...' : '반려 처리'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
