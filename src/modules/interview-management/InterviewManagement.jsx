import React from 'react';
import { dummyData } from './Dummydata';
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
  const stageColors = ['#6366F1', '#F97316', '#F59E0B', '#3B82F6'];
  
  const stages = dummyData.list.reduce((acc, round, index) => {
    acc[round.roundName] = {
      count: round.candidates.length,
      color: stageColors[index],
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

      <div className="kanban-board">
        {Object.entries(stages).map(([stage, { count, color }]) => (
          <div key={stage} className="kanban-column">
            <div className="column-header">
              <div className="stage-info">
                <span className="stage-dot" style={{ backgroundColor: color }}></span>
                <span className="stage-name">{stage}</span>
                <span className="stage-count">{count}</span>
              </div>
            </div>
            <div className="column-content">
              {(() => {
                let candidates = [];
                const roundData = dummyData.list.find(round => round.roundName === stage);
                candidates = roundData ? roundData.candidates : [];
                
                return candidates.map(candidate => (
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
                        <span>{stage === 'New Applications' ? 'Resume Score' : 'Overall Score'}</span>
                        <div className="score-value">
                          <span>{candidate.score}%</span>
                          <span className={candidate.status === 'COMPLETED' ? "urgent-tag" : "not-urgent-tag"}>
                            {candidate.status === 'COMPLETED' ? "Completed" : "Pending"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InterviewManagement;
