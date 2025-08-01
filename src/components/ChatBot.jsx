import React, { useState } from 'react';
import './ChatBot.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments, faTimes } from '@fortawesome/free-solid-svg-icons';
import { candidateService } from '../services/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

const ChatBot = ({ candidateId, candidateName, resumeId, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = React.useRef(null);


  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() !== '' && !isLoading) {
      setIsLoading(true);
      setMessages(prevMessages => [...prevMessages, { text: inputMessage, sender: 'user' }]);
      setInputMessage('');

      // Add thinking message
      setMessages(prevMessages => [...prevMessages, { text: '...', sender: 'bot', isThinking: true }]);

      try {
        const response = await candidateService.sendChatMessage(resumeId, inputMessage);
        const formattedMessage = formatResponse(response.data.message);
        // Remove thinking message and add actual response
        setMessages(prevMessages => prevMessages.filter(msg => !msg.isThinking).concat({ text: formattedMessage, sender: 'bot' }));
      } catch (error) {
        console.error('Error sending message:', error);
        // Remove thinking message and add error message
        setMessages(prevMessages => prevMessages.filter(msg => !msg.isThinking).concat({ text: "Sorry, I couldn't process your request. Please try again.", sender: 'bot' }));
      } finally {
        setIsLoading(false);
      }
    }
  };

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatResponse = (message) => {
    // Split the message into sections based on double newlines
    const sections = message.split('\n\n');

    // Format each section
    const formattedSections = sections.map(section => {
      if (section.startsWith('•')) {
        // Convert bullet points to markdown list
        return section.split('\n').map(item => `- ${item.substring(1).trim()}`).join('\n');
      }
      return section;
    });

    // Join the formatted sections back together
    return formattedSections.join('\n\n');
  };

  return (
    <div className="chat-bot open">
      <div className="chat-bot-header">
        <span>Ask about {candidateName || 'Candidate'}</span>
        <button className="chat-bot-close" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      <div className="chat-bot-container">
        <div className="chat-bot-messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.sender}`}
              data-thinking={message.isThinking || false}
            >
              {message.sender === 'bot' && message.isThinking ? (
                <div className="thinking-dots">
                  <span className="dot dot-red"></span>
                  <span className="dot dot-blue"></span>
                  <span className="dot dot-green"></span>
                </div>
              ) : message.sender === 'bot' ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    h1: ({ node, ...props }) => <h1 style={{ fontSize: '14px', margin: '0 0 4px 0' }} {...props} />,
                    h2: ({ node, ...props }) => <h2 style={{ fontSize: '14px', margin: '0 0 4px 0' }} {...props} />,
                    h3: ({ node, ...props }) => <h3 style={{ fontSize: '14px', margin: '0 0 4px 0' }} {...props} />,
                    h4: ({ node, ...props }) => <h4 style={{ fontSize: '13px', margin: '0 0 4px 0' }} {...props} />,
                    h5: ({ node, ...props }) => <h5 style={{ fontSize: '13px', margin: '0 0 4px 0' }} {...props} />,
                    p: ({ node, ...props }) => <p style={{ fontSize: '13px', margin: '0 0 4px 0' }} {...props} />,
                    ul: ({ node, ...props }) => <ul style={{ fontSize: '13px', margin: '0 0 4px 0', paddingLeft: '14px' }} {...props} />,
                    ol: ({ node, ...props }) => <ol style={{ fontSize: '13px', margin: '0 0 4px 0', paddingLeft: '14px' }} {...props} />,
                    li: ({ node, ...props }) => <li style={{ fontSize: '13px', marginBottom: '2px' }} {...props} />,
                    code: ({ node, ...props }) => <code style={{ backgroundColor: '#f4f4f4', padding: '1px 2px', borderRadius: '2px', fontFamily: 'monospace', fontSize: '11px' }} {...props} />,
                    a: ({ node, ...props }) => <a style={{ color: '#047857', textDecoration: 'underline' }} {...props} />
                  }}
                >
                  {message.text}
                </ReactMarkdown>
              ) : (
                message.text
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="chat-bot-input">
          <button className="input-action-btn plus-btn">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          
          <input
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Ask anything"
          />
          
          {inputMessage.trim() && (
            <button className="input-action-btn attach-btn" onClick={handleSendMessage} disabled={isLoading}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 12L8 4M8 4L5 7M8 4L11 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
          
          <div className="chat-bot-input-buttons">
            <button className="input-action-btn tools-btn">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 8H14M8 2V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
              {/* <span>Tools</span> */}
            </button>
            
            <button className="input-action-btn mic-btn" disabled={isLoading}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1C7.17 1 6.5 1.67 6.5 2.5V8C6.5 8.83 7.17 9.5 8 9.5C8.83 9.5 9.5 8.83 9.5 8V2.5C9.5 1.67 8.83 1 8 1Z" fill="currentColor"/>
                <path d="M4.5 6.5V8C4.5 10.21 6.29 12 8.5 12H7.5C9.71 12 11.5 10.21 11.5 8V6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M8 12V15M8 15H6M8 15H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            
            <button className="input-action-btn audio-viz-btn" onClick={handleSendMessage} disabled={inputMessage.trim() === '' || isLoading}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="6" width="2" height="4" fill="currentColor" rx="1"/>
                <rect x="4" y="4" width="2" height="8" fill="currentColor" rx="1"/>
                <rect x="7" y="2" width="2" height="12" fill="currentColor" rx="1"/>
                <rect x="10" y="5" width="2" height="6" fill="currentColor" rx="1"/>
                <rect x="13" y="7" width="2" height="2" fill="currentColor" rx="1"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
