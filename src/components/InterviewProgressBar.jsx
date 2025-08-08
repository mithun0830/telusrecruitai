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
  { roundNumber: 2, name: 'HR Screening' },
  { roundNumber: 3, name: 'Technical Round 1' },
  { roundNumber: 4, name: 'Technical Round 2' }
];

const InterviewProgressBar = ({ interviewHistory = [], onRoundClick }) => {
  const [hoveredRound, setHoveredRound] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedRound, setSelectedRound] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [rejectedRoundFeedback, setRejectedRoundFeedback] = useState(null);
  
const getStatusForRound = (roundNumber) => {
  const round = interviewHistory.find(r => r.roundNumber === roundNumber);
  
  // Check if there's a rejection in a later round
  const hasRejectionInLaterRound = interviewHistory.some(r => 
    r.roundNumber > roundNumber && 
    r.status?.toLowerCase() === 'rejected'
  );

  // Check if any later round is completed or selected
  const hasCompletedLaterRound = interviewHistory.some(r => 
    r.roundNumber > roundNumber && 
    (r.status?.toLowerCase() === 'completed' || r.status?.toLowerCase() === 'selected')
  );

  // If there's a rejection in a later round, mark previous rounds as selected
  if (hasRejectionInLaterRound) {
    return round ? 'selected' : 'skipped-selected';
  }

  // If a later round is completed/selected, mark this round as skipped-completed
  if (hasCompletedLaterRound && !round) {
    return 'skipped-completed';
  }

  // If a later round is completed/selected, mark this round as completed
  if (hasCompletedLaterRound) {
    return 'completed';
  }

  if (!round) {
    return 'pending';
  }
  
  const status = round.status?.toLowerCase();
  
  if (status === 'selected' || status === 'completed') {
    return 'completed';
  }
  
  if (status === 'in progress') {
    return 'in-progress';
  }
  
  if (status === 'rejected') {
    return 'rejected';
  }
  
  return 'pending';
};

const getCurrentRound = () => {
  if (!interviewHistory || interviewHistory.length === 0) {
    return 1;
  }
  const lastCompletedRound = interviewHistory
    .filter(round => round.status?.toLowerCase() === 'completed' || round.status?.toLowerCase() === 'selected')
    .sort((a, b) => b.roundNumber - a.roundNumber)[0];
  return lastCompletedRound ? lastCompletedRound.roundNumber + 1 : 1;
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
          const isCurrentRound = round.roundNumber === getCurrentRound();

          return (
            <div key={round.roundNumber} className="progress-step">
              <div 
                className={`step-circle ${status} ${isCurrentRound ? 'current' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  const roundInfo = getRoundInfo(round.roundNumber);
                  if (status === 'completed' || status === 'skipped' || round.roundNumber < getCurrentRound()) {
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
                {(status === 'completed' || status === 'selected' || status === 'skipped-completed' || status === 'skipped-selected' || round.roundNumber < getCurrentRound()) && (
                  <span className={`checkmark ${status.startsWith('skipped') ? 'skipped' : ''}`}>
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
                {status === 'in-progress' && <span className="in-progress-dot"></span>}
              </div>
              <div className="step-label">{round.name}</div>
              {index < ROUNDS.length - 1 && (
                <div className={`connecting-line ${
                  isActive || getStatusForRound(round.roundNumber + 1) === 'completed' ? 'completed' : ''
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
              <button className="modal-header-close" onClick={() => setShowPopup(false)}>&times;</button>
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
