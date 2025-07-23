import React, { useState } from 'react';
import './AIChatOverlay.css';

const AIChatOverlay = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = () => {
    if (inputMessage.trim() !== '') {
      setMessages([...messages, { text: inputMessage, sender: 'user' }]);
      setInputMessage('');
      // Here you would typically send the message to your AI service
      // and then add the AI's response to the messages
      setTimeout(() => {
        setMessages(prevMessages => [...prevMessages, { text: "I'm processing your request. Please wait a moment.", sender: 'ai' }]);
      }, 1000);
    }
  };

  return (
    <div className="chat-overlay">
      <div className="chat-container">
        <div className="chat-header">
          <h2>AI Job Description Assistant</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>
        <div className="chat-messages">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.sender}`}>
              {message.text}
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message here..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default AIChatOverlay;
