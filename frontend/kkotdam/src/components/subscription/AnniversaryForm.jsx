import { useState } from 'react';
import './AnniversaryForm.css';

const DEFAULT_FORM = {
  name: '',
  anniversaryDate: '',
  active: true,
  daysBefore: 0,
  flowerNote: '',
};

export default function AnniversaryForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(
    initial
      ? { ...initial, anniversaryDate: initial.anniversaryDate?.slice(0, 10) }
      : DEFAULT_FORM
  );
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.anniversaryDate) {
      setError('기념일 이름과 날짜는 필수입니다.');
      return;
    }
    setError('');
    onSave(form);
  };

  return (
    <div className="anniversary-form-wrap">
      <form className="anniversary-form" onSubmit={handleSubmit}>
        <h3 className="anniversary-form__title">
          {initial ? '기념일 수정' : '새 기념일 추가'}
        </h3>

        <div className="anniversary-form__field">
          <label className="anniversary-form__label" htmlFor="anniv-name">기념일 이름</label>
          <input
            id="anniv-name"
            className="anniversary-form__input"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="예: 결혼기념일, 생일, 어버이날"
          />
        </div>

        <div className="anniversary-form__field">
          <label className="anniversary-form__label" htmlFor="anniv-date">날짜</label>
          <input
            id="anniv-date"
            className="anniversary-form__input"
            name="anniversaryDate"
            type="date"
            value={form.anniversaryDate}
            onChange={handleChange}
          />
          <span className="anniversary-form__hint">매년 이 날짜에 꽃을 보내드려요.</span>
        </div>

        <div className="anniversary-form__field">
          <label className="anniversary-form__label" htmlFor="anniv-days">며칠 전 발송</label>
          <select
            id="anniv-days"
            className="anniversary-form__select"
            name="daysBefore"
            value={form.daysBefore}
            onChange={handleChange}
          >
            <option value={0}>당일 발송</option>
            <option value={1}>1일 전</option>
            <option value={2}>2일 전</option>
            <option value={3}>3일 전</option>
          </select>
        </div>

        <div className="anniversary-form__field">
          <label className="anniversary-form__label" htmlFor="anniv-note">꽃 스타일 메모 (선택)</label>
          <textarea
            id="anniv-note"
            className="anniversary-form__textarea"
            name="flowerNote"
            value={form.flowerNote}
            onChange={handleChange}
            placeholder="예: 분홍 계열로, 소박하게, 화려하게..."
            rows={3}
          />
        </div>

        <label className="anniversary-form__checkbox">
          <input type="checkbox" name="active" checked={form.active} onChange={handleChange} />
          <span>이 기념일 챙기기</span>
        </label>

        {error && <p className="anniversary-form__error">{error}</p>}

        <div className="anniversary-form__actions">
          <button type="button" className="anniversary-form__cancel" onClick={onCancel}>취소</button>
          <button type="submit" className="anniversary-form__submit">저장</button>
        </div>
      </form>
    </div>
  );
}
