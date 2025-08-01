import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import './ManagerDetailsDialog.css';

const ManagerDetailsDialog = ({ manager, show, onHide }) => {
  if (!manager) return null;

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Modal show={show} onHide={onHide} dialogClassName="manager-dialog">
      <Modal.Header closeButton>
        <span className="visually-hidden">Close</span>
      </Modal.Header>
      <Modal.Body>
        <div className="profile-header">
          <div className="profile-avatar">
            {getInitials(manager.fullName)}
          </div>
        </div>
        <div className="profile-content">
          <h2 className="profile-name">{manager.fullName}</h2>
          <p className="profile-title">{manager.designation} • {manager.department}</p>
          <div className="info-container">
            <div className="info-item">
              <div className="info-label">Email</div>
              <div className="info-value">{manager.email}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Phone</div>
              <div className="info-value">{manager.phoneNumber}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Region</div>
              <div className="info-value">{manager.region}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Business Unit</div>
              <div className="info-value">{manager.businessUnit}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Role</div>
              <div className="info-value">{manager.role}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Status</div>
              <div className="info-value">
                <span className="status-tag">Active</span>
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" className="btn-cancel" onClick={onHide}>Cancel</Button>
        <Button variant="primary">Request changes</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ManagerDetailsDialog;
