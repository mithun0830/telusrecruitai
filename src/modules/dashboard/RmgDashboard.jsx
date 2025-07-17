import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faBriefcase, 
  faClipboardCheck, 
  faChartLine 
} from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';
import { managerService } from '../../services/api';
import './MngDashboard.css';

const RmgDashboard = () => {
  const user = useSelector((state) => state.auth.user);
  const [managerData, setManagerData] = useState({
    totalManagers: 0,
    activeManagers: 0,
    pendingManagers: 0
  });

  useEffect(() => {
    const fetchManagerData = async () => {
      try {
        const response = await managerService.getManagerStats();
        if (response.success) {
          setManagerData(response.data);
        } else {
          console.error('Error fetching manager data:', response.message);
        }
      } catch (error) {
        console.error('Error fetching manager data:', error);
      }
    };

    fetchManagerData();
  }, []);
  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>RMG Dashboard</h1>
      </div>
      <div className="dashboard-content">
        <div className="dashboard-summary">
          <div className="summary-card">
            <FontAwesomeIcon icon={faUsers} className="summary-icon" />
            <div className="summary-details">
              <h3>Total Managers</h3>
              <p className="summary-value">{managerData.totalManagers}</p>
            </div>
          </div>
          <div className="summary-card">
            <FontAwesomeIcon icon={faBriefcase} className="summary-icon" />
            <div className="summary-details">
              <h3>Active Managers</h3>
              <p className="summary-value">{managerData.activeManagers}</p>
            </div>
          </div>
          <div className="summary-card">
            <FontAwesomeIcon icon={faClipboardCheck} className="summary-icon" />
            <div className="summary-details">
              <h3>Pending Managers</h3>
              <p className="summary-value">{managerData.pendingManagers}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RmgDashboard;
