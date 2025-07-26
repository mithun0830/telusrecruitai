import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { useSelector } from 'react-redux';
import './ManagerCandidates.css';
import useManagerCandidates from './useManagerCandidates';
import { authService, candidateService, interviewService } from '../../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faLockOpen, faTimesCircle, faCheck } from '@fortawesome/free-solid-svg-icons';
import CompareView from './CompareView';
import { Modal, Button, Tooltip, OverlayTrigger } from 'react-bootstrap';
import Loader from '../../components/Loader';
import AIChatOverlay from '../../components/AIChatOverlay';
import AIJobDescriptionPopup from '../../components/AIJobDescriptionPopup';

const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getDarkColor = () => {
  const h = Math.floor(Math.random() * 360);
  const s = Math.floor(Math.random() * 30) + 70; // 70-100%
  const l = Math.floor(Math.random() * 20) + 10; // 10-30%
  return `hsl(${h}, ${s}%, ${l}%)`;
};

const getLightColor = () => {
  const h = Math.floor(Math.random() * 360);
  const s = Math.floor(Math.random() * 30) + 70; // 70-100%
  const l = Math.floor(Math.random() * 10) + 85; // 85-95%
  return `hsl(${h}, ${s}%, ${l}%)`;
};

const scrollToRef = (ref) => {
  if (ref && ref.current) {
    ref.current.scrollIntoView({ behavior: 'smooth' });
  }
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
  const expandedViewRef = useRef(null);
  const [lockErrorState, setLockErrorState] = useState({ show: false, message: '', candidateId: null });
  const [showShortlistModal, setShowShortlistModal] = useState(false);
  const [shortlistMessage, setShortlistMessage] = useState('');
  const [shortlistSuccess, setShortlistSuccess] = useState(false);
  const [secondarySearch, setSecondarySearch] = useState('');
  const [fullJobDescriptionData, setFullJobDescriptionData] = useState(null);
  const [showAIChatOverlay, setShowAIChatOverlay] = useState(false);
  const [showAIPopup, setShowAIPopup] = useState(true);
  const textareaRef = useRef(null);

  const spinKeyframes = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;

  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  useLayoutEffect(() => {
    adjustTextareaHeight();
  }, [adjustTextareaHeight]);

  const handleGenerateJobDescription = async (data) => {
    if (data) {
      // Store the complete response.data
      setFullJobDescriptionData(data);
      // Do not automatically set the summary in the search field
      // adjustTextareaHeight();
    }
  };

  const handleCandidateLockToggle = async (candidate, currentUserId) => {
    try {
      let response;
      if (candidate.locked) {
        response = await candidateService.unlockCandidate(candidate, currentUserId);
      } else {
        response = await candidateService.lockCandidate(candidate, currentUserId);
      }

      if (response.success) {
        // Toggle the locked status and set managerId
        candidate.locked = !candidate.locked;
        candidate.managerId = candidate.locked ? currentUserId : null;
        // Update the selectedCandidates list
        handleSelectCandidate(candidate.resume.id);
      } else {
        throw new Error(response.message || 'Failed to update candidate status');
      }
    } catch (error) {
      console.error('Error updating candidate lock status:', error);
      let errorMessage;
      if (error.message.includes('locked')) {
        errorMessage = 'This candidate is already locked by another manager. You cannot modify it.';
      } else {
        errorMessage = error.message || 'An unexpected error occurred. Please try again.';
      }
      setLockErrorState({ show: true, message: errorMessage, candidateId: candidate.resume.id });
      setTimeout(() => setLockErrorState({ show: false, message: '', candidateId: null }), 3000); // Hide tooltip after 3 seconds
    }
  };
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [expandedCandidate, setExpandedCandidate] = useState(null);
  const [isResumeExpanded, setIsResumeExpanded] = useState(false);
  const [isCompareViewOpen, setIsCompareViewOpen] = useState(false);
  const currentUserId = useSelector(state => state.auth.user?.id);

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
    if (expandedCandidate?.resume.id === candidate.resume.id) {
      setExpandedCandidate(null);
    } else {
      setExpandedCandidate(candidate);
      setTimeout(() => scrollToRef(expandedViewRef), 100);
    }
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
                    <div className="contact-item">
                      <span>🔍</span>
                      <span className={`source-tag ${candidate.source?.toLowerCase()}`}>{candidate.source || 'Internal'}</span>
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
                      <div className="error-icon">!</div>
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
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isShortlisting, setIsShortlisting] = useState(false);
  const [showSearchSlideshow, setShowSearchSlideshow] = useState(false);
  const [currentSearchSlide, setCurrentSearchSlide] = useState(0);

  // Search slideshow data - dynamically filtered based on external search setting
  const getSearchSlides = () => {
    const baseSlides = [
      {
        title: "🔍 Searching for Candidates",
        description: "Please be patient while we search for the best candidates for you",
        content: "We're analyzing your job requirements and searching through our comprehensive database to find candidates that match your specific needs."
      },
      {
        title: "🏢 Searching Local Database",
        description: "Scanning our internal candidate database for perfect matches",
        content: "Our AI is evaluating candidates from our local database, analyzing their skills, experience, and qualifications to find the best fits for your position."
      }
    ];

    // Only add internet sources slide if external search is enabled
    if (filters.externalSearch) {
      baseSlides.push({
        title: "🌐 Searching Internet Sources",
        description: "Expanding search to external platforms and job boards",
        content: "We're now searching external sources and professional networks to find additional qualified candidates who might be the perfect fit for your role."
      });
    }

    baseSlides.push({
      title: "⚡ Finalizing Results",
      description: "Almost done! We're compiling and ranking your candidate matches",
      content: "Our system is now ranking all found candidates based on their match score, experience level, and relevance to your job requirements. Thank you for your patience!"
    });

    return baseSlides;
  };

  const searchSlides = getSearchSlides();

  // Auto-advance search slideshow
  useEffect(() => {
    if (showSearchSlideshow) {
      const interval = setInterval(() => {
        setCurrentSearchSlide((prev) => (prev + 1) % searchSlides.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [showSearchSlideshow, searchSlides.length]);

  const setLoading = useCallback((isLoading) => {
    document.documentElement.classList.toggle('loading', isLoading);
    document.body.classList.toggle('loading', isLoading);
  }, []);

  useEffect(() => {
    const isLoading = isGeneratingDescription || isSearching || isShortlisting;
    setLoading(isLoading);
    return () => setLoading(false);
  }, [isGeneratingDescription, isSearching, isShortlisting, setLoading]);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentSearchValue, setCurrentSearchValue] = useState('');

  const handleSearchClick = async (e, searchValue = null) => {
    // Prevent any event bubbling
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const searchText = searchValue;
    if (!searchText?.trim()) {
      setErrorMessage('Please enter job requirements to search for candidates.');
      return;
    }

    setErrorMessage('');
    setIsSearching(true);
    setShowSearchSlideshow(true);
    setCurrentSearchSlide(0);
    setExpandedCandidate(null); // Reset expanded view
    setSearchResults([]);

    const searchString = searchText.trim();
    setCurrentSearchValue(searchString); // Save the search value
    console.log("searchString", searchString)
    try {
      let internalCandidates = [];
      let externalCandidates = [];

      if (filters.externalSearch) {
        const externalResponse = await candidateService.searchExternalCandidates(searchString);
        if (externalResponse.success) {
          externalCandidates = externalResponse.data.map(candidate => ({ ...candidate, source: 'External' }));
        }
      }

      const internalResponse = await candidateService.searchCandidates(searchString);
      if (internalResponse.success) {
        internalCandidates = internalResponse.data.map(candidate => ({ ...candidate, source: 'Internal' }));
      }

      const mergedResults = [...internalCandidates, ...externalCandidates];

      if (mergedResults.length > 0) {
        setSearchResults(mergedResults);
      } else {
        setErrorMessage('No candidates found. Please try a different search.');
      }
    } catch (error) {
      console.error('Error during search:', error);
      setErrorMessage('An error occurred. Please try again.');
    } finally {
      setIsSearching(false);
      setShowSearchSlideshow(false);
    }
  };

  const getFormattedCandidateData = () => {
    return searchResults
      .filter(candidate => candidate.locked && candidate.managerId === currentUserId)
      .map(candidate => ({
        resumeId: candidate.resume.id,
        evaluationId: 123456,
        name: candidate.resume.name,
        email: candidate.resume.email,
        phone: candidate.resume.phoneNumber,
        positionApplied: currentSearchValue || candidate.resume.positionApplied || "Not specified",
        jobDetails: currentSearchValue || candidate.resume.jobDetails || "Not specified",
        score: candidate.score
      }));
  };

  const handleShortlistClick = async () => {
    setIsShortlisting(true);
    const formattedCandidates = getFormattedCandidateData();
    if (formattedCandidates.length === 0) {
      setShortlistMessage('Please select at least one candidate to shortlist.');
      setShortlistSuccess(false);
      setShowShortlistModal(true);
      return;
    }

    const payload = {
      managerId: currentUserId,
      candidates: formattedCandidates,
      jobDescription: fullJobDescriptionData
    };

    try {
      const response = await interviewService.shortlistCandidates(payload);
      if (response) {
        setShortlistMessage('Candidates have been successfully shortlisted.');
        setShortlistSuccess(true);
      } else {
        setShortlistMessage('Failed to shortlist candidates. Please try again.');
        setShortlistSuccess(false);
      }
    } catch (error) {
      console.error('Error shortlisting candidates:', error);
      setShortlistMessage('An error occurred while shortlisting candidates. Please try again.');
      setShortlistSuccess(false);
    } finally {
      setIsShortlisting(false);
      setShowShortlistModal(true);
    }
  };

  const handleEnableAI = () => {
    setShowAIPopup(false);
    setShowAIChatOverlay(true);
  };

  const handleMaybeLater = () => {
    setShowAIPopup(false);
  };

  return (
    <>
      {(isGeneratingDescription || isSearching || isShortlisting) && <Loader isVisible={true} />}
      <div className="candidates-page">
        <style>{spinKeyframes}</style>
      <div className="candidates-header">
        <h1>Candidates Search</h1>
        <button
          className="ai-job-description-btn"
          onClick={handleEnableAI}
          aria-label="Generate AI Job Description"
        >
          <span style={{ fontSize: '20px' }}>✨</span>
          Generate AI Job Description
        </button>
      </div>
      <div className="candidates-content">
        <div className="filters-section horizontal">
            <div className="filters-container" style={{ backgroundColor: '#fff', border: '2px solid #059669' }}>
              <div className="ai-search-container">
                <textarea
                  ref={textareaRef}
                  placeholder="Enter job requirements to search for candidates..."
                  className="ai-search-input ai-generated-textarea"
                  value={secondarySearch}
                  onChange={(e) => {
                    setSecondarySearch(e.target.value);
                    adjustTextareaHeight();
                  }}
                  onFocus={() => setErrorMessage('')}
                />
              </div>
              <div className="search-controls">
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip id="external-search-tooltip">Search External Candidates</Tooltip>}
                >
                  <div className="external-search-checkbox">
                    <input
                      type="checkbox"
                      id="externalSearch"
                      checked={filters.externalSearch || false}
                      onChange={(e) => handleFilterChange('externalSearch', e.target.checked)}
                    />
                    <label htmlFor="externalSearch"></label>
                  </div>
                </OverlayTrigger>
                <button
                  className="search-button"
                  onClick={() => handleSearchClick(null, secondarySearch)}
                  aria-label="Search candidates"
                  disabled={isSearching}
                  style={{
                    backgroundColor: '#059669',
                    padding: '10px 24px',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {isSearching ? (
                    <span>Searching...</span>
                  ) : (
                    <>
                      <span style={{ fontSize: '20px' }}>🔍</span>
                      Search
                    </>
                  )}
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
                {searchResults.length > 0 ? (
                  <div className="candidates-grid">
                    {searchResults.map((candidate) => (
                      <div key={candidate.resume.id} className="candidate-card">
                        <div className="card-header">
                          <div className="candidate-info">
                            <div
                              className="avatar"
                              style={{
                                backgroundColor: getLightColor(),
                                color: getDarkColor(),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                fontWeight: 'bold',
                                fontSize: '16px',
                              }}
                            >
                              {getInitials(candidate.resume.name)}
                            </div>
                            <div>
                              <h3>{candidate.resume.name}</h3>
                            </div>
                          </div>
                          <div className="card-actions">
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip id={`lock-error-tooltip-${candidate.resume.id}`} className="custom-tooltip">
                                  {lockErrorState.message}
                                </Tooltip>
                              }
                              show={lockErrorState.show && lockErrorState.candidateId === candidate.resume.id}
                            >
                              <div className="lock-toggle">
                                <input
                                  type="checkbox"
                                  checked={candidate.locked}
                                  onChange={() => handleCandidateLockToggle(candidate, currentUserId)}
                                />
                                <span className={`status-icon ${candidate.locked ? 'locked' : 'unlocked'}`}>
                                  <FontAwesomeIcon icon={!candidate.locked ? faLockOpen : faLock} />
                                </span>
                              </div>
                            </OverlayTrigger>
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
                                  <button onClick={() => handleViewClick(candidate)}>
                                    {expandedCandidate?.resume.id === candidate.resume.id ? 'Hide Details' : 'Show Details'}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="card-content">
                          <div className="candidate-details">
                            <div>Phone: {candidate.resume.phoneNumber}</div>
                            <div>Email: {candidate.resume.email}</div>
                            <div>Skill: {candidate.analysis?.keyStrengths?.[0]?.strength || 'N/A'}</div>
                            <div>Experience: {candidate.resume.fullText.match(/(\d+)\+ years/)?.[1] || 'N/A'} yrs</div>
                            <div>Score: {candidate.score}%</div>
                          </div>
                          <div className="source-section">
                            <span className={`source-tag ${candidate.source?.toLowerCase()}`}>{candidate.source || 'Internal'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-candidates-message">
                    <div>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 8C15 10.2091 13.2091 12 11 12C8.79086 12 7 10.2091 7 8C7 5.79086 8.79086 4 11 4C13.2091 4 15 5.79086 15 8Z" stroke="#059669" strokeWidth="2" />
                        <path d="M3 20C3 16.6863 6.58172 14 11 14C15.4183 14 19 16.6863 19 20" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
                        <path d="M19 4L23 8M23 4L19 8" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      <div>
                        {currentSearchValue
                          ? "Please check back later or try refreshing the data."
                          : "Enter your requirements to discover candidates that fit your role"}
                      </div>
                    </div>
                  </div>
                )}
                {expandedCandidate && (
                  <div ref={expandedViewRef} className="expanded-view-container">
                    <button
                      className="close-button"
                      onClick={() => setExpandedCandidate(null)}
                      aria-label="Close expanded view"
                    >
                      ✕
                    </button>
                    {renderExpandedView(expandedCandidate)}
                  </div>
                )}
              </div>
              <div className="candidates-footer">
                <div className="selection-info">
                  Selected: <span className="selected-count">{searchResults.filter(c => c.locked && c.managerId === currentUserId).length}</span>
                </div>
                <div className="footer-actions">
                  <button
                    className="btn-action secondary"
                    onClick={handleShortlistClick}
                    disabled={searchResults.length === 0 || isShortlisting || searchResults.filter(c => c.locked && c.managerId === currentUserId).length === 0}
                  >
                    {isShortlisting ? 'Shortlisting...' : 'Shortlist'}
                  </button>
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
      <Modal
        show={showShortlistModal}
        onHide={() => setShowShortlistModal(false)}
        centered
        backdrop="static"
        keyboard={false}
        className="success-modal"
      >
        <Modal.Body className="text-center p-5">
          <div className="success-icon-wrapper mb-4">
            <FontAwesomeIcon
              icon={shortlistSuccess === 'success' ? faCheck : faTimesCircle}
              className={`success-icon ${shortlistSuccess ? '' : 'text-danger'}`}
            />
          </div>
          <h4 className="success-title mb-3">
            {shortlistSuccess ? 'Success' : 'Operation Failed'}
          </h4>
          <p className="success-message mb-4">{shortlistMessage}</p>
          <Button
            variant={shortlistSuccess ? 'success' : 'danger'}
            onClick={() => setShowShortlistModal(false)}
            className="continue-button"
          >
            Close
          </Button>
        </Modal.Body>
      </Modal>
      {showAIChatOverlay && (
        <AIChatOverlay 
          onClose={() => setShowAIChatOverlay(false)}
          onJobDescriptionGenerated={handleGenerateJobDescription}
        />
      )}
      {showAIPopup && (
        <AIJobDescriptionPopup
          onClose={() => setShowAIPopup(false)}
          onEnable={handleEnableAI}
          onMaybeLater={handleMaybeLater}
        />
      )}
      
      {/* Search slideshow overlay on top of loader */}
      {showSearchSlideshow && isSearching && (
        <div className="slideshow-overlay">
          <div className="slideshow-container">
            <div className="slideshow-slide">
              <h3>{searchSlides[currentSearchSlide].title}</h3>
              <p className="slide-description">{searchSlides[currentSearchSlide].description}</p>
              <p className="slide-content">{searchSlides[currentSearchSlide].content}</p>
              
              <div className="slide-indicators">
                {searchSlides.map((_, index) => (
                  <div
                    key={index}
                    className={`indicator ${index === currentSearchSlide ? 'active' : ''}`}
                    onClick={() => setCurrentSearchSlide(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default ManagerCandidates;
