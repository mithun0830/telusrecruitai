import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import './ManagerCandidates.css';
import useManagerCandidates from './useManagerCandidates';
import { candidateService } from '../../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faLockOpen } from '@fortawesome/free-solid-svg-icons';
import CompareView from './CompareView';

const isFilterSelected = (filters) => {
  return Boolean(filters.aiSearch.trim());
};

const loaderStyle = {
  width: '50px',
  height: '50px',
  border: '3px solid #059669',
  borderTopColor: 'transparent',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
};

const loaderContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '300px',
  flexDirection: 'column',
  gap: '20px',
};

const loaderTextStyle = {
  color: '#059669',
  fontSize: '18px',
};

const ManagerCandidates = () => {
  const spinKeyframes = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;

  const handleCandidateLockToggle = async (candidate, currentUserId) => {
    try {
      if (candidate.locked) {
        await candidateService.unlockCandidate(candidate, currentUserId);
      } else {
        await candidateService.lockCandidate(candidate, currentUserId);
      }
      // Toggle the locked status
      candidate.locked = !candidate.locked;
      // Update the selectedCandidates list
      handleSelectCandidate(candidate.resume.id);
    } catch (error) {
      console.error('Error updating candidate lock status:', error);
      alert('Failed to update candidate status. Please try again.');
    }
  };
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [expandedCandidate, setExpandedCandidate] = useState(null);
  const [isResumeExpanded, setIsResumeExpanded] = useState(false);
  const [isCompareViewOpen, setIsCompareViewOpen] = useState(false);
  const currentUserId = useSelector(state => state.auth.user?.id);

  const handleAISearchClick = () => {
    setErrorMessage('');
  };
  const {
    filters,
    selectedCandidates,
    handleFilterChange: originalHandleFilterChange,
    handleSelectCandidate,
  } = useManagerCandidates();

  const handleFilterChange = (filterName, value) => {
    setErrorMessage('');
    originalHandleFilterChange(filterName, value);
  };

  const handleMoreOptionsClick = (candidateId) => {
    setActiveDropdown(activeDropdown === candidateId ? null : candidateId);
  };

  const handleViewClick = (candidate) => {
    setExpandedCandidate(expandedCandidate?.resume.id === candidate.resume.id ? null : candidate);
    setActiveDropdown(null);
  };

  const renderExpandedView = (candidate) => {
    if (!candidate) return null;

    const toggleResumeExpand = () => {
      setIsResumeExpanded(!isResumeExpanded);
    };

    return (
      <div className="expanded-view">
        <div className="expanded-content">
          <div className="candidate-header">
            <div className="candidate-info">
                <div className="candidate-name-row">
                  <div className="candidate-avatar-large">
                    {candidate.resume.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="candidate-details">
                    <h2 className="candidate-name-large">{candidate.resume.name}</h2>
                    <div className="contact-info">
                      <div className="contact-item">
                        <span>📧</span>
                        <span>{candidate.resume.email}</span>
                      </div>
                      <div className="contact-item">
                        <span>📞</span>
                        <span>{candidate.resume.phoneNumber}</span>
                      </div>
                    </div>
                  </div>
                </div>
            </div>
            <div className="match-score">
              <div className="score-percentage">{candidate.score}%</div>
              <div className="score-label">Match Score</div>
            </div>
          </div>
          <div className="expanded-row">
            <div className="content-section">
              <h4>Executive Summary</h4>
              <p>{candidate.analysis?.executiveSummary || 'No executive summary available.'}</p>
            </div>
          </div>

          {candidate.analysis?.categoryScores && (
            <div className="expanded-row">
              <div className="content-section">
                <h4>Category Scores</h4>
                <div className="scores-list">
                  {[
                    { label: "Technical Skills", score: "technicalSkills", total: 40 },
                    { label: "Experience", score: "experience", total: 25 },
                    { label: "Education", score: "education", total: 10 },
                    { label: "Soft Skills", score: "softSkills", total: 15 },
                    { label: "Achievements", score: "achievements", total: 10 }
                  ].map((item, index) => (
                    <div key={index} className="score-item">
                      <div className="score-label">{item.label}</div>
                      <div className="score-bar-container">
                        <div className="score-bar">
                          <div 
                            className="score-fill" 
                            style={{ width: `${(candidate.analysis.categoryScores[item.score] / item.total) * 100}%` }}
                          ></div>
                        </div>
                        <div className="score-value">{candidate.analysis.categoryScores[item.score]}/{item.total}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {candidate.analysis?.keyStrengths?.length > 0 && (
            <div className="expanded-row">
              <div className="content-section">
                <h4>Key Strengths</h4>
                <div className="strengths-list">
                  {candidate.analysis.keyStrengths.map((strength, index) => (
                    <div key={index} className="strength-item">
                      <div className="check-icon">✓</div>
                      <div className="strength-content">
                        <h5>{strength.strength}</h5>
                        <p>{strength.evidence}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {candidate.analysis?.improvementAreas?.length > 0 && (
            <div className="expanded-row">
              <div className="content-section">
                <h4>Areas for Improvement</h4>
                <div className="improvement-list">
                  {candidate.analysis.improvementAreas.map((area, index) => (
                    <div key={index} className="improvement-item">
                      <div className="warning-icon">!</div>
                      <div className="improvement-content">
                        <h5>{area.gap}</h5>
                        <p>{area.suggestion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {candidate.analysis?.recommendation && (
            <div className="expanded-row">
              <div className="content-section">
                <h4>Recommendation</h4>
                <div className="recommendation-card">
                  <div className="recommendation-type">
                    <span className={`recommendation-sign ${candidate.analysis.recommendation.type.toLowerCase().replace(/\s+/g, '-')}`}></span>
                    {candidate.analysis.recommendation.type}
                  </div>
                  <p>{candidate.analysis.recommendation.reason}</p>
                </div>
              </div>
            </div>
          )}

          {candidate.resume?.fullText && (
            <div className="expanded-row">
              <div className="content-section resume-full-text">
                <div className="resume-header" onClick={toggleResumeExpand}>
                  <h4>Resume</h4>
                  <span className={`arrow ${isResumeExpanded ? 'expanded' : ''}`}>▼</span>
                </div>
                {isResumeExpanded && (
                  <div className="resume-text-card">
                    <div className="resume-body">
                      {candidate.resume.fullText.split('\n\n').map((section, index) => {
                        const lines = section.split('\n').map(line => line.trim()).filter(line => line !== '');
                        const title = lines[0];
                        const content = lines.slice(1);
                        return (
                          <div key={index} className="resume-section">
                            <h3>{title}</h3>
                            {content.map((line, lineIndex) => (
                              <p key={lineIndex}>{line}</p>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSearchClick = async (e) => {
    // Prevent any event bubbling
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!isFilterSelected(filters)) {
      setErrorMessage('Please select at least one filter before searching.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);
    const searchString = filters.aiSearch.trim();
    console.log("searchString", searchString)
    try {
      const response = await candidateService.searchCandidates(searchString);
      if (response.success) {
        setSearchResults(response.data);
      } else {
        console.error('Search failed:', response.message);
        setErrorMessage('Search failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during search:', error);
      setErrorMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="candidates-page">
      <style>{spinKeyframes}</style>
      <div className="candidates-header">
        <h1>Manager Candidates</h1>
      </div>
      <div className="candidates-content">
        <div className="filters-section horizontal">
          <div className="filters-container">
            <div className="ai-search-container">
              <input
                type="text"
                placeholder="Search Candidate: E.g., Data Engineers with 4+ years..."
                className="ai-search-input"
                value={filters.aiSearch}
                onChange={(e) => handleFilterChange('aiSearch', e.target.value)}
                onFocus={() => setErrorMessage('')}
              />
            </div>
            <div>
              <button
                className="search-button"
                onClick={handleSearchClick}
                aria-label="Search candidates"
              >
                Search
              </button>
            </div>
          </div>
          {errorMessage && <div className="error-message">{errorMessage}</div>}
        </div>
        <div className={`candidates-container ${isCompareViewOpen ? 'with-compare-view' : ''}`}>
          <div className="candidates-list-wrapper">
            <div className="candidates-list">
              <div className="candidates-list-header">
                <h2>Candidates <span className="candidate-count">{isLoading ? '...' : searchResults.length}</span></h2>
                <div className="header-actions">
                </div>
              </div>
              <div className="candidates-table-container">
              {isLoading ? (
                <div style={loaderContainerStyle}>
                  <div style={loaderStyle}></div>
                  <span style={loaderTextStyle}>Searching for candidates...</span>
                </div>
              ) : searchResults.length > 0 ? (
              <table className="candidates-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Skill Set</th>
                    <th>Exp.</th>
                    <th>Score</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((candidate) => (
                    <React.Fragment key={candidate.resume.id}>
                      <tr className={expandedCandidate?.resume.id === candidate.resume.id ? 'expanded' : ''}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedCandidates.includes(candidate.resume.id)}
                           onChange={() => {
                              // if (candidate.locked) {
                              //   alert("This candidate is already shortlisted");
                              //   return;
                              // }
                              handleCandidateLockToggle(candidate, currentUserId);
                            }}
                         
                            // onChange={() => (!candidate.locked && (currentUserId === candidate.managerID)) && handleSelectCandidate(candidate.resume.id)}
                            // disabled={candidate.locked || (currentUserId !== candidate.managerID)}
                            // title={
                            //   candidate.locked 
                            //     ? "This candidate is already shortlisted" 
                            //     : currentUserId !== candidate.managerID 
                            //       ? "You don't have permission to select this candidate" 
                            //       : ""
                            // }
                          />
                        </td>
                        <td>
                          <div className="candidate-name">
                            <div className="candidate-avatar">{candidate.resume.name.charAt(0).toUpperCase()}</div>
                            <span>{candidate.resume.name}</span>
                          </div>
                        </td>
                        <td><div className="candidate-name"><span>{candidate.resume.phoneNumber}</span></div></td>
                        <td>
                          <div className="candidate-name">
                            <span>
                              {candidate.analysis?.keyStrengths?.[0]?.strength || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td>{candidate.resume.fullText.match(/(\d+)\+ years/)?.[1] || 'N/A'} yrs</td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="score-cell">{candidate.score}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`status-icon ${candidate.locked ? 'locked' : 'unlocked'}`}>
                            <FontAwesomeIcon icon={!candidate.locked ? faLockOpen : faLock} />
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div className="dropdown">
                            <button
                              className="btn-more"
                              title="More options"
                              onClick={() => handleMoreOptionsClick(candidate.resume.id)}
                            >
                              ⋮
                            </button>
                            {activeDropdown === candidate.resume.id && (
                              <div className="dropdown-content">
                                <button onClick={() => handleViewClick(candidate)}>Detailed View</button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                      {expandedCandidate?.resume.id === candidate.resume.id && (
                        <tr className="expanded-row">
                          <td colSpan="8">
                            {renderExpandedView(expandedCandidate)}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-candidates-message">
                <div>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 8C15 10.2091 13.2091 12 11 12C8.79086 12 7 10.2091 7 8C7 5.79086 8.79086 4 11 4C13.2091 4 15 5.79086 15 8Z" stroke="#059669" strokeWidth="2" />
                    <path d="M3 20C3 16.6863 6.58172 14 11 14C15.4183 14 19 16.6863 19 20" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
                    <path d="M19 4L23 8M23 4L19 8" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <div>No Candidate found matching your search criteria.</div>
                </div>
              </div>
              )}
              </div>
              <div className="candidates-footer">
                <div className="selection-info">
                  Selected: <span className="selected-count">{selectedCandidates.length}</span>
                </div>
                <div className="footer-actions">
                  <button className="btn-action secondary">Shortlist</button>
                </div>
              </div>
            </div>
          </div>
          {isCompareViewOpen && (
            <div className="compare-view-wrapper">
              <CompareView
                candidates={selectedCandidates.map(id => searchResults.find(c => c.resume.id === id))}
                onClose={() => setIsCompareViewOpen(false)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerCandidates;
