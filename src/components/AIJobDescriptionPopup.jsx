import React from 'react';
import './AIJobDescriptionPopup.css';

const AIJobDescriptionPopup = ({ onClose, onEnable, onMaybeLater }) => {
  return (
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
        
        <button className="enable-button" onClick={onEnable}>
          Generate with AI
        </button>
        
        <button className="maybe-later-button" onClick={onMaybeLater}>
          Maybe later
        </button>
      </div>
    </div>
  );
};

export default AIJobDescriptionPopup;
