// 꽃 지식 데일리 퀴즈 문제 목록
// 백엔드 QuizService.java의 CORRECT_ANSWERS 리스트와 correctIndex 순서가 동일해야 합니다.
export const quizQuestions = [
  {
    question: "장미의 대표적인 꽃말은 무엇인가요?",
    options: ["사랑과 열정", "순수와 청결", "희망과 번영", "우정과 신뢰"],
    correctIndex: 0,
    explanation: "빨간 장미는 '사랑과 열정'을 상징합니다. 색에 따라 꽃말이 달라지기도 해요.",
  },
  {
    question: "다음 중 봄에 피지 않는 꽃은 무엇인가요?",
    options: ["코스모스", "벚꽃", "개나리", "진달래"],
    correctIndex: 0,
    explanation: "코스모스는 가을(9~10월)에 피는 꽃입니다. 벚꽃·개나리·진달래는 모두 봄꽃이에요.",
  },
  {
    question: "해바라기의 꽃말은 무엇인가요?",
    options: ["당신만 바라봐요", "영원한 사랑", "고독", "감사"],
    correctIndex: 0,
    explanation: "해바라기는 항상 태양을 향하는 모습에서 '당신만 바라봐요'라는 꽃말이 생겼습니다.",
  },
  {
    question: "튤립의 원산지는 어디인가요?",
    options: ["네덜란드", "영국", "터키", "일본"],
    correctIndex: 2,
    explanation: "튤립의 원산지는 터키(오스만 제국)입니다. 17세기 네덜란드로 전해져 지금은 네덜란드가 최대 재배국이 되었어요.",
  },
  {
    question: "우리나라 국화(國花)인 무궁화의 개화 시기는?",
    options: ["봄 (3~5월)", "여름~가을 (7~10월)", "겨울 (12~2월)", "사계절 내내"],
    correctIndex: 1,
    explanation: "무궁화는 7월부터 10월까지 100일 이상 피고 진다는 의미에서 '무궁(無窮)'이라는 이름이 붙었습니다.",
  },
  {
    question: "국화(菊花)의 꽃말은 무엇인가요?",
    options: ["고귀함과 절개", "사랑의 맹세", "행운", "첫사랑"],
    correctIndex: 0,
    explanation: "국화는 서리 속에서도 꽃을 피우는 강인함 때문에 '고귀함과 절개'를 상징합니다.",
  },
  {
    question: "벚꽃(Cherry Blossom)의 학명 속명(屬名)은?",
    options: ["Rosa", "Lilium", "Prunus", "Chrysanthemum"],
    correctIndex: 3,
    explanation: "벚나무는 Prunus 속에 속합니다. 대표 학명은 Prunus serrulata(왕벚나무)입니다.",
  },
  {
    question: "수선화의 꽃말로 올바른 것은?",
    options: ["슬픈 사랑", "자기애(自己愛)와 자존심", "열정", "우정"],
    correctIndex: 1,
    explanation: "그리스 신화의 나르키소스에서 유래해 '자기애'가 수선화의 대표 꽃말이 되었습니다.",
  },
  {
    question: "라벤더가 주로 알려진 효능은 무엇인가요?",
    options: ["피부 미백", "소화 촉진", "진정·불면 해소", "혈압 강하"],
    correctIndex: 2,
    explanation: "라벤더 향은 스트레스 완화와 수면 개선에 도움을 줘 아로마테라피에 널리 활용됩니다.",
  },
  {
    question: "민들레의 꽃말은 무엇인가요?",
    options: ["행복한 사랑·진실", "이별의 슬픔", "순결", "기다림"],
    correctIndex: 0,
    explanation: "민들레는 '행복한 사랑'과 '진실'을 꽃말로 가집니다. 홀씨가 바람에 날리는 모습은 소망을 상징하기도 해요.",
  },
  {
    question: "백합(나리)의 꽃말은 무엇인가요?",
    options: ["고독", "순결·깨끗한 마음", "사랑의 고백", "질투"],
    correctIndex: 1,
    explanation: "흰 백합은 순결과 성모 마리아를 상징하는 꽃으로, '순결한 마음'이 대표 꽃말입니다.",
  },
  {
    question: "카네이션이 특히 많이 쓰이는 기념일은?",
    options: ["발렌타인데이", "크리스마스", "어린이날", "어버이날"],
    correctIndex: 3,
    explanation: "카네이션은 어버이날(5월 8일)에 부모님께 감사를 전하는 꽃으로 널리 사용됩니다.",
  },
  {
    question: "아이리스(붓꽃)가 상징하는 것으로 가장 유명한 것은?",
    options: ["지혜와 희망의 메시지", "이별", "풍요", "고독"],
    correctIndex: 0,
    explanation: "아이리스는 그리스 신화의 무지개 여신 이리스에서 이름이 유래해 '희망과 지혜의 메시지'를 상징합니다.",
  },
  {
    question: "흔히 '봄의 여왕'이라 불리는 꽃은?",
    options: ["개나리", "진달래", "튤립", "목련"],
    correctIndex: 2,
    explanation: "튤립은 화려한 색과 기품 있는 형태로 '봄의 여왕'이라 불립니다.",
  },
  {
    question: "목련이 잎보다 꽃이 먼저 피는 이유는?",
    options: ["양분 절약을 위해", "수분(受粉) 효율을 높이기 위해", "해충 방어를 위해", "광합성 최대화를 위해"],
    correctIndex: 1,
    explanation: "잎이 없을 때 꽃을 피워 곤충이 꽃을 쉽게 발견하게 해 수분 효율을 높입니다.",
  },
  {
    question: "코스모스의 꽃말은 무엇인가요?",
    options: ["소녀의 순정·평화", "영원한 사랑", "기쁨", "기다림"],
    correctIndex: 0,
    explanation: "코스모스의 꽃말은 '소녀의 순정'과 '평화'입니다. 가을 들판에 흔들리는 모습이 연상됩니다.",
  },
  {
    question: "복숭아꽃(桃花)의 꽃말로 알맞은 것은?",
    options: ["결별", "바람둥이·매혹", "희망", "우정"],
    correctIndex: 3,
    explanation: "복숭아꽃의 꽃말 중 하나는 '바람둥이·매혹'으로, 요염한 분홍빛이 그 이미지를 만들었습니다.",
  },
  {
    question: "동백꽃의 대표적인 특징으로 옳은 것은?",
    options: ["향기가 매우 강하다", "씨앗이 바람에 날린다", "꽃이 통째로 떨어진다", "열매가 독성을 지닌다"],
    correctIndex: 2,
    explanation: "동백꽃은 꽃잎이 하나씩 지는 것이 아니라 꽃 전체가 통째로 떨어지는 것으로 유명합니다.",
  },
  {
    question: "매화가 피는 시기는 언제인가요?",
    options: ["여름 (6~8월)", "초봄·이른 봄 (1~3월)", "가을 (9~11월)", "한겨울 (12~1월)"],
    correctIndex: 1,
    explanation: "매화는 이른 봄(1~3월)에 눈 속에서도 꽃을 피워 인내와 기상을 상징합니다.",
  },
  {
    question: "진달래에 대한 설명으로 옳은 것은?",
    options: ["꽃잎을 식용으로 활용할 수 있다", "독성이 강해 절대 먹으면 안 된다", "한여름에 핀다", "향기가 매우 진하다"],
    correctIndex: 0,
    explanation: "진달래 꽃잎은 식용이 가능해 화전(花煎)을 만들 때 사용합니다. 비슷한 철쭉은 독성이 있어 구별이 중요해요.",
  },
]

/**
 * 오늘 날짜 기준으로 퀴즈 인덱스를 계산합니다.
 * 백엔드 QuizService.getTodayQuizIndex()와 동일한 로직입니다.
 */
export function getTodayQuizIndex() {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now - start
  const oneDay = 1000 * 60 * 60 * 24
  const dayOfYear = Math.floor(diff / oneDay)
  return dayOfYear % quizQuestions.length
}

/**
 * 오늘의 퀴즈 문제를 반환합니다.
 */
export function getTodayQuiz() {
  return quizQuestions[getTodayQuizIndex()]
}
