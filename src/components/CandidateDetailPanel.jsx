import React, { useState, useEffect } from 'react';
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
  faTrophy,
  faChevronDown,
  faChevronUp
} from '@fortawesome/free-solid-svg-icons';
import './CandidateDetailPanel.css';

const CandidateDetailPanel = ({ 
  candidate, 
  isOpen, 
  onClose 
}) => {
  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    strengths: false,
    improvements: false,
    recommendation: false,
    resume: false
  });

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Calculate weighted scores correctly
  const getWeightedScores = (categoryScores) => {
    if (!categoryScores) return null;
    
    return {
      technical: Math.round((categoryScores.technicalSkills / 100) * 40),
      experience: Math.round((categoryScores.experience / 100) * 25),
      education: Math.round((categoryScores.education / 100) * 10),
      softSkills: Math.round((categoryScores.softSkills / 100) * 15),
      achievements: Math.round((categoryScores.achievements / 100) * 10)
    };
  };

  if (!isOpen || !candidate) return null;

  const weightedScores = getWeightedScores(candidate.analysis?.categoryScores);

  return (
    <div className={`candidate-detail-panel ${isOpen ? 'open' : ''}`}>
      <div className="panel-container">
        {/* Panel Header */}
        <div className="panel-header">
          <div className="candidate-info-header">
            <div className="candidate-avatar-panel">
              {candidate.resume.name.charAt(0).toUpperCase()}
            </div>
            <div className="candidate-details-panel">
              <h3 className="candidate-name-panel">{candidate.resume.name}</h3>
              <div className="contact-info-panel">
                <div className="contact-item-panel">
                  <FontAwesomeIcon icon={faEnvelope} className="contact-icon-panel" />
                  <span>{candidate.resume.email}</span>
                </div>
                <div className="contact-item-panel">
                  <FontAwesomeIcon icon={faPhone} className="contact-icon-panel" />
                  <span>{candidate.resume.phoneNumber}</span>
                </div>
                <div className="contact-item-panel">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="contact-icon-panel" />
                  <span className={`source-tag-panel ${candidate.source?.toLowerCase()}`}>
                    {candidate.source || 'Internal'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="panel-header-actions">
            <div className="match-score-panel">
              <div className="score-percentage-panel">{candidate.score}/100</div>
              <div className="score-label-panel">Match Score</div>
            </div>
            <button
              className="panel-close-btn"
              onClick={onClose}
              aria-label="Close panel"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>

        {/* Weighted Category Scores */}
        {weightedScores && (
          <div className="weighted-scores-section">
            <h4 className="scores-title">Category Breakdown (Weighted)</h4>
            <div className="weighted-scores-grid">
              <div className="weighted-score-item">
                <FontAwesomeIcon icon={faCode} className="score-icon-weighted" />
                <span className="score-label-weighted">Technical Skills</span>
                <div className="score-bar-weighted">
                  <div 
                    className="score-fill-weighted technical"
                    style={{ width: `${(weightedScores.technical / 40) * 100}%` }}
                  ></div>
                </div>
                <span className="score-value-weighted">{weightedScores.technical}/40</span>
              </div>
              
              <div className="weighted-score-item">
                <FontAwesomeIcon icon={faBriefcase} className="score-icon-weighted" />
                <span className="score-label-weighted">Experience</span>
                <div className="score-bar-weighted">
                  <div 
                    className="score-fill-weighted experience"
                    style={{ width: `${(weightedScores.experience / 25) * 100}%` }}
                  ></div>
                </div>
                <span className="score-value-weighted">{weightedScores.experience}/25</span>
              </div>
              
              <div className="weighted-score-item">
                <FontAwesomeIcon icon={faGraduationCap} className="score-icon-weighted" />
                <span className="score-label-weighted">Education</span>
                <div className="score-bar-weighted">
                  <div 
                    className="score-fill-weighted education"
                    style={{ width: `${(weightedScores.education / 10) * 100}%` }}
                  ></div>
                </div>
                <span className="score-value-weighted">{weightedScores.education}/10</span>
              </div>
              
              <div className="weighted-score-item">
                <FontAwesomeIcon icon={faUsers} className="score-icon-weighted" />
                <span className="score-label-weighted">Soft Skills</span>
                <div className="score-bar-weighted">
                  <div 
                    className="score-fill-weighted soft-skills"
                    style={{ width: `${(weightedScores.softSkills / 15) * 100}%` }}
                  ></div>
                </div>
                <span className="score-value-weighted">{weightedScores.softSkills}/15</span>
              </div>
              
              <div className="weighted-score-item">
                <FontAwesomeIcon icon={faTrophy} className="score-icon-weighted" />
                <span className="score-label-weighted">Achievements</span>
                <div className="score-bar-weighted">
                  <div 
                    className="score-fill-weighted achievements"
                    style={{ width: `${(weightedScores.achievements / 10) * 100}%` }}
                  ></div>
                </div>
                <span className="score-value-weighted">{weightedScores.achievements}/10</span>
              </div>
            </div>
          </div>
        )}

        {/* Panel Content - Collapsible Sections */}
        <div className="panel-content">
          {/* Executive Summary */}
          <div className="panel-section">
            <div 
              className="section-header-panel"
              onClick={() => toggleSection('summary')}
            >
              <h4 className="section-title-panel">Executive Summary</h4>
              <FontAwesomeIcon 
                icon={expandedSections.summary ? faChevronUp : faChevronDown} 
                className="section-toggle-icon"
              />
            </div>
            {expandedSections.summary && (
              <div className="section-content-panel">
                <p>{candidate.analysis?.executiveSummary || 'No executive summary available.'}</p>
              </div>
            )}
          </div>

          {/* Key Strengths */}
          {candidate.analysis?.keyStrengths?.length > 0 && (
            <div className="panel-section">
              <div 
                className="section-header-panel"
                onClick={() => toggleSection('strengths')}
              >
                <h4 className="section-title-panel">Key Strengths ({candidate.analysis.keyStrengths.length})</h4>
                <FontAwesomeIcon 
                  icon={expandedSections.strengths ? faChevronUp : faChevronDown} 
                  className="section-toggle-icon"
                />
              </div>
              {expandedSections.strengths && (
                <div className="section-content-panel">
                  <div className="strengths-grid-panel">
                    {candidate.analysis.keyStrengths.map((strength, index) => (
                      <div key={index} className="strength-item-panel">
                        <div className="strength-icon-panel">✓</div>
                        <div className="strength-content-panel">
                          <h5 className="strength-title-panel">{strength.strength}</h5>
                          <p className="strength-evidence-panel">{strength.evidence}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Areas for Improvement */}
          {candidate.analysis?.improvementAreas?.length > 0 && (
            <div className="panel-section">
              <div 
                className="section-header-panel"
                onClick={() => toggleSection('improvements')}
              >
                <h4 className="section-title-panel">Areas for Improvement ({candidate.analysis.improvementAreas.length})</h4>
                <FontAwesomeIcon 
                  icon={expandedSections.improvements ? faChevronUp : faChevronDown} 
                  className="section-toggle-icon"
                />
              </div>
              {expandedSections.improvements && (
                <div className="section-content-panel">
                  <div className="improvements-grid-panel">
                    {candidate.analysis.improvementAreas.map((area, index) => (
                      <div key={index} className="improvement-item-panel">
                        <div className="improvement-icon-panel">!</div>
                        <div className="improvement-content-panel">
                          <h5 className="improvement-title-panel">{area.gap}</h5>
                          <p className="improvement-suggestion-panel">{area.suggestion}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recommendation */}
          {candidate.analysis?.recommendation && (
            <div className="panel-section">
              <div 
                className="section-header-panel"
                onClick={() => toggleSection('recommendation')}
              >
                <h4 className="section-title-panel">Recommendation</h4>
                <FontAwesomeIcon 
                  icon={expandedSections.recommendation ? faChevronUp : faChevronDown} 
                  className="section-toggle-icon"
                />
              </div>
              {expandedSections.recommendation && (
                <div className="section-content-panel">
                  <div className="recommendation-card-panel">
                    <div className="recommendation-header-panel">
                      <span className={`recommendation-badge-panel ${candidate.analysis.recommendation.type.toLowerCase().replace(/\s+/g, '-')}`}>
                        {candidate.analysis.recommendation.type}
                      </span>
                    </div>
                    <p className="recommendation-reason-panel">
                      {candidate.analysis.recommendation.reason}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Resume Full Text */}
          {candidate.resume?.fullText && (
            <div className="panel-section">
              <div 
                className="section-header-panel"
                onClick={() => toggleSection('resume')}
              >
                <h4 className="section-title-panel">Full Resume</h4>
                <FontAwesomeIcon 
                  icon={expandedSections.resume ? faChevronUp : faChevronDown} 
                  className="section-toggle-icon"
                />
              </div>
              {expandedSections.resume && (
                <div className="section-content-panel">
                  <div className="resume-content-panel">
                    {candidate.resume.fullText.split('\n\n').map((section, index) => {
                      const lines = section.split('\n').map(line => line.trim()).filter(line => line !== '');
                      const title = lines[0];
                      const content = lines.slice(1);
                      return (
                        <div key={index} className="resume-section-panel">
                          <h5 className="resume-section-title-panel">{title}</h5>
                          {content.map((line, lineIndex) => (
                            <p key={lineIndex} className="resume-line-panel">{line}</p>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailPanel;
