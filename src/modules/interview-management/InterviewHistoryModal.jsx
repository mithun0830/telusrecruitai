import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './InterviewHistoryModal.css';
import { candidateService, interviewService, aiFeedbackService } from '../../services/api';
import Loader from '../../components/Loader';
import { Modal, Button } from 'react-bootstrap';
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
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [interviewers, setInterviewers] = useState([]); // Array of {id, email} objects
  const [loadingInterviewers, setLoadingInterviewers] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const multiselectRef = useRef(null);
  
  // AI Feedback related state
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(null);
  const [showAiFeedback, setShowAiFeedback] = useState(false);
  
  // Store feedback per candidate ID to persist across modal opens/closes
  const [candidateFeedbackCache, setCandidateFeedbackCache] = useState({});
  
  // Polling related state
  const [isPolling, setIsPolling] = useState(false);
  const [candidateFolderExists, setCandidateFolderExists] = useState(false);
  const [pollingIntervalId, setPollingIntervalId] = useState(null);
  const [hasStoppedPolling, setHasStoppedPolling] = useState(new Set()); // Track candidates for which polling has stopped

  useEffect(() => {
    if (isOpen) {
      setSelectedInterviewers([]);
      
      // Load cached feedback for this candidate if it exists
      if (candidateHistory?.candidateId && candidateFeedbackCache[candidateHistory.candidateId]) {
        setAiFeedback(candidateFeedbackCache[candidateHistory.candidateId]);
        setShowAiFeedback(false); // Start collapsed
      } else {
        // Clear AI feedback when modal opens for a different candidate with no cache
        setAiFeedback(null);
        setShowAiFeedback(false);
      }

      // Check if we've already found the folder for this candidate
      if (candidateHistory?.candidateId && hasStoppedPolling.has(candidateHistory.candidateId)) {
        // We've already found the folder for this candidate, enable the button
        console.log('✅ Folder already found for candidate:', candidateHistory.candidateId);
        setCandidateFolderExists(true);
        setIsPolling(false);
      } else if (candidateHistory?.candidateId) {
        // Start polling for candidate folder if not already found
        console.log('🔄 Starting fresh polling for candidate:', candidateHistory.candidateId);
        setCandidateFolderExists(false);
        startPollingForCandidateFolder(candidateHistory.candidateId);
      }
    } else {
      // Clean up polling when modal closes
      stopPolling();
    }

    // Cleanup on unmount
    return () => {
      stopPolling();
    };
  }, [isOpen, candidateHistory?.candidateId, candidateFeedbackCache, hasStoppedPolling]);

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

  useEffect(() => {
    if (isOpen && candidateHistory && candidateHistory.resumeId) {
      fetchInterviewers(candidateHistory.resumeId);
    }
  }, [isOpen, candidateHistory]);

  const fetchInterviewers = async (resumeId) => {
    setLoadingInterviewers(true);
    try {
      const response = await candidateService.getMatchingInterviewers(resumeId);
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

  // Polling functions
  const startPollingForCandidateFolder = async (candidateId) => {
    console.log('🔄 Starting polling for candidate folder:', candidateId);
    setIsPolling(true);
    setCandidateFolderExists(false);

    // Check immediately first
    await checkCandidateFolder(candidateId);

    // Set up polling interval (every 10 seconds)
    const intervalId = setInterval(async () => {
      await checkCandidateFolder(candidateId);
    }, 10000);

    setPollingIntervalId(intervalId);
  };

  const checkCandidateFolder = async (candidateId) => {
    try {
      console.log('🔍 Checking candidate folder for:', candidateId);
      const response = await aiFeedbackService.checkCandidateFolder(candidateId);
      console.log('📋 Full API Response:', response);
      
      // Check multiple possible response structures
      const folderExists = response.success && (
        response.data?.exists === true || 
        response.data?.folderExists === true ||
        response.data === true ||
        response.exists === true ||
        response.folderExists === true
      );
      
      console.log('📋 Folder exists check result:', folderExists);
      
      if (folderExists) {
        console.log('✅ Candidate folder found! Stopping polling immediately.');
        
        // Stop polling FIRST to prevent any more calls
        if (pollingIntervalId) {
          console.log('🛑 Clearing polling interval:', pollingIntervalId);
          clearInterval(pollingIntervalId);
          setPollingIntervalId(null);
        }
        
        // Update states
        setIsPolling(false);
        setCandidateFolderExists(true);
        
        // Mark this candidate as having stopped polling
        setHasStoppedPolling(prev => {
          const newSet = new Set([...prev, candidateId]);
          console.log('📝 Updated hasStoppedPolling set:', newSet);
          return newSet;
        });
        
        console.log('✅ Polling completely stopped for candidate:', candidateId);
      } else {
        console.log('❌ Candidate folder not found yet, continuing polling...');
        console.log('📋 Response data:', response.data);
        setCandidateFolderExists(false);
      }
    } catch (error) {
      console.error('❌ Error checking candidate folder:', error);
      setCandidateFolderExists(false);
    }
  };

  const stopPolling = () => {
    if (pollingIntervalId) {
      console.log('🛑 Stopping polling, clearing interval:', pollingIntervalId);
      clearInterval(pollingIntervalId);
      setPollingIntervalId(null);
    }
    setIsPolling(false);
    console.log('🛑 Polling stopped completely');
  };

  // AI Feedback generation function
  const handleGenerateAIFeedback = async () => {
    if (!candidateHistory.candidateId) {
      setModalType('error');
      setModalMessage('Candidate ID not found. Cannot generate feedback.');
      setShowModal(true);
      return;
    }

    if (!candidateFolderExists) {
      setModalType('error');
      setModalMessage('Candidate folder not found. Please wait for the interview files to be uploaded.');
      setShowModal(true);
      return;
    }

    setIsGeneratingFeedback(true);
    console.log('🤖 Generating AI feedback for candidate:', candidateHistory.candidateId);

    try {
      const response = await aiFeedbackService.generateFeedbackForCandidate(candidateHistory.candidateId);
      console.log('🤖 AI Feedback Response:', response);

      if (response.success && response.data) {
        // Cache the feedback for this candidate
        setCandidateFeedbackCache(prev => ({
          ...prev,
          [candidateHistory.candidateId]: response.data
        }));
        
        setAiFeedback(response.data);
        setShowAiFeedback(true);
        setModalType('success');
        setModalMessage('AI feedback generated successfully!');
        setShowModal(true);
      } else {
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

  const { history, candidateName, jobTitle, jobDepartment, email, resumeId } = candidateHistory;

  console.log('Candidate Info:', { candidateName, jobTitle, jobDepartment, email, resumeId });

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
    if (selectedInterviewers.length === 0 || !selectedDateTime) {
      setModalType('error');
      setModalMessage('Please select at least one interviewer and a date/time');
      setShowModal(true);
      return;
    }
    setIsLoading(true);

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
          setSelectedSlot(null);
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
      setIsLoading(false);
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
      if (response.data?.meetingEvent?.hangoutLink) {
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
          
          // Refresh the interview management screen
          onUpdateSuccess();
          
          // Update the history array in the component
          if (history && history.length > 0) {
            history[history.length - 1].meetingLink = meetingLink;
          }
          // Update the latest meeting link state
          setLatestMeetingLink(meetingLink);
          resetScheduleFields();
          // Show success modal
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

  return (
    isOpen && candidateHistory && (
      <>
        {(isLoading || loadingInterviewers) && <Loader />}
      <div className="modal-overlay">
        <div className="modal-content" style={{ fontFamily: '"Inter", "Roboto", "Helvetica Neue", "Arial", sans-serif' }}>
          <div className="modal-left">
            <h2>Interview Details</h2>
            {history && history.length > 0 && (history[history.length - 1].status.toUpperCase() !== 'COMPLETED' || history[history.length - 1].feedback) ? (
              <>
              <div className="schedule-form">
              <label>
                Select Interview Round:
                <select
                  value={selectedRound}
                  onChange={(e) => {
                    setSelectedRound(e.target.value);
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
                        <div key={index} className="multiselect-option">
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
                          {interviewer.email}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </label>
              {loadingInterviewers && <p>Loading interviewers...</p>}
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
                  disabled={selectedInterviewers.length === 0}
                >
                  Find Slots
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
                  <button 
                    onClick={handleSchedule} 
                    className="schedule-button"
                    disabled={selectedInterviewers.length === 0 || !selectedSlot}
                  >
                    <FontAwesomeIcon icon={faRobot} style={{ marginRight: '8px' }} />
                    Schedule Interview
                  </button>
                </div>
              </>
            ) : (
              history[history.length - 1].status.toUpperCase() === 'COMPLETED' ? (
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
                    
                    {candidateFolderExists && !isPolling && (
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
                    <div style={{ marginTop: '15px', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
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
                        <span style={{ fontSize: '14px' }}>
                          {showAiFeedback ? '▼' : '▶'}
                        </span>
                      </div>
                      
                      {showAiFeedback && (
                        <div style={{ padding: '20px', backgroundColor: '#fff', maxHeight: '400px', overflowY: 'auto' }}>
                          {renderAIFeedback(aiFeedback)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : null
            )}
          </div>
          <div className="modal-right">
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
                    <div className="timeline-content">
                      <h3>{interview.roundName}</h3>
                      <div className="status-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <p className="timeline-subtitle" style={{ margin: 0 }}>{interview.status}</p>
                      </div>
                      {interview.feedback && (
                        <p className="timeline-description">
                          <strong>Interviewer's feedback: </strong>
                          {interview.feedback}
                        </p>
                      )}
                    </div>
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => handleClose()} className="close-button">×</button>
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
              {modalType === 'success' ? 'Interview Scheduled!' : 'Scheduling Failed'}
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
      </>
    )
  );
};


export default InterviewHistoryModal;
