import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { subscriptionApi } from '../../api/subscriptionApi';
import AnniversaryForm from '../../components/subscription/AnniversaryForm';
import AnniversaryItem from '../../components/subscription/AnniversaryItem';
import './AnniversaryPage.css';

export default function AnniversaryPage() {
  const { subscriptionId } = useParams();
  const [anniversaries, setAnniversaries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchList = async () => {
    try {
      const res = await subscriptionApi.getAnniversaries(subscriptionId);
      setAnniversaries(res.data);
    } catch {
      // 조회 실패 시 빈 목록 유지
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [subscriptionId]);

  const handleSave = async (formData) => {
    if (editTarget) {
      await subscriptionApi.updateAnniversary(editTarget.id, formData);
    } else {
      await subscriptionApi.addAnniversary(subscriptionId, formData);
    }
    setShowForm(false);
    setEditTarget(null);
    fetchList();
  };

  const handleEdit = (item) => {
    setEditTarget(item);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('기념일을 삭제하시겠어요?')) return;
    await subscriptionApi.deleteAnniversary(id);
    fetchList();
  };

  const handleToggleActive = async (item) => {
    await subscriptionApi.updateAnniversary(item.id, { ...item, active: !item.active });
    fetchList();
  };

  return (
    <div className="anniversary-page">
      <div className="anniversary-page__header">
        <div>
          <h1 className="anniversary-page__title">기념일 설정</h1>
          <p className="anniversary-page__desc">챙기고 싶은 날을 등록하면 꽃과 함께 알림을 드려요 🌷</p>
        </div>
        <button className="anniversary-page__add-btn" onClick={() => { setEditTarget(null); setShowForm(true); }}>
          + 기념일 추가
        </button>
      </div>

      {showForm && (
        <AnniversaryForm
          initial={editTarget}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditTarget(null); }}
        />
      )}

      {loading ? (
        <p className="anniversary-page__loading">불러오는 중...</p>
      ) : anniversaries.length === 0 ? (
        <div className="anniversary-page__empty">
          <p>아직 등록된 기념일이 없어요.</p>
          <p>기념일을 추가하면 꽃과 함께 챙겨드릴게요!</p>
        </div>
      ) : (
        <ul className="anniversary-list">
          {anniversaries.map((item) => (
            <AnniversaryItem
              key={item.id}
              item={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
