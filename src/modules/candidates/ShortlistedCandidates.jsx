import React, { useState, useEffect } from 'react';
import { interviewService } from '../../services/api';
import { useSelector } from 'react-redux';
import './ShortlistedCandidates.css';

const ShortlistedCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    fetchShortlistedCandidates();
  }, []);

  const fetchShortlistedCandidates = async () => {
    try {
      setLoading(true);
      const response = await interviewService.getShortlistedCandidates(user?.id);
      setCandidates(response);
    } catch (err) {
      console.error('Error fetching shortlisted candidates:', err);
      setError('Failed to fetch shortlisted candidates');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="shortlisted-candidates">
      <div className="header">
        <h2>Shortlisted Candidates</h2>
      </div>
      
      {candidates.length === 0 ? (
        <div className="no-candidates">
          <p>No shortlisted candidates found.</p>
        </div>
      ) : (
        <div className="candidates-grid">
          {candidates.map((candidate) => (
            <div key={candidate.candidateId} className="candidate-card">
              <div className="candidate-header">
                <h3>{candidate.candidateName || 'No Name'}</h3>
                <span className={`status-badge ${candidate.status.toLowerCase()}`}>
                  {candidate.status}
                </span>
              </div>
              <div className="candidate-info">
                <p><strong>Round:</strong> {candidate.roundName}</p>
                <p><strong>Feedback:</strong> {candidate.feedback && candidate.feedback.trim() !== '' ? candidate.feedback : 'No feedback yet'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShortlistedCandidates;
