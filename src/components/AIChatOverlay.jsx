import React, { useState, useEffect } from 'react';
import './AIChatOverlay.css';
import Loader from './Loader';
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
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideshowLoading, setSlideshowLoading] = useState(false);
  const [isFileUploading, setIsFileUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [transcript, setTranscript] = useState('');

  // Slideshow data for AI features
  const slides = [
    {
      title: "🔄 Generating Your Job Description",
      description: "Please be patient while our AI crafts the perfect job description for you",
      content: "Our advanced AI is analyzing your requirements and creating a comprehensive job description that will attract the right candidates. This process typically takes a few moments to ensure quality and accuracy."
    },
    {
      title: "🎯 AI-Powered Job Matching",
      description: "While we work, here's how our AI helps you find the perfect candidates",
      content: "Our intelligent system evaluates skills, experience, cultural fit, and career aspirations to connect the right talent with the right opportunities, improving hiring success rates by 75%."
    },
    {
      title: "⏳ Almost Ready...",
      description: "Your customized job description is being finalized",
      content: "We're putting the finishing touches on your job description, ensuring it includes all the essential details like responsibilities, qualifications, and benefits to attract top talent."
    },
    {
      title: "🚀 Smart Recruitment Features",
      description: "Thank you for your patience! Here's what makes our platform special",
      content: "AI-driven screening processes, real-time analytics, collaborative hiring tools, and automated candidate matching - all designed to streamline your recruitment process and improve hiring outcomes."
    }
  ];

  // Auto-advance slideshow
  useEffect(() => {
    if (showSlideshow) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [showSlideshow, slides.length]);

  const handleUpArrowClick = () => {
    if (inputMessage.trim() !== '') {
      // Start slideshow and make AI call immediately
      setShowSlideshow(true);
      setCurrentSlide(0);
      handleSendMessageWithSlideshow();
    }
  };

  const handleSendMessageWithSlideshow = async () => {
    if (inputMessage.trim() !== '') {
      setMessages(prevMessages => [...prevMessages, { text: inputMessage, sender: 'user' }]);
      setInputMessage('');
      setIsLoading(true);
      setSlideshowLoading(true); // Show loader with slideshow
      
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
        setSlideshowLoading(false);
        setShowSlideshow(false);
      }
    }
  };

  const handleCloseSlideshow = () => {
    setShowSlideshow(false);
    setCurrentSlide(0);
  };

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

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file type
    const allowedTypes = [
      'text/plain',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      setMessages(prevMessages => [
        ...prevMessages,
        {
          text: 'Please upload a valid file format (TXT, PDF, DOC, or DOCX).',
          sender: 'ai'
        }
      ]);
      return;
    }

    setIsFileUploading(true);
    setMessages(prevMessages => [
      ...prevMessages,
      {
        text: `📎 Uploaded file: ${file.name}`,
        sender: 'user'
      }
    ]);

    try {
      let fileContent = '';

      if (file.type === 'text/plain') {
        // Handle text files
        fileContent = await file.text();
      } else {
        // For PDF and DOC files, we'll send the file to the backend for processing
        const formData = new FormData();
        formData.append('file', file);

        // You would typically send this to your backend API
        // For now, we'll simulate file processing
        fileContent = `File uploaded: ${file.name}\nPlease process this job description file and extract the relevant information.`;
      }

      // Add AI processing message and show loader
      setMessages(prevMessages => [
        ...prevMessages,
        {
          text: '🤖 Processing your job description file...',
          sender: 'ai'
        }
      ]);

      // Show loader during AI processing
      setIsLoading(true);

      // Simulate AI processing the file content
      const response = await candidateService.generateJobDescription(
        `Please analyze and process this job description file content: ${fileContent}`
      );

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
          text: `✅ Successfully processed your job description file!\n\n${jobDescriptionContent.trim()}`,
          sender: 'ai',
          showApplyButton: true,
          data: response.data
        };

        // Call onJobDescriptionGenerated with the response data
        onJobDescriptionGenerated(response.data);

        // Update messages state
        setMessages(prevMessages => {
          const newMessages = [...prevMessages, aiMessage];
          return newMessages;
        });
      } else {
        throw new Error(response.message || 'Failed to process job description file');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setMessages(prevMessages => [
        ...prevMessages,
        {
          text: 'Sorry, I encountered an error while processing your file. Please try again or enter the job description manually.',
          sender: 'ai'
        }
      ]);
    } finally {
      setIsFileUploading(false);
      setIsLoading(false); // Hide loader when processing is complete
      // Reset file input
      event.target.value = '';
    }
  };

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onstart = () => {
        console.log('Speech recognition started');
        setMessages(prevMessages => [
          ...prevMessages,
          {
            text: '🎤 Listening... Speak now. Click the microphone again to stop.',
            sender: 'ai'
          }
        ]);
      };
      
      recognitionInstance.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Update transcript state with final results
        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript);
        }
        
        // Show interim results in input field
        const currentText = transcript + finalTranscript + interimTranscript;
        setInputMessage(currentText);
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        
        let errorMessage = 'Speech recognition error occurred. ';
        switch (event.error) {
          case 'no-speech':
            errorMessage += 'No speech was detected. Please try again.';
            break;
          case 'audio-capture':
            errorMessage += 'No microphone was found. Please check your microphone.';
            break;
          case 'not-allowed':
            errorMessage += 'Microphone permission was denied. Please allow microphone access.';
            break;
          case 'network':
            errorMessage += 'Network error occurred. Please check your internet connection.';
            break;
          default:
            errorMessage += 'Please try again.';
        }
        
        setMessages(prevMessages => [
          ...prevMessages,
          {
            text: errorMessage,
            sender: 'ai'
          }
        ]);
      };
      
      recognitionInstance.onend = () => {
        console.log('Speech recognition ended');
        setIsRecording(false);
        
        if (transcript.trim()) {
          setInputMessage(transcript.trim());
          setMessages(prevMessages => [
            ...prevMessages,
            {
              text: '✅ Speech recognition completed! Your speech has been converted to text. You can edit it if needed before sending.',
              sender: 'ai'
            }
          ]);
        }
      };
      
      setRecognition(recognitionInstance);
    } else {
      console.warn('Speech recognition not supported in this browser');
    }
  }, [transcript]);

  const startRecording = () => {
    if (!recognition) {
      setMessages(prevMessages => [
        ...prevMessages,
        {
          text: 'Speech recognition is not supported in your browser. Please type your message or try a different browser.',
          sender: 'ai'
        }
      ]);
      return;
    }

    try {
      setTranscript('');
      setInputMessage('');
      setIsRecording(true);
      recognition.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setMessages(prevMessages => [
        ...prevMessages,
        {
          text: 'Unable to start speech recognition. Please check your microphone permissions and try again.',
          sender: 'ai'
        }
      ]);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognition && isRecording) {
      recognition.stop();
      setMessages(prevMessages => [
        ...prevMessages,
        {
          text: '🎤 Recording stopped. Processing your speech...',
          sender: 'ai'
        }
      ]);
    }
  };

  const handleMicButtonClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handlePlusButtonClick = () => {
    // Trigger file input click
    document.getElementById('file-upload-input').click();
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
    <>
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
                <div className="spinner-loader">
                  <div className="spinner"></div>
                  <span style={{ marginLeft: '8px', fontSize: '13px', color: '#6B7280' }}>AI is thinking...</span>
                </div>
              </div>
            )}
          </div>
          <div className="chat-input">
            <button 
              className="input-action-btn plus-btn" 
              onClick={handlePlusButtonClick}
              disabled={isLoading || isFileUploading}
              title="Upload job description file"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            
            {/* Hidden file input */}
            <input
              id="file-upload-input"
              type="file"
              accept=".txt,.pdf,.doc,.docx"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask anything"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            
            {inputMessage.trim() && (
              <button className="input-action-btn attach-btn" onClick={handleUpArrowClick} disabled={isLoading || slideshowLoading}>
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
            
            <button 
              className={`input-action-btn mic-btn ${isRecording ? 'recording' : ''}`} 
              onClick={handleMicButtonClick}
              disabled={isLoading}
              title={isRecording ? "Stop recording" : "Start voice recording"}
            >
              {isRecording ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="4" y="4" width="8" height="8" rx="2" fill="currentColor"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1C7.17 1 6.5 1.67 6.5 2.5V8C6.5 8.83 7.17 9.5 8 9.5C8.83 9.5 9.5 8.83 9.5 8V2.5C9.5 1.67 8.83 1 8 1Z" fill="currentColor"/>
                  <path d="M4.5 6.5V8C4.5 10.21 6.29 12 8.5 12H7.5C9.71 12 11.5 10.21 11.5 8V6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M8 12V15M8 15H6M8 15H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              )}
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
      
      {/* Loader with slideshow overlay */}
      <Loader isVisible={slideshowLoading} />
      
      {/* Slideshow overlay on top of loader */}
      {showSlideshow && slideshowLoading && (
        <div className="slideshow-overlay">
          <div className="slideshow-container">
            <div className="slideshow-slide">
              <h3>{slides[currentSlide].title}</h3>
              <p className="slide-description">{slides[currentSlide].description}</p>
              <p className="slide-content">{slides[currentSlide].content}</p>
              
              <div className="slide-indicators">
                {slides.map((_, index) => (
                  <div
                    key={index}
                    className={`indicator ${index === currentSlide ? 'active' : ''}`}
                    onClick={() => setCurrentSlide(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatOverlay;
