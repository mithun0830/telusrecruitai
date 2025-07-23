import React, { useState } from 'react';
import './AIChatOverlay.css';
import { candidateService } from '../services/api';

const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

const AIChatOverlay = ({ 
  onClose,
  onJobDescriptionGenerated
}) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCopyMessage = (message) => {
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
                      onClick={() => handleCopyMessage(message)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Copy message"
                    >
                      <CopyIcon />
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
