import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './InterviewProgressBar.css';
import { Modal } from 'react-bootstrap';

const formatFeedback = (feedback) => {
  if (!feedback) return 'Feedback not generated yet';
  
  const lines = feedback.split('\n');
  const formattedLines = lines.map(line => {
    const trimmedLine = line.trim();
    if (/^[1-5][).]\s/.test(trimmedLine)) {
      return `<p>${trimmedLine}</p>`;
    }
    return trimmedLine;
  });
  
  return formattedLines.join('\n');
};

const ROUNDS = [
  { roundNumber: 1, name: 'New Application' },
  { roundNumber: 2, name: 'Technical Round 1' },
  { roundNumber: 3, name: 'Technical Round 2' },
  { roundNumber: 4, name: 'Managerial Round' },
  { roundNumber: 5, name: 'On-Boarding' }
];

const InterviewProgressBar = ({ interviewHistory = [], onRoundClick }) => {
  const [hoveredRound, setHoveredRound] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedRound, setSelectedRound] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [rejectedRoundFeedback, setRejectedRoundFeedback] = useState(null);

const getStatusForRound = (roundNumber) => {
  const round = interviewHistory.find(r => r.roundNumber === roundNumber);
  const status = round?.status?.toLowerCase();

  // Normalize status groups
  const statusGroups = {
    completed: ['completed', 'selected'],
    rejected: ['rejected'],
    inProgress: ['in progress', 'ongoing'],
    pending: ['pending']
  };

  // Helper to get all rounds for a status group
  const getRoundsByStatus = (group) => {
    return interviewHistory
      .filter(r => statusGroups[group]?.includes(r.status?.toLowerCase()))
      .map(r => r.roundNumber)
      .sort((a, b) => a - b);
  };

  const completedRounds = getRoundsByStatus('completed');
  const rejectedRounds = getRoundsByStatus('rejected');
  const inProgressRounds = getRoundsByStatus('inProgress');
  const pendingRounds = getRoundsByStatus('pending');

  // Special handling for round one when candidate has moved to later rounds
  if (roundNumber === 1) {
    const hasLaterRounds = interviewHistory.some(r => r.roundNumber > 1);
    if (hasLaterRounds) {
      // If round one is completed/selected, return 'completed' for green border + light green bg
      if (statusGroups.completed.includes(status)) {
        return 'completed';
      }
      // If round one is in-progress/pending, return 'skipped' for green border + white bg
      if (statusGroups.inProgress.includes(status) || statusGroups.pending.includes(status)) {
        return 'skipped';
      }
    }
  }

  // Priority check — rejected first
  if (rejectedRounds.includes(roundNumber)) return 'rejected';

  // Then completed
  if (completedRounds.includes(roundNumber)) return 'completed';

  // Then in progress
  if (inProgressRounds.includes(roundNumber)) return 'in-progress';

  // Then pending
  if (pendingRounds.includes(roundNumber)) return 'pending';

  // Skipped logic — if a later completed/rejected/inProgress round exists
  const allProgressRounds = [
    ...completedRounds,
    ...rejectedRounds,
    ...inProgressRounds
  ];
  const hasLaterProgressRound = allProgressRounds.some(r => r > roundNumber);

  if (hasLaterProgressRound) {
    return 'skipped';
  }

  // Default fallback
  return 'pending';
};


  const getRoundInfo = (roundNumber) => {
    return interviewHistory.find(r => r.roundNumber === roundNumber) || {};
  };

  return (
    <div className="interview-progress-bar">
      <div className="progress-steps">
        {ROUNDS.map((round, index) => {
          const status = getStatusForRound(round.roundNumber);
          const roundInfo = getRoundInfo(round.roundNumber);
          const isActive = status !== 'pending';

          return (
            <div key={round.roundNumber} className="progress-step">
              <div 
                className={`step-circle ${status}`}
                onClick={(e) => {
                  e.stopPropagation();
                  const roundInfo = getRoundInfo(round.roundNumber);
                  if (status === 'completed' || status === 'skipped') {
                    setSelectedRound({
                      ...roundInfo,
                      roundName: round.name
                    });
                    setShowPopup(true);
                  } else {
                    onRoundClick(roundInfo, e);
                  }
                }}
                onMouseEnter={() => setHoveredRound(round.roundNumber)}
                onMouseLeave={() => setHoveredRound(null)}
              >
                {(status === 'completed' || status === 'skipped') && (
                  <span className="checkmark">
                    <svg viewBox="0 0 24 24" width="16" height="16">
                      <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                    </svg>
                  </span>
                )}
                {status === 'rejected' && (
                  <span 
                    className="cross" 
                    onClick={(e) => {
                      e.stopPropagation();
                      const roundInfo = getRoundInfo(round.roundNumber);
                      setRejectedRoundFeedback(roundInfo);
                      setShowFeedbackModal(true);
                    }}
                  >
                    ✕
                  </span>
                )}
                {status === 'in-progress' && (
                  <span className="in-progress-icon">⋯</span>
                )}
                {status === 'pending' && (
                  <span className="pending-icon">•</span>
                )}
              </div>
              <div className="step-label">{round.name}</div>
              {index < ROUNDS.length - 1 && (
                <div className={`connecting-line ${
                  ['completed', 'skipped'].includes(getStatusForRound(round.roundNumber)) &&
                  ['completed', 'skipped'].includes(getStatusForRound(round.roundNumber + 1))
                    ? 'completed'
                    : ''
                }`}></div>
              )}
              {hoveredRound === round.roundNumber && roundInfo.feedback && (
                <div className="tooltip">
                  <span className="tooltiptext">
                    <strong>Status:</strong> {roundInfo.status}
                    <br />
                    <strong>Feedback Available</strong>
                    {roundInfo.interviewDateTime && (
                      <>
                        <br />
                        <strong>Date:</strong> {new Date(roundInfo.interviewDateTime).toLocaleString()}
                      </>
                    )}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {showPopup && selectedRound && ReactDOM.createPortal(
        <div className="modal_pop_up" onClick={(e) => {
          if (e.target.classList.contains('modal_pop_up')) {
            setShowPopup(false);
          }
        }}>
          <div className="popup-content">
            <div className="popup-header">
              <div className="technical-round">{selectedRound.roundName}</div>
              <div className="status">{selectedRound.status}</div>
              {/* <button className="modal-header-close" onClick={() => setShowPopup(false)}>&times;</button> */}
            </div>
            <div className="popup-body">
              <p><strong>Feedback:</strong></p>
              <div dangerouslySetInnerHTML={{ __html: formatFeedback(selectedRound.feedback) }} />
              {selectedRound.interviewDateTime && (
                <p><strong>Interview Date:</strong> {new Date(selectedRound.interviewDateTime).toLocaleString()}</p>
              )}
            </div>
            <button className="bottom-close" onClick={() => setShowPopup(false)}>Close</button>
          </div>
        </div>,
        document.body
      )}

      {showFeedbackModal && rejectedRoundFeedback && ReactDOM.createPortal(
        <div className="modal_pop_up" onClick={(e) => {
          if (e.target.classList.contains('modal_pop_up')) {
            setShowFeedbackModal(false);
          }
        }}>
          <div className="popup-content">
            <div className="popup-header">
              <div className="technical-round">{rejectedRoundFeedback.roundName}</div>
              <div className="status rejected-status">Rejected</div>
              {/* <button className="modal-header-close" onClick={() => setShowFeedbackModal(false)}>&times;</button> */}
            </div>
            <div className="popup-body">
              <p><strong>Interview Date:</strong> {new Date(rejectedRoundFeedback.interviewDateTime).toLocaleString()}</p>
              <p><strong>Interviewers:</strong> {rejectedRoundFeedback.interviewers?.join(', ')}</p>
              <p><strong>Feedback:</strong></p>
              <div dangerouslySetInnerHTML={{ __html: formatFeedback(rejectedRoundFeedback.feedback) }} />
            </div>
            <button className="bottom-close" onClick={() => setShowFeedbackModal(false)}>Close</button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default InterviewProgressBar;
