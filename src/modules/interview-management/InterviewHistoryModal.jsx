import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './InterviewHistoryModal.css';
import { candidateService, interviewService, aiFeedbackService, notificationService } from '../../services/api';
import Loader from '../../components/Loader';
import { Modal, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle, faRobot } from '@fortawesome/free-solid-svg-icons';

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      slots.push(new Date(2023, 0, 1, hour, minute, 0, 0));
    }
  }
  return slots;
};

const scrollTimeList = (direction) => {
  const timeList = document.querySelector('.react-datepicker__time-list');
  if (timeList) {
    const scrollAmount = direction === 'up' ? -40 : 40;
    timeList.scrollBy({ top: scrollAmount, behavior: 'smooth' });
  }
};

const InterviewHistoryModal = ({ isOpen, onClose, candidateHistory, interviewRounds, onUpdateSuccess }) => {
  const handleClose = (success = false, meetingLink = null) => {
    resetScheduleFields();
    onClose(success, meetingLink);
  };

const resetScheduleFields = () => {
  setSelectedRound('');
  setSelectedInterviewers([]);
  setSelectedDateTime(new Date());
  setDuration('30');
  setShowSlots(false);
  setAvailableSlots([]);
  setSelectedSlot(null);
  setIsDropdownOpen(false);
};
  const [selectedRound, setSelectedRound] = useState('');
  const [selectedInterviewers, setSelectedInterviewers] = useState([]);
  const [selectedDateTime, setSelectedDateTime] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [duration, setDuration] = useState('30');
  const [showSlots, setShowSlots] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [latestMeetingLink, setLatestMeetingLink] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFindingSlotsLoading, setIsFindingSlotsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [interviewers, setInterviewers] = useState([]);
  const [loadingInterviewers, setLoadingInterviewers] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [sendQuestionnaire, setSendQuestionnaire] = useState(false);
  const multiselectRef = useRef(null);
  
  // AI Feedback related state
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(null);
  const [showAiFeedback, setShowAiFeedback] = useState(false);
  
  // Store feedback per candidate ID to persist across modal opens/closes
  const [candidateFeedbackCache, setCandidateFeedbackCache] = useState({});
  
  // Questions Asked related state
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [questionsData, setQuestionsData] = useState(null);
  const [showQuestions, setShowQuestions] = useState(false);
  const [questionsCache, setQuestionsCache] = useState({});
  
  // JD Relevance related state
  const [isLoadingRelevance, setIsLoadingRelevance] = useState(false);
  const [relevanceData, setRelevanceData] = useState(null);
  const [showRelevance, setShowRelevance] = useState(false);
  const [relevanceCache, setRelevanceCache] = useState({});
  
  // Track if AI feedback has been generated at least once for this candidate
  const [hasGeneratedFeedback, setHasGeneratedFeedback] = useState(false);
  
  // Polling related state
  const [isPolling, setIsPolling] = useState(false);
  const [candidateFolderExists, setCandidateFolderExists] = useState(false);
  const [pollingIntervalId, setPollingIntervalId] = useState(null);
  const [hasStoppedPolling, setHasStoppedPolling] = useState(new Set()); // Track candidates for which polling has stopped
  
  // Use refs for immediate state tracking to prevent race conditions
  const pollingIntervalRef = useRef(null);
  const isPollingRef = useRef(false);
  const hasStoppedPollingRef = useRef(new Set());
  const candidateFolderExistsRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedInterviewers([]);
      
      // Use email as the primary identifier for caching and polling
      const candidateEmail = candidateHistory?.email;
      
      // Load cached feedback for this candidate if it exists
      if (candidateEmail && candidateFeedbackCache[candidateEmail]) {
        setAiFeedback(candidateFeedbackCache[candidateEmail]);
        setShowAiFeedback(false); // Start collapsed
        setHasGeneratedFeedback(true); // Mark as generated if cached feedback exists
      } else {
        // Clear AI feedback when modal opens for a different candidate with no cache
        setAiFeedback(null);
        setShowAiFeedback(false);
        setHasGeneratedFeedback(false);
      }

      // Load cached questions for this candidate if it exists
      if (candidateEmail && questionsCache[candidateEmail]) {
        setQuestionsData(questionsCache[candidateEmail]);
        setShowQuestions(false); // Start collapsed
      } else {
        setQuestionsData(null);
        setShowQuestions(false);
      }

      // Load cached relevance data for this candidate if it exists
      if (candidateEmail && relevanceCache[candidateEmail]) {
        setRelevanceData(relevanceCache[candidateEmail]);
        setShowRelevance(false); // Start collapsed
      } else {
        setRelevanceData(null);
        setShowRelevance(false);
      }

      // Check if we've already found the folder for this candidate
      if (candidateEmail && hasStoppedPolling.has(candidateEmail)) {
        // We've already found the folder for this candidate, enable the button
        console.log('✅ Folder already found for candidate email:', candidateEmail);
        
        // Update refs to match state
        candidateFolderExistsRef.current = true;
        hasStoppedPollingRef.current = new Set([...hasStoppedPollingRef.current, candidateEmail]);
        isPollingRef.current = false;
        
        setCandidateFolderExists(true);
        setIsPolling(false);
      } else if (candidateEmail) {
        // Start polling for candidate folder if not already found
        console.log('🔄 Starting fresh polling for candidate email:', candidateEmail);
        
        // Reset refs for new polling
        candidateFolderExistsRef.current = false;
        isPollingRef.current = false;
        
        setCandidateFolderExists(false);
        startPollingForCandidateFolder(candidateEmail);
      }
    } else {
      // Clean up polling when modal closes
      stopPolling();
    }

    // Cleanup on unmount
    return () => {
      stopPolling();
    };
  }, [isOpen, candidateHistory?.email, candidateFeedbackCache, hasStoppedPolling]);

  // New useEffect to check candidate folder immediately when the modal opens
  useEffect(() => {
    if (isOpen && candidateHistory?.email) {
      console.log('🔄 Modal opened, checking candidate folder for:', candidateHistory.email);
      
      // Reset states when modal opens
      setCandidateFolderExists(false);
      setIsPolling(true);
      
      // Function to check folder
      const checkFolder = async () => {
        try {
          const response = await aiFeedbackService.checkCandidateFolder(candidateHistory.email);
          console.log('📋 Checking folder response:', response);
          
          // Check if folder exists based on the API response structure
          const folderExists = response.success && (
            response.folderExists === true ||
            (response.filesFound && response.filesFound.length > 0) ||
            (response.message && response.message.includes('Folder found:'))
          );
          
          if (folderExists) {
            console.log('✅ Folder exists, stopping polling');
            setCandidateFolderExists(true);
            setIsPolling(false);
            setHasStoppedPolling(prev => new Set([...prev, candidateHistory.email]));
          } else {
            console.log('❌ Folder not found, continuing polling');
          }
        } catch (error) {
          console.error('❌ Error checking folder:', error);
        }
      };
      
      // Immediate check
      checkFolder();
      
      // Start polling
      const intervalId = setInterval(checkFolder, 5000);
      
      // Cleanup
      return () => {
        console.log('🛑 Cleaning up polling for:', candidateHistory.email);
        clearInterval(intervalId);
        setIsPolling(false);
      };
    }
  }, [isOpen, candidateHistory?.email]);

  // Log state changes
  useEffect(() => {
    console.log('📊 candidateFolderExists state changed:', candidateFolderExists);
  }, [candidateFolderExists]);

  useEffect(() => {
    console.log('📊 isPolling state changed:', isPolling);
  }, [isPolling]);

  // Log state changes
  useEffect(() => {
    console.log('📊 candidateFolderExists state changed:', candidateFolderExists);
  }, [candidateFolderExists]);

  useEffect(() => {
    console.log('📊 isPolling state changed:', isPolling);
  }, [isPolling]);

  // Sync refs with state changes
  useEffect(() => {
    hasStoppedPollingRef.current = hasStoppedPolling;
  }, [hasStoppedPolling]);

  useEffect(() => {
    candidateFolderExistsRef.current = candidateFolderExists;
  }, [candidateFolderExists]);

  useEffect(() => {
    isPollingRef.current = isPolling;
  }, [isPolling]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (multiselectRef.current && !multiselectRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setIsLoading(loadingInterviewers);
  }, [loadingInterviewers]);

  // Remove the automatic API call when modal opens - only call after round selection

  const fetchInterviewers = async (jobDescription) => {
    setLoadingInterviewers(true);
    try {
      const response = await candidateService.getMatchingInterviewers(jobDescription?.summary+','+jobDepartment?.technicalSkills);
      if (response.success && Array.isArray(response.data)) {
        setInterviewers(response.data);
      } else {
        throw new Error('Failed to fetch interviewers');
      }
    } catch (error) {
      console.error('Error fetching interviewers:', error);
      setInterviewers([]);
      setModalType('error');
      setModalMessage('Failed to fetch interviewers. Please try again.');
      setShowModal(true);
    } finally {
      setLoadingInterviewers(false);
    }
  };

  const fetchManagerInterviewers = async () => {
    setLoadingInterviewers(true);
    try {
      // Using hardcoded manager ID as requested (will be made dynamic later)
      const managerId = 122;
      
      console.log('🔄 Calling manager API for ID:', managerId);
      const response = await candidateService.getManagerForCandidate(managerId);
      
      // Enhanced logging to debug the response structure
      console.log('📋 Full Manager API Response:', response);
      console.log('📋 Response type:', typeof response);
      console.log('📋 Response.success:', response?.success);
      console.log('📋 Response.data:', response?.data);
      console.log('📋 Response.data type:', typeof response?.data);
      
      // Handle different possible response structures
      let managerData = null;
      
      if (response && response.success) {
        // Case 1: Standard success response with data
        if (response.data) {
          managerData = response.data;
          console.log('✅ Using response.data:', managerData);
        }
      } else if (response && response.data) {
        // Case 2: Direct data without success flag
        managerData = response.data;
        console.log('✅ Using response.data (no success flag):', managerData);
      } else if (response && !response.success && !response.data) {
        // Case 3: Response might be the data itself
        managerData = response;
        console.log('✅ Using response as data:', managerData);
      }
      
      if (managerData) {
        console.log('📋 Processing manager data:', managerData);
        
        // Ensure we have an array to work with
        const managerArray = Array.isArray(managerData) ? managerData : [managerData];
        console.log('📋 Manager array:', managerArray);
        
        // Transform manager data to match interviewer format
        const transformedData = managerArray.map((manager, index) => {
          console.log(`📋 Processing manager ${index}:`, manager);
          
          return {
            email: manager.email || `manager${index}@company.com`,
            // Handle both 'name' and 'fullName' fields from API response
            name: manager.fullName || manager.name || manager.firstName || `Manager ${index + 1}`,
            interviewerId: manager.id || manager.managerId || managerId,
            experienceYears: manager.experienceYears || 'N/A',
            technicalExpertise: manager.technicalExpertise || [],
            matchScore: manager.matchScore || 'N/A',
            specializations: manager.specializations || ['Management']
          };
        });
        
        console.log('✅ Transformed manager data:', transformedData);
        setInterviewers(transformedData);
      } else {
        console.error('❌ No valid manager data found in response');
        throw new Error('No manager data found in API response');
      }
    } catch (error) {
      console.error('❌ Error fetching manager:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      
      setInterviewers([]);
      setModalType('error');
      setModalMessage(`Failed to fetch manager data: ${error.message}. Please try again.`);
      setShowModal(true);
    } finally {
      setLoadingInterviewers(false);
    }
  };

  const fetchHRInterviewers = async () => {
    setLoadingInterviewers(true);
    try {
      console.log('🔄 Calling HR API');
      const response = await candidateService.getHRPersonnel();
      
      // Enhanced logging to debug the response structure
      console.log('📋 Full HR API Response:', response);
      console.log('📋 Response type:', typeof response);
      console.log('📋 Response.success:', response?.success);
      console.log('📋 Response.data:', response?.data);
      console.log('📋 Response.data type:', typeof response?.data);
      
      // Handle different possible response structures
      let hrData = null;
      
      if (response && response.success) {
        // Case 1: Standard success response with data
        if (response.data) {
          hrData = response.data;
          console.log('✅ Using response.data:', hrData);
        }
      } else if (response && response.data) {
        // Case 2: Direct data without success flag
        hrData = response.data;
        console.log('✅ Using response.data (no success flag):', hrData);
      } else if (response && !response.success && !response.data) {
        // Case 3: Response might be the data itself
        hrData = response;
        console.log('✅ Using response as data:', hrData);
      }
      
      if (hrData) {
        console.log('📋 Processing HR data:', hrData);
        
        // Ensure we have an array to work with
        const hrArray = Array.isArray(hrData) ? hrData : [hrData];
        console.log('📋 HR array:', hrArray);
        
        // Transform HR data to match interviewer format
        const transformedData = hrArray.map((hr, index) => {
          console.log(`📋 Processing HR ${index}:`, hr);
          
          return {
            email: hr.email || `hr${index}@company.com`,
            name: hr.name || hr.fullName || hr.firstName || `HR ${index + 1}`,
            interviewerId: hr.id || index + 1,
            experienceYears: hr.experienceYears || 'N/A',
            technicalExpertise: hr.technicalExpertise || [],
            matchScore: hr.matchScore || 'N/A',
            specializations: hr.specializations || ['HR', 'Onboarding']
          };
        });
        
        console.log('✅ Transformed HR data:', transformedData);
        setInterviewers(transformedData);
      } else {
        console.error('❌ No valid HR data found in response');
        throw new Error('No HR data found in API response');
      }
    } catch (error) {
      console.error('❌ Error fetching HR personnel:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      
      setInterviewers([]);
      setModalType('error');
      setModalMessage(`Failed to fetch HR personnel: ${error.message}. Please try again.`);
      setShowModal(true);
    } finally {
      setLoadingInterviewers(false);
    }
  };

  // Polling functions with robust race condition prevention
  const startPollingForCandidateFolder = async (candidateId) => {
    console.log('🔄 Starting polling for candidate folder:', candidateId);
    
    // Update refs immediately
    isPollingRef.current = true;
    candidateFolderExistsRef.current = false;
    
    // Update state
    setIsPolling(true);
    setCandidateFolderExists(false);

    // Check immediately first
    await checkCandidateFolder(candidateId);

    // Only set up polling interval if folder wasn't found and we haven't stopped polling
    if (!hasStoppedPollingRef.current.has(candidateId) && !candidateFolderExistsRef.current) {
      console.log('🔄 Setting up polling interval for candidate:', candidateId);
      
      // Set up polling interval (every 10 seconds)
      const intervalId = setInterval(async () => {
        // Robust check using refs to prevent race conditions
        if (hasStoppedPollingRef.current.has(candidateId) || candidateFolderExistsRef.current || !isPollingRef.current) {
          console.log('🛑 Stopping interval due to ref checks - hasStoppedPolling:', hasStoppedPollingRef.current.has(candidateId), 'folderExists:', candidateFolderExistsRef.current, 'isPolling:', isPollingRef.current);
          clearInterval(intervalId);
          pollingIntervalRef.current = null;
          setPollingIntervalId(null);
          isPollingRef.current = false;
          setIsPolling(false);
          return;
        }
        
        console.log('🔄 Polling check for candidate:', candidateId);
        await checkCandidateFolder(candidateId);
      }, 10000);

      // Store interval in both ref and state
      pollingIntervalRef.current = intervalId;
      setPollingIntervalId(intervalId);
    } else {
      console.log('🛑 Not setting up interval - already stopped or folder exists');
    }
  };

  const checkCandidateFolder = async (candidateId) => {
    try {
      console.log('🔍 Checking candidate folder for:', candidateId);
      const response = await aiFeedbackService.checkCandidateFolder(candidateId);
      console.log('📋 Full API Response:', response);
      
      // Updated check for folder existence
      const folderExists = response.success && (
        response.folderExists === true ||
        (response.filesFound && response.filesFound.length > 0) ||
        (response.message && response.message.includes('Folder found:'))
      );
      
      console.log('📋 Folder exists check result:', folderExists);
      console.log('📋 Response structure:', JSON.stringify(response, null, 2));
      console.log('📋 Current candidateFolderExists state:', candidateFolderExists);
      console.log('📋 Current isPolling state:', isPolling);
      
      if (folderExists) {
        console.log('✅ Candidate folder found!');
        console.log('✅ Stopping polling immediately.');
        
        // Update refs IMMEDIATELY to prevent race conditions
        candidateFolderExistsRef.current = true;
        hasStoppedPollingRef.current = new Set([...hasStoppedPollingRef.current, candidateId]);
        isPollingRef.current = false;
        
        // Stop polling immediately using ref
        stopPollingImmediate();
        
        // Update state after refs
        setCandidateFolderExists(true);
        setHasStoppedPolling(prev => {
          const newSet = new Set([...prev, candidateId]);
          console.log('📝 Updated hasStoppedPolling set:', newSet);
          return newSet;
        });
        setIsPolling(false);
        
        console.log('✅ Polling completely stopped for candidate:', candidateId);
        console.log('📋 Updated candidateFolderExists state:', true);
        console.log('📋 Updated isPolling state:', false);
      } else {
        console.log('❌ Candidate folder not found yet, continuing polling...');
        console.log('📋 Response data:', response);
        candidateFolderExistsRef.current = false;
        setCandidateFolderExists(false);
        console.log('📋 Updated candidateFolderExists state:', false);
      }
    } catch (error) {
      console.error('❌ Error checking candidate folder:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      candidateFolderExistsRef.current = false;
      setCandidateFolderExists(false);
      console.log('📋 Updated candidateFolderExists state (error case):', false);
    }
  };

  const stopPollingImmediate = () => {
    // Clear interval using ref for immediate effect
    if (pollingIntervalRef.current) {
      console.log('🛑 Stopping polling immediately, clearing interval:', pollingIntervalRef.current);
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    // Also clear state interval as backup
    if (pollingIntervalId) {
      console.log('🛑 Also clearing state interval:', pollingIntervalId);
      clearInterval(pollingIntervalId);
      setPollingIntervalId(null);
    }
    
    // Update refs immediately
    isPollingRef.current = false;
    
    // Update state
    setIsPolling(false);
    console.log('🛑 Polling stopped completely (immediate)');
  };

  const stopPolling = () => {
    stopPollingImmediate();
  };

  // AI Feedback generation function
  const handleGenerateAIFeedback = async () => {
    const candidateEmail = candidateHistory?.email;
    
    console.log('🔍 Attempting to generate AI feedback');
    console.log('📊 Current state - candidateFolderExists:', candidateFolderExists);
    console.log('📊 Current state - isPolling:', isPolling);
    
    if (!candidateEmail) {
      console.error('❌ Candidate email not found');
      setModalType('error');
      setModalMessage('Candidate email not found. Cannot generate feedback.');
      setShowModal(true);
      return;
    }

    if (!candidateFolderExists) {
      console.error('❌ Candidate folder not found');
      setModalType('error');
      setModalMessage('Candidate folder not found. Please wait for the interview files to be uploaded.');
      setShowModal(true);
      return;
    }

    setIsGeneratingFeedback(true);
    console.log('🤖 Generating AI feedback for candidate email:', candidateEmail);

    try {
      const response = await aiFeedbackService.generateFeedbackForCandidate(candidateEmail);
      console.log('🤖 AI Feedback Response:', response);

      if (response.success && response.data) {
        console.log('✅ AI Feedback generated successfully');
        // Cache the feedback for this candidate using email
        setCandidateFeedbackCache(prev => ({
          ...prev,
          [candidateEmail]: response.data
        }));
        
        setAiFeedback(response.data);
        setShowAiFeedback(true);
        
        // Mark that feedback has been generated for this candidate
        setHasGeneratedFeedback(true);
      } else {
        console.error('❌ Failed to generate AI feedback:', response.message);
        throw new Error(response.message || 'Failed to generate AI feedback');
      }
    } catch (error) {
      console.error('❌ Error generating AI feedback:', error);
      setModalType('error');
      setModalMessage(error.message || 'Failed to generate AI feedback. Please try again.');
      setShowModal(true);
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  // Questions Asked function
  const handleGetQuestionsAsked = async () => {
    const candidateEmail = candidateHistory?.email;
    
    if (!candidateEmail) {
      setModalType('error');
      setModalMessage('Candidate email not found. Cannot get questions.');
      setShowModal(true);
      return;
    }

    setIsLoadingQuestions(true);
    console.log('❓ Getting questions asked for candidate email:', candidateEmail);

    try {
      const response = await aiFeedbackService.getQuestionsAsked(candidateEmail);
      console.log('❓ Questions Response:', response);

      if (response.success && response.data) {
        // Cache the questions for this candidate using email
        setQuestionsCache(prev => ({
          ...prev,
          [candidateEmail]: response.data
        }));
        
        setQuestionsData(response.data);
        setShowQuestions(true);
      } else {
        throw new Error(response.message || 'Failed to get questions');
      }
    } catch (error) {
      console.error('❌ Error getting questions:', error);
      setModalType('error');
      setModalMessage(error.message || 'Failed to get questions. Please try again.');
      setShowModal(true);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  // Save Feedback function
  const handleSaveFeedback = async () => {
    const candidateEmail = candidateHistory?.email;
    
    if (!candidateEmail || !aiFeedback) {
      setModalType('error');
      setModalMessage('Candidate email or AI feedback not found. Cannot save feedback.');
      setShowModal(true);
      return;
    }

    setIsLoadingRelevance(true);
    console.log('💾 Saving feedback for candidate email:', candidateEmail);

    try {
      const feedbackData = {
        candidateId: candidateHistory.candidateId,
        roundId: history[history.length - 1].roundNumber,
        status: aiFeedback.feedback.result === 'pass' ? 'Selected' : 'Rejected',
        feedback: String(aiFeedback.feedback.next_steps)
      };

      console.log('💾 Feedback data being sent:', feedbackData);

      const response = await interviewService.saveFeedback(feedbackData);
      console.log('💾 Save Feedback Response:', response);

      // Check if response has success flag or status 200
      if (response.success || (response.status === 200) || (response.data && response.data.status === 200)) {
        console.log('✅ Feedback saved successfully');
        setModalType('success');
        setModalMessage('AI Feedback Saved Successfully');
        
        // Trigger any necessary updates
        if (onUpdateSuccess) {
          onUpdateSuccess();
        }
      } else {
        console.error('❌ Unexpected response structure:', response);
        throw new Error('Failed to save feedback - unexpected response structure');
      }
    } catch (error) {
      console.error('❌ Error saving feedback:', error);
      setModalType('error');
      setModalMessage(error.message || 'Error in saving AI Feedback');
    } finally {
      setIsLoadingRelevance(false);
      setShowModal(true);
    }
  };

  // Function to safely render any value as a string or JSX
  const safeStringify = (value, returnJSX = false) => {
    if (value === null || value === undefined) {
      return 'N/A';
    }
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    if (Array.isArray(value)) {
      if (returnJSX) {
        return (
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {value.map((item, index) => (
              <li key={index} style={{ marginBottom: '4px', lineHeight: '1.6' }}>
                {safeStringify(item)}
              </li>
            ))}
          </ul>
        );
      }
      return value.map(item => safeStringify(item)).join(', ');
    }
    if (typeof value === 'object') {
      // Try to extract meaningful text from objects instead of showing JSON
      if (value.text || value.content || value.description || value.value) {
        return safeStringify(value.text || value.content || value.description || value.value, returnJSX);
      }
      
      // Always format objects as key-value pairs, regardless of size
      const entries = Object.entries(value);
      
      // For complex objects, try to find the most relevant field first
      const relevantKeys = ['summary', 'result', 'assessment', 'feedback', 'comment', 'note', 'notes'];
      for (const key of relevantKeys) {
        if (value[key]) {
          return safeStringify(value[key], returnJSX);
        }
      }
      
      // Format all key-value pairs as bullet points if JSX requested
      if (returnJSX) {
        return (
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {entries.map(([key, val], index) => {
              // Format key names to be more readable
              const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim();
              const formattedKey2 = formattedKey.charAt(0).toUpperCase() + formattedKey.slice(1);
              return (
                <li key={index} style={{ marginBottom: '4px', lineHeight: '1.6' }}>
                  <strong>{formattedKey2}:</strong> {safeStringify(val)}
                </li>
              );
            })}
          </ul>
        );
      }
      
      // Format all key-value pairs nicely for text
      return entries
        .map(([key, val]) => {
          // Format key names to be more readable
          const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim();
          const formattedKey2 = formattedKey.charAt(0).toUpperCase() + formattedKey.slice(1);
          return `${formattedKey2}: ${safeStringify(val)}`;
        })
        .join('; ');
    }
    return String(value);
  };

  // Function to render questions in a segregated format
  const renderQuestionsData = (questionsData) => {
    console.log('🎨 Rendering questions data:', questionsData);
    
    if (!questionsData) {
      return <div>No questions available</div>;
    }

    // Handle different response formats from the API
    let questionsArray = null;
    
    // If questionsData is an object with a nested structure, extract the actual questions
    if (typeof questionsData === 'object' && questionsData !== null) {
      // Check if it has questionsAsked array (new format)
      if (questionsData.questionsAsked && Array.isArray(questionsData.questionsAsked)) {
        questionsArray = questionsData.questionsAsked;
        console.log('📝 Found questionsAsked array:', questionsArray);
      }
      // Check if it's wrapped in response structure
      else if (questionsData.questions) {
        questionsArray = questionsData.questions;
      } else if (questionsData.data) {
        questionsArray = questionsData.data;
      } else if (questionsData.result) {
        questionsArray = questionsData.result;
      }
    }

    // If we found a questions array, render it directly
    if (questionsArray && Array.isArray(questionsArray)) {
      console.log('📝 Rendering questions array with', questionsArray.length, 'questions');
      
      return (
        <div style={{ fontFamily: '"Inter", "Roboto", "Helvetica Neue", "Arial", sans-serif' }}>
          {questionsArray.map((questionObj, index) => {
            const questionText = questionObj.question || '';
            const category = questionObj.category || 'general';
            const difficulty = questionObj.difficulty || 'medium';
            const timestamp = questionObj.timestamp_context || '';

            // Color coding for categories
            const getCategoryColor = (cat) => {
              switch (cat.toLowerCase()) {
                case 'technical': return '#3b82f6';
                case 'behavioral': return '#8b5cf6';
                case 'experience': return '#10b981';
                case 'general': return '#6b7280';
                default: return '#6b7280';
              }
            };

            // Color coding for difficulty
            const getDifficultyColor = (diff) => {
              switch (diff.toLowerCase()) {
                case 'easy': return '#10b981';
                case 'medium': return '#f59e0b';
                case 'hard': return '#ef4444';
                default: return '#f59e0b';
              }
            };

            return (
              <div
                key={index}
                style={{
                  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '16px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  border: `2px solid ${getCategoryColor(category)}20`
                }}
              >
                {/* Question Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ 
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#1f2937'
                    }}>
                      Q{index + 1}
                    </span>
                    <span style={{
                      backgroundColor: getCategoryColor(category),
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'capitalize'
                    }}>
                      {category}
                    </span>
                    <span style={{
                      backgroundColor: getDifficultyColor(difficulty),
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'capitalize'
                    }}>
                      {difficulty}
                    </span>
                  </div>
                </div>
                
                {/* Question Text */}
                <div style={{
                  background: 'rgba(255,255,255,0.8)',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: timestamp ? '12px' : '0'
                }}>
                  <p style={{
                    margin: 0,
                    lineHeight: '1.6',
                    fontSize: '15px',
                    color: '#374151',
                    fontWeight: '500'
                  }}>
                    "{questionText}"
                  </p>
                </div>

                {/* Timestamp Context */}
                {timestamp && (
                  <div style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    borderLeft: '3px solid #3b82f6'
                  }}>
                    <p style={{
                      margin: 0,
                      fontSize: '13px',
                      color: '#1e40af',
                      fontStyle: 'italic'
                    }}>
                      <strong>Context:</strong> {timestamp}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    // Fallback to string parsing for old format
    let questionsText = questionsData;
    
    // If it's still a string, try to parse it as JSON
    if (typeof questionsText === 'string') {
      try {
        questionsText = JSON.parse(questionsText);
        console.log('📝 Parsed JSON questions:', questionsText);
      } catch (e) {
        // If parsing fails, treat as plain text and try to parse manually
        console.log('📝 Treating as plain text, attempting manual parsing');
        
        // Use a more robust regex to parse the questions format
        const questionRegex = /Question:\s*([^;]+);\s*Category:\s*([^;]+);\s*Difficulty:\s*([^;]+);\s*Timestamp context:\s*([^,]*?)(?:,\s*Question:|$)/g;
        
        // If the above doesn't work, try a simpler approach by splitting on ", Question:"
        if (!questionRegex.test(questionsText)) {
          console.log('📝 Regex failed, trying split approach');
          const questionParts = questionsText.split(', Question:');
          
          // Add "Question:" back to the beginning of each part (except the first)
          const formattedParts = questionParts.map((part, index) => {
            if (index === 0) {
              return part; // First part already has "Question:"
            } else {
              return 'Question: ' + part; // Add "Question:" back to other parts
            }
          });
          
          console.log('📝 Split parts:', formattedParts);
          
          const questions = [];
          formattedParts.forEach(part => {
            // Parse each part using a simpler regex
            const match = part.match(/Question:\s*([^;]+);\s*Category:\s*([^;]+);\s*Difficulty:\s*([^;]+);\s*Timestamp context:\s*(.+)/);
            if (match) {
              questions.push({
                text: match[1]?.trim() || '',
                category: match[2]?.trim() || 'general',
                difficulty: match[3]?.trim() || 'medium',
                timestamp: match[4]?.trim() || ''
              });
            }
          });
          
          console.log('📝 Parsed questions from split:', questions);
          
          if (questions.length > 0) {
            return (
              <div style={{ fontFamily: '"Inter", "Roboto", "Helvetica Neue", "Arial", sans-serif' }}>
                {questions.map((question, index) => {
                  const { text: questionText, category, difficulty, timestamp } = question;

                  // Color coding for categories
                  const getCategoryColor = (cat) => {
                    switch (cat.toLowerCase()) {
                      case 'technical': return '#3b82f6';
                      case 'behavioral': return '#8b5cf6';
                      case 'experience': return '#10b981';
                      case 'general': return '#6b7280';
                      default: return '#6b7280';
                    }
                  };

                  // Color coding for difficulty
                  const getDifficultyColor = (diff) => {
                    switch (diff.toLowerCase()) {
                      case 'easy': return '#10b981';
                      case 'medium': return '#f59e0b';
                      case 'hard': return '#ef4444';
                      default: return '#f59e0b';
                    }
                  };

                  return (
                    <div
                      key={index}
                      style={{
                        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                        borderRadius: '12px',
                        padding: '20px',
                        marginBottom: '16px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                        border: `2px solid ${getCategoryColor(category)}20`
                      }}
                    >
                      {/* Question Header */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '12px',
                        flexWrap: 'wrap',
                        gap: '8px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ 
                            fontSize: '18px',
                            fontWeight: '700',
                            color: '#1f2937'
                          }}>
                            Q{index + 1}
                          </span>
                          <span style={{
                            backgroundColor: getCategoryColor(category),
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600',
                            textTransform: 'capitalize'
                          }}>
                            {category}
                          </span>
                          <span style={{
                            backgroundColor: getDifficultyColor(difficulty),
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600',
                            textTransform: 'capitalize'
                          }}>
                            {difficulty}
                          </span>
                        </div>
                      </div>
                      
                      {/* Question Text */}
                      <div style={{
                        background: 'rgba(255,255,255,0.8)',
                        borderRadius: '8px',
                        padding: '16px',
                        marginBottom: timestamp ? '12px' : '0'
                      }}>
                        <p style={{
                          margin: 0,
                          lineHeight: '1.6',
                          fontSize: '15px',
                          color: '#374151',
                          fontWeight: '500'
                        }}>
                          "{questionText}"
                        </p>
                      </div>

                      {/* Timestamp Context */}
                      {timestamp && (
                        <div style={{
                          background: 'rgba(59, 130, 246, 0.1)',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          borderLeft: '3px solid #3b82f6'
                        }}>
                          <p style={{
                            margin: 0,
                            fontSize: '13px',
                            color: '#1e40af',
                            fontStyle: 'italic'
                          }}>
                            <strong>Context:</strong> {timestamp}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          }
        }
        
        // Reset regex for the original approach
        questionRegex.lastIndex = 0;
        const questions = [];
        let match;
        
        while ((match = questionRegex.exec(questionsText)) !== null) {
          questions.push({
            text: match[1]?.trim() || '',
            category: match[2]?.trim() || 'general',
            difficulty: match[3]?.trim() || 'medium',
            timestamp: match[4]?.trim() || ''
          });
        }
        
        console.log('📝 Parsed questions:', questions);
        
        if (questions.length > 0) {
          return (
            <div style={{ fontFamily: '"Inter", "Roboto", "Helvetica Neue", "Arial", sans-serif' }}>
              {questions.map((question, index) => {
                const { text: questionText, category, difficulty, timestamp } = question;

                // Color coding for categories
                const getCategoryColor = (cat) => {
                  switch (cat.toLowerCase()) {
                    case 'technical': return '#3b82f6';
                    case 'behavioral': return '#8b5cf6';
                    case 'experience': return '#10b981';
                    case 'general': return '#6b7280';
                    default: return '#6b7280';
                  }
                };

                // Color coding for difficulty
                const getDifficultyColor = (diff) => {
                  switch (diff.toLowerCase()) {
                    case 'easy': return '#10b981';
                    case 'medium': return '#f59e0b';
                    case 'hard': return '#ef4444';
                    default: return '#f59e0b';
                  }
                };

                return (
                  <div
                    key={index}
                    style={{
                      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                      borderRadius: '12px',
                      padding: '20px',
                      marginBottom: '16px',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                      border: `2px solid ${getCategoryColor(category)}20`
                    }}
                  >
                    {/* Question Header */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '12px',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ 
                          fontSize: '18px',
                          fontWeight: '700',
                          color: '#1f2937'
                        }}>
                          Q{index + 1}
                        </span>
                        <span style={{
                          backgroundColor: getCategoryColor(category),
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          textTransform: 'capitalize'
                        }}>
                          {category}
                        </span>
                        <span style={{
                          backgroundColor: getDifficultyColor(difficulty),
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          textTransform: 'capitalize'
                        }}>
                          {difficulty}
                        </span>
                      </div>
                    </div>
                    
                    {/* Question Text */}
                    <div style={{
                      background: 'rgba(255,255,255,0.8)',
                      borderRadius: '8px',
                      padding: '16px',
                      marginBottom: timestamp ? '12px' : '0'
                    }}>
                      <p style={{
                        margin: 0,
                        lineHeight: '1.6',
                        fontSize: '15px',
                        color: '#374151',
                        fontWeight: '500'
                      }}>
                        "{questionText}"
                      </p>
                    </div>

                    {/* Timestamp Context */}
                    {timestamp && (
                      <div style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        borderLeft: '3px solid #3b82f6'
                      }}>
                        <p style={{
                          margin: 0,
                          fontSize: '13px',
                          color: '#1e40af',
                          fontStyle: 'italic'
                        }}>
                          <strong>Context:</strong> {timestamp}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        }
      }
    }

    // If it's an array or object, use the original renderAIFeedback function
    return renderAIFeedback(questionsData);
  };

  // Function to render AI feedback in a beautiful format
  const renderAIFeedback = (feedback) => {
    console.log('🎨 Rendering feedback:', feedback);
    
    if (!feedback) {
      return <div>No feedback available</div>;
    }

    // Handle different response formats from the API
    let parsedFeedback = feedback;
    
    // If feedback is an object with a nested structure, extract the actual feedback
    if (typeof feedback === 'object' && feedback !== null) {
      // Check if it's wrapped in response structure
      if (feedback.feedback) {
        parsedFeedback = feedback.feedback;
      } else if (feedback.data) {
        parsedFeedback = feedback.data;
      } else if (feedback.result) {
        parsedFeedback = feedback.result;
      }
    }
    
    // If it's still a string, try to parse it as JSON
    if (typeof parsedFeedback === 'string') {
      try {
        parsedFeedback = JSON.parse(parsedFeedback);
        console.log('📝 Parsed JSON feedback:', parsedFeedback);
      } catch (e) {
        // If parsing fails, render as plain text with beautiful formatting
        console.log('📝 Treating as plain text');
        return (
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '16px',
            padding: '24px',
            color: 'white',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            fontFamily: '"Inter", "Roboto", "Helvetica Neue", "Arial", sans-serif'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '16px',
                fontSize: '20px'
              }}>
                🤖
              </div>
              <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
                AI Generated Feedback
              </h3>
            </div>
            <div style={{
              whiteSpace: 'pre-wrap',
              lineHeight: '1.8',
              fontSize: '16px',
              background: 'rgba(255,255,255,0.1)',
              padding: '20px',
              borderRadius: '12px'
            }}>
              {safeStringify(parsedFeedback)}
            </div>
          </div>
        );
      }
    }

    // If it's an object, render structured sections
    if (typeof parsedFeedback === 'object' && parsedFeedback !== null) {
      const feedbackSections = [
        { key: 'overall_score', title: 'Overall Score', icon: '🎯', color: '#6c757d' },
        { key: 'score', title: 'Overall Score', icon: '🎯', color: '#6c757d' },
        { key: 'rating', title: 'Overall Rating', icon: '🎯', color: '#6c757d' },
        { key: 'overallAssessment', title: 'Overall Assessment', icon: '📋', color: '#6c757d' },
        { key: 'technicalSkills', title: 'Technical Skills', icon: '💻', color: '#6c757d' },
        { key: 'technical_assessment', title: 'Technical Assessment', icon: '⚙️', color: '#6c757d' },
        { key: 'coding_assessment', title: 'Coding Assessment', icon: '💻', color: '#6c757d' },
        { key: 'communicationSkills', title: 'Communication Skills', icon: '💬', color: '#6c757d' },
        { key: 'communication_skills', title: 'Communication Skills', icon: '💬', color: '#6c757d' },
        { key: 'problemSolving', title: 'Problem Solving', icon: '🧩', color: '#6c757d' },
        { key: 'problem_solving_approach', title: 'Problem Solving Approach', icon: '🔍', color: '#6c757d' },
        { key: 'cultural_fit', title: 'Cultural Fit', icon: '🤝', color: '#6c757d' },
        { key: 'experience_level', title: 'Experience Level', icon: '📈', color: '#6c757d' },
        { key: 'strengths', title: 'Key Strengths', icon: '✅', color: '#6c757d' },
        { key: 'areasForImprovement', title: 'Areas for Improvement', icon: '🔄', color: '#6c757d' },
        { key: 'recommendation', title: 'Final Recommendation', icon: '🎯', color: '#6c757d' },
        { key: 'final_recommendation', title: 'Final Recommendation', icon: '🎯', color: '#6c757d' },
        { key: 'notes', title: 'Additional Notes', icon: '📝', color: '#6c757d' }
      ];

      return (
        <div style={{ fontFamily: '"Inter", "Roboto", "Helvetica Neue", "Arial", sans-serif' }}>
          {feedbackSections.map(section => {
            const value = parsedFeedback[section.key];
            if (!value) return null;

            return (
              <div
                key={section.key}
                style={{
                  background: `linear-gradient(135deg, ${section.color} 0%, ${section.color}88 100%)`,
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '16px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  color: '#2d3748'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <span style={{ fontSize: '20px', marginRight: '12px' }}>
                    {section.icon}
                  </span>
                  <h4 style={{
                    margin: 0,
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#2d3748'
                  }}>
                    {section.title}
                  </h4>
                </div>
                
                <div style={{
                  background: 'rgba(255,255,255,0.8)',
                  borderRadius: '8px',
                  padding: '16px'
                }}>
                  {Array.isArray(value) ? (
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      {value.map((item, index) => (
                        <li key={index} style={{
                          marginBottom: '8px',
                          lineHeight: '1.6'
                        }}>
                          {safeStringify(item)}
                        </li>
                      ))}
                    </ul>
                  ) : typeof value === 'object' ? (
                    safeStringify(value, true)
                  ) : (
                    <p style={{
                      margin: 0,
                      lineHeight: '1.6',
                      fontSize: '15px'
                    }}>
                      {safeStringify(value)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {/* Fallback for any other fields */}
          {Object.entries(parsedFeedback).map(([key, value]) => {
            const renderedFields = [
              'overallAssessment', 'technicalSkills', 'technical_assessment', 'communicationSkills', 
              'communication_skills', 'problemSolving', 'problem_solving_approach', 'strengths', 
              'areasForImprovement', 'recommendation', 'final_recommendation', 'score', 'rating', 
              'notes', 'coding_assessment', 'cultural_fit', 'experience_level', 'overall_score'
            ];
            if (renderedFields.includes(key)) return null;

            return (
              <div
                key={key}
                style={{
                  background: 'linear-gradient(135deg, #6c757d 0%, #6c757d88 100%)',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '16px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  color: '#2d3748'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <span style={{ fontSize: '20px', marginRight: '12px' }}>📄</span>
                  <h4 style={{
                    margin: 0,
                    fontSize: '18px',
                    fontWeight: '600',
                    textTransform: 'capitalize'
                  }}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}
                  </h4>
                </div>
                
                <div style={{
                  background: 'rgba(255,255,255,0.8)',
                  borderRadius: '8px',
                  padding: '16px'
                }}>
                  <p style={{ margin: 0, lineHeight: '1.6', fontSize: '15px' }}>
                    {safeStringify(value)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    // Final fallback
    return (
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        padding: '20px',
        color: 'white'
      }}>
        <h4>AI Feedback</h4>
        <p>{safeStringify(feedback)}</p>
      </div>
    );
  };

  if (!isOpen || !candidateHistory) return null;

  const { history = [], candidateName, jobTitle, jobDepartment, email, resumeId } = candidateHistory;

  console.log('Candidate Info:', { candidateName, jobTitle, jobDepartment, email, resumeId });

  // Get the latest round status
  const latestRound = history[history.length - 1] || {};
  const latestStatus = latestRound.status || 'Unknown';

  const handleDateTimeSelect = (dateTime) => {
    setSelectedDateTime(dateTime);
  };

  const handleCalendarOpen = () => {
    setIsCalendarOpen(true);
  };

  const handleCalendarClose = () => {
    setIsCalendarOpen(false);
  };

  const handleOkClick = () => {
    setIsCalendarOpen(false);
  };

  const handleFindSlots = async () => {
    if (!selectedRound || selectedInterviewers.length === 0 || !selectedDateTime) {
      setModalType('error');
      setModalMessage('Please select an interview round, at least one interviewer, and a date/time');
      setShowModal(true);
      return;
    }
    setIsFindingSlotsLoading(true);
    setAvailableSlots([]); // Clear existing slots
    setShowSlots(false); // Hide slots section
    setSelectedSlot(null); // Clear selected slot

    console.log('Candidate Email:', email);
    console.log('Full candidateHistory:', candidateHistory);

    const requestBody = {
      emails: selectedInterviewers,
      dateTime: selectedDateTime.toISOString(),
      duration: parseInt(duration),
      title: "Interview",
      description: "Candidate Interview",
      attendees: [email]
    };

    try {
      const response = await interviewService.getFreeSlots(requestBody);
      if (Array.isArray(response.data.slots)) {
        const formattedSlots = response.data.slots.map(slot => {
          const start = new Date(slot);
          const end = new Date(start.getTime() + parseInt(duration) * 60000);
          return `${start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })} - ${end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })}`;
        });

        if (formattedSlots.length === 0) {
          setModalType('error');
          setModalMessage('No available slots found for the selected time range');
          setShowModal(true);
        } else {
          setAvailableSlots(formattedSlots);
          setShowSlots(true);
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching free slots:', error);
      setModalType('error');
      setModalMessage(error.message || 'Failed to fetch available slots. Please try again.');
      setShowModal(true);
    } finally {
      setIsFindingSlotsLoading(false);
    }
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleSchedule = async () => {
    if (!selectedRound || selectedInterviewers.length === 0 || !selectedDateTime || !selectedSlot) {
      setModalType('error');
      setModalMessage('Please select a round, at least one interviewer, date/time, and a time slot');
      setShowModal(true);
      return;
    }
    setIsLoading(true);

    // Parse the selected slot to get start time
    const [startTime] = selectedSlot.split(' - ');
    const [time, period] = startTime.split(' ');
    let [hours, minutes] = time.split(':');

    // Convert to 24-hour format if PM
    hours = parseInt(hours);
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    // Create date in local timezone
    const selectedDate = new Date(selectedDateTime);
    selectedDate.setHours(hours, parseInt(minutes), 0, 0);

    // Add offset to convert to UTC
    const offset = -330; // IST offset in minutes (-5:30)
    const utcDate = new Date(selectedDate.getTime() - (offset * 60000));

    console.log('Selected Date (IST):', selectedDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    console.log('UTC Date:', utcDate.toISOString());

    const requestBody = {
      dateTime: selectedDate.toISOString(),
      duration: parseInt(duration),
      title: "Interview",
      description: "Candidate Interview",
      attendees: [email, ...selectedInterviewers],
      timeZone: "Asia/Kolkata"
    };

    try {
      const response = await interviewService.scheduleMeeting(requestBody);
      console.log('Schedule Meeting Response:', response);
      if (!response.data?.meetingEvent) {
        setModalType('error');
        setModalMessage('Failed to schedule interview. No meeting data received.');
        setShowModal(true);
        return;
      }
      if (response.data?.meetingEvent) {
        const meetingLink = response.data.meetingEvent.hangoutLink;
        const startMeetingTimeStamp = new Date(response.data.meetingEvent.start.dateTime).toISOString().slice(0, 19);
        const endMeetingTimeStamp = new Date(response.data.meetingEvent.end.dateTime).toISOString().slice(0, 19);

        // Update interview status
        const updateStatusBody = {
          candidateId: candidateHistory.candidateId,
          roundId: parseInt(selectedRound), // Ensure roundId is sent as a number
          interviewers: selectedInterviewers.map(email => ({
            interviewerId: interviewers.find(i => i.email === email)?.interviewerId,
            interviewerEmail: email
          })),
          status: "In progress",
          meetingLink: meetingLink,
          startMeetingTimeStamp: startMeetingTimeStamp,
          endMeetingTimeStamp: endMeetingTimeStamp,
          feedback: ""
        };

        try {
          await interviewService.updateInterviewStatus(updateStatusBody);
          
          // Show success modal and refresh immediately after scheduling
          setModalType('success');
          setModalMessage('Interview scheduled successfully!');
          setShowModal(true);
          onUpdateSuccess();
          
          // Send questionnaire silently if checkbox is checked
          if (sendQuestionnaire) {
            // Run questionnaire process in background
            (async () => {
              try {
                console.log('🔄 Silently generating questions for job description:', candidateHistory?.jobDescription);
                
                const questionsResponse = await candidateService.generateQuestions(
                  candidateHistory?.jobDescription?.summary + ',' + candidateHistory?.jobDescription?.technicalSkills || ""
                );
                console.log('✅ Questions generated silently:', questionsResponse);

                if (questionsResponse.success) {
                  const notificationData = {
                    eventType: "InterviewQuestions",
                    data: {
                      candidateName: candidateHistory.candidateName,
                      managerEmails: selectedInterviewers,
                      position: jobTitle,
                      interviewDate: startMeetingTimeStamp,
                      questions: questionsResponse.data || []
                    }
                  };
                  console.log('📤 Silently sending notification with data:', notificationData);
                  
                  await notificationService.process(notificationData);
                  console.log('✅ Notification sent silently');
                }
              } catch (error) {
                console.error("❌ Silent questionnaire process error:", error);
              }
            })();
          }
          
          // Update the history array in the component
          if (history && history.length > 0) {
            history[history.length - 1].meetingLink = meetingLink;
          }
          // Update the latest meeting link state
          setLatestMeetingLink(meetingLink);
          resetScheduleFields();
          // Show success modal only for interview scheduling
          setModalType('success');
          setModalMessage('Interview scheduled successfully!');
          setShowModal(true);
          // Just update the parent component's state without closing the modal
          if (onClose) {
            onClose(true, meetingLink, false); // Pass false to indicate not to close the modal
          }
        } catch (updateError) {
          console.error('Error updating interview status:', updateError);
          setModalType('error');
          setModalMessage('Interview scheduled, but failed to update status. Please contact support.');
          setShowModal(true);
        }
      } else {
        // Show error modal
        setModalType('error');
        setModalMessage('Failed to schedule interview. Please try again.');
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error scheduling interview:', error);
      // Show error modal
      setModalType('error');
      setModalMessage(error.message || 'Failed to schedule interview. Please try again.');
      setShowModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  return isOpen && candidateHistory ? (
    <div>
      {(isLoading || loadingInterviewers) && <Loader />}
      <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h1>Interview Management Portal</h1>
          <button onClick={() => handleClose()} className="close-button">×</button>
        </div>
        <div className="modal-body-item">
          <div className="modal-left" style={{ flex: '0 0 60%', paddingRight: '30px', borderRight: '1px solid #e2e8f0' }}>
            <h2>Interview Details</h2>
            {history.length > 0 && (history[history.length - 1].status.toUpperCase() !== 'COMPLETED' || history[history.length - 1].feedback) ? (
              <>
              <div className="schedule-form">
              <label>
                Select Interview Round:
                <select
                  value={selectedRound}
                  onChange={(e) => {
                    const roundId = e.target.value;
                    setSelectedRound(roundId);
                    
                    // Clear previous interviewers and selected interviewers
                    setInterviewers([]);
                    setSelectedInterviewers([]);
                    
                    // Only call API if a round is selected
                    if (roundId) {
                      // Find the selected round to check if it's a manager round
                      const selectedRoundData = interviewRounds.find(round => round.roundId.toString() === roundId);
                      
                      // Check if the selected round is "Managerial Round"
                      if (selectedRoundData && selectedRoundData.roundName === "Managerial Round") {
                        // Call manager API instead of regular interviewer API
                        fetchManagerInterviewers();
                      } else if (selectedRoundData && selectedRoundData.roundName === "Onboarding") {
                        // Call HR API for onboarding round
                        fetchHRInterviewers();
                      } else if (candidateHistory?.jobDescription) {
                        // Call regular interviewer API for other rounds
                        fetchInterviewers(candidateHistory.jobDescription);
                      }
                    }
                  }}
                >
                  <option value="">Select interview round</option>
                  {interviewRounds
                    .filter(round => {
                      const currentRoundId = history[history.length - 1]?.roundNumber;
                      return currentRoundId && round.roundId > currentRoundId;
                    })
                    .map((round) => (
                      <option key={round.roundId} value={round.roundId}>
                        {round.roundName}
                      </option>
                    ))
                  }
                </select>
              </label>
              <label>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <FontAwesomeIcon icon={faRobot} style={{ marginRight: '8px', color: '#66CC00' }} />
                  Select Interviewers:
                </div>
                <div className="custom-multiselect" ref={multiselectRef}>
                  <div
                    className="multiselect-selected"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    {selectedInterviewers.length === 0
                      ? "Select interviewers"
                      : `${selectedInterviewers.length} interviewer(s) selected`}
                  </div>
                  {isDropdownOpen && (
                    <div className="multiselect-options">
                      {interviewers.map((interviewer, index) => (
                        <div key={index} className="multiselect-option" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <input
                              type="checkbox"
                              value={interviewer.email}
                              checked={selectedInterviewers.includes(interviewer.email)}
                              onChange={(e) => {
                                const email = e.target.value;
                                setSelectedInterviewers((prev) =>
                                  e.target.checked
                                    ? [...prev, email]
                                    : prev.filter((i) => i !== email)
                                );
                              }}
                            />
                            <span>{interviewer.email}</span>
                          </div>
                          <OverlayTrigger
                            placement="right"
                            overlay={
                              <Tooltip id={`tooltip-${index}`}>
                                <div style={{ textAlign: 'left' }}>
                                  <div><strong>Name:</strong> {interviewer.name || 'N/A'}</div>
                                  <div><strong>Email:</strong> {interviewer.email}</div>
                                  <div><strong>Experience:</strong> {interviewer.experienceYears+" years" || 'N/A'}</div>
                                  <div><strong>Skills:</strong> {interviewer.technicalExpertise?.join(', ') || 'N/A'}</div>
                                  <div><strong>Match Score:</strong> {interviewer.matchScore || 'N/A'}</div>
                                  <div><strong>Specializations:</strong> {interviewer.specializations?.join(', ') || 'N/A'}</div>
                                </div>
                              </Tooltip>
                            }
                          >
                            <span style={{ cursor: 'help' }}>ℹ️</span>
                          </OverlayTrigger>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </label>
              {loadingInterviewers && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  margin: '8px 0',
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    color: '#6c757d',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid #e9ecef',
                      borderTop: '2px solid #007bff',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Loading interviewers...
                  </div>
                </div>
              )}
              <div className="datetime-duration-container">
                <div className="datetime-field">
                  <label>Select Date and Time:</label>
                  <DatePicker
                    selected={selectedDateTime}
                    onChange={handleDateTimeSelect}
                    showTimeSelect
                    timeIntervals={15}
                    dateFormat="MMMM d, yyyy h:mm aa"
                    minDate={new Date()}
                    timeZone="Asia/Kolkata"
                    open={isCalendarOpen}
                    onCalendarOpen={handleCalendarOpen}
                    onCalendarClose={handleCalendarClose}
                    timeCaption="Time"
                    timeFormat="HH:mm"
                    placeholderText="Select date and time"
                    renderCustomHeader={({
                      date,
                      decreaseMonth,
                      increaseMonth,
                      prevMonthButtonDisabled,
                      nextMonthButtonDisabled
                    }) => (
                      <div className="custom-header">
                        <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>◀</button>
                        <span className="month-year">
                          {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </span>
                        <button onClick={increaseMonth} disabled={nextMonthButtonDisabled}>▶</button>
                      </div>
                    )}
                    renderCustomTimeSection={({ date }) => (
                      <div className="time-section">
                        <div className="time-arrow time-arrow-up" onClick={() => scrollTimeList('up')}>▲</div>
                        <div className="time-list">
                          <ul className="react-datepicker__time-list">
                            {generateTimeSlots().map((time, index) => (
                              <li
                                key={index}
                                className={`react-datepicker__time-list-item ${
                                  selectedDateTime &&
                                  time.getHours() === selectedDateTime.getHours() &&
                                  time.getMinutes() === selectedDateTime.getMinutes()
                                    ? 'react-datepicker__time-list-item--selected'
                                    : ''
                                }`}
                                onClick={() => {
                                  const newDate = new Date(selectedDateTime || date);
                                  newDate.setHours(time.getHours());
                                  newDate.setMinutes(time.getMinutes());
                                  handleDateTimeSelect(newDate);
                                }}
                              >
                                {time.toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true
                                })}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="time-arrow time-arrow-down" onClick={() => scrollTimeList('down')}>▼</div>
                      </div>
                    )}
                    renderCustomFooter={() => (
                      <div className="custom-footer">
                        <button onClick={handleOkClick} className="ok-button">
                          OK
                        </button>
                      </div>
                    )}
                  />
                </div>
                <div className="duration-field">
                  <label>Duration:</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="duration-select"
                  >
                    <option value="30">30 mins</option>
                    <option value="60">60 mins</option>
                  </select>
                </div>
<button 
  className="find-slots-button" 
  onClick={handleFindSlots}
  disabled={!selectedRound || selectedInterviewers.length === 0 || !selectedDateTime || isFindingSlotsLoading}
  style={{
    opacity: (!selectedRound || selectedInterviewers.length === 0 || !selectedDateTime || isFindingSlotsLoading) ? 0.6 : 1,
    cursor: (!selectedRound || selectedInterviewers.length === 0 || !selectedDateTime || isFindingSlotsLoading) ? 'not-allowed' : 'pointer'
  }}
>
                  {isFindingSlotsLoading ? (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      gap: '8px'
                    }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      Finding Slots...
                    </div>
                  ) : (
                    'Find Slots'
                  )}
                </button>
              </div>
              {showSlots && (
                <div className="available-slots">
                  {availableSlots.map((slot, index) => (
                    <button
                      key={index}
                      className={`slot-button ${selectedSlot === slot ? 'selected' : ''}`}
                      onClick={() => handleSlotSelect(slot)}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
              <div style={{ width: '100%', display: 'flex', alignItems: 'center', marginBottom: '5px' ,marginTop: '10px'  }}>
                <input
                  type="checkbox"
                  checked={sendQuestionnaire}
                  onChange={(e) => setSendQuestionnaire(e.target.checked)}
                  style={{ 
                    width: '16px', 
                    height: '16px', 
                    cursor: 'pointer', 
                    marginRight: '8px',
                    accentColor: '#059669'
                  }}
                />
                <span style={{ cursor: 'pointer' }} onClick={() => setSendQuestionnaire(!sendQuestionnaire)}>
                  Send questionnaire to Interviewer
                </span>
              </div>
  <button 
    onClick={handleSchedule} 
    className="schedule-button"
    disabled={!selectedRound || selectedInterviewers.length === 0 || !selectedDateTime || !selectedSlot || !duration || isLoading}
    style={{ 
      marginTop: '10px',
      opacity: (!selectedRound || selectedInterviewers.length === 0 || !selectedDateTime || !selectedSlot || !duration || isLoading) ? 0.6 : 1,
      cursor: (!selectedRound || selectedInterviewers.length === 0 || !selectedDateTime || !selectedSlot || !duration || isLoading) ? 'not-allowed' : 'pointer'
    }}
  >
                    <FontAwesomeIcon icon={faRobot} style={{ marginRight: '8px' }} />
                    Schedule Interview
                  </button>
                </div>
              </>
            ) : (
              latestStatus.toUpperCase() === 'COMPLETED' ? (
                <div className="candidate-info-modal" style={{ marginTop: '20px' }}>
                  <h3>Schedule Next Interview</h3>
                  <p style={{ color: '#666', fontSize: '14px', marginTop: '10px' }}>Feedback for the last interview round is required before scheduling the next interview.</p>
                  
                  {/* Polling Status and Generate AI Feedback Button */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', width: '100%', marginBottom: '10px' }}>
                    {/* Polling Status Indicator */}
                    {isPolling && (
                      <div style={{ 
                        marginBottom: '8px', 
                        padding: '6px 12px', 
                        backgroundColor: '#fff3cd', 
                        border: '1px solid #ffeaa7', 
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: '#856404',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span style={{ animation: 'spin 1s linear infinite' }}>🔄</span>
                        Checking for interview files...
                      </div>
                    )}
                    
                    {candidateFolderExists && (
                      <div style={{ 
                        marginBottom: '8px', 
                        padding: '6px 12px', 
                        backgroundColor: '#d4edda', 
                        border: '1px solid #c3e6cb', 
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: '#155724',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        ✅ Interview files found - Ready to generate feedback
                      </div>
                    )}

                    <button 
                      onClick={handleGenerateAIFeedback}
                      disabled={isGeneratingFeedback || !candidateFolderExists}
                      className="btn btn-success"
                      style={{ 
                        marginTop: '10px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        backgroundColor: candidateFolderExists ? '#059669' : '#6c757d', 
                        borderColor: candidateFolderExists ? '#059669' : '#6c757d',
                        marginLeft: 'auto',
                        opacity: (isGeneratingFeedback || !candidateFolderExists) ? 0.7 : 1,
                        cursor: (isGeneratingFeedback || !candidateFolderExists) ? 'not-allowed' : 'pointer'
                      }}
                      title={!candidateFolderExists ? 'Waiting for interview files to be uploaded...' : ''}
                    >
                      <FontAwesomeIcon icon={faRobot} />
                      {isGeneratingFeedback ? 'Generating...' : 
                       !candidateFolderExists ? 'Waiting for Files...' : 
                       'Generate AI Feedback'}
                    </button>
                  </div>
                  
                  {/* AI Feedback Results - Collapsible Dropdown */}
                  {aiFeedback && (
                    <div style={{ width: '100%', marginTop: '15px', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', width: '100%' }}>
                      <div 
                        style={{ 
                          backgroundColor: '#f8f9fa', 
                          padding: '12px', 
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderBottom: showAiFeedback ? '1px solid #ddd' : 'none'
                        }}
                        onClick={() => setShowAiFeedback(!showAiFeedback)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FontAwesomeIcon icon={faRobot} style={{ color: '#059669' }} />
                          <strong>AI Generated Feedback</strong>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {aiFeedback?.feedback?.result && (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 12px',
                              borderRadius: '16px',
                              backgroundColor: aiFeedback.feedback.result === 'pass' ? '#10b981' : '#ef4444',
                              color: 'white',
                              fontSize: '14px',
                              fontWeight: '600'
                            }}>
                              <FontAwesomeIcon 
                                icon={aiFeedback.feedback.result === 'pass' ? faCheckCircle : faTimesCircle} 
                                style={{ marginRight: '4px' }}
                              />
                              {aiFeedback.feedback.result === 'pass' ? 'Selected' : 'Rejected'}
                            </div>
                          )}
                          <span style={{ fontSize: '14px' }}>
                            {showAiFeedback ? '▼' : '▶'}
                          </span>
                        </div>
                      </div>
                      
                      {showAiFeedback && (
                        <div style={{ padding: '20px', backgroundColor: '#fff', maxHeight: '400px', overflowY: 'auto' }}>
                          {renderAIFeedback(aiFeedback)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Questions Asked and JD Relevance Buttons - Only show if feedback has been generated */}
                  {hasGeneratedFeedback && (
                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={handleGetQuestionsAsked}
                        disabled={isLoadingQuestions}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '10px',
                          padding: '12px 20px',
                          background: isLoadingQuestions 
                            ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)' 
                            : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          fontFamily: '"Inter", "Roboto", "Helvetica Neue", "Arial", sans-serif',
                          cursor: isLoadingQuestions ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: isLoadingQuestions 
                            ? 'none' 
                            : '0 2px 4px rgba(59, 130, 246, 0.2)',
                          transform: isLoadingQuestions ? 'none' : 'translateY(0)',
                          opacity: isLoadingQuestions ? 0.7 : 1
                        }}
                        onMouseEnter={(e) => {
                          if (!isLoadingQuestions) {
                            e.target.style.transform = 'translateY(-1px)';
                            e.target.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.3)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isLoadingQuestions) {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.2)';
                          }
                        }}
                      >
                        <span style={{ fontSize: '16px' }}>❓</span>
                        {isLoadingQuestions ? 'Analyzing Questions...' : 'Questions Asked'}
                      </button>

                      <button 
                        onClick={handleSaveFeedback}
                        disabled={isLoadingRelevance || !aiFeedback}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '10px',
                          padding: '12px 20px',
                          background: isLoadingRelevance 
                            ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)' 
                            : 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          fontFamily: '"Inter", "Roboto", "Helvetica Neue", "Arial", sans-serif',
                          cursor: (isLoadingRelevance || !aiFeedback) ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: isLoadingRelevance 
                            ? 'none' 
                            : '0 2px 4px rgba(8, 145, 178, 0.2)',
                          transform: isLoadingRelevance ? 'none' : 'translateY(0)',
                          opacity: (isLoadingRelevance || !aiFeedback) ? 0.7 : 1
                        }}
                        onMouseEnter={(e) => {
                          if (!isLoadingRelevance && aiFeedback) {
                            e.target.style.transform = 'translateY(-1px)';
                            e.target.style.boxShadow = '0 4px 8px rgba(8, 145, 178, 0.3)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isLoadingRelevance && aiFeedback) {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 2px 4px rgba(8, 145, 178, 0.2)';
                          }
                        }}
                      >
                        <span style={{ fontSize: '16px' }}>💾</span>
                        {isLoadingRelevance ? 'Saving Feedback...' : 'Save Feedback'}
                      </button>
                    </div>
                  )}

                  {/* Questions Asked Results - Collapsible Dropdown */}
                  {questionsData && (
                    <div style={{ marginTop: '15px', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          backgroundColor: '#e3f2fd', 
                          padding: '12px', 
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderBottom: showQuestions ? '1px solid #ddd' : 'none'
                        }}
                        onClick={() => setShowQuestions(!showQuestions)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>❓</span>
                          <strong>Questions Asked by Interviewer</strong>
                        </div>
                        <span style={{ fontSize: '14px' }}>
                          {showQuestions ? '▼' : '▶'}
                        </span>
                      </div>
                      
                      {showQuestions && (
                        <div style={{ padding: '20px', backgroundColor: '#fff', maxHeight: '400px', overflowY: 'auto' }}>
                          {renderQuestionsData(questionsData)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* JD Relevance Results - Collapsible Dropdown */}
                  {relevanceData && (
                    <div style={{ marginTop: '15px', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          backgroundColor: '#e0f7fa', 
                          padding: '12px', 
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderBottom: showRelevance ? '1px solid #ddd' : 'none'
                        }}
                        onClick={() => setShowRelevance(!showRelevance)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>📊</span>
                          <strong>JD Relevance Analysis</strong>
                        </div>
                        <span style={{ fontSize: '14px' }}>
                          {showRelevance ? '▼' : '▶'}
                        </span>
                      </div>
                      
                      {showRelevance && (
                        <div style={{ padding: '20px', backgroundColor: '#fff', maxHeight: '400px', overflowY: 'auto' }}>
                          {renderAIFeedback(relevanceData)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : null
            )}
          </div>
          <div className="modal-right" style={{ flex: '0 0 40%', paddingLeft: '30px' }}>
            <h2>Interview Process</h2>
            <div className="candidate-info-modal">
              <h3>{candidateName || 'Candidate Name Not Available'}</h3>
              <p>{jobTitle ? `${jobTitle}${jobDepartment ? ` - ${jobDepartment}` : ''}` : 'Job Details Not Available'}</p>
              {latestMeetingLink && (
                <p className="timeline-description">
                  <strong>Meeting Link: </strong>
                  <a href={latestMeetingLink} target="_blank" rel="noopener noreferrer">
                    {latestMeetingLink}
                  </a>
                </p>
              )}
            </div>
            <div className="interview-timeline">
              <div className="timeline-line"></div>
              {history.map((interview, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-status">
                    <div className={`status-icon ${interview.status.toLowerCase()}`}>
                      <i className="fas fa-check"></i>
                    </div>
                  </div>
              <div className={`timeline-content ${
  interview.status.toLowerCase() === 'pending' ? 'pending' : ''
} ${
  index > 0 && 
  history[index - 1]?.status.toLowerCase() === 'selected' ? 
  'next-after-selected' : ''
}`}>
  <h3>{interview.roundName}</h3>
  <div className="feedback-container">
    {interview.feedback ? (
      <p className="timeline-description">
        <strong>Feedback: </strong>
        {interview.feedback}
      </p>
    ) : (
      <p className="timeline-description feedback-placeholder">
        Feedback not generated yet
      </p>
    )}
  </div>
</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
        <Modal 
          show={showModal} 
          onHide={() => setShowModal(false)} 
          centered
          backdrop="static"
          keyboard={false}
          className="success-modal"
        >
          <Modal.Body className="text-center p-5">
            <div className="success-icon-wrapper mb-4">
              <FontAwesomeIcon 
                icon={modalType === 'success' ? faCheckCircle : faTimesCircle} 
                className={`success-icon ${modalType === 'error' ? 'text-danger' : ''}`}
              />
            </div>
            <h4 className="success-title mb-3">
              {modalType === 'success' 
                ? (modalMessage === 'AI Feedback Saved Successfully' ? 'AI Feedback Saved!' : 'Interview Scheduled!') 
                : (modalMessage.includes('saving') ? 'Saving Failed' : 'Scheduling Failed')}
            </h4>
            <p className="success-message mb-4">{modalMessage}</p>
            <Button 
              variant={modalType === 'success' ? 'success' : 'danger'} 
              onClick={() => setShowModal(false)}
              className="continue-button"
            >
              {modalType === 'success' ? 'Continue' : 'Try Again'}
            </Button>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  ) : null;
};

export default InterviewHistoryModal;
