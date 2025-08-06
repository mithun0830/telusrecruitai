import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { interviewService } from '../../services/api';
import './ShortlistedCandidates.css';
import Loader from '../../components/Loader';

const ShortlistedCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const currentUserId = useSelector(state => state.auth.user?.id);

  useEffect(() => {
    const fetchShortlistedCandidates = async () => {
      if (!currentUserId) return;
      
      try {
        setIsLoading(true);
        const response = await interviewService.getShortlistedCandidates(currentUserId);
        console.log('Shortlisted candidates response:', response);
        if (response.success && Array.isArray(response.data)) {
          setCandidates(response.data);
        } else {
          setError(response.message || 'Failed to fetch shortlisted candidates');
        }
      } catch (err) {
        setError('An error occurred while fetching shortlisted candidates');
        console.error('Error fetching shortlisted candidates:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShortlistedCandidates();
  }, [currentUserId]);

  const groupedCandidates = candidates.reduce((acc, candidate) => {
    if (!acc[candidate.roundName]) {
      acc[candidate.roundName] = [];
    }
    acc[candidate.roundName].push(candidate);
    return acc;
  }, {});

  const filteredCandidates = filter === 'all' 
    ? groupedCandidates 
    : Object.fromEntries(
        Object.entries(groupedCandidates).map(([round, candidates]) => [
          round,
          candidates.filter(c => c.status.toLowerCase() === filter)
        ])
      );

  if (isLoading) {
    return <Loader isVisible={true} />;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="shortlisted-candidates-page">
      <h1>Shortlisted Candidates</h1>
      <div className="filter-controls">
        <label>
          Filter by status:
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </label>
      </div>
      <p>Total shortlisted candidates: {candidates.length}</p>
      {Object.keys(filteredCandidates).length === 0 ? (
        <p>No shortlisted candidates found.</p>
      ) : (
        Object.entries(filteredCandidates).map(([round, roundCandidates]) => (
          <div key={round} className="round-section">
            <h2>{round}</h2>
            <div className="candidates-grid">
              {roundCandidates.map((candidate) => (
                <div key={candidate.candidateId} className="candidate-card">
                  <h3>{candidate.candidateName}</h3>
                  <p>Round: {candidate.roundName}</p>
                  <p className={`status-badge ${candidate.status.toLowerCase()}`}>
                    Status: {candidate.status}
                  </p>
                  {candidate.feedback && (
                    <p>Feedback: {candidate.feedback}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ShortlistedCandidates;
