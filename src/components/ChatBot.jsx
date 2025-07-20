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
              {message.sender === 'bot' ? (
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
          <input
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
          />
          <button onClick={handleSendMessage} disabled={inputMessage.trim() === '' || isLoading}>
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
