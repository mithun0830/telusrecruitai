import React, { useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import './FeedbackDialog.css';

const FeedbackDialog = ({ isOpen, onClose, candidate }) => {
  useEffect(() => {
    console.log('FeedbackDialog opened with candidate:', candidate);
  }, [candidate]);

  const getLatestFeedback = () => {
    if (candidate?.interviewHistory && candidate.interviewHistory.length > 0) {
      const latestInterview = candidate.interviewHistory[candidate.interviewHistory.length - 1];
      return latestInterview.feedback || 'No feedback available';
    }
    return 'No feedback available';
  };

  const feedback = getLatestFeedback();

  return (
    <Modal show={isOpen} onHide={onClose} centered>
      <div className="feedback-dialog">
        <div className="feedback-dialog-header">
          <h3>{candidate?.name || 'Candidate'}</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="feedback-dialog-content">
          <div className="status-section">
            <span className={`status-badge ${candidate?.status?.toLowerCase()}`}>
              {candidate?.status || 'Status Not Available'}
            </span>
          </div>
          <div className="feedback-section">
            <h4>Feedback</h4>
            {feedback === 'No feedback available' ? (
              <p className="no-feedback">No feedback is available for this candidate.</p>
            ) : (
              <p className="feedback-text">{feedback}</p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default FeedbackDialog;
