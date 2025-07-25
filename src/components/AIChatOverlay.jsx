import React, { useState } from 'react';
import './AIChatOverlay.css';
import { candidateService } from '../services/api';

const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

const TickIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20,6 9,17 4,12"></polyline>
  </svg>
);

const AIChatOverlay = ({ 
  onClose,
  onJobDescriptionGenerated
}) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageIndex, setCopiedMessageIndex] = useState(null);

  const handleCopyMessage = (message, messageIndex) => {
    let textToCopy = '';
    
    if (message.data) {
      if (message.data.summary) {
        textToCopy += `Summary:\n${message.data.summary}\n\n`;
      }

      if (message.data.technicalSkills) {
        textToCopy += 'Technical Skills:\n';
        let skills = message.data.technicalSkills;
        if (typeof skills === 'string') {
          skills = skills.split(',').map(skill => skill.trim());
        }
        if (Array.isArray(skills)) {
          textToCopy += skills.map(skill => `• ${skill}`).join('\n');
        } else {
          textToCopy += skills.toString();
        }
      }
    }

    navigator.clipboard.writeText(textToCopy.trim()).then(() => {
      console.log('Summary and technical skills copied to clipboard');
      // Set the copied state for this message
      setCopiedMessageIndex(messageIndex);
      
      // Reset back to copy icon after 5 seconds
      setTimeout(() => {
        setCopiedMessageIndex(null);
      }, 5000);
    }).catch(err => {
      console.error('Failed to copy message: ', err);
    });
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() !== '') {
      setMessages(prevMessages => [...prevMessages, { text: inputMessage, sender: 'user' }]);
      setInputMessage('');
      setIsLoading(true);
      
      try {
        const response = await candidateService.generateJobDescription(inputMessage.trim());
        console.log('API Response:', response);
        
        if (response.success) {
          let jobDescriptionContent = '';

          if (response.data.summary) {
            jobDescriptionContent += `Summary:\n${response.data.summary}\n\n`;
          }

          if (response.data.technicalSkills) {
            jobDescriptionContent += 'Technical Skills:\n';
            let skills = response.data.technicalSkills;
            if (typeof skills === 'string') {
              skills = skills.split(',').map(skill => skill.trim());
            }
            if (Array.isArray(skills)) {
              jobDescriptionContent += skills.map(skill => `• ${skill}`).join('\n');
            } else {
              jobDescriptionContent += skills.toString();
            }
            jobDescriptionContent += '\n\n';
          }

          if (response.data.responsibilities) {
            jobDescriptionContent += `Responsibilities:\n${response.data.responsibilities}\n\n`;
          }

          if (response.data.requiredQualifications) {
            jobDescriptionContent += `Required Qualifications:\n${response.data.requiredQualifications}\n\n`;
          }

          if (response.data.preferredQualifications) {
            jobDescriptionContent += `Preferred Qualifications:\n${response.data.preferredQualifications}\n\n`;
          }

          if (response.data.benefits) {
            jobDescriptionContent += `Benefits:\n${response.data.benefits}\n\n`;
          }

          const aiMessage = {
            text: jobDescriptionContent.trim(),
            sender: 'ai',
            showApplyButton: true,
            data: response.data
          };

          console.log('Job description message:', aiMessage);

          // Call onJobDescriptionGenerated with the response data
          onJobDescriptionGenerated(response.data);

          // Update messages state
          setMessages(prevMessages => {
            const newMessages = [...prevMessages, aiMessage];
            console.log('Final messages state:', newMessages);
            return newMessages;
          });
        } else {
          throw new Error(response.message || 'Failed to generate job description');
        }
      } catch (error) {
        console.error('Error generating job description:', error);
        setMessages(prevMessages => [
          ...prevMessages,
          {
            text: 'Sorry, I encountered an error while generating the job description. Please try again.',
            sender: 'ai'
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="chat-overlay">
      <div className="chat-container">
        <div className="chat-header">
          <h2>AI Job Description Assistant</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="chat-messages">
          {console.log('Rendering messages:', messages)}
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`message ${message.sender}`}
            >
              <div style={{ width: '100%' }}>
                {message.text.split('\n').map((line, i) => (
                  <p key={i} style={{ fontSize: '13px', lineHeight: '1.5', margin: '0 0 6px 0' }}>{line}</p>
                ))}
                {message.sender === 'ai' && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    marginTop: '8px',
                    position: 'relative'
                  }}>
                    <button 
                      onClick={() => handleCopyMessage(message, index)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: copiedMessageIndex === index ? '#00A86B' : 'inherit'
                      }}
                      title={copiedMessageIndex === index ? "Copied!" : "Copy message"}
                    >
                      {copiedMessageIndex === index ? <TickIcon /> : <CopyIcon />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message ai" style={{ padding: '8px 12px', minHeight: 'auto' }}>
              <span style={{ fontSize: '20px' }}>...</span>
            </div>
          )}
        </div>
        <div className="chat-input">
          <button className="input-action-btn plus-btn">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask anything"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          
          {inputMessage.trim() && (
            <button className="input-action-btn attach-btn" onClick={handleSendMessage} disabled={isLoading}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 12L8 4M8 4L5 7M8 4L11 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
          
          <button className="input-action-btn tools-btn">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 8H14M8 2V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
            <span>Tools</span>
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
  );
};

export default AIChatOverlay;
