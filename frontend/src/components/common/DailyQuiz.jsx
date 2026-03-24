import { useState, useEffect } from 'react'
import axios from 'axios'
import { getTodayQuiz, getTodayQuizIndex } from '../../data/quizData'
import './DailyQuiz.css'

const STORAGE_KEY_PREFIX = 'kkotdam_quiz_'
const USER_KEY = 'kkotdam_user'

function getTodayKey() {
  const d = new Date()
  return `${STORAGE_KEY_PREFIX}${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function DailyQuiz() {
  const quiz = getTodayQuiz()
  const todayKey = getTodayKey()

  const [selected, setSelected] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState(null) // { correct, pointsEarned, alreadyAnswered }
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // 로그인 사용자 확인
    const storedUser = localStorage.getItem(USER_KEY)
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        // 파싱 실패 시 무시
      }
    }

    // 오늘 이미 응답했는지 확인
    const done = localStorage.getItem(todayKey)
    if (done) {
      try {
        const saved = JSON.parse(done)
        setResult(saved)
        setSubmitted(true)
        setSelected(saved.selectedIndex ?? null)
      } catch {
        // 파싱 실패 시 무시
      }
    }
  }, [todayKey])

  const handleSubmit = async () => {
    if (selected === null || loading) return
    setLoading(true)

    const correct = selected === quiz.correctIndex
    let pointsEarned = 0
    let alreadyAnswered = false

    // 로그인된 경우 백엔드에 포인트 지급 요청
    if (user && user.id) {
      try {
        const res = await axios.post('http://localhost:8080/api/quiz/submit', {
          memberId: user.id,
          answerIndex: selected,
        })
        pointsEarned = res.data.pointsEarned ?? 0
        alreadyAnswered = res.data.alreadyAnswered ?? false

        // 백엔드에서 이미 응답한 경우 백엔드 결과를 우선
        if (alreadyAnswered) {
          const savedResult = {
            correct: res.data.correct,
            pointsEarned: 0,
            alreadyAnswered: true,
            selectedIndex: selected,
          }
          localStorage.setItem(todayKey, JSON.stringify(savedResult))
          setResult(savedResult)
          setSubmitted(true)
          setLoading(false)
          return
        }
      } catch {
        // 백엔드 오류 시 프론트엔드 로직만으로 처리
      }
    }

    const finalResult = {
      correct,
      pointsEarned: correct ? pointsEarned || 0 : 0,
      alreadyAnswered,
      selectedIndex: selected,
    }

    localStorage.setItem(todayKey, JSON.stringify(finalResult))
    setResult(finalResult)
    setSubmitted(true)
    setLoading(false)
  }

  return (
    <section className="daily-quiz-section">
      <div className="section-inner">
        <div className="daily-quiz-card">
          <div className="quiz-header">
            <span className="quiz-badge">DAILY QUIZ</span>
            <h2 className="quiz-title">오늘의 꽃 지식 퀴즈</h2>
            <p className="quiz-subtitle">
              정답을 맞히면 <strong>15 포인트</strong> 지급! 하루에 한 번만 참여 가능해요.
            </p>
          </div>

          <div className="quiz-question">{quiz.question}</div>

          <ul className="quiz-options">
            {quiz.options.map((option, idx) => {
              let cls = 'quiz-option'
              if (submitted) {
                if (idx === quiz.correctIndex) cls += ' correct'
                else if (idx === selected && selected !== quiz.correctIndex) cls += ' wrong'
              } else if (selected === idx) {
                cls += ' selected'
              }
              return (
                <li key={idx}>
                  <button
                    className={cls}
                    onClick={() => !submitted && setSelected(idx)}
                    disabled={submitted}
                  >
                    <span className="option-label">{String.fromCharCode(65 + idx)}</span>
                    {option}
                  </button>
                </li>
              )
            })}
          </ul>

          {!submitted ? (
            <div className="quiz-actions">
              <button
                className="quiz-submit-btn"
                onClick={handleSubmit}
                disabled={selected === null || loading}
              >
                {loading ? '제출 중...' : '정답 제출'}
              </button>
              {!user && (
                <p className="quiz-login-hint">
                  로그인하면 포인트를 적립할 수 있어요!
                </p>
              )}
            </div>
          ) : (
            <div className={`quiz-result ${result?.correct ? 'result-correct' : 'result-wrong'}`}>
              {result?.alreadyAnswered ? (
                <p className="result-msg">오늘은 이미 퀴즈에 참여하셨어요. 내일 또 도전해보세요!</p>
              ) : result?.correct ? (
                <>
                  <p className="result-msg">정답이에요! 🎉</p>
                  {user && result.pointsEarned > 0 && (
                    <p className="result-points">+{result.pointsEarned} 포인트 적립</p>
                  )}
                  {!user && (
                    <p className="result-points-hint">로그인하면 포인트가 적립됩니다.</p>
                  )}
                </>
              ) : (
                <p className="result-msg">아쉽게도 틀렸어요. 내일 다시 도전해보세요!</p>
              )}
              <p className="quiz-explanation">{quiz.explanation}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
