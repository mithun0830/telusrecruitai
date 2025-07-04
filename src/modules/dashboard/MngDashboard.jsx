import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faClipboardCheck,
  faUserTie
} from '@fortawesome/free-solid-svg-icons';
import './MngDashboard.css';

const MngDashboard = () => {
  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Manager Dashboard</h1>
      </div>
      <div className="dashboard-content">
        <div className="dashboard-summary">
          <div className="summary-card">
            <FontAwesomeIcon icon={faUsers} className="summary-icon" />
            <div className="summary-details">
              <h3>Team Members</h3>
              <p className="summary-value">8</p>
            </div>
          </div>
          <div className="summary-card">
            <FontAwesomeIcon icon={faUserTie} className="summary-icon" />
            <div className="summary-details">
              <h3>Active Projects</h3>
              <p className="summary-value">3</p>
            </div>
          </div>
          <div className="summary-card">
            <FontAwesomeIcon icon={faClipboardCheck} className="summary-icon" />
            <div className="summary-details">
              <h3>Tasks Completed</h3>
              <p className="summary-value">15</p>
            </div>
          </div>
        </div>
        <div className="team-performance">
          <h2>Team Performance</h2>
          <table className="performance-table">
            <thead>
              <tr>
                <th>Team Member</th>
                <th>Projects</th>
                <th>Tasks Completed</th>
                <th>Performance Score</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>John Doe</td>
                <td>2</td>
                <td>5</td>
                <td>
                  <div className="performance-indicator" style={{width: '85%'}} title="85/100"></div>
                </td>
              </tr>
              <tr>
                <td>Jane Smith</td>
                <td>1</td>
                <td>7</td>
                <td>
                  <div className="performance-indicator" style={{width: '92%'}} title="92/100"></div>
                </td>
              </tr>
              <tr>
                <td>Bob Johnson</td>
                <td>3</td>
                <td>3</td>
                <td>
                  <div className="performance-indicator" style={{width: '78%'}} title="78/100"></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MngDashboard;
