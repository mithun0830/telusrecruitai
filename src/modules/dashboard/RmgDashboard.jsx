import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faBriefcase, 
  faClipboardCheck, 
  faChartLine 
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import './MngDashboard.css';

const RmgDashboard = () => {
  const { user } = useAuth();
  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Hello {user?.username}</h1>
      </div>
      <div className="dashboard-content">
        <div className="dashboard-summary">
          <div className="summary-card">
            <FontAwesomeIcon icon={faUsers} className="summary-icon" />
            <div className="summary-details">
              <h3>Active Candidates</h3>
              <p className="summary-value">25</p>
            </div>
          </div>
          <div className="summary-card">
            <FontAwesomeIcon icon={faBriefcase} className="summary-icon" />
            <div className="summary-details">
              <h3>Filled Positions</h3>
              <p className="summary-value">8</p>
            </div>
          </div>
          <div className="summary-card">
            <FontAwesomeIcon icon={faClipboardCheck} className="summary-icon" />
            <div className="summary-details">
              <h3>Interviews Scheduled</h3>
              <p className="summary-value">12</p>
            </div>
          </div>
        </div>
        <div className="team-performance">
          <div className="d-flex align-items-center mb-3">
            <FontAwesomeIcon icon={faChartLine} className="summary-icon" />
            <h2>Recruitment Progress</h2>
          </div>
          <p className="text-muted">Recruitment metrics and progress chart will be displayed here</p>
        </div>
      </div>
    </div>
  );
};

export default RmgDashboard;
