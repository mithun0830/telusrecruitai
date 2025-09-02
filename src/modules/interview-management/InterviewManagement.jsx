  import React, { useState, useEffect } from 'react';
import { interviewService, aiFeedbackService } from '../../services/api';
import InterviewHistoryModal from './InterviewHistoryModal';
import ChatBot from '../../components/ChatBot';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments } from '@fortawesome/free-solid-svg-icons';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import './InterviewManagement.css';

const CandidateChatBot = ({ candidate, onChatToggle }) => {
  return (
    <button
      className="chat-bot-toggle"
      title="Ask AI"
      onClick={() => onChatToggle({
        id: candidate.candidateId,
        name: candidate.name,
        resumeId: candidate.resumeId
      })}
    >
      <FontAwesomeIcon icon={faComments} />
    </button>
  );
};

const getInitials = (name) => {
  if (!name) return ''; // Return empty string if name is undefined or null
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

const CandidateCard = ({ candidate, round, handleStatusClick, onChatToggle }) => {
  const getLatestFeedback = () => {
    if (candidate.interviewHistory && candidate.interviewHistory.length > 0) {
      const latestInterview = candidate.interviewHistory[candidate.interviewHistory.length - 1];
      return latestInterview.feedback || 'No feedback available';
    }
    return 'No feedback available';
  };

  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      {getLatestFeedback()}
    </Tooltip>
  );

  return (
    <div className="candidate-card">
      <div className="card-header">
        <div className="candidate-info">
          <div
            className="avatar"
            style={{
              backgroundColor: '#ffd6d6',
              color: '#333',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 'bold',
              marginRight: '16px'
            }}
          >
            {getInitials(candidate.name)}
          </div>
          <div>
            <h3 style={{ margin: '0', fontSize: '18px', fontWeight: '600', color: '#333' }}>
              {candidate.name || 'No Name'}
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#666' }}>
              Applied at {candidate.interviewDateTime ? new Date(candidate.interviewDateTime).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
        <CandidateChatBot candidate={candidate} onChatToggle={onChatToggle} />
      </div>
      <div className="card-content" style={{ padding: '0px' }}>
             <div className="score-section">
           <span className="manager-info" style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
            {/* JD: {candidate.jobDescription?.title} */}
            JD: {candidate.jobDescription?.title || "Java Developer"}
          </span>
          <span className="manager-info" style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
            Manager: {candidate.manager ? candidate.manager.name : 'RMG Admin'} 
          </span>
          <span className="manager-info" style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
              {round.roundName === 'New Applications' ? 'Resume Score' : 'Overall Score'}
              : {candidate.score || 0}%
            </span>
          <div style={{ display: 'flex', marginLeft: 'auto', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="score-value" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
         
              {candidate.status.toUpperCase() === 'REJECTED' ? (
                <OverlayTrigger
                  placement="bottom"
                  delay={{ show: 250, hide: 400 }}
                  overlay={renderTooltip}
                >
                  <span
                    style={{
                      backgroundColor: '#dc3545',
                      color: '#fff',
                      padding: '6px 12px',
                      borderRadius: '16px',
                      fontSize: '14px',
                      fontWeight: '500',
                      display: 'inline-block'
                    }}
                  >
                    {candidate.status.toUpperCase()}
                  </span>
                </OverlayTrigger>
              ) : (
                <span
                  onClick={(e) => {
                    e.preventDefault();
                    if (candidate.status.toUpperCase() !== 'IN PROGRESS' && candidate.status.toUpperCase() !== 'REJECTED' && !(round.roundName === 'New Applications' && candidate.status.toUpperCase() === 'PENDING')) {
                      handleStatusClick(candidate, round);
                    } else {
                      console.log('Not calling handleStatusClick for IN PROGRESS, REJECTED, or PENDING in New Applications status');
                    }
                  }}
                  style={{
                    cursor: (candidate.status.toUpperCase() !== 'IN PROGRESS' && candidate.status.toUpperCase() !== 'REJECTED' && !(round.roundName === 'New Applications' && candidate.status.toUpperCase() === 'PENDING')) ? 'pointer' : 'default',
                    backgroundColor: candidate.status.toUpperCase() === 'PENDING' ? '#FFA500' : // Warning color
                                   candidate.status.toUpperCase() === 'COMPLETED' ? '#00a78e' : // Success color
                                   candidate.status.toUpperCase() === 'SELECTED' ? '#007bff' : // Primary color
                                   candidate.status.toUpperCase() === 'REJECTED' ? '#dc3545' : // Red color
                                   '#6c757d', // Default gray
                    color: '#fff',
                    padding: '6px 12px',
                    borderRadius: '16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'inline-block'
                  }}
                >
                  {candidate.status.toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const KanbanColumn = ({ round, stages, handleStatusClick, handleChatToggle }) => {
  return (
    <div className="kanban-column">
      <div className="column-header">
        <div className="stage-info">
          <span className="stage-dot" style={{ backgroundColor: stages[round.roundName].color }}></span>
          <span className="stage-name">{round.roundName}</span>
          <span className="stage-count">{round.candidates.length}</span>
        </div>
      </div>
      <div className="column-content">
        {round.candidates.map(candidate => (
          <CandidateCard
            key={candidate.candidateId}
            candidate={candidate}
            round={round}
            handleStatusClick={handleStatusClick}
            onChatToggle={handleChatToggle}
          />
        ))}
      </div>
    </div>
  );
};

const InterviewManagement = () => {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [interviewRounds, setInterviewRounds] = useState([]);
  const [filteredRounds, setFilteredRounds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatCandidate, setActiveChatCandidate] = useState(null);
  const [candidateFolderStatus, setCandidateFolderStatus] = useState({});
  const stageColors = ['#6366F1', '#F97316', '#F59E0B', '#3B82F6'];

  const handleChatToggle = (candidateInfo) => {
    setIsChatOpen(true);
    setActiveChatCandidate(candidateInfo);
  };

  const fetchInterviewRounds = async () => {
    try {
      setIsLoading(true);
      const response = await interviewService.getInterviewRounds();
      const sortedRounds = response.data.list.sort((a, b) => a.roundId - b.roundId);
      setInterviewRounds(sortedRounds);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to fetch interview rounds');
      setIsLoading(false);
    }
  };

  // Function to check candidate folder status
const checkCandidateFolderStatus = async (candidate) => {
    try {
      console.log(`🔍 Checking folder status for candidate: ${candidate.email}`);
      const response = await aiFeedbackService.checkCandidateFolder(candidate.email);
      console.log(`📁 Folder check response for ${candidate.email}:`, response);
      console.log(`📊 Response data:`, response.data);
      console.log(`✅ Response success:`, response.success);
      console.log(`📂 Folder exists:`, response.data?.exists);
      
      const folderExists = response.success && response.data?.exists;
      console.log(`🎯 Final folder status for ${candidate.email}:`, folderExists);
      
      setCandidateFolderStatus(prev => {
        const newStatus = {
          ...prev,
          [candidate.email]: folderExists
        };
        console.log(`🔄 Updated candidateFolderStatus:`, newStatus);
        return newStatus;
      });
      
      return folderExists;
    } catch (error) {
      console.error(`❌ Error checking folder for candidate ${candidate.email}:`, error);
      setCandidateFolderStatus(prev => ({
        ...prev,
        [candidate.email]: false
      }));
      return false;
    }
  };

  // Function to check all candidates' folder status
  const checkAllCandidatesFolderStatus = async () => {
    const allCandidates = interviewRounds.flatMap(round => round.candidates);
    
    // Log all candidates and their statuses for debugging
    console.log('🔍 All candidates and their statuses:');
    allCandidates.forEach(candidate => {
      console.log(`- ${candidate.name} (ID: ${candidate.candidateId}): ${candidate.status}`);
    });
    
    // Check for candidates that might need folder checking (not just COMPLETED)
    const candidatesToCheck = allCandidates.filter(candidate => {
      const status = candidate.status.toUpperCase();
      return status === 'COMPLETED' || status === 'SELECTED' || status === 'FINISHED' || status === 'DONE';
    });

    console.log(`📋 Checking folder status for ${candidatesToCheck.length} candidates (out of ${allCandidates.length} total)`);
    console.log('📋 Candidates to check:', candidatesToCheck.map(c => `${c.name} (${c.status})`));

    for (const candidate of candidatesToCheck) {
      if (candidate.email) {
        await checkCandidateFolderStatus(candidate);
        // Add a small delay between requests to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  };

  // Function to handle manual folder check refresh
  const handleFolderCheck = async () => {
    if (selectedCandidate?.email) {
      console.log('Manual folder check triggered for:', selectedCandidate.email);
      await checkCandidateFolderStatus(selectedCandidate);
    }
  };

  useEffect(() => {
    fetchInterviewRounds();
  }, []);

  // Effect to handle search filtering
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredRounds(interviewRounds);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = interviewRounds.map(round => ({
      ...round,
      candidates: round.candidates.filter(candidate => {
        const nameMatch = candidate.name?.toLowerCase().includes(query);
        const emailMatch = candidate.email?.toLowerCase().includes(query);
        const jobTitleMatch = candidate.jobTitle?.toLowerCase().includes(query);
        const departmentMatch = candidate.department?.toLowerCase().includes(query);
        const managerMatch = candidate.manager?.fullName?.toLowerCase().includes(query);
        
        return nameMatch || emailMatch || jobTitleMatch || departmentMatch || managerMatch;
      })
    }));

    setFilteredRounds(filtered);
  }, [searchQuery, interviewRounds]);

  // Effect to check folder status when interview rounds are loaded
  useEffect(() => {
    if (interviewRounds.length > 0) {
      checkAllCandidatesFolderStatus();
    }
  }, [interviewRounds]);

  // Polling effect to periodically check folder status
  useEffect(() => {
    const pollInterval = setInterval(() => {
      if (interviewRounds.length > 0) {
        console.log('Polling: Checking candidate folder status...');
        checkAllCandidatesFolderStatus();
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(pollInterval);
  }, [interviewRounds]);

  const handleStatusClick = (candidate, round) => {
    const roundId = round.roundId;

    const isLastRound = round.roundId === interviewRounds[interviewRounds.length - 1].roundId;
    const isSelected = candidate.status.toUpperCase() === 'SELECTED';
    const hasFeedback = candidate.interviewHistory && candidate.interviewHistory.length > 0 && candidate.interviewHistory[candidate.interviewHistory.length - 1].feedback;

    if (isLastRound && isSelected && hasFeedback) {
      console.log('Modal not opened: Last round, not selected status, and feedback present');
      return;
    }

    if (round.roundName.toUpperCase() == 'NEW APPLICATION' && candidate.status.toUpperCase() === 'PENDING') {
      setSelectedCandidate({
        history: candidate.interviewHistory || [],
        candidateName: candidate.name || 'No Name',
        jobTitle: candidate.jobTitle || 'Software Engineer',
        jobDepartment: candidate.department || 'Engineering',
        email: candidate.email || '',
        candidateId: candidate.candidateId,
        currentRoundId: candidate.currentRoundId,
        resumeId: candidate.resumeId || '',
        status: candidate.status.toUpperCase(),
        roundId: roundId,
        jobDescription: candidate.jobDescription || ''
      });
      setShowOverlay(true);
    } else if (candidate.status.toUpperCase() !== 'IN PROGRESS' && candidate.status.toUpperCase() !== 'REJECTED') {
      setSelectedCandidate({
        history: candidate.interviewHistory || [],
        candidateName: candidate.name || 'No Name',
        jobTitle: candidate.jobTitle || 'Software Engineer',
        jobDepartment: candidate.department || 'Engineering',
        email: candidate.email || '',
        candidateId: candidate.candidateId,
        currentRoundId: candidate.currentRoundId,
        resumeId: candidate.resumeId || '',
        status: candidate.status.toUpperCase(),
        roundId: roundId,
        jobDescription: candidate.jobDescription || ''
      });
      setIsModalOpen(true);
    }
  };

  const handleOverlayClose = async () => {
    try {
      await interviewService.updateInterviewStatus({
        candidateId: selectedCandidate.candidateId,
        roundId: selectedCandidate.roundId,
        interviewerId: "",
        interviewerEmail: "",
        status: "Rejected",
        meetingLink: "",
        startMeetingTimeStamp: "",
        endMeetingTimeStamp: ""
      });
      await fetchInterviewRounds();
    } catch (error) {
      console.error('Error rejecting candidate:', error);
    }
    setShowOverlay(false);
    setSelectedCandidate(null);
  };

  const handleModalClose = (success, meetingLink, shouldClose = true) => {
    if (shouldClose) {
      setIsModalOpen(false);
    }
    if (success && meetingLink) {
      // Find the current candidate in the rounds
      const currentRound = interviewRounds.find(round =>
        round.candidates.some(c => c.candidateId === selectedCandidate.candidateId)
      );

      if (currentRound) {
        const candidateIndex = currentRound.candidates.findIndex(c =>
          c.candidateId === selectedCandidate.candidateId
        );

        if (candidateIndex !== -1) {
          const updatedCandidate = {
            ...currentRound.candidates[candidateIndex]
          };

          if (updatedCandidate.interviewHistory && updatedCandidate.interviewHistory.length > 0) {
            updatedCandidate.interviewHistory[updatedCandidate.interviewHistory.length - 1].meetingLink = meetingLink;
          }

          updateCandidateInRounds(updatedCandidate);
        }
      }
    }
  };

  const updateCandidateInRounds = (updatedCandidate) => {
    setInterviewRounds(prevRounds =>
      prevRounds.map(round => ({
        ...round,
        candidates: round.candidates.map(candidate =>
          candidate.candidateId === updatedCandidate.candidateId ? updatedCandidate : candidate
        )
      }))
    );
  };

  // Removed moveToNextRound function

  const stages = interviewRounds.reduce((acc, round, index) => {
    acc[round.roundName] = {
      count: round.candidates.length,
      color: stageColors[index % stageColors.length],
      roundId: round.roundId
    };
    return acc;
  }, {});

  return (
    <div className="interview-management">
      <div className="header">
        <div className="left-controls">
          <div className="search">
            {/* <i className="fas fa-search"></i> */}
            <input 
              type="text" 
              placeholder="Search candidate by name, email, job title, department, or manager"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='search-container'
            />
          </div>
          {/* <div className="control">
            <i className="fas fa-filter"></i>
            More filters
          </div> */}
        </div>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <p className="loading-text">Loading interview rounds...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p>Error: {error}</p>
        </div>
      ) : (
        <div className="kanban-board">
          {filteredRounds.map((round) => (
            <KanbanColumn
              key={round.roundId}
              round={round}
              stages={stages}
              handleStatusClick={handleStatusClick}
              handleChatToggle={handleChatToggle}
            />
          ))}
        </div>
      )}
      <InterviewHistoryModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        candidateHistory={selectedCandidate || []}
        interviewRounds={interviewRounds}
        onUpdateSuccess={fetchInterviewRounds}
        candidateFolderStatus={candidateFolderStatus}
        onFolderCheck={handleFolderCheck}
      />
      {showOverlay && selectedCandidate && (
        <div className="overlay">
          <div className="overlay-content">
            <button
              onClick={() => setShowOverlay(false)}
              className="overlay-close-button"
            >
              ×
            </button>
            <h3>Do you want to schedule an interview for this candidate?</h3>
            <div className="overlay-buttons">
              <button
                onClick={handleOverlayClose}
                className="overlay-button overlay-button-reject"
              >
                Reject
              </button>
              <button
                onClick={() => {
                  setShowOverlay(false);
                  setIsModalOpen(true);
                }}
                className="overlay-button overlay-button-schedule"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
      {isChatOpen && (
        <ChatBot
          candidateId={activeChatCandidate.id}
          candidateName={activeChatCandidate.name}
          resumeId={activeChatCandidate.resumeId}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </div>
  );
};

export default InterviewManagement;
