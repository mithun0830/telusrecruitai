import React, { useState, useEffect } from 'react';
import { interviewService } from '../../services/api';
import InterviewHistoryModal from './InterviewHistoryModal';
import ChatBot from '../../components/ChatBot';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments } from '@fortawesome/free-solid-svg-icons';
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
  return (
    <div className="candidate-card">
      <div className="card-header">
        <div className="candidate-info">
          <div
            className="avatar"
            style={{
              backgroundColor: getLightColor(),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: getDarkColor(),
              fontWeight: 'bold'
            }}
          >
            {getInitials(candidate.name)}
          </div>
          <div>
            <h3>{candidate.name || 'No Name'}</h3>
            <p>Applied at {candidate.interviewDateTime ? new Date(candidate.interviewDateTime).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>
        <CandidateChatBot candidate={candidate} onChatToggle={onChatToggle} />
      </div>
      <div className="card-content">
        <div className="score-section">
          <span className="manager-info">Manager: {candidate.manager ? candidate.manager.fullName : 'RMG Admin'}</span>
          <span>{round.roundName === 'New Applications' ? 'Resume Score' : 'Overall Score'}</span>
          <div className="score-value">
            <span>{candidate.score || 0}%</span>
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
                backgroundColor: getLightColor(),
                color: getDarkColor(),
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                display: 'inline-block'
              }}
            >
              {candidate.status.toUpperCase()}
            </span>
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatCandidate, setActiveChatCandidate] = useState(null);
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

  useEffect(() => {
    fetchInterviewRounds();
  }, []);

  const handleStatusClick = (candidate, round) => {
    console.log('handleStatusClick called:', round.roundName.toUpperCase());
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
        roundId: round?.roundId
      });
      setShowOverlay(true);
    } else if (candidate.status.toUpperCase() !== 'IN PROGRESS' && candidate.status.toUpperCase() !== 'REJECTED') {
      console.log('Setting selected candidate and opening modal');
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
        roundId: round?.roundId
      });
      setIsModalOpen(true);
    } else {
      console.log('Not taking any action for IN PROGRESS, REJECTED, or PENDING status');
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
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Search candidate" />
          </div>
          <div className="control">
            <i className="fas fa-filter"></i>
            More filters
          </div>
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
          {interviewRounds.map((round) => (
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
      />
      {showOverlay && selectedCandidate && (
        <div className="overlay">
          <div className="overlay-content">
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
