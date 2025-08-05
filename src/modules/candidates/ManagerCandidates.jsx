import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { useSelector } from 'react-redux';
import './ManagerCandidates.css';
import './SkaletoneStyles.css';
import useManagerCandidates from './useManagerCandidates';
import { authService, candidateService, interviewService  , managerService } from '../../services/api';
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
  faMapMarkerAlt,
  faCode,
  faBriefcase,
  faGraduationCap,
  faUsers,
  faTrophy,
  faClock
} from '@fortawesome/free-solid-svg-icons';
import CompareView from './CompareView';
import { Modal, Button, Tooltip, OverlayTrigger } from 'react-bootstrap';
import Loader from '../../components/Loader';
import AIJobDescriptionGenerator from '../../components/AIJobDescriptionGenerator';
import AIJobDescriptionPopup from '../../components/AIJobDescriptionPopup';
import ManagerDetailsDialog from '../../components/ManagerDetailsDialog';
import CandidateDrawer from '../../components/CandidateDrawer';

// import ManagerDetailsDialog from '../../components/ManagerDetailsDialog';

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
 // const textareaRef = useRef(null);
  const currentUserId = useSelector(state => state.auth.user?.id);

  // State variables
  const [searchResults, setSearchResults] = useState([]);
  const [lockErrorState, setLockErrorState] = useState({ show: false, message: '', candidateId: null });
  const [showShortlistModal, setShowShortlistModal] = useState(false);
  const [shortlistMessage, setShortlistMessage] = useState('');
  const [shortlistSuccess, setShortlistSuccess] = useState(false);
  const [secondarySearch, setSecondarySearch] = useState('');
  const [fullJobDescriptionData, setFullJobDescriptionData] = useState(null);
  const [showAIChatOverlay, setShowAIChatOverlay] = useState(false);
  const [showAIPopup, setShowAIPopup] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [expandedCandidate, setExpandedCandidate] = useState(null);
  const [isResumeExpanded, setIsResumeExpanded] = useState(false);
  const [isCompareViewOpen, setIsCompareViewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isShortlisting, setIsShortlisting] = useState(false);
  const [showSearchSlideshow, setShowSearchSlideshow] = useState(false);
  const [currentSearchSlide, setCurrentSearchSlide] = useState(0);
    const [managers, setManagers] = useState([]);

  const [managerDetails, setManagerDetails] = useState({});

  const [showManagerDialog, setShowManagerDialog] = useState(false);

  const [selectedManager, setSelectedManager] = useState(null);
  const [showShortlistSlideshow, setShowShortlistSlideshow] = useState(false);
  const [currentShortlistSlide, setCurrentShortlistSlide] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentSearchValue, setCurrentSearchValue] = useState('');
  const textareaRef = useRef(null);

  // Smart Drawer State
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerCandidate, setDrawerCandidate] = useState(null);
  const [drawerDirection, setDrawerDirection] = useState('right');

   const fetchManagerDetails = useCallback(async (managerId) => {

    if (!managerDetails[managerId]) {

      try {

        const response = await managerService.getManagerById(managerId);

        if (response.success) {

          const { fullName, email, phoneNumber, designation, region, businessUnit, department, role } = response.data;

          setManagerDetails(prev => ({

            ...prev,

            [managerId]: { fullName, email, phoneNumber, designation, region, businessUnit, department, role }

          }));

        }

      } catch (error) {

        console.error('Error fetching manager details:', error);

      }

    }

  }, [managerDetails]);



  const handleOpenManagerDialog = (managerId) => {

    setSelectedManager(managerDetails[managerId]);

    setShowManagerDialog(true);

  };



  useEffect(() => {

    searchResults.forEach(candidate => {

      if (candidate.locked && candidate.managerId) {

        fetchManagerDetails(candidate.managerId);

      }

    });

  }, [searchResults, fetchManagerDetails]);

  const {
    filters,
    selectedCandidates,
    handleFilterChange: originalHandleFilterChange,
    handleSelectCandidate,
  } = useManagerCandidates();

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

  const handleCopyForSearch = (combinedText) => {
    // Update the search box with the combined text
    setSecondarySearch(combinedText);
    // Show success feedback
    console.log('Search box updated with:', combinedText);
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
  const handleFilterChange = (filterName, value) => {
    setErrorMessage('');
    originalHandleFilterChange(filterName, value);
  };

  const handleMoreOptionsClick = (candidateId) => {
    setActiveDropdown(activeDropdown === candidateId ? null : candidateId);
  };

  // Smart positioning logic for drawer
  const getDrawerDirection = (cardElement) => {
    if (!cardElement) return 'right';
    
    const rect = cardElement.getBoundingClientRect();
    const screenWidth = window.innerWidth;
    const cardCenterX = rect.left + rect.width / 2;
    
    // If card is on right half of screen, drawer slides from left
    // If card is on left half of screen, drawer slides from right
    return cardCenterX > screenWidth / 2 ? 'left' : 'right';
  };

  const handleViewClick = (candidate, event) => {
    // Close any existing expanded view
    setExpandedCandidate(null);
    
    // Get the card element for smart positioning
    const cardElement = event?.target?.closest('.enhanced-candidate-card');
    const direction = getDrawerDirection(cardElement);
    
    // Set drawer state
    setDrawerCandidate(candidate);
    setDrawerDirection(direction);
    setShowDrawer(true);
    setActiveDropdown(null);
  };

  const handleCloseDrawer = () => {
    setShowDrawer(false);
    setDrawerCandidate(null);
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
                            style={{ width: `${candidate.analysis.categoryScores[item.score]}%` }}
                          ></div>
                        </div>
                        <div className="score-value">{candidate.analysis.categoryScores[item.score]}%</div>
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
      
      <div className="min-h-screen bg-white">
        <style>{spinKeyframes}</style>
        {/* Main Content */}
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          {/* Compact Search Section */}
          <div className="compact-search-container">
            <div className="search-row">
              {/* Search Input */}
              <div className="search-input-wrapper">
                <div className="search-icon">
                  <FontAwesomeIcon icon={faSearch} />
                </div>
                <input
                  type="text"
                  placeholder="Search your candidate pipeline by name, skills, location, or requirements..."
                  value={secondarySearch}
                  onChange={(e) => setSecondarySearch(e.target.value)}
                  onFocus={() => setErrorMessage('')}
                  className="compact-search-input"
                />
              </div>
              
              {/* Internal Only Checkbox */}
              <label className="internal-checkbox-label">
                <input
                  type="checkbox"
                  checked={!filters.externalSearch}
                  onChange={(e) => handleFilterChange('externalSearch', !e.target.checked)}
                  className="internal-checkbox"
                />
                <span className="checkbox-text">Internal Only</span>
              </label>
              
              {/* Search Button */}
              <button 
                className="search-btn-green"
                onClick={() => handleSearchClick(null, secondarySearch)}
                disabled={isSearching}
              >
                <FontAwesomeIcon icon={faSearch} />
                {isSearching ? 'Searching...' : 'Search'}
              </button>
              
              {/* AI Job Generator Button */}
              <button
                className="ai-generator-btn"
                onClick={handleEnableAI}
              >
                <FontAwesomeIcon icon={faMagic} />
                AI Job Generator
              </button>
            </div>
            
            {errorMessage && (
              <div className="error-message">
                <p>{errorMessage}</p>
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
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                  className={`enhanced-candidate-card ${scoreTheme} ${
                    candidate.locked && String(candidate.managerId) === String(currentUserId) ? 'selected' : ''
                  }`}
                >
                    {/* Heart Selection - Top Right Corner */}
                    <div className="card-heart-right">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleCandidateLockToggle(candidate, currentUserId);
                        }}
                        className="heart-btn-right"
                        aria-label={candidate.locked && String(candidate.managerId) === String(currentUserId) ? "Unselect candidate" : "Select candidate"}
                      >
                        {candidate.locked && String(candidate.managerId) === String(currentUserId) ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="heart-right selected">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="#ec4899"/>
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="heart-right">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="#d1d5db" strokeWidth="2" fill="none"/>
                          </svg>
                        )}
                      </button>
                      {/* Score under heart */}
                      <div className={`score-under-heart ${scoreTheme}`}>
                        {candidate.score}%
                      </div>
                    </div>

                  {/* Error State */}
                  {lockErrorState.show && lockErrorState.candidateId === candidate.resume.id && (
                    <div className="card-error-left">
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id={`error-tooltip-${candidate.resume.id}`}>
                            {lockErrorState.message}
                          </Tooltip>
                        }
                        show={true}
                      >
                        <FontAwesomeIcon icon={faTimesCircle} className="error-icon" />
                      </OverlayTrigger>
                    </div>
                  )}

                  {/* Card Body */}
                  <div className="enhanced-card-body">
                    {/* Clean Header Section */}
                    <div className="clean-header-section">
                      <div className="avatar-and-name">
                        <div className="clean-avatar">
                          {getInitials(candidate.resume.name)}
                        </div>
                        <div className="name-and-status">
                          <h3 className="clean-name">{candidate.resume.name}</h3>
                          <div className="status-badges">
                            <span className="status-badge interviewing">
                              {candidate.locked && candidate.managerId ? 'selected' : 'available'}
                            </span>
                            <span className="status-badge experience">
                              {candidate.resume.fullText.match(/(\d+)\+ years/)?.[0] || 
                               candidate.analysis?.keyStrengths?.[0]?.strength?.substring(0, 15) || 
                               '5+ years'}
                            </span>
                            <span className={`status-badge source ${candidate.source?.toLowerCase() || 'internal'}`}>
                              {candidate.source || 'Internal'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information with Selected By */}
                    <div className="contact-and-selection-section">
                      <div className="contact-details">
                        {candidate.resume.phoneNumber && (
                          <div className="clean-contact-item">
                            <FontAwesomeIcon icon={faPhone} className="clean-contact-icon" />
                            <span className="clean-contact-text">{candidate.resume.phoneNumber}</span>
                          </div>
                        )}
                        {candidate.resume.email && (
                          <div className="clean-contact-item">
                            <FontAwesomeIcon icon={faEnvelope} className="clean-contact-icon" />
                            <span className="clean-contact-text">{candidate.resume.email}</span>
                          </div>
                        )}
                      </div>
                      <div className="selection-info">
                        {candidate.locked && candidate.managerId && (
                          <div className="selected-by-info">
                            <div className="selected-by-label">Shortlisted by:

                              <span 

      style={{ marginLeft: '4px', cursor: 'pointer', textDecoration: 'underline' }}

      onClick={() => handleOpenManagerDialog(candidate.managerId)}

    >

      {managerDetails[candidate.managerId] 

        ? managerDetails[candidate.managerId].fullName 

        : 'Loading...'}

    </span>

                            </div>
                            {/* <div className="selected-by-value">{candidate.managerId}</div> */}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Key Strengths Section - Horizontal Pills */}
                    <div className="key-strengths-section">
                      <div className="strengths-section-header">
                        <FontAwesomeIcon icon={faTrophy} className="strengths-icon" />
                        <span className="strengths-title">STRENGTHS</span>
                      </div>
                      <div className="strengths-pills-container">
                        <div className="strengths-row">
                          {(() => {
                            const strengths = candidate.analysis?.keyStrengths;
                            if (strengths && strengths.length > 0) {
                              // Show ALL strengths instead of limiting to 2
                              const getStrengthColor = (index) => {
                                const colors = ['green', 'blue', 'purple', 'orange'];
                                return colors[index % colors.length];
                              };
                              
                              return strengths.map((strength, index) => (
                                <span 
                                  key={index} 
                                  className={`strength-pill ${getStrengthColor(index)}`}
                                >
                                  {strength?.strength || `Strength ${index + 1}`}
                                </span>
                              ));
                            } else {
                              // Fallback when no strengths available
                              return (
                                <>
                                  <span className="strength-pill green">Strong candidate</span>
                                  <span className="strength-pill blue">Experienced professional</span>
                                  <span className="strength-pill purple">Team player</span>
                                </>
                              );
                            }
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Score Breakdown */}
                    {candidate.analysis?.categoryScores && (
                      <div className="score-breakdown-section">
                        <div className="score-breakdown-header">
                          <h4 className="breakdown-title">Score Breakdown</h4>
                          <div className="overall-score">{candidate.score}% Overall</div>
                        </div>
                        <div className="score-badges-container">
                          <div className="score-badge technical">
                            <FontAwesomeIcon icon={faCode} className="badge-icon" />
                            <span className="badge-label">Technical</span>
                            <span className="badge-percentage">
                              {candidate.analysis.categoryScores.technicalSkills}%
                            </span>
                          </div>
                          <div className="score-badge experience">
                            <FontAwesomeIcon icon={faBriefcase} className="badge-icon" />
                            <span className="badge-label">Experience</span>
                            <span className="badge-percentage">
                              {candidate.analysis.categoryScores.experience}%
                            </span>
                          </div>
                          <div className="score-badge education">
                            <FontAwesomeIcon icon={faGraduationCap} className="badge-icon" />
                            <span className="badge-label">Education</span>
                            <span className="badge-percentage">
                              {candidate.analysis.categoryScores.education}%
                            </span>
                          </div>
                          <div className="score-badge soft-skills">
                            <FontAwesomeIcon icon={faUsers} className="badge-icon" />
                            <span className="badge-label">Soft Skills</span>
                            <span className="badge-percentage">
                              {candidate.analysis.categoryScores.softSkills}%
                            </span>
                          </div>
                          <div className="score-badge achievements">
                            <FontAwesomeIcon icon={faTrophy} className="badge-icon" />
                            <span className="badge-label">Achievements</span>
                            <span className="badge-percentage">
                              {candidate.analysis.categoryScores.achievements}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )}


                    {/* Action Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleViewClick(candidate, e);
                      }}
                      className={`action-btn-enhanced ${scoreTheme}`}
                    >
                      <FontAwesomeIcon icon={faEye} className="icon" />
                      View Details
                    </button>
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
        <AIJobDescriptionGenerator 
          onClose={() => setShowAIChatOverlay(false)}
          onJobDescriptionGenerated={handleGenerateJobDescription}
          onCopyForSearch={handleCopyForSearch}
        />
      )}
      {showAIPopup && (
        <AIJobDescriptionPopup
          onClose={() => setShowAIPopup(false)}
          onEnable={handleEnableAI}
          onMaybeLater={handleMaybeLater}
        />
      )}

      {/* Smart Candidate Drawer */}
      <CandidateDrawer
        candidate={drawerCandidate}
        isOpen={showDrawer}
        onClose={handleCloseDrawer}
        slideDirection={drawerDirection}
      />

      <ManagerDetailsDialog
        show={showManagerDialog}
        onHide={() => setShowManagerDialog(false)}
        manager={selectedManager}
      />

    </>
  );
};

export default ManagerCandidates;
