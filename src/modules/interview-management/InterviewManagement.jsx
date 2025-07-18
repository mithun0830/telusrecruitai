import React, { useState, useEffect } from 'react';
import { interviewService } from '../../services/api';
import InterviewHistoryModal from './InterviewHistoryModal';
import './InterviewManagement.css';

const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const InterviewManagement = () => {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [interviewRounds, setInterviewRounds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const stageColors = ['#6366F1', '#F97316', '#F59E0B', '#3B82F6'];

  useEffect(() => {
    const fetchInterviewRounds = async () => {
      try {
        setIsLoading(true);
        const response = await interviewService.getInterviewRounds();
        const sortedRounds = response.data.list.sort((a, b) => a.roundId - b.roundId);
        setInterviewRounds(sortedRounds);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to fetch interview rounds');
        setIsLoading(false);
      }
    };

    fetchInterviewRounds();
  }, []);

  const handleStatusClick = (candidate) => {
    setSelectedCandidate({
      history: candidate.interviewHistory,
      dateTime: candidate.interviewDateTime
    });
    setIsModalOpen(true);
  };
  
  const stages = interviewRounds.reduce((acc, round, index) => {
    acc[round.roundName] = {
      count: round.candidates.length,
      color: stageColors[index % stageColors.length],
      roundId: round.roundId
    };
    return acc;
  }, {});

  return (
    <div className="interview-management">
      <div className="header">
        <div className="left-controls">
          <div className="control">
            <i className="fas fa-th"></i>
            All stages
          </div>
          <div className="control">
            <i className="fas fa-filter"></i>
            More filters
          </div>
        </div>
        <div className="right-controls">
          <div className="sort">
            Sort by:
            <select>
              <option>Stage</option>
            </select>
          </div>
          <div className="search">
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Search candidate" />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <p className="loading-text">Loading interview rounds...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p>Error: {error}</p>
        </div>
      ) : (
        <div className="kanban-board">
          {interviewRounds.map((round) => (
            <div key={round.roundId} className="kanban-column">
              <div className="column-header">
                <div className="stage-info">
                  <span className="stage-dot" style={{ backgroundColor: stages[round.roundName].color }}></span>
                  <span className="stage-name">{round.roundName}</span>
                  <span className="stage-count">{round.candidates.length}</span>
                </div>
              </div>
              <div className="column-content">
                {round.candidates.map(candidate => (
                  <div key={candidate.candidateId} className="candidate-card">
                    <div className="card-header">
                      <div className="candidate-info">
                        <div 
                          className="avatar" 
                          style={{
                            backgroundColor: getRandomColor(),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        >
                          {getInitials(candidate.name)}
                        </div>
                          <div>
                            <h3>{candidate.name}</h3>
                            <p>Applied at {new Date(candidate.interviewDateTime).toLocaleDateString()}</p>
                          </div>
                      </div>
                      <button className="more-options">...</button>
                    </div>
                    <div className="card-content">
                      <div className="score-section">
                        <span className="manager-info">Manager: {candidate.manager ? candidate.manager.fullName : 'RMG Admin'}</span>
                        <span>{round.roundName === 'New Applications' ? 'Resume Score' : 'Overall Score'}</span>
                        <div className="score-value">
                          <span>{candidate.score}%</span>
                          <span 
                            className={candidate.status === 'COMPLETED' ? "urgent-tag" : "not-urgent-tag"}
                            onClick={() => handleStatusClick(candidate)}
                            style={{ cursor: 'pointer' }}
                          >
                            {candidate.status === 'COMPLETED' ? "Completed" : "Pending"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <InterviewHistoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        candidateHistory={selectedCandidate || []}
      />
    </div>
  );
};

export default InterviewManagement;
