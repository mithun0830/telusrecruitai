import React, { useState, useEffect } from 'react';
import { interviewService, aiFeedbackService } from '../../services/api';
import { useSelector } from 'react-redux';
import InterviewHistoryModal from '../interview-management/InterviewHistoryModal';
import InterviewTimeline from '../../components/InterviewTimeline';
import InterviewProgressBar from '../../components/InterviewProgressBar';
import './ShortlistedCandidates.css';
import { Modal, Button } from 'react-bootstrap';

const ROUNDS = [
  { roundNumber: 1, name: 'New Application' },
  { roundNumber: 2, name: 'HR Screening' },
  { roundNumber: 3, name: 'Technical Round 1' },
  { roundNumber: 4, name: 'Technical Round 2' }
];

const CandidateCard = ({ candidate, onViewDetails, interviewRounds, onSaveFeedback }) => {
  const handleRoundClick = (roundInfo, e) => {
    e.stopPropagation();
    if (roundInfo && roundInfo.status !== 'completed') {
      onViewDetails(candidate, roundInfo);
    }
  };

  const handleCardClick = () => {
    onViewDetails(candidate);
  };
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'selected':
        return 'status-completed';
      case 'in progress':
        return 'status-in-progress';
      case 'rejected':
        return 'status-rejected';
      default:
        return 'status-pending';
    }
  };
  
  const getCurrentRound = () => {
    if (!candidate.interviewHistory || candidate.interviewHistory.length === 0) {
      return { roundNumber: 1, roundName: 'New Application', status: 'in progress' };
    }
    return candidate.interviewHistory[candidate.interviewHistory.length - 1];
  };

  const currentRound = getCurrentRound();

  const getDisplayStatus = (status) => {
    if (status?.toLowerCase() === 'selected') return 'Selected';
    if (status?.toLowerCase() === 'completed') return 'Completed';
    return status || 'Pending';
  };

  return (
    <div className="candidate-card" onClick={handleCardClick}>
      <div className="candidate-header">
        <h3 className="candidate-name">{candidate.name || ''}</h3>
        <div className={`status-badge ${getStatusClass(currentRound?.status)}`}>
          {getDisplayStatus(currentRound?.status)}
        </div>
      </div>
      <div className="floating-progress-bar">
        <InterviewProgressBar
          currentRound={candidate.currentRound}
          interviewHistory={candidate.interviewHistory}
          onRoundClick={handleRoundClick}
        />
      </div>
    </div>
  );
};

const ShortlistedCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedRound, setSelectedRound] = useState(null);
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
      
      // Ensure we're setting an array of candidates
      if (Array.isArray(response)) {
        setCandidates(response);
      } else if (response && typeof response === 'object') {
        // If it's an object, it might be wrapped in a data property
        setCandidates(response.data || []);
      } else {
        setCandidates([]);
      }
      
      console.log('Set candidates:', candidates);
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

  const handleViewDetails = (candidate, roundInfo = null) => {
    setSelectedCandidate(candidate);
    setSelectedRound(roundInfo);
    setIsModalOpen(true);
  };

  const handleCloseModal = (success = false, meetingLink = null) => {
    setIsModalOpen(false);
    setSelectedRound(null);
    if (success) {
      fetchShortlistedCandidates(); // Refresh the candidates list
    }
  };

  const handleSaveFeedback = async (candidateId, roundId, feedback) => {
    try {
      const feedbackData = {
        candidateId,
        roundId,
        feedback,
        status: 'completed'
      };
      await interviewService.saveFeedback(feedbackData);
      fetchShortlistedCandidates(); // Refresh the list after saving feedback
    } catch (error) {
      console.error('Error saving feedback:', error);
      setError('Failed to save feedback');
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
        <h2>My Candidates</h2>
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
      
      {loading ? (
        <div className="loading-container">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : candidates.length === 0 ? (
        <div className="no-candidates">
          <p>No shortlisted candidates found.</p>
        </div>
      ) : (
        <div className="candidates-grid">
          {candidates
            .filter(candidate => 
              candidate.name?.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((candidate) => (
            <CandidateCard 
              key={candidate.candidateId} 
              candidate={candidate} 
              onViewDetails={handleViewDetails}
              interviewRounds={interviewRounds}
              onSaveFeedback={handleSaveFeedback}
            />
          ))}
        </div>
      )}

    </div>
  );
};

export default ShortlistedCandidates;
