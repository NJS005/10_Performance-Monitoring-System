import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import './AcademicAssistant.css';

const AcademicAssistant = ({ rollNo }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello! I am your AI Academic Advisor. Ask me for course recommendations, study tips, or to analyze your academic progress.' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userText = inputMessage.trim();
    setInputMessage('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:8080/api/student/chat/${rollNo}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userText }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, { sender: 'ai', text: data.response }]);
      } else {
        setMessages((prev) => [...prev, { sender: 'ai', text: 'Sorry, I am having trouble connecting to my academic database right now.' }]);
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { sender: 'ai', text: 'Error connecting to the backend. Please ensure the server is running.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="academic-assistant-wrapper">
      {/* Floating Action Button */}
      <button 
        className={`assistant-fab ${isOpen ? 'open' : ''} bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle AI Assistant"
      >
        {isOpen ? (
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="assistant-chat-window bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700">
          <div className="chat-header bg-indigo-600 dark:bg-gray-900 border-b dark:border-gray-700">
            <div className="header-info">
              <div className="bot-avatar bg-indigo-400">AI</div>
              <div>
                <h3 className="text-white font-semibold m-0 text-sm">NITC Academic Guide</h3>
                <span className="text-indigo-100 text-xs flex items-center gap-1">
                  <span className="online-dot bg-green-400"></span> Online (Gemini 1.5)
                </span>
              </div>
            </div>
          </div>

          <div className="chat-messages dark:bg-gray-800">
            {messages.map((msg, index) => (
              <div key={index} className={`message-bubble-wrapper ${msg.sender}`}>
                {msg.sender === 'ai' && <div className="bubble-avatar ai text-xs text-center border dark:border-gray-600 dark:bg-gray-700">AI</div>}
                <div className={`message-bubble ${msg.sender} ${msg.sender === 'ai' ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200' : 'bg-indigo-600 text-white'}`}>
                  {msg.sender === 'ai' ? (
                     <div className="markdown-body">
                       <ReactMarkdown>{msg.text}</ReactMarkdown>
                     </div>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="message-bubble-wrapper ai">
                <div className="bubble-avatar ai text-xs text-center border dark:border-gray-600 dark:bg-gray-700">AI</div>
                <div className="message-bubble ai loading bg-gray-100 dark:bg-gray-700">
                  <div className="typing-indicator">
                    <span className="dark:bg-gray-400"></span>
                    <span className="dark:bg-gray-400"></span>
                    <span className="dark:bg-gray-400"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
            <textarea
              className="bg-gray-50 dark:bg-gray-900 dark:text-gray-100 border dark:border-gray-700 focus:ring-1 focus:ring-indigo-500"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask for course advice..."
              rows={1}
            />
            <button 
              className="send-btn text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-gray-700" 
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicAssistant;
