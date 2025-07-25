import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const CompareView = ({ candidates, onClose }) => {
  if (candidates.length === 0) {
    return (
      <div className="compare-view">
        <div className="compare-view-header">
          <h2>Compare Candidates</h2>
          <button onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className="compare-view-content">
          <div className="no-candidates-message">
            Please select candidates to compare
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="compare-view">
      <div className="compare-view-header">
        <h2>Compare Candidates ({candidates.length})</h2>
        <button onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      <div className="compare-view-content">
        {candidates.map(candidate => (
          <div key={candidate.resume.id} className="candidate-card">
            <div className="candidate-card-content">
              <div className="candidate-header">
                <div className="candidate-avatar">
                  {candidate.resume.name.charAt(0).toUpperCase()}
                </div>
                <h3>{candidate.resume.name}</h3>
              </div>
              <div className="candidate-details">
                <p><span>Score: {candidate.score}%</span></p>
                <p><span>Experience: {candidate.resume.fullText.match(/(\d+)\+ years/)?.[1] || 'N/A'} years</span></p>
                <p><span>Key Strength: {candidate.analysis?.keyStrengths?.[0]?.strength || 'N/A'}</span></p>
                <p><span>Phone: {candidate.resume.phoneNumber || 'N/A'}</span></p>
                <p><span>Email: {candidate.resume.email || 'N/A'}</span></p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompareView;
