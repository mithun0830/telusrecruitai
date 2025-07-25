import React, { useState } from 'react';
import './AIChatOverlay.css';
import { candidateService } from '../services/api';

const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const MicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
    <line x1="12" y1="19" x2="12" y2="23"></line>
    <line x1="8" y1="23" x2="16" y2="23"></line>
  </svg>
);

const AIChatOverlay = ({ 
  onClose,
  onJobDescriptionGenerated
}) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState(null);

  const handleCopyMessage = (message, index) => {
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
      setCopiedMessageId(index);
      setTimeout(() => setCopiedMessageId(null), 2000);
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
                      className={`copy-button ${copiedMessageId === index ? 'copied' : ''}`}
                      title="Copy message"
                    >
                      {copiedMessageId === index ? 'Copied!' : <CopyIcon />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message ai" style={{ padding: '8px 12px', minHeight: 'auto' }}>
              <div className="dancing-loader">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
        </div>
        <div className="chat-input">
          <button className="chat-input-button">
            <PlusIcon />
          </button>
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Enter Job Requirement to search candidate"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <button className="chat-input-button">
            <MicIcon />
          </button>
          <button className="chat-input-button" onClick={handleSendMessage}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatOverlay;
