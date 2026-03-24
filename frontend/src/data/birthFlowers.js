// 366일 탄생화 데이터
// getBirthFlower(month, day) → { name, emoji, meaning, description }

const MONTH_FLOWERS = [
  // 1월 (January)
  [
    { start: 1,  end: 5,  name: '설강화',   emoji: '🌸', meaning: '희망, 위로',       description: '눈 속에서 피어나는 설강화는 추운 겨울을 견디는 희망의 꽃입니다.' },
    { start: 6,  end: 10, name: '수선화',   emoji: '🌼', meaning: '자존심, 고결함',    description: '순백의 꽃잎과 은은한 향기로 고결한 아름다움을 상징합니다.' },
    { start: 11, end: 15, name: '팬지',     emoji: '💜', meaning: '사색, 나를 생각해줘', description: '다채로운 색의 팬지는 사랑하는 사람을 생각하는 마음을 담고 있습니다.' },
    { start: 16, end: 20, name: '복수초',   emoji: '🌻', meaning: '행복, 영원한 사랑',  description: '새해를 맞이하는 이른 봄의 복수초는 행복과 장수를 상징합니다.' },
    { start: 21, end: 25, name: '동백꽃',   emoji: '🌺', meaning: '겸손한 미덕, 완벽한 사랑', description: '붉은 동백꽃은 완벽한 아름다움과 겸손한 덕을 지닌 꽃입니다.' },
    { start: 26, end: 31, name: '카네이션', emoji: '🌸', meaning: '모정, 순수한 사랑',   description: '카네이션은 어머니의 사랑과 순수한 감정을 표현하는 꽃입니다.' },
  ],
  // 2월 (February)
  [
    { start: 1,  end: 5,  name: '프리지아',   emoji: '💛', meaning: '순결, 청순함',       description: '달콤한 향기의 프리지아는 사랑하는 이에게 전하는 순결한 마음입니다.' },
    { start: 6,  end: 10, name: '아네모네',   emoji: '🌸', meaning: '진실한 사랑, 기대',   description: '바람꽃이라 불리는 아네모네는 진실된 마음을 전하는 꽃입니다.' },
    { start: 11, end: 14, name: '장미(빨강)', emoji: '🌹', meaning: '열정적인 사랑',        description: '발렌타인의 상징, 빨간 장미는 뜨거운 사랑을 고백하는 꽃입니다.' },
    { start: 15, end: 19, name: '라일락',     emoji: '💜', meaning: '첫사랑, 청춘의 추억', description: '보라빛 라일락은 첫사랑의 설렘과 아름다운 청춘을 떠올리게 합니다.' },
    { start: 20, end: 24, name: '미모사',     emoji: '💛', meaning: '감수성, 예민함',       description: '노란 미모사는 예민한 감수성과 섬세한 마음씨를 나타냅니다.' },
    { start: 25, end: 29, name: '바이올렛',   emoji: '💜', meaning: '소박함, 성실함',       description: '작고 수수한 바이올렛은 성실하고 소박한 아름다움을 지닌 꽃입니다.' },
  ],
  // 3월 (March)
  [
    { start: 1,  end: 5,  name: '히아신스',   emoji: '💜', meaning: '겸손한 사랑, 슬픔',  description: '진한 향기의 히아신스는 사랑에 담긴 그리움을 표현합니다.' },
    { start: 6,  end: 10, name: '튤립(노랑)', emoji: '🌷', meaning: '희망, 밝은 미소',     description: '봄을 알리는 노란 튤립은 희망차고 밝은 앞날을 상징합니다.' },
    { start: 11, end: 15, name: '벚꽃',       emoji: '🌸', meaning: '정신의 아름다움, 순결', description: '봄날의 벚꽃은 순수하고 아름다운 정신세계를 상징합니다.' },
    { start: 16, end: 20, name: '목련',       emoji: '🌸', meaning: '고귀함, 자연애',       description: '이른 봄 가장 먼저 피어나는 목련은 고귀한 품격을 상징합니다.' },
    { start: 21, end: 25, name: '민들레',     emoji: '🌼', meaning: '행복, 긍정적인 사랑',  description: '어디서나 피어나는 민들레는 강인하고 긍정적인 힘을 상징합니다.' },
    { start: 26, end: 31, name: '개나리',     emoji: '💛', meaning: '희망, 기대',           description: '봄을 맞이하는 샛노란 개나리는 새로운 희망과 기대의 꽃입니다.' },
  ],
  // 4월 (April)
  [
    { start: 1,  end: 5,  name: '튤립(빨강)', emoji: '🌷', meaning: '사랑 고백, 정열',     description: '빨간 튤립은 열정적인 사랑을 고백하는 봄의 꽃입니다.' },
    { start: 6,  end: 10, name: '데이지',     emoji: '🌼', meaning: '순수함, 명랑함',       description: '하얗고 작은 데이지는 순수하고 밝은 마음을 상징합니다.' },
    { start: 11, end: 15, name: '수련',       emoji: '🌸', meaning: '청순한 마음, 순결',    description: '물 위에 피어나는 수련은 깨끗하고 순결한 마음을 나타냅니다.' },
    { start: 16, end: 20, name: '라넌큘러스', emoji: '🌸', meaning: '매력, 빛나는 매력',    description: '풍성한 꽃잎의 라넌큘러스는 눈부신 매력과 아름다움의 꽃입니다.' },
    { start: 21, end: 25, name: '팝피',       emoji: '🌺', meaning: '위로, 상상력',         description: '붉은 양귀비는 상상력과 창의력, 따뜻한 위로를 상징합니다.' },
    { start: 26, end: 30, name: '아이리스',   emoji: '💜', meaning: '지혜, 믿음, 희망',     description: '청보라빛 아이리스는 지혜와 믿음, 그리고 희망을 상징하는 꽃입니다.' },
  ],
  // 5월 (May)
  [
    { start: 1,  end: 5,  name: '은방울꽃',   emoji: '🌸', meaning: '순결, 행복이 돌아오다', description: '종처럼 생긴 은방울꽃은 행복의 귀환과 순결을 상징합니다.' },
    { start: 6,  end: 10, name: '작약',       emoji: '🌸', meaning: '부끄러움, 수줍음',     description: '풍성하고 아름다운 작약은 수줍고 부끄러운 사랑을 담고 있습니다.' },
    { start: 11, end: 15, name: '장미(흰색)', emoji: '🌹', meaning: '순결, 존경, 침묵',     description: '흰 장미는 순수한 사랑과 깊은 존경심을 전하는 꽃입니다.' },
    { start: 16, end: 20, name: '제라늄',     emoji: '🌸', meaning: '행복, 진실한 우정',    description: '밝고 다채로운 제라늄은 진실된 우정과 행복을 상징합니다.' },
    { start: 21, end: 25, name: '라벤더',     emoji: '💜', meaning: '침묵, 기다림, 고독',   description: '은은한 보라빛 라벤더는 고요한 기다림과 고독한 아름다움입니다.' },
    { start: 26, end: 31, name: '클로버',     emoji: '🌿', meaning: '행운, 행복',           description: '네잎 클로버는 행운과 행복을 가져다주는 사랑스러운 식물입니다.' },
  ],
  // 6월 (June)
  [
    { start: 1,  end: 5,  name: '장미(분홍)', emoji: '🌹', meaning: '행복한 사랑, 감사',    description: '분홍 장미는 감사와 행복한 사랑, 따뜻한 마음을 전합니다.' },
    { start: 6,  end: 10, name: '금어초',     emoji: '🌸', meaning: '욕망, 오만',           description: '토끼 입처럼 생긴 금어초는 강렬한 욕망과 강인함을 상징합니다.' },
    { start: 11, end: 15, name: '수국',       emoji: '💙', meaning: '진심, 변덕, 냉정',     description: '풍성한 수국은 진심 어린 감정의 풍부함과 변화를 나타냅니다.' },
    { start: 16, end: 20, name: '카모마일',   emoji: '🌼', meaning: '역경 속의 힘, 인내',   description: '작고 하얀 카모마일은 어려움 속에서도 굴하지 않는 강인함입니다.' },
    { start: 21, end: 25, name: '백합(흰색)', emoji: '🌸', meaning: '순결, 위엄',           description: '우아한 흰 백합은 순결함과 고귀한 위엄을 상징하는 꽃입니다.' },
    { start: 26, end: 30, name: '스위트피',   emoji: '🌸', meaning: '섬세한 즐거움, 작별',  description: '달콤한 향기의 스위트피는 소중한 기억과 아름다운 이별을 담습니다.' },
  ],
  // 7월 (July)
  [
    { start: 1,  end: 5,  name: '해바라기',   emoji: '🌻', meaning: '동경, 애모, 기다림',   description: '태양을 향해 자라는 해바라기는 변하지 않는 동경과 사랑을 상징합니다.' },
    { start: 6,  end: 10, name: '델피늄',     emoji: '💙', meaning: '자유, 경쾌함',         description: '하늘색 델피늄은 자유로운 영혼과 경쾌한 기분을 상징합니다.' },
    { start: 11, end: 15, name: '리시안서스', emoji: '💜', meaning: '영원한 사랑',           description: '우아한 리시안서스는 시들지 않는 영원한 사랑을 나타냅니다.' },
    { start: 16, end: 20, name: '칸나',       emoji: '🌺', meaning: '정렬, 기쁨',           description: '열대적인 칸나는 뜨거운 열정과 풍성한 기쁨을 상징합니다.' },
    { start: 21, end: 25, name: '베고니아',   emoji: '🌸', meaning: '친절, 겸손함',         description: '다양한 색의 베고니아는 친절하고 겸손한 마음씨를 나타냅니다.' },
    { start: 26, end: 31, name: '연꽃',       emoji: '🪷', meaning: '순결, 신성함, 깨달음', description: '진흙 속에서 피어나는 연꽃은 순결함과 깨달음의 상징입니다.' },
  ],
  // 8월 (August)
  [
    { start: 1,  end: 5,  name: '글라디올러스', emoji: '🌸', meaning: '추억, 열애',         description: '칼처럼 뻗은 글라디올러스는 강렬한 사랑과 소중한 추억을 담습니다.' },
    { start: 6,  end: 10, name: '에키나세아',   emoji: '🌸', meaning: '강인함, 치유',       description: '보라빛 에키나세아는 강인한 생명력과 치유의 힘을 상징합니다.' },
    { start: 11, end: 15, name: '해당화',       emoji: '🌹', meaning: '아름다운 추억, 향수', description: '바닷가에 피는 해당화는 그리운 추억과 아름다운 고향을 떠올립니다.' },
    { start: 16, end: 20, name: '달리아',       emoji: '🌺', meaning: '화려함, 우아함',     description: '풍성하고 화려한 달리아는 우아함과 품격 있는 아름다움을 자랑합니다.' },
    { start: 21, end: 25, name: '천일홍',       emoji: '🌸', meaning: '불변, 영원한 사랑',  description: '마르지 않는 천일홍은 변하지 않는 사랑과 영원함을 상징합니다.' },
    { start: 26, end: 31, name: '루드베키아',   emoji: '🌼', meaning: '공정함, 밝음',       description: '여름의 태양 같은 루드베키아는 공정하고 밝은 성격을 상징합니다.' },
  ],
  // 9월 (September)
  [
    { start: 1,  end: 5,  name: '코스모스',   emoji: '🌸', meaning: '소녀의 순정, 순결',   description: '가을 하늘 아래 흔들리는 코스모스는 순수한 소녀의 마음입니다.' },
    { start: 6,  end: 10, name: '용담',       emoji: '💙', meaning: '성실함, 슬픈 사랑',   description: '깊고 진한 파란빛 용담은 성실함과 슬프도록 아름다운 사랑입니다.' },
    { start: 11, end: 15, name: '과꽃',       emoji: '💜', meaning: '다양함, 믿음직함',    description: '다채로운 색의 과꽃은 믿음직한 성격과 다양한 매력을 담습니다.' },
    { start: 16, end: 20, name: '버베나',     emoji: '💜', meaning: '가족 화목, 협력',     description: '무리 지어 피는 버베나는 가족의 화목과 협력을 상징합니다.' },
    { start: 21, end: 25, name: '세이지',     emoji: '💜', meaning: '지혜, 건강',          description: '허브 세이지는 오랜 지혜와 건강한 삶을 상징하는 식물입니다.' },
    { start: 26, end: 30, name: '국화(흰색)', emoji: '🌼', meaning: '성실, 진실',          description: '흰 국화는 진실하고 성실한 마음을 전통적으로 상징해 왔습니다.' },
  ],
  // 10월 (October)
  [
    { start: 1,  end: 5,  name: '국화(노랑)', emoji: '🌼', meaning: '장수, 부유함',        description: '노란 국화는 오래 행복하게 살고 풍요롭기를 바라는 마음입니다.' },
    { start: 6,  end: 10, name: '매리골드',   emoji: '🌻', meaning: '이별의 슬픔, 질투',  description: '선명한 주황빛 매리골드는 이별의 아픔과 진한 감정을 담고 있습니다.' },
    { start: 11, end: 15, name: '금잔화',     emoji: '🌼', meaning: '이별, 슬픔',          description: '금잔화는 이별의 아픔과 슬픔을 담은 가을의 꽃입니다.' },
    { start: 16, end: 20, name: '토란꽃',     emoji: '🌸', meaning: '즐거움, 행복',        description: '소박한 토란꽃은 일상 속 작은 즐거움과 소소한 행복을 담습니다.' },
    { start: 21, end: 25, name: '핑크뮬리',   emoji: '🌸', meaning: '낭만, 몽환',          description: '분홍빛 물결의 핑크뮬리는 낭만적이고 몽환적인 가을을 상징합니다.' },
    { start: 26, end: 31, name: '억새',       emoji: '🌾', meaning: '활력, 생명력',        description: '바람에 흔들리는 억새는 강인한 생명력과 활기찬 에너지를 나타냅니다.' },
  ],
  // 11월 (November)
  [
    { start: 1,  end: 5,  name: '국화(빨강)', emoji: '🌺', meaning: '사랑, 진심',          description: '빨간 국화는 가슴 속 깊은 사랑과 진심 어린 마음을 전합니다.' },
    { start: 6,  end: 10, name: '시클라멘',   emoji: '🌸', meaning: '수줍음, 내성적임',    description: '고개 숙인 시클라멘은 수줍고 내성적이지만 깊은 감정을 담습니다.' },
    { start: 11, end: 15, name: '국화(보라)', emoji: '💜', meaning: '우아함, 신비로움',    description: '보라 국화는 신비로운 우아함과 고귀한 기품을 상징합니다.' },
    { start: 16, end: 20, name: '포인세티아', emoji: '🌺', meaning: '박애, 행운',          description: '붉은 포인세티아는 넓은 사랑과 행운을 가져다주는 겨울 꽃입니다.' },
    { start: 21, end: 25, name: '동백(흰색)', emoji: '🌸', meaning: '완벽한 아름다움',     description: '흰 동백은 꾸밈없이 완벽한 아름다움과 고결함을 상징합니다.' },
    { start: 26, end: 30, name: '마가렛',     emoji: '🌼', meaning: '진실한 사랑, 예언',   description: '꽃잎으로 사랑을 점치는 마가렛은 진실한 사랑의 꽃입니다.' },
  ],
  // 12월 (December)
  [
    { start: 1,  end: 5,  name: '크리스마스로즈', emoji: '🌸', meaning: '위로, 안심',      description: '겨울에 피는 크리스마스로즈는 추운 계절의 따뜻한 위로입니다.' },
    { start: 6,  end: 10, name: '홀리(호랑가시)', emoji: '🌿', meaning: '예지, 선견지명',  description: '빨간 열매의 홀리는 미래를 보는 지혜와 예지를 상징합니다.' },
    { start: 11, end: 15, name: '수선화(흰색)',    emoji: '🌸', meaning: '고결, 품위',      description: '겨울 수선화의 청초한 흰빛은 고결한 품위와 우아함을 나타냅니다.' },
    { start: 16, end: 20, name: '포인세티아(흰색)', emoji: '🌸', meaning: '축복, 순수함',  description: '흰 포인세티아는 성스러운 축복과 순수한 기쁨을 상징합니다.' },
    { start: 21, end: 25, name: '히아신스(흰색)', emoji: '🌸', meaning: '아름다운 추억',   description: '겨울의 흰 히아신스는 소중한 추억과 그리운 시간을 담습니다.' },
    { start: 26, end: 31, name: '설강화',           emoji: '❄️', meaning: '희망, 새 출발', description: '한 해의 끝자락에 피는 설강화는 새로운 희망의 시작을 알립니다.' },
  ],
]

/**
 * 생년월일로 탄생화 조회
 * @param {number} month - 월 (1~12)
 * @param {number} day - 일 (1~31)
 * @returns {{ name, emoji, meaning, description }}
 */
export function getBirthFlower(month, day) {
  const m = Math.max(1, Math.min(12, month))
  const d = Math.max(1, Math.min(31, day))
  const groups = MONTH_FLOWERS[m - 1]
  for (const group of groups) {
    if (d >= group.start && d <= group.end) {
      return { name: group.name, emoji: group.emoji, meaning: group.meaning, description: group.description }
    }
  }
  // fallback: last group of the month
  const last = groups[groups.length - 1]
  return { name: last.name, emoji: last.emoji, meaning: last.meaning, description: last.description }
}

export default MONTH_FLOWERS
