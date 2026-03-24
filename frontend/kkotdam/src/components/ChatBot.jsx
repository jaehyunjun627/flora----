import React, { useState, useRef, useEffect } from 'react';
import './ChatBot.css';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      const newMessage = {
        id: Date.now(),
        text: input,
        sender: 'user',
        timestamp: new Date(),
      };
      setMessages([...messages, newMessage]);
      setInput('');
    }
  };

  const handleButtonSend = () => {
    if (input.trim()) {
      const newMessage = {
        id: Date.now(),
        text: input,
        sender: 'user',
        timestamp: new Date(),
      };
      setMessages([...messages, newMessage]);
      setInput('');
    }
  };

  return (
    <div className="chatbot-container">
      {/* 챗봇 아이콘 버튼 */}
      <button
        className="chatbot-icon-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="채팅 시작하기"
      >
        <img
          src="/src/assets/Group 11 1.png"
          alt="ChatBot Icon"
          className="chatbot-icon"
        />
      </button>

      {/* 채팅 창 */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>꽃담 상담</h3>
            <button
              className="chatbot-close-btn"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          {/* 추천 질문 영역 */}
          {messages.length === 0 && (
            <div className="chatbot-suggestions">
              <p className="suggestions-title">추천 질문</p>
              <div className="suggestions-list">
                {/* 나중에 추가될 추천질문 */}
              </div>
            </div>
          )}

          {/* 메시지 영역 */}
          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chatbot-message ${msg.sender}`}
              >
                <div className="message-content">
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* 입력 영역 */}
          <div className="chatbot-input-area">
            <input
              type="text"
              className="chatbot-input"
              placeholder="메시지를 입력하세요..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleSendMessage}
            />
            <button
              className="chatbot-send-btn"
              onClick={handleButtonSend}
            >
              전송
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
