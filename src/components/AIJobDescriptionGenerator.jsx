import React, { useState, useEffect } from 'react';
import './AIJobDescriptionGenerator.css';
import Loader from './Loader';
import { candidateService } from '../services/api';

const AIJobDescriptionGenerator = ({ 
  onClose,
  onJobDescriptionGenerated,
  onCopyForSearch
}) => {
  // Form state
  const [formData, setFormData] = useState({
    jobTitle: '',
    company: '',
    keySkills: '',
    genericDescription: '',
    experienceLevel: 'Entry Level (0-2 years)'
  });

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [generatedData, setGeneratedData] = useState(null);
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Speech recognition state
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [activeField, setActiveField] = useState(null);

  // Experience level options
  const experienceLevels = [
    'Entry Level (0-2 years)',
    'Mid Level (3-5 years)',
    'Senior Level (6-10 years)',
    'Lead/Principal (10+ years)',
    'Executive Level'
  ];

  // Slideshow data
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

  // Handle Escape key to close dialog
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [onClose]);

  // Handle overlay click to close dialog
  const handleOverlayClick = (event) => {
    // Only close if clicking directly on the overlay, not on the dialog content
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onstart = () => {
        console.log('Speech recognition started');
        setIsRecording(true);
      };
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        
        if (activeField && transcript) {
          setFormData(prev => ({
            ...prev,
            [activeField]: prev[activeField] + (prev[activeField] ? ' ' : '') + transcript
          }));
        }
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        setActiveField(null);
      };
      
      recognitionInstance.onend = () => {
        console.log('Speech recognition ended');
        setIsRecording(false);
        setActiveField(null);
      };
      
      setRecognition(recognitionInstance);
    }
  }, [activeField]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const startVoiceInput = (field) => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    setActiveField(field);
    recognition.start();
  };

  const generateJobDescription = async () => {
    // Validate form
    if (!formData.jobTitle.trim()) {
      alert('Please enter a job title');
      return;
    }

    // Combine form data into a prompt
    const prompt = `Create a comprehensive job description for the following position:
    
Job Title: ${formData.jobTitle}
Company: ${formData.company || 'Our Company'}
Key Skills Required: ${formData.keySkills}
Experience Level: ${formData.experienceLevel}

Please provide a detailed job description including summary, responsibilities, qualifications, and benefits.`;

    setIsGenerating(true);
    setShowSlideshow(true);

    try {
      const response = await candidateService.generateJobDescription(prompt);
      
      if (response.success) {
        // Format the generated content
        let jobDescriptionContent = '';

        if (response.data.summary) {
          jobDescriptionContent += `${response.data.summary}\n\n`;
        }

        if (response.data.responsibilities) {
          jobDescriptionContent += `Key Responsibilities:\n${response.data.responsibilities}\n\n`;
        }

        if (response.data.requiredQualifications) {
          jobDescriptionContent += `Required Qualifications:\n${response.data.requiredQualifications}\n\n`;
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

        if (response.data.preferredQualifications) {
          jobDescriptionContent += `Preferred Qualifications:\n${response.data.preferredQualifications}\n\n`;
        }

        if (response.data.benefits) {
          jobDescriptionContent += `Benefits:\n${response.data.benefits}`;
        }

        setGeneratedContent(jobDescriptionContent.trim());
        setGeneratedData(response.data);
        setShowPreview(true);

        // Call the callback with the generated data
        onJobDescriptionGenerated(response.data);
      } else {
        throw new Error(response.message || 'Failed to generate job description');
      }
    } catch (error) {
      console.error('Error generating job description:', error);
      alert('Sorry, there was an error generating the job description. Please try again.');
    } finally {
      setIsGenerating(false);
      setShowSlideshow(false);
    }
  };

  const downloadJobDescription = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${formData.jobTitle.replace(/\s+/g, '_')}_Job_Description.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const shareJobDescription = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${formData.jobTitle} - Job Description`,
          text: generatedContent,
        });
      } catch (error) {
        console.log('Error sharing:', error);
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent).then(() => {
      alert('Job description copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy to clipboard');
    });
  };

  const handleCopyForSearch = () => {
    if (!generatedData) {
      alert('No job description generated yet!');
      return;
    }

    // Combine Required Qualifications + Technical Skills + Generic Description
    let combinedText = '';

    // Add Required Qualifications
    if (generatedData.requiredQualifications) {
      combinedText += `Required Qualifications: ${generatedData.requiredQualifications}`;
    }

    // Add Technical Skills
    if (generatedData.technicalSkills) {
      if (combinedText) combinedText += '. ';
      let skills = generatedData.technicalSkills;
      if (typeof skills === 'string') {
        skills = skills.split(',').map(skill => skill.trim());
      }
      if (Array.isArray(skills)) {
        combinedText += `Technical Skills: ${skills.join(', ')}`;
      } else {
        combinedText += `Technical Skills: ${skills.toString()}`;
      }
    }

    // Add Generic Description
    if (formData.genericDescription.trim()) {
      if (combinedText) combinedText += '. ';
      combinedText += formData.genericDescription.trim();
    }

    // Call the callback to update search box and close modal
    if (onCopyForSearch && combinedText) {
      onCopyForSearch(combinedText);
      onClose(); // Close the generator
    } else {
      alert('No content available to copy for search!');
    }
  };

  return (
    <>
      <div className="ai-generator-overlay" onClick={handleOverlayClick}>
        <div className="ai-generator-container">
          {/* Header */}
          <div className="ai-generator-header">
            <div className="header-content">
              <div className="header-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h2>AI Job Description Generator</h2>
                <p>Create compelling job descriptions with AI intelligence</p>
              </div>
            </div>
            <button className="close-button" onClick={onClose}>×</button>
          </div>

          <div className="ai-generator-content">
            {/* Form Section */}
            <div className="form-section">
              <div className="form-group">
                <label htmlFor="jobTitle">Job Title</label>
                <div className="input-with-voice">
                  <input
                    id="jobTitle"
                    type="text"
                    placeholder="e.g. Senior React Developer"
                    value={formData.jobTitle}
                    onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                  />
                  <button 
                    className={`voice-btn ${isRecording && activeField === 'jobTitle' ? 'recording' : ''}`}
                    onClick={() => startVoiceInput('jobTitle')}
                    disabled={isRecording && activeField !== 'jobTitle'}
                  >
                    🎤
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="company">Company</label>
                <div className="input-with-voice">
                  <input
                    id="company"
                    type="text"
                    placeholder="Your company name"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                  />
                  <button 
                    className={`voice-btn ${isRecording && activeField === 'company' ? 'recording' : ''}`}
                    onClick={() => startVoiceInput('company')}
                    disabled={isRecording && activeField !== 'company'}
                  >
                    🎤
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="keySkills">Key Skills</label>
                <div className="input-with-voice">
                  <textarea
                    id="keySkills"
                    placeholder="React, Node.js, TypeScript..."
                    value={formData.keySkills}
                    onChange={(e) => handleInputChange('keySkills', e.target.value)}
                    rows="3"
                  />
                  <button 
                    className={`voice-btn ${isRecording && activeField === 'keySkills' ? 'recording' : ''}`}
                    onClick={() => startVoiceInput('keySkills')}
                    disabled={isRecording && activeField !== 'keySkills'}
                  >
                    🎤
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="genericDescription">Generic Description</label>
                <div className="input-with-voice">
                  <textarea
                    id="genericDescription"
                    placeholder="Additional job details, company culture, benefits, remote work options..."
                    value={formData.genericDescription}
                    onChange={(e) => handleInputChange('genericDescription', e.target.value)}
                    rows="3"
                  />
                  <button 
                    className={`voice-btn ${isRecording && activeField === 'genericDescription' ? 'recording' : ''}`}
                    onClick={() => startVoiceInput('genericDescription')}
                    disabled={isRecording && activeField !== 'genericDescription'}
                  >
                    🎤
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="experienceLevel">Experience Level</label>
                <select
                  id="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                >
                  {experienceLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <button 
                className="generate-btn"
                onClick={generateJobDescription}
                disabled={isGenerating || !formData.jobTitle.trim()}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {isGenerating ? 'Generating...' : 'Generate Job Description'}
              </button>
            </div>

            {/* Preview Section */}
            <div className="preview-section">
              <div className="preview-header">
                <div className="preview-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3>AI Generated Preview</h3>
              </div>

              <div className="preview-content">
                {isGenerating ? (
                  <div className="preview-loading">
                    <div className="preview-loader">
                      <div className="loader-spinner">
                        <div className="spinner-circle"></div>
                        <div className="spinner-circle"></div>
                        <div className="spinner-circle"></div>
                      </div>
                      <div className="loading-text">
                        <h4>🤖 AI is generating your job description...</h4>
                        <p>Creating professional content tailored to your requirements</p>
                      </div>
                      {showSlideshow && (
                        <div className="preview-slideshow">
                          <div className="slide-content">
                            <h5>{slides[currentSlide].title}</h5>
                            <p className="slide-description">{slides[currentSlide].description}</p>
                            <p className="slide-text">{slides[currentSlide].content}</p>
                          </div>
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
                      )}
                    </div>
                  </div>
                ) : showPreview ? (
                  <div className="generated-content">
                    <div className="content-text">
                      {generatedContent.split('\n').map((line, index) => (
                        <p key={index}>{line}</p>
                      ))}
                    </div>
                    <div className="preview-actions">
                      <button className="copy-for-search-btn" onClick={handleCopyForSearch}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke="currentColor" strokeWidth="2" fill="none"/>
                        </svg>
                        Copy for Search
                      </button>
                      <button className="download-btn" onClick={downloadJobDescription}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        Download
                      </button>
                      <button className="share-btn" onClick={shareJobDescription}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <polyline points="16,6 12,2 8,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <line x1="12" y1="2" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        Share
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="preview-placeholder">
                    <div className="placeholder-icon">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <h4>Your AI-generated job description will appear here</h4>
                    <p>Professional, compelling, and optimized for candidates</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

    </>
  );
};

export default AIJobDescriptionGenerator;
