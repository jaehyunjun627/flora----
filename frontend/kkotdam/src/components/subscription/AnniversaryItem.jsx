import './AnniversaryItem.css';

const DAYS_LABEL = { 0: '당일 발송', 1: '1일 전 발송', 2: '2일 전 발송', 3: '3일 전 발송' };

export default function AnniversaryItem({ item, onEdit, onDelete, onToggleActive }) {
  const dateStr = item.anniversaryDate
    ? new Date(item.anniversaryDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
    : '';

  return (
    <li className={`anniversary-item ${item.active ? '' : 'anniversary-item--inactive'}`}>
      <div className="anniversary-item__left">
        <span className="anniversary-item__icon">🌸</span>
        <div className="anniversary-item__info">
          <p className="anniversary-item__name">{item.name}</p>
          <p className="anniversary-item__date">
            {dateStr} &middot; {DAYS_LABEL[item.daysBefore] ?? '당일 발송'}
          </p>
          {item.flowerNote && (
            <p className="anniversary-item__note">"{item.flowerNote}"</p>
          )}
        </div>
      </div>

      <div className="anniversary-item__actions">
        <button
          className={`anniversary-item__toggle ${item.active ? 'anniversary-item__toggle--on' : 'anniversary-item__toggle--off'}`}
          onClick={() => onToggleActive(item)}
          title={item.active ? '비활성화' : '활성화'}
        >
          {item.active ? 'ON' : 'OFF'}
        </button>
        <button className="anniversary-item__edit" onClick={() => onEdit(item)}>수정</button>
        <button className="anniversary-item__delete" onClick={() => onDelete(item.id)}>삭제</button>
      </div>
    </li>
  );
}
