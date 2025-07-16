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
  const stages = {
    'New Applications': { count: 4, color: '#6366F1' },
    'Screening (HR Review)': { count: 2, color: '#F97316' },
    'Technical Interview': { count: 4, color: '#F59E0B' },
    'Final Interview': { count: 3, color: '#3B82F6' }
  };

  return (
    <div className="interview-management">
      <div className="header">
        <div className="left-controls">
          <div className="control">
            <i className="fas fa-columns"></i>
            Kanban view
          </div>
          <div className="control">
            <i className="fas fa-star"></i>
            Select score range
          </div>
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
                switch(stage) {
                  case 'New Applications':
                    candidates = dummyData.list[0].candidates;
                    break;
                  case 'Screening (HR Review)':
                    candidates = dummyData.list[1].candidates;
                    break;
                  case 'Technical Interview':
                    candidates = dummyData.list[0].candidates.filter(c => c.status === 'COMPLETED');
                    break;
                  case 'Final Interview':
                    candidates = dummyData.list[1].candidates.filter(c => c.status === 'COMPLETED');
                    break;
                  default:
                    candidates = [];
                }
                
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
                          <span>{Math.floor(Math.random() * (98 - 80 + 1)) + 80}%</span>
                          {stage === 'New Applications' ? (
                            <span className="portfolio-tag">Portfolio Submitted</span>
                          ) : (
                            <span className={Math.random() > 0.5 ? "urgent-tag" : "not-urgent-tag"}>
                              {Math.random() > 0.5 ? "Urgent" : "Not Urgent"}
                            </span>
                          )}
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
