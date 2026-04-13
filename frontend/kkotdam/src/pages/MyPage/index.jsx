import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';
import MyCalendar from '../../components/mypage/MyCalendar';
import BadgeCollection, { ALL_BADGES } from '../../components/mypage/BadgeCollection';
import PointLevel from '../../components/mypage/PointLevel';
import PlantCard from '../../components/mypage/PlantCard';
import PlantDiary from '../../components/mypage/PlantDiary';
import TermsAgreement from '../../components/mypage/TermsAgreement';
import './MyPage.css';

const TABS = [
  { id: 'activity',      label: '내 활동' },
  { id: 'subscription',  label: '구독 관리' },
  { id: 'diary',         label: '식물일기' },
  { id: 'card',          label: '식물 명함' },
  { id: 'terms',         label: '약관 동의' },
];

const INITIAL_PLANTS = [
  { id: 1, name: '몬스테라', nickname: '몬이', plantType: '관엽식물' },
  { id: 2, name: '선인장',   nickname: '선이', plantType: '선인장'   },
];

export default function MyPage() {
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab,       setActiveTab]       = useState('activity');
  const [myData,          setMyData]          = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [plants,          setPlants]          = useState(() => {
    try { return JSON.parse(localStorage.getItem('flora-plants') || 'null') || INITIAL_PLANTS; }
    catch { return INITIAL_PLANTS; }
  });
  const [selectedBadge,   setSelectedBadge]   = useState(null);
  const [showBadgePicker, setShowBadgePicker] = useState(false);
  const [profileBadgeTitle, setProfileBadgeTitle] = useState(null);
  const [subscriptions,   setSubscriptions]   = useState([]);
  const [cancelConfirmId, setCancelConfirmId] = useState(null);

  // 구독 데이터 로드 함수
  const loadSubscriptions = () => {
    try {
      const data = JSON.parse(localStorage.getItem('flora-subscriptions') || '[]');
      setSubscriptions(data);
    } catch { setSubscriptions([]); }
  };

  useEffect(() => {
    if (!authUser) { navigate('/login'); return; }
    loadMyPage();
    loadSubscriptions(); // 마운트 시 구독 데이터 로드
  }, [authUser]);

  // 구독 탭 활성화 시 최신 데이터 로드
  useEffect(() => {
    if (activeTab === 'subscription') {
      loadSubscriptions();
    }
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('flora-plants', JSON.stringify(plants));
  }, [plants]);

  const loadMyPage = async () => {
    try {
      const res = await api.get('/api/mypage');
      setMyData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // API 뱃지 데이터가 있으면 매칭, 없으면 첫 번째 뱃지만 기본 획득
  const apiBadges = myData?.badges || null;
  const earnedBadges = ALL_BADGES.filter(b =>
    apiBadges
      ? apiBadges.some(ab => ab.badgeCode === b.badgeCode || ab.badgeName === b.name)
      : (b.id <= 1)
  );

  // 유저 정보: API 데이터 우선, 없으면 authContext 사용
  const userName  = myData?.nickname || authUser?.nickname || '사용자';
  const userEmail = myData?.email    || authUser?.email    || '';
  const joinDate  = myData?.createdAt ? new Date(myData.createdAt).toLocaleDateString('ko-KR') : '';
  const userPoints = myData?.points || 0;

  const handleCancelSubscription = (id) => {
    const updated = subscriptions.map(s =>
      s.id === id ? { ...s, status: 'cancelled', cancelledAt: new Date().toISOString() } : s
    );
    setSubscriptions(updated);
    localStorage.setItem('flora-subscriptions', JSON.stringify(updated));
    setCancelConfirmId(null);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>불러오는 중...</div>;

  return (
    <div className="mypage-wrap">
      <div className="mypage-top-label">MY PAGE</div>
      <div className="mypage-header">
        <h1 className="mypage-title">🧑 마이페이지</h1>
        <p className="mypage-sub">나의 식물 활동, 뱃지, 명함, 포인트를 한 눈에 파악하세요.</p>
      </div>

      {/* 유저 프로필 배너 */}
      <div className="profile-banner">
        <div className="profile-avatar">{myData?.profileEmoji || '🌿'}</div>
        <div className="profile-info">

          {/* 닉네임 + 뱃지 칭호 */}
          <div className="profile-name-row">
            <span className="profile-name">{userName}</span>
            {profileBadgeTitle && (
              <span className="profile-badge-title">
                {profileBadgeTitle.icon} {profileBadgeTitle.name}
              </span>
            )}
            <button
              className="btn-badge-pick"
              onClick={() => setShowBadgePicker(v => !v)}
            >
              {profileBadgeTitle ? '변경' : '칭호 선택'}
            </button>
          </div>

          {/* 뱃지 칭호 선택 드롭다운 */}
          {showBadgePicker && (
            <div className="badge-picker-dropdown">
              {earnedBadges.map(b => (
                <button
                  key={b.id}
                  className={`badge-picker-item${profileBadgeTitle?.id === b.id ? ' active' : ''}`}
                  onClick={() => { setProfileBadgeTitle(b); setShowBadgePicker(false); }}
                >
                  {b.icon} {b.name}
                </button>
              ))}
              {profileBadgeTitle && (
                <button
                  className="badge-picker-item clear"
                  onClick={() => { setProfileBadgeTitle(null); setShowBadgePicker(false); }}
                >
                  ✕ 칭호 해제
                </button>
              )}
            </div>
          )}

          <div className="profile-meta">{userEmail}{joinDate ? ` · ${joinDate} 가입` : ''}</div>

          {/* 키우는 식물 수 (실시간 반영) */}
          <div className="profile-stats">
            <div className="profile-stat">
              <span className="pstat-num">{plants.length}종</span>
              <span className="pstat-label">키우는 식물</span>
            </div>
            <div className="profile-stat">
              <span className="pstat-num">{userPoints.toLocaleString()}P</span>
              <span className="pstat-label">포인트</span>
            </div>
            <div className="profile-stat">
              <span className="pstat-num">{myData?.streakDays || 0}일</span>
              <span className="pstat-label">연속 출석</span>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 */}
      <div className="mypage-tab-bar">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`mypage-tab${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.id === 'activity' ? '🌿 ' : tab.id === 'subscription' ? '🌸 ' : tab.id === 'diary' ? '📝 ' : tab.id === 'card' ? '🪪 ' : '📋 '}{tab.label}
          </button>
        ))}
      </div>

      <div className="mypage-content">
        {activeTab === 'activity' && (
          <div className="activity-tab">
            <MyCalendar plants={plants} setPlants={setPlants} />
            <div className="two-col-grid">
              <PointLevel points={userPoints} />
              <BadgeCollection selectedBadge={selectedBadge} onSelectBadge={setSelectedBadge} apiBadges={apiBadges} />
            </div>
          </div>
        )}

        {activeTab === 'subscription' && (() => {
          const activeSubs = subscriptions.filter(s => s.status === 'active');
          const cancelledSubs = [...subscriptions.filter(s => s.status !== 'active')]
            .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

          const renderSubCard = (sub) => {
            const startDate = new Date(sub.startDate);
            const fmt = (d) => `${d.getFullYear()}년 ${String(d.getMonth()+1).padStart(2,'0')}월 ${String(d.getDate()).padStart(2,'0')}일`;
            const startStr = fmt(startDate);
            const isActive = sub.status === 'active';
            const cancelStr = sub.cancelledAt ? fmt(new Date(sub.cancelledAt)) : '';
            const cancelReason = sub.cancelReason || '';

            return (
              <div key={sub.id} className={`sub-tab-card ${isActive ? 'active' : 'cancelled'}`}>
                <div className="sub-card-top">
                  <div className="sub-card-dot" style={{ background: sub.planGradient || sub.planColor || '#35A865' }} />
                  <div className="sub-card-info">
                    <div className="sub-card-name">{sub.planName}</div>
                    <div className="sub-card-period">{sub.planPeriodLabel} · {sub.planPrice?.toLocaleString()}원</div>
                  </div>
                  <span className={`sub-card-badge ${isActive ? 'badge-active' : 'badge-cancelled'}`}>
                    {isActive ? '구독 중' : '취소됨'}
                  </span>
                </div>

                <div className="sub-card-details">
                  <div className="sub-card-row">
                    <span className="sub-card-label">구독 시작일</span>
                    <span className="sub-card-value">{startStr}</span>
                  </div>
                  {sub.selectedColorName && (
                    <div className="sub-card-row">
                      <span className="sub-card-label">꽃다발 색상</span>
                      <span className="sub-card-value">🌸 {sub.selectedColorName}</span>
                    </div>
                  )}
                  {sub.letterService && (
                    <div className="sub-card-row">
                      <span className="sub-card-label">편지 서비스</span>
                      <span className="sub-card-value" style={{ color: '#35A865' }}>✓ 포함 (무료)</span>
                    </div>
                  )}
                  {sub.anniversaries?.filter(a => a.date).length > 0 && (
                    <div className="sub-card-row">
                      <span className="sub-card-label">등록 기념일</span>
                      <span className="sub-card-value">
                        {sub.anniversaries.filter(a => a.date).map(a => {
                          const TARGET_LABELS = { spouse:'배우자', child:'자녀', parents:'부모님', friend:'친구', lover:'연인', self:'나 자신', custom:'직접 입력' };
                          const label = a.targetId === 'custom' ? (a.customTarget || '기타') : (TARGET_LABELS[a.targetId] || a.targetId || '');
                          return `${label} ${a.date}`;
                        }).join(', ')}
                      </span>
                    </div>
                  )}
                  <div className="sub-card-row">
                    <span className="sub-card-label">배송지</span>
                    <span className="sub-card-value">{sub.deliveryInfo?.address || '-'}</span>
                  </div>
                  <div className="sub-card-row">
                    <span className="sub-card-label">주문번호</span>
                    <span className="sub-card-value" style={{ color: '#aaa', fontSize: '12px' }}>{sub.id}</span>
                  </div>
                  {!isActive && cancelStr && (
                    <div className="sub-card-row">
                      <span className="sub-card-label">취소일</span>
                      <span className="sub-card-value" style={{ color: '#e74c3c' }}>
                        {cancelStr}{cancelReason ? ` (${cancelReason})` : ''}
                      </span>
                    </div>
                  )}
                </div>

                <div className="sub-card-actions">
                  {cancelConfirmId === sub.id ? (
                    <div className="sub-cancel-confirm">
                      <p>정말 구독을 취소하시겠습니까?<br/><small>취소 후 다음 배송부터 중지됩니다.</small></p>
                      <div className="sub-cancel-btns">
                        <button className="btn-cancel-confirm" onClick={() => handleCancelSubscription(sub.id)}>
                          취소 확인
                        </button>
                        <button className="btn-cancel-abort" onClick={() => setCancelConfirmId(null)}>
                          돌아가기
                        </button>
                      </div>
                    </div>
                  ) : isActive ? (
                    <div className="sub-action-btns">
                      <button className="sub-change-btn" onClick={() => navigate('/subscription')}>
                        구독 변경
                      </button>
                      <button className="sub-cancel-btn" onClick={() => setCancelConfirmId(sub.id)}>
                        구독 취소
                      </button>
                    </div>
                  ) : (
                    <button className="sub-change-btn" onClick={() => navigate('/subscription')}>
                      다시 구독하기
                    </button>
                  )}
                </div>
              </div>
            );
          };

          return (
            <div className="subscription-tab">
              <div className="sub-tab-header">
                <h2 className="sub-tab-title">🌸 구독 관리</h2>
                <p className="sub-tab-desc">현재 구독 중인 플랜을 확인하고 관리하세요.</p>
              </div>

              {subscriptions.length === 0 ? (
                <div className="sub-tab-empty">
                  <div className="sub-tab-empty-icon">🌱</div>
                  <p>아직 구독 내역이 없습니다.</p>
                  <button className="sub-tab-go-btn" onClick={() => navigate('/subscription')}>
                    구독 시작하기
                  </button>
                </div>
              ) : (
                <div className="sub-tab-list">
                  {/* 활성 구독 */}
                  {activeSubs.length === 0 && (
                    <div className="sub-tab-no-active">
                      <p>현재 구독 중인 플랜이 없습니다.</p>
                      <button className="sub-tab-go-btn" onClick={() => navigate('/subscription')}>
                        구독 시작하기
                      </button>
                    </div>
                  )}
                  {activeSubs.map(renderSubCard)}
                </div>
              )}
            </div>
          );
        })()}

        {activeTab === 'diary' && (
          <div className="diary-tab">
            <PlantDiary plants={plants} />
          </div>
        )}

        {activeTab === 'card' && (
          <div className="card-tab">
            <PlantCard selectedBadge={profileBadgeTitle} plants={plants} userName={userName} />
          </div>
        )}

        {activeTab === 'terms' && (
          <div className="terms-tab">
            <TermsAgreement />
          </div>
        )}
      </div>

      {/* 빠른 링크 */}
      <div className="mypage-quick-links">
        <button onClick={() => navigate('/orders')} className="quick-link-btn">📦 주문 내역</button>
        <button onClick={() => navigate('/notice')} className="quick-link-btn">📢 공지사항</button>
        <button onClick={() => navigate('/community')} className="quick-link-btn">💬 커뮤니티</button>
        <button onClick={() => { logout(); navigate('/'); }} className="quick-link-btn logout-btn">🚪 로그아웃</button>
      </div>
    </div>
  );
}
