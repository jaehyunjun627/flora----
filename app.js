/* ── app.js ── 식물도감 메인 스크립트 ── */

// ── 상태 ──
const state = {
  plants: [],
  filtered: [],
  activeCategory: 'all',
  activeSeason: 'all',
  activeToxicity: 'all',
  searchQuery: ''
};

// ── Wikimedia Commons 이미지 URL 생성 ──
function getWikiImageUrl(wikiName, size = 400) {
  if (!wikiName) return null;
  const encoded = encodeURIComponent(wikiName.replace(/ /g, '_'));
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encoded}.jpg?width=${size}`;
}

// ── 카드 이미지: Wikimedia 우선, 실패 시 fallback ──
function createCardImage(plant) {
  const img = document.createElement('img');
  const fallback = document.createElement('div');
  fallback.className = 'fallback-icon';
  fallback.textContent = getCategoryEmoji(plant.category);

  const wikiUrl = getWikiImageUrl(plant.wikiImage, 400);
  if (wikiUrl) {
    img.src = wikiUrl;
    img.alt = plant.nameKo;
    img.loading = 'lazy';
    img.onerror = () => {
      img.remove();
      img.parentElement && img.parentElement.appendChild(fallback);
    };
  } else {
    return fallback;
  }
  return img;
}

// ── 모달 이미지 ──
function loadModalImage(plant) {
  const modalImg = document.getElementById('modal-img');
  const wikiUrl = getWikiImageUrl(plant.wikiImage, 640);
  if (wikiUrl) {
    modalImg.src = wikiUrl;
    modalImg.alt = plant.nameKo;
    modalImg.onerror = () => {
      modalImg.src = '';
      modalImg.style.display = 'none';
    };
    modalImg.style.display = '';
  } else {
    modalImg.src = '';
    modalImg.style.display = 'none';
  }
}

// ── 카테고리 이모지 ──
function getCategoryEmoji(cat) {
  const map = {
    '꽃': '🌸', '나무': '🌳', '채소': '🥬', '허브': '🌿',
    '과수': '🍎', '다육식물': '🪴', '관엽식물': '🌴',
    '야생화': '🌼', '수생식물': '🪷'
  };
  return map[cat] || '🌱';
}

// ── 계절 라벨 ──
const SEASON_COLORS = { '봄': 'spring', '여름': 'summer', '가을': 'autumn', '겨울': 'winter' };

// ── 카드 렌더링 ──
function renderCard(plant) {
  const card = document.createElement('div');
  card.className = 'plant-card';
  card.dataset.id = plant.id;

  // 이미지 영역
  const imgWrap = document.createElement('div');
  imgWrap.className = 'card-img-wrap';
  imgWrap.appendChild(createCardImage(plant));

  // 계절 점
  const seasonBadge = document.createElement('div');
  seasonBadge.className = 'card-season-badge';
  (plant.season || []).forEach(s => {
    const dot = document.createElement('div');
    dot.className = `season-dot ${s}`;
    dot.title = s;
    seasonBadge.appendChild(dot);
  });
  imgWrap.appendChild(seasonBadge);

  // 독성 배지
  const toxBadge = document.createElement('div');
  toxBadge.className = `card-toxicity ${plant.petToxicity}`;
  toxBadge.title = plant.petToxicity === 'safe' ? '반려동물 안전' : '반려동물 독성 주의';
  toxBadge.textContent = plant.petToxicity === 'safe' ? '✓' : '!';
  imgWrap.appendChild(toxBadge);

  // 본문
  const body = document.createElement('div');
  body.className = 'card-body';
  body.innerHTML = `
    <div class="card-category">${plant.category}</div>
    <div class="card-name-ko">${plant.nameKo}</div>
    <div class="card-name-en">${plant.nameEn || ''}</div>
    <div class="card-family">${plant.family}</div>
  `;

  card.appendChild(imgWrap);
  card.appendChild(body);
  card.addEventListener('click', () => openModal(plant));
  return card;
}

// ── 그리드 렌더링 ──
function renderGrid() {
  const grid = document.getElementById('plant-grid');
  const empty = document.getElementById('empty-state');
  const countEl = document.getElementById('result-count');

  grid.innerHTML = '';
  countEl.textContent = state.filtered.length;

  if (state.filtered.length === 0) {
    empty.style.display = '';
  } else {
    empty.style.display = 'none';
    const fragment = document.createDocumentFragment();
    state.filtered.forEach(p => fragment.appendChild(renderCard(p)));
    grid.appendChild(fragment);
  }
}

// ── 필터링 ──
function applyFilters() {
  const q = state.searchQuery.trim().toLowerCase();
  state.filtered = state.plants.filter(p => {
    const matchCat = state.activeCategory === 'all' || p.category === state.activeCategory;
    const matchSeason = state.activeSeason === 'all' || (p.season && p.season.includes(state.activeSeason));
    const matchTox = state.activeToxicity === 'all' || p.petToxicity === state.activeToxicity;
    const matchQ = !q || [p.nameKo, p.nameEn, p.nameLatin, p.family].some(v => v && v.toLowerCase().includes(q));
    return matchCat && matchSeason && matchTox && matchQ;
  });
  renderGrid();
}

// ── 모달 열기 ──
function openModal(plant) {
  loadModalImage(plant);

  document.getElementById('modal-name-ko').textContent = plant.nameKo;
  document.getElementById('modal-name-en').textContent = plant.nameEn || '';
  document.getElementById('modal-name-latin').textContent = plant.nameLatin || '';
  document.getElementById('modal-desc').textContent = plant.description || '';

  // 독성 배지
  const toxBadge = document.getElementById('modal-toxicity-badge');
  toxBadge.className = `modal-toxicity-badge ${plant.petToxicity}`;
  toxBadge.textContent = plant.petToxicity === 'safe' ? '✅ 반려동물 안전' : '⚠️ 독성 주의';

  // 메타 태그
  const meta = document.getElementById('modal-meta');
  meta.innerHTML = '';
  const tags = [plant.family, plant.category].filter(Boolean);
  tags.forEach(t => {
    const span = document.createElement('span');
    span.className = 'meta-tag';
    span.textContent = t;
    meta.appendChild(span);
  });

  // 계절 배지 (이미지 위)
  const badges = document.getElementById('modal-badges');
  badges.innerHTML = '';
  (plant.season || []).forEach(s => {
    const b = document.createElement('span');
    b.className = `season-badge ${s}`;
    b.textContent = `${getSeasonEmoji(s)} ${s}`;
    badges.appendChild(b);
  });

  // 계절 (본문)
  const seasonsEl = document.getElementById('modal-seasons');
  seasonsEl.innerHTML = '';

  // Wiki 링크
  const wikiLink = document.getElementById('wiki-link');
  wikiLink.href = plant.wikiImage
    ? `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(plant.wikiImage.replace(/ /g, '_'))}.jpg`
    : `https://commons.wikimedia.org/w/index.php?search=${encodeURIComponent(plant.nameEn || plant.nameKo)}`;

  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function getSeasonEmoji(s) {
  return { '봄': '🌸', '여름': '☀️', '가을': '🍂', '겨울': '❄️' }[s] || '';
}

