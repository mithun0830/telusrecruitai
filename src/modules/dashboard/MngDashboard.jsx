import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faChartLine,
  faClipboardCheck,
  faUserTie
} from '@fortawesome/free-solid-svg-icons';

const MngDashboard = () => {
  return (
    <div className="container-fluid">
      <h2 className="mb-4">Manager Dashboard</h2>
      <section className="mb-4">
        <div className="row">
          <div className="col-md-4 mb-3">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faUsers} className="text-primary me-3" size="2x" />
                  <div>
                    <h5 className="card-title">Team Members</h5>
                    <p className="card-text display-4">8</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faUserTie} className="text-success me-3" size="2x" />
                  <div>
                    <h5 className="card-title">Active Projects</h5>
                    <p className="card-text display-4">3</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faClipboardCheck} className="text-warning me-3" size="2x" />
                  <div>
                    <h5 className="card-title">Tasks Completed</h5>
                    <p className="card-text display-4">15</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="card">
          <div className="card-body">
            <div className="d-flex align-items-center mb-3">
              <FontAwesomeIcon icon={faChartLine} className="text-info me-3" size="2x" />
              <h5 className="card-title mb-0">Team Performance</h5>
            </div>
            <p className="text-muted">Performance metrics will be displayed here</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MngDashboard;
