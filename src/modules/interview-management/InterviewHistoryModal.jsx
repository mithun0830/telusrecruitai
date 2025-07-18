import React from 'react';
import './InterviewHistoryModal.css';

const InterviewHistoryModal = ({ isOpen, onClose, candidateHistory }) => {
  if (!isOpen || !candidateHistory) return null;

  const { history, dateTime } = candidateHistory;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Interview Process</h2>
        <p className="interview-datetime">
          {new Date(dateTime).toLocaleString()}
        </p>
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
                <p className="timeline-subtitle">{interview.status}</p>
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
        <button onClick={onClose} className="close-button">Close</button>
      </div>
    </div>
  );
};


export default InterviewHistoryModal;