// ── 모달 닫기 ──
function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

// ── 칩 필터 이벤트 ──
function initChips(groupId, stateKey) {
  const group = document.getElementById(groupId);
  group.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      group.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state[stateKey] = chip.dataset.value;
      applyFilters();
    });
  });
}

// ── JSON 불러오기 ──
async function loadPlants() {
  try {
    const res = await fetch('plants.json');
    if (!res.ok) throw new Error('plants.json 로드 실패');
    state.plants = await res.json();
    state.filtered = [...state.plants];
    document.getElementById('total-count').textContent = state.plants.length;
    document.getElementById('result-count').textContent = state.plants.length;
    renderGrid();
  } catch (err) {
    console.error(err);
    document.getElementById('plant-grid').innerHTML = `
      <div class="empty-state" style="display:block; grid-column:1/-1">
        <div class="empty-icon">⚠️</div>
        <p>데이터를 불러오지 못했습니다</p>
        <small>plants.json 파일이 같은 폴더에 있는지 확인해주세요</small>
      </div>`;
  }
}

// ── 초기화 ──
(function init() {
  loadPlants();

  initChips('category-filters', 'activeCategory');
  initChips('season-filters', 'activeSeason');
  initChips('toxicity-filters', 'activeToxicity');

  let searchTimer;
  document.getElementById('search-input').addEventListener('input', e => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.searchQuery = e.target.value;
      applyFilters();
    }, 220);
  });

  document.getElementById('reset-btn').addEventListener('click', () => {
    state.activeCategory = 'all';
    state.activeSeason = 'all';
    state.activeToxicity = 'all';
    state.searchQuery = '';
    document.getElementById('search-input').value = '';
    document.querySelectorAll('.chip-group').forEach(g => {
      g.querySelectorAll('.chip').forEach((c, i) => c.classList.toggle('active', i === 0));
    });
    applyFilters();
  });

  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-overlay')) closeModal();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
})();
