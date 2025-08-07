import React, { useState } from 'react';
import ReactDOM from 'react-dom';

const ROUNDS = [
  { roundNumber: 1, name: 'New Application' },
  { roundNumber: 2, name: 'HR Screening' },
  { roundNumber: 3, name: 'Technical Round 1' },
  { roundNumber: 4, name: 'Technical Round 2' }
];

const InterviewProgressBar = ({ currentRound, interviewHistory = [], onRoundClick }) => {
  const [hoveredRound, setHoveredRound] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedRound, setSelectedRound] = useState(null);
  
  const getStatusForRound = (roundNumber) => {
    const round = interviewHistory.find(r => r.roundNumber === roundNumber);
    if (!round) return 'pending';
    
    if (roundNumber < currentRound) {
      return 'completed';
    }
    
    switch (round.status?.toLowerCase()) {
      case 'completed':
      case 'selected':
        return 'completed';
      case 'in progress':
        return 'in-progress';
      case 'rejected':
        return 'rejected';
      default:
        return 'pending';
    }
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
          const isCurrentRound = round.roundNumber === currentRound;

          return (
            <div key={round.roundNumber} className="progress-step">
              <div 
                className={`step-circle ${status} ${isCurrentRound ? 'current' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  const roundInfo = getRoundInfo(round.roundNumber);
                  if (status === 'completed' || round.roundNumber < currentRound) {
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
                {(status === 'completed' || round.roundNumber < currentRound) && (
                  <span className="checkmark">
                    <svg viewBox="0 0 24 24" width="16" height="16">
                      <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                    </svg>
                  </span>
                )}
                {status === 'rejected' && <span className="cross">✕</span>}
                {status === 'in-progress' && <span className="in-progress-dot"></span>}
                {status === 'pending' && round.roundNumber >= currentRound && <span className="pending-number">{round.roundNumber}</span>}
              </div>
              <div className="step-label">{round.name}</div>
              {index < ROUNDS.length - 1 && (
                <div className={`connecting-line ${isActive ? status : ''}`}></div>
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
          if (e.target.className === 'modal_pop_up') {
            setShowPopup(false);
          }
        }}>
          <div className="popup-content">
            <div className="popup-header">
              <div className="technical-round">{selectedRound.roundName}</div>
              <div className="status">{selectedRound.status}</div>
            </div>
            <div className="popup-body">
              <p><strong>Feedback:</strong> {selectedRound.feedback || 'No feedback available'}</p>
              {selectedRound.interviewDateTime && (
                <p><strong>Interview Date:</strong> {new Date(selectedRound.interviewDateTime).toLocaleString()}</p>
              )}
            </div>
            <button onClick={() => setShowPopup(false)}>Close</button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default InterviewProgressBar;
