import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { useSelector } from 'react-redux';
import './ManagerCandidates.css';
import './SkaletoneStyles.css';
import useManagerCandidates from './useManagerCandidates';
import { authService, candidateService, interviewService, managerService } from '../../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLock, 
  faLockOpen, 
  faTimesCircle, 
  faCheck, 
  faSearch, 
  faEllipsisV, 
  faEye, 
  faMagic, 
  faSort, 
  faChevronDown, 
  faPlus, 
  faTimes,
  faEnvelope,
  faPhone,
  faMapMarkerAlt
} from '@fortawesome/free-solid-svg-icons';
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
  const [managers, setManagers] = useState([]);
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

  // Fetch managers data on component mount
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await managerService.getAllManagers();
        if (response.success) {
          setManagers(response.data);
          
        }
      } catch (error) {
        console.error('Error fetching managers:', error);
      }
    };

    fetchManagers();
  }, []);


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
      console.error('Full error object:', error);
      
      let errorMessage;
      const errorText = error.message?.toLowerCase() || '';
      
      // Check for various lock-related error patterns
      if (errorText.includes('locked') || 
          errorText.includes('already') || 
          errorText.includes('another manager') ||
          errorText.includes('conflict') ||
          errorText.includes('duplicate') ||
          error.message?.includes('409')) {
        errorMessage = 'This candidate is already locked by another manager. You cannot modify it.';
      } else if (errorText.includes('permission') || errorText.includes('forbidden')) {
        errorMessage = 'You do not have permission to lock/unlock this candidate.';
      } else if (errorText.includes('network') || errorText.includes('connection')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else {
        errorMessage = error.message || 'An unexpected error occurred. Please try again.';
      }
      
      console.log('Showing tooltip with message:', errorMessage);
      setLockErrorState({ show: true, message: errorMessage, candidateId: candidate.resume.id });
      setTimeout(() => setLockErrorState({ show: false, message: '', candidateId: null }), 5000); // Show tooltip for 5 seconds
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
                      <FontAwesomeIcon icon={faEnvelope} className="icon-sm text-gray-500" />
                      <span>{candidate.resume.email}</span>
                    </div>
                    <div className="contact-item">
                      <FontAwesomeIcon icon={faPhone} className="icon-sm text-gray-500" />
                      <span>{candidate.resume.phoneNumber}</span>
                    </div>
                    <div className="contact-item">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="icon-sm text-gray-500" />
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
  const [showShortlistSlideshow, setShowShortlistSlideshow] = useState(false);
  const [currentShortlistSlide, setCurrentShortlistSlide] = useState(0);

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

  // Shortlist slideshow data
  const shortlistSlides = [
    {
      title: "📋 Processing Shortlist",
      description: "Preparing your selected candidates for the next stage",
      content: "We're organizing your selected candidates and preparing their profiles for the shortlisting process. This includes validating their information and ensuring all data is complete."
    },
    {
      title: "🔄 Updating Candidate Status",
      description: "Marking candidates as shortlisted in the system",
      content: "Our system is updating the status of your selected candidates to 'Shortlisted' and notifying relevant stakeholders about the progression to the next interview stage."
    },
    {
      title: "📧 Sending Notifications",
      description: "Notifying team members and candidates about the shortlisting",
      content: "We're sending automated notifications to your team members and preparing communication templates for the shortlisted candidates about their next steps."
    },
    {
      title: "✅ Finalizing Shortlist",
      description: "Almost done! Completing the shortlisting process",
      content: "We're finalizing the shortlist, updating all relevant records, and preparing the candidate pipeline for the interview scheduling phase. Thank you for your patience!"
    }
  ];

  // Auto-advance search slideshow
  useEffect(() => {
    if (showSearchSlideshow) {
      const interval = setInterval(() => {
        setCurrentSearchSlide((prev) => (prev + 1) % searchSlides.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [showSearchSlideshow, searchSlides.length]);

  // Auto-advance shortlist slideshow
  useEffect(() => {
    if (showShortlistSlideshow) {
      const interval = setInterval(() => {
        setCurrentShortlistSlide((prev) => (prev + 1) % shortlistSlides.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [showShortlistSlideshow, shortlistSlides.length]);

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
    setShowShortlistSlideshow(true);
    setCurrentShortlistSlide(0);
    
    const formattedCandidates = getFormattedCandidateData();
    if (formattedCandidates.length === 0) {
      setShortlistMessage('Please select at least one candidate to shortlist.');
      setShortlistSuccess(false);
      setIsShortlisting(false);
      setShowShortlistSlideshow(false);
      setShowShortlistModal(true);
      return;
    }

    const payload = {
      managerId: currentUserId,
      candidates: formattedCandidates,
      jobDescription: fullJobDescriptionData || {
        summary: secondarySearch
      }
    };

    try {
      // Add minimum 5-second delay to ensure slideshow displays properly
      const [response] = await Promise.all([
        interviewService.shortlistCandidates(payload),
        new Promise(resolve => setTimeout(resolve, 5000)) // 5-second minimum delay
      ]);
      
      if (response) {
        setShortlistMessage('Candidates have been successfully shortlisted. Please contact HR for further processing and scheduling!');
        setShortlistSuccess(true);
      } else {
        setShortlistMessage('Failed to shortlist candidates. Please try again.');
        setShortlistSuccess(false);
      }
    } catch (error) {
      console.error('Error shortlisting candidates:', error);
      setShortlistMessage('An error occurred while shortlisting candidates. Please try again.');
      setShortlistSuccess(false);
      
      // Ensure minimum delay even on error
      await new Promise(resolve => setTimeout(resolve, 5000));
    } finally {
      setIsShortlisting(false);
      setShowShortlistSlideshow(false);
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
      <div className="min-h-screen bg-white">
        <style>{spinKeyframes}</style>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Candidates Search</h1>
                <p className="text-gray-600 mt-1">Find and manage your candidate pipeline</p>
              </div>
              <button
                className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 rounded-button whitespace-nowrap cursor-pointer text-base"
                onClick={handleEnableAI}
                aria-label="Generate AI Job Description"
              >
                <FontAwesomeIcon icon={faMagic} className="fa-icon-left icon-md" />
                Generate AI Job Description
              </button>
            </div>
          </div>
        </div>
        {/* Main Content */}
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          {/* Enhanced Search Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faSearch} className="text-gray-400 icon-md" />
                </div>
                <textarea
                  ref={textareaRef}
                  placeholder="Search candidates by name, skills, or experience..."
                  value={secondarySearch}
                  onChange={(e) => {
                    setSecondarySearch(e.target.value);
                    adjustTextareaHeight();
                  }}
                  onFocus={() => setErrorMessage('')}
                  className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all duration-200 bg-gray-50 hover:bg-white resize-none"
                  style={{ minHeight: '60px', maxHeight: '120px' }}
                />
              </div>
              
              {/* Search Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button 
                    className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors duration-200 rounded-button whitespace-nowrap cursor-pointer text-base"
                    onClick={() => handleSearchClick(null, secondarySearch)}
                    aria-label="Search candidates"
                    disabled={isSearching}
                  >
                    <FontAwesomeIcon icon={faSearch} className="fa-icon-left icon-sm" />
                    {isSearching ? 'Searching...' : 'Search'}
                  </button>
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip id="external-search-tooltip">Search External Candidates</Tooltip>}
                  >
                    <label className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 cursor-pointer">
                      <input
                        type="checkbox"
                        id="externalSearch"
                        checked={filters.externalSearch || false}
                        onChange={(e) => handleFilterChange('externalSearch', e.target.checked)}
                        className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                      />
                      <span>External Search</span>
                    </label>
                  </OverlayTrigger>
                </div>
              </div>
            </div>
            {errorMessage && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{errorMessage}</p>
              </div>
            )}
          </div>
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Candidates
                <span className="ml-2 bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-medium">
                  {searchResults.length}
                </span>
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <FontAwesomeIcon icon={faSort} className="icon-sm" />
                <span>Sort by: Relevance</span>
                <FontAwesomeIcon icon={faChevronDown} className="icon-sm" />
              </div>
            </div>
          </div>

          {/* Enhanced Candidates Grid */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {searchResults.length > 0 ? (
              searchResults.map((candidate) => {
                const getScoreTheme = (score) => {
                  if (score >= 85) return 'excellent';
                  if (score >= 75) return 'good';
                  if (score >= 60) return 'average';
                  return 'poor';
                };
                
                const scoreTheme = getScoreTheme(candidate.score);
                
                return (
                <div
                  key={candidate.resume.id}
                  className={`rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 border overflow-hidden group cursor-pointer ${
                    candidate.locked && String(candidate.managerId) === String(currentUserId)
                      ? 'bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200 shadow-pink-100'
                      : `bg-white card-theme-${scoreTheme}`
                  } text-score-${scoreTheme}`}
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        {/* Heart-style checkbox for candidate selection */}
                        <div className="flex items-center">
                          <button
                            onClick={() => handleCandidateLockToggle(candidate, currentUserId)}
                            className="heart-checkbox transition-all duration-300 hover:scale-110 focus:outline-none"
                            aria-label={candidate.locked && String(candidate.managerId) === String(currentUserId) ? "Unselect candidate" : "Select candidate"}
                          >
                            {candidate.locked && String(candidate.managerId) === String(currentUserId) ? (
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-pink-500">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="currentColor"/>
                              </svg>
                            ) : (
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-300 hover:text-pink-400">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" fill="none"/>
                              </svg>
                            )}
                          </button>
                        </div>
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                          style={{
                            backgroundColor: getLightColor().replace('85', '500').replace('95', 'white'),
                            color: getDarkColor()
                          }}
                        >
                          {getInitials(candidate.resume.name)}
                        </div>
                        <div>
                          <h3 className="candidate-name text-lg font-semibold transition-colors duration-200">
                            {candidate.resume.name}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              candidate.locked ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {candidate.locked ? 'shortlisted' : 'available'}
                            </span>
                            <span className="contact-text text-sm">
                              {candidate.resume.fullText.match(/(\d+)\+ years/)?.[1] || 'N/A'} yrs experience
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {lockErrorState.show && lockErrorState.candidateId === candidate.resume.id && (
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id={`lock-error-tooltip-${candidate.resume.id}`} className="custom-tooltip">
                                {lockErrorState.message}
                              </Tooltip>
                            }
                            show={true}
                          >
                            <div className="p-2 text-red-500">
                              <FontAwesomeIcon icon={faTimesCircle} className="text-lg" />
                            </div>
                          </OverlayTrigger>
                        )}
                        <div className="relative">
                          <button 
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 cursor-pointer"
                            onClick={() => handleMoreOptionsClick(candidate.resume.id)}
                          >
                            <FontAwesomeIcon icon={faEllipsisV} className="icon-sm" />
                          </button>
                          {activeDropdown === candidate.resume.id && (
                            <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                              <button 
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                                onClick={() => handleViewClick(candidate)}
                              >
                                <FontAwesomeIcon icon={faEye} className="fa-icon-left icon-sm" />
                                {expandedCandidate?.resume.id === candidate.resume.id ? 'Hide Details' : 'View Details'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Contact Info - Simplified */}
                    <div className="space-y-1 mb-4">
                      <div className="text-sm text-gray-600">{candidate.resume.phoneNumber}</div>
                      <div className="text-sm text-gray-600 truncate">{candidate.resume.email}</div>
                    </div>

                    {/* Skills - Simplified */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                        {candidate.analysis?.keyStrengths?.[0]?.strength || 'Extensive experience in relevant technologies'}
                      </p>
                    </div>

                    {/* Score and Stats - Simplified */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${
                            candidate.score >= 85 ? 'text-green-600' : 
                            candidate.score >= 75 ? 'text-blue-600' : 'text-orange-600'
                          }`}>
                            {candidate.score}%
                          </div>
                          <div className="text-xs text-gray-500">Score</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-teal-600">
                            {candidate.locked ? '1' : '0'}
                          </div>
                          <div className="text-xs text-gray-500">Shortlisted by</div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors duration-200 text-sm font-medium"
                          onClick={() => handleViewClick(candidate)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>

                    {/* Enhanced Progress Bar */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>Match Score</span>
                        <span className="font-semibold">{candidate.score}%</span>
                      </div>
                      <div className="progress-bar-container">
                        <div
                          className={`progress-bar-fill ${
                            candidate.score >= 85 ? 'progress-bar-excellent' :
                            candidate.score >= 75 ? 'progress-bar-good' :
                            candidate.score >= 60 ? 'progress-bar-average' : 'progress-bar-poor'
                          }`}
                          style={{ width: `${candidate.score}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Source Tag */}
                    <div className="mt-3 flex justify-end">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        candidate.source?.toLowerCase() === 'external' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {candidate.source || 'Internal'}
                      </span>
                    </div>
                  </div>
                </div>
                );
              })
            ) : (
              <div className="col-span-full flex justify-center items-center py-12">
                <div className="text-center">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4">
                    <path d="M15 8C15 10.2091 13.2091 12 11 12C8.79086 12 7 10.2091 7 8C7 5.79086 8.79086 4 11 4C13.2091 4 15 5.79086 15 8Z" stroke="#059669" strokeWidth="2" />
                    <path d="M3 20C3 16.6863 6.58172 14 11 14C15.4183 14 19 16.6863 19 20" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
                    <path d="M19 4L23 8M23 4L19 8" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
                  <p className="text-gray-600">
                    {currentSearchValue
                      ? "Please check back later or try refreshing the data."
                      : "Enter your requirements to discover candidates that fit your role"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Load More */}
          {searchResults.length > 0 && (
            <div className="text-center mt-12">
              <button className="bg-white text-teal-600 border-2 border-teal-600 px-8 py-3 rounded-lg hover:bg-teal-600 hover:text-white transition-all duration-200 font-medium rounded-button whitespace-nowrap cursor-pointer text-base">
                <FontAwesomeIcon icon={faPlus} className="fa-icon-left icon-sm" />
                Load More Candidates
              </button>
            </div>
          )}

          {/* Expanded View */}
          {expandedCandidate && (
            <div className="mt-8 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="relative">
                <button
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 z-10"
                  onClick={() => setExpandedCandidate(null)}
                  aria-label="Close expanded view"
                >
                  <FontAwesomeIcon icon={faTimes} className="icon-lg" />
                </button>
                {renderExpandedView(expandedCandidate)}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="mt-8 flex items-center justify-between p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="text-sm text-gray-600">
              Selected: <span className="font-semibold text-teal-600">{searchResults.filter(c => c.locked && c.managerId === currentUserId).length}</span> candidates
            </div>
            <button
              className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              onClick={handleShortlistClick}
              disabled={searchResults.length === 0 || isShortlisting || searchResults.filter(c => c.locked && c.managerId === currentUserId).length === 0}
            >
              {isShortlisting ? 'Shortlisting...' : 'Shortlist Selected'}
            </button>
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
      <Modal
        show={showShortlistModal}
        onHide={() => setShowShortlistModal(false)}
        centered
        backdrop="static"
        keyboard={false}
        className="success-modal"
        size="lg"
      >
        <Modal.Body className="text-center p-5">
          <div className="success-icon-wrapper mb-4">
            <FontAwesomeIcon
              icon={faCheck}
              className="success-icon text-success"
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

      {/* Shortlist slideshow overlay on top of loader */}
      {showShortlistSlideshow && isShortlisting && (
        <div className="slideshow-overlay">
          <div className="slideshow-container">
            <div className="slideshow-slide">
              <h3>{shortlistSlides[currentShortlistSlide].title}</h3>
              <p className="slide-description">{shortlistSlides[currentShortlistSlide].description}</p>
              <p className="slide-content">{shortlistSlides[currentShortlistSlide].content}</p>
              
              <div className="slide-indicators">
                {shortlistSlides.map((_, index) => (
                  <div
                    key={index}
                    className={`indicator ${index === currentShortlistSlide ? 'active' : ''}`}
                    onClick={() => setCurrentShortlistSlide(index)}
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

export default ManagerCandidates;
