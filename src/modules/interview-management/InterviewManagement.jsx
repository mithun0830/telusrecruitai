import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { interviewService } from '../../services/api';
import InterviewHistoryModal from './InterviewHistoryModal';
import './InterviewManagement.css';

const ItemTypes = {
  CANDIDATE: 'candidate'
};

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

const CandidateCard = ({ candidate, round, handleStatusClick, onDragEnd }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CANDIDATE,
    item: () => ({
      type: ItemTypes.CANDIDATE,
      candidateId: candidate?.candidateId,
      fromRound: round?.roundId,
      candidate: candidate
    }),
    canDrag: () => candidate && round && candidate.candidateId && round.roundId,
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (item?.candidateId && item?.fromRound && dropResult?.roundId) {
        onDragEnd(item.candidateId, item.fromRound, dropResult.roundId);
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className={`candidate-card ${isDragging ? 'is-dragging' : ''}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
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
  );
};

const KanbanColumn = ({ round, stages, handleStatusClick, onDrop }) => {
  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.CANDIDATE,
    drop: () => ({ roundId: round?.roundId }),
    canDrop: (item) => {
      return item?.fromRound !== round?.roundId && round?.roundId != null;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const columnStyle = {
    backgroundColor: isOver ? '#e2e8f0' : '#f1f5f9',
    transition: 'background-color 0.2s ease'
  };

  return (
    <div ref={drop} className="kanban-column" style={columnStyle}>
      <div className="column-header">
        <div className="stage-info">
          <span className="stage-dot" style={{ backgroundColor: stages[round.roundName].color }}></span>
          <span className="stage-name">{round.roundName}</span>
          <span className="stage-count">{round.candidates.length}</span>
        </div>
      </div>
      <div className="column-content">
        {round.candidates.map(candidate => (
          <CandidateCard
            key={candidate.candidateId}
            candidate={candidate}
            round={round}
            handleStatusClick={handleStatusClick}
            onDragEnd={onDrop}
          />
        ))}
      </div>
    </div>
  );
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
      candidateName: candidate.name,
      jobTitle: candidate.jobTitle || 'Software Engineer', // Add default or get from candidate object
      jobDepartment: candidate.department || 'Engineering', // Add default or get from candidate object
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

  const handleDrop = (candidateId, fromRoundId, toRoundId) => {
    if (!candidateId || !fromRoundId || !toRoundId || fromRoundId === toRoundId) return;

    setInterviewRounds(prevRounds => {
      const newRounds = [...prevRounds];
      const fromRoundIndex = newRounds.findIndex(r => r.roundId === fromRoundId);
      const toRoundIndex = newRounds.findIndex(r => r.roundId === toRoundId);
      
      if (fromRoundIndex === -1 || toRoundIndex === -1) return prevRounds;
      
      const candidateIndex = newRounds[fromRoundIndex].candidates.findIndex(c => c.candidateId === candidateId);
      if (candidateIndex === -1) return prevRounds;
      
      const [candidate] = newRounds[fromRoundIndex].candidates.splice(candidateIndex, 1);
      newRounds[toRoundIndex].candidates.push(candidate);
      
      return newRounds;
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
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
            <KanbanColumn
              key={round.roundId}
              round={round}
              stages={stages}
              handleStatusClick={handleStatusClick}
              onDrop={handleDrop}
            />
          ))}
        </div>
      )}
      <InterviewHistoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        candidateHistory={selectedCandidate || []}
      />
      </div>
    </DndProvider>
  );
};

export default InterviewManagement;
