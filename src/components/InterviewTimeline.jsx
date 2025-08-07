import React from 'react';

const InterviewTimeline = ({ history }) => {
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'selected':
        return '✓';
      case 'rejected':
        return '✗';
      case 'in progress':
        return '⋯';
      default:
        return '○';
    }
  };

  return (
    <div className="interview-timeline">
      <div className="timeline-line"></div>
      {history.map((interview, index) => (
        <div key={index} className="timeline-item">
          <div className="timeline-status">
            <div className={`status-icon ${interview.status.toLowerCase()}`}>
              {getStatusIcon(interview.status)}
            </div>
          </div>
          <div className="timeline-content">
            <h3>{interview.roundName}</h3>
            <p className={`timeline-subtitle ${interview.status.toLowerCase()}`}>
              {interview.status}
            </p>
            {interview.feedback && (
              <p className="timeline-description">
                {interview.feedback}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default InterviewTimeline;
