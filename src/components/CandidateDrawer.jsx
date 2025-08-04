import React, { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faCode,
  faBriefcase,
  faGraduationCap,
  faUsers,
  faTrophy
} from '@fortawesome/free-solid-svg-icons';
import './CandidateDrawer.css';

const CandidateDrawer = ({ 
  candidate, 
  isOpen, 
  onClose, 
  slideDirection = 'right' 
}) => {
  const drawerRef = useRef(null);
  const [isResumeExpanded, setIsResumeExpanded] = React.useState(false);

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const toggleResumeExpand = () => {
    setIsResumeExpanded(!isResumeExpanded);
  };

  if (!isOpen || !candidate) return null;

  return (
    <div 
      className="drawer-overlay"
      onClick={handleBackdropClick}
    >
      <div 
        ref={drawerRef}
        className={`drawer-content ${isOpen ? 'open' : ''} slide-${slideDirection}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-candidate-info">
            <div className="drawer-avatar">
              {candidate.resume.name.charAt(0).toUpperCase()}
            </div>
            <div className="drawer-candidate-details">
              <h2 className="drawer-candidate-name">{candidate.resume.name}</h2>
              <div className="drawer-contact-info">
                <div className="drawer-contact-item">
                  <FontAwesomeIcon icon={faEnvelope} className="drawer-contact-icon" />
                  <span>{candidate.resume.email}</span>
                </div>
                <div className="drawer-contact-item">
                  <FontAwesomeIcon icon={faPhone} className="drawer-contact-icon" />
                  <span>{candidate.resume.phoneNumber}</span>
                </div>
                <div className="drawer-contact-item">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="drawer-contact-icon" />
                  <span className={`drawer-source-tag ${candidate.source?.toLowerCase()}`}>
                    {candidate.source || 'Internal'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="drawer-header-actions">
            <div className="drawer-match-score">
              <div className="drawer-score-percentage">{candidate.score}%</div>
              <div className="drawer-score-label">Match Score</div>
            </div>
            <button
              className="drawer-close-btn"
              onClick={onClose}
              aria-label="Close drawer"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="drawer-body">
          {/* Executive Summary */}
          <div className="drawer-section">
            <h4 className="drawer-section-title">Executive Summary</h4>
            <p className="drawer-section-content">
              {candidate.analysis?.executiveSummary || 'No executive summary available.'}
            </p>
          </div>

          {/* Category Scores */}
          {candidate.analysis?.categoryScores && (
            <div className="drawer-section">
              <h4 className="drawer-section-title">Category Scores</h4>
              <div className="drawer-scores-grid">
                {[
                  { label: "Technical Skills", score: "technicalSkills", icon: faCode },
                  { label: "Experience", score: "experience", icon: faBriefcase },
                  { label: "Education", score: "education", icon: faGraduationCap },
                  { label: "Soft Skills", score: "softSkills", icon: faUsers },
                  { label: "Achievements", score: "achievements", icon: faTrophy }
                ].map((item, index) => (
                  <div key={index} className="drawer-score-item">
                    <div className="drawer-score-header">
                      <FontAwesomeIcon icon={item.icon} className="drawer-score-icon" />
                      <span className="drawer-score-label">{item.label}</span>
                    </div>
                    <div className="drawer-score-bar-container">
                      <div className="drawer-score-bar">
                        <div
                          className="drawer-score-fill"
                          style={{ width: `${candidate.analysis.categoryScores[item.score]}%` }}
                        ></div>
                      </div>
                      <div className="drawer-score-value">
                        {candidate.analysis.categoryScores[item.score]}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Strengths */}
          {candidate.analysis?.keyStrengths?.length > 0 && (
            <div className="drawer-section">
              <h4 className="drawer-section-title">Key Strengths</h4>
              <div className="drawer-strengths-grid">
                {candidate.analysis.keyStrengths.map((strength, index) => (
                  <div key={index} className="drawer-strength-item">
                    <div className="drawer-strength-icon">✓</div>
                    <div className="drawer-strength-content">
                      <h5 className="drawer-strength-title">{strength.strength}</h5>
                      <p className="drawer-strength-evidence">{strength.evidence}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Areas for Improvement */}
          {candidate.analysis?.improvementAreas?.length > 0 && (
            <div className="drawer-section">
              <h4 className="drawer-section-title">Areas for Improvement</h4>
              <div className="drawer-improvements-grid">
                {candidate.analysis.improvementAreas.map((area, index) => (
                  <div key={index} className="drawer-improvement-item">
                    <div className="drawer-improvement-icon">!</div>
                    <div className="drawer-improvement-content">
                      <h5 className="drawer-improvement-title">{area.gap}</h5>
                      <p className="drawer-improvement-suggestion">{area.suggestion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendation */}
          {candidate.analysis?.recommendation && (
            <div className="drawer-section">
              <h4 className="drawer-section-title">Recommendation</h4>
              <div className="drawer-recommendation-card">
                <div className="drawer-recommendation-header">
                  <span className={`drawer-recommendation-badge ${candidate.analysis.recommendation.type.toLowerCase().replace(/\s+/g, '-')}`}>
                    {candidate.analysis.recommendation.type}
                  </span>
                </div>
                <p className="drawer-recommendation-reason">
                  {candidate.analysis.recommendation.reason}
                </p>
              </div>
            </div>
          )}

          {/* Resume Full Text */}
          {candidate.resume?.fullText && (
            <div className="drawer-section">
              <div 
                className="drawer-resume-header" 
                onClick={toggleResumeExpand}
              >
                <h4 className="drawer-section-title">Resume</h4>
                <span className={`drawer-resume-arrow ${isResumeExpanded ? 'expanded' : ''}`}>
                  ▼
                </span>
              </div>
              {isResumeExpanded && (
                <div className="drawer-resume-content">
                  {candidate.resume.fullText.split('\n\n').map((section, index) => {
                    const lines = section.split('\n').map(line => line.trim()).filter(line => line !== '');
                    const title = lines[0];
                    const content = lines.slice(1);
                    return (
                      <div key={index} className="drawer-resume-section">
                        <h5 className="drawer-resume-section-title">{title}</h5>
                        {content.map((line, lineIndex) => (
                          <p key={lineIndex} className="drawer-resume-line">{line}</p>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateDrawer;
