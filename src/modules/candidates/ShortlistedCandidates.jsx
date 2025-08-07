import React, { useState, useEffect } from 'react';
import { interviewService } from '../../services/api';
import { useSelector } from 'react-redux';
import InterviewHistoryModal from '../interview-management/InterviewHistoryModal';
import InterviewTimeline from '../../components/InterviewTimeline';
import './ShortlistedCandidates.css';

const CandidateCard = ({ candidate, onViewDetails, interviewRounds }) => {
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="candidate-card">
      <div className="candidate-header">
        <div className="candidate-info">
          <div className="avatar">
            {getInitials(candidate.candidateName || 'No Name')}
          </div>
          <div className="candidate-details">
            <h3>{candidate.candidateName || 'No Name'}</h3>
          </div>
        </div>
      </div>
      <div className="candidate-timeline">
        <h4>Interview Process</h4>
        <InterviewTimeline history={candidate.history} />
      </div>
    </div>
  );
};

const ShortlistedCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [interviewRounds, setInterviewRounds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    fetchShortlistedCandidates();
    fetchInterviewRounds();
  }, []);

  const fetchShortlistedCandidates = async () => {
    try {
      setLoading(true);
      const response = await interviewService.getShortlistedCandidates(user?.id);
      console.log('Fetched candidates:', response);
      
      // Group candidates by candidateId
      const groupedCandidates = response.reduce((acc, curr) => {
        if (!acc[curr.candidateId]) {
          acc[curr.candidateId] = {
            ...curr,
            history: [],
            jobTitle: curr.jobTitle || 'Not specified',
            jobDepartment: curr.jobDepartment || 'Not specified',
            email: curr.email || 'Not available',
            resumeId: curr.resumeId || 'Not available'
          };
        }
        acc[curr.candidateId].history.push({
          roundId: curr.roundId,
          roundName: curr.roundName,
          status: curr.status,
          feedback: curr.feedback
        });
        return acc;
      }, {});

      // Convert the grouped object back to an array
      const transformedCandidates = Object.values(groupedCandidates);

      // Sort the history array for each candidate based on roundId
      transformedCandidates.forEach(candidate => {
        candidate.history.sort((a, b) => a.roundId - b.roundId);
      });

      console.log('Transformed candidates:', transformedCandidates);
      setCandidates(transformedCandidates);
    } catch (err) {
      console.error('Error fetching shortlisted candidates:', err);
      setError('Failed to fetch shortlisted candidates');
    } finally {
      setLoading(false);
    }
  };

  const fetchInterviewRounds = async () => {
    try {
      const response = await interviewService.getInterviewRounds();
      // Ensure we're setting an array
      setInterviewRounds(Array.isArray(response.data) ? response.data : []);
      console.log('Fetched interview rounds:', response.data);
    } catch (err) {
      console.error('Error fetching interview rounds:', err);
      setInterviewRounds([]); // Set empty array on error
    }
  };

  const handleViewDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
  };

  const handleCloseModal = (success = false, meetingLink = null) => {
    setIsModalOpen(false);
    if (success) {
      fetchShortlistedCandidates(); // Refresh the candidates list
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
        <div className="search-container">
          <input
            type="text"
            placeholder="Search candidates by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>
      
      {candidates.length === 0 ? (
        <div className="no-candidates">
          <p>No shortlisted candidates found.</p>
        </div>
      ) : (
        <div className="candidates-grid">
          {candidates
            .filter(candidate => 
              candidate.candidateName?.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((candidate) => (
            <CandidateCard 
              key={candidate.candidateId} 
              candidate={candidate} 
              onViewDetails={handleViewDetails}
              interviewRounds={interviewRounds}
            />
          ))}
        </div>
      )}

      {selectedCandidate && (
        <InterviewHistoryModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          candidateHistory={selectedCandidate}
          interviewRounds={interviewRounds}
          onUpdateSuccess={fetchShortlistedCandidates}
        />
      )}
    </div>
  );
};

export default ShortlistedCandidates;
