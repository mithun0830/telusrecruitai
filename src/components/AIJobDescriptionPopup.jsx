import React, { useState, useEffect } from 'react';
import './AIJobDescriptionPopup.css';
import Loader from './Loader';

const AIJobDescriptionPopup = ({ onClose, onEnable, onMaybeLater }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Test slideshow data
  const slides = [
    {
      title: "Smart Job Matching",
      description: "AI analyzes candidate profiles and matches them with perfect job opportunities using advanced algorithms and machine learning",
      content: "Our intelligent matching system considers skills, experience, location preferences, and cultural fit to connect the right candidates with the right opportunities."
    },
    {
      title: "Automated Screening",
      description: "Intelligent screening process saves time and improves candidate quality through automated evaluation",
      content: "Advanced AI screening evaluates resumes, conducts initial assessments, and ranks candidates based on job requirements, reducing manual review time by 80%."
    },
    {
      title: "Real-time Analytics",
      description: "Get insights into your hiring process with comprehensive analytics and performance metrics",
      content: "Track hiring funnel performance, time-to-hire metrics, candidate source effectiveness, and team productivity with detailed dashboards and reports."
    },
    {
      title: "Enhanced Collaboration",
      description: "Seamless team collaboration tools for better hiring decisions and streamlined communication",
      content: "Enable hiring teams to share feedback, schedule interviews, make collaborative decisions, and maintain consistent communication throughout the hiring process."
    }
  ];

  // Auto-advance slideshow
  useEffect(() => {
    if (showSlideshow) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [showSlideshow, slides.length]);

  const handleEnableClick = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onEnable();
    }, 2000);
  };

  const handleTestSlideshow = () => {
    setShowSlideshow(true);
  };

  const handleCloseSlideshowAndPopup = () => {
    setShowSlideshow(false);
    onClose();
  };

  if (showSlideshow) {
    return (
      <div className="popup-overlay">
        <div className="popup-container slideshow-container">
          <button className="close-button" onClick={handleCloseSlideshowAndPopup}></button>
          
          <div className="slideshow-content">
            <h2>{slides[currentSlide].title}</h2>
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
            
            <div className="slideshow-controls">
              <button 
                className="prev-button" 
                onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
              >
                ‹
              </button>
              <button 
                className="next-button" 
                onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
              >
                ›
              </button>
            </div>
          </div>
          
          <button className="enable-button" onClick={handleEnableClick}>
            Get Started
          </button>
          
          <button className="maybe-later-button" onClick={() => setShowSlideshow(false)}>
            Back to Main
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="popup-overlay">
        <div className="popup-container">
          <button className="close-button" onClick={onClose}></button>
          
          <div className="popup-icon">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="20" fill="#00A86B"/>
              <path d="M20 12C16.13 12 13 15.13 13 19C13 22.17 15.1 24.84 18 25.71V28H22V25.71C24.9 24.84 27 22.17 27 19C27 15.13 23.87 12 20 12ZM20 24C17.24 24 15 21.76 15 19C15 16.24 17.24 14 20 14C22.76 14 25 16.24 25 19C25 21.76 22.76 24 20 24Z" fill="white"/>
            </svg>
          </div>
          
          <h2>AI-powered Job Description</h2>
          <p>Transform your hiring process with AI-powered job descriptions. Let our AI craft the perfect job description that attracts your ideal candidates.</p>
          
          <button className="enable-button" onClick={handleEnableClick}>
            Generate with AI
          </button>
          
          <button className="test-slideshow-button" onClick={handleTestSlideshow}>
            View Features
          </button>
          
          <button className="maybe-later-button" onClick={onMaybeLater}>
            Maybe later
          </button>
        </div>
      </div>
      
      <Loader isVisible={isLoading} />
    </>
  );
};

export default AIJobDescriptionPopup;
