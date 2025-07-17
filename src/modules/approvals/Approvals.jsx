import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faUserPlus, faSearch, faFilter, faExclamationTriangle, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { Modal, Button, Form, Dropdown } from 'react-bootstrap';
import { userService } from '../../services/api';
import './Approvals.css';
import { debounce } from 'lodash';

const Approvals = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
const [showOverlay, setShowOverlay] = useState(false);
const [overlayAction, setOverlayAction] = useState('');
const [reviewComment, setReviewComment] = useState('');
const [selectedUser, setSelectedUser] = useState(null);
const [showCommentError, setShowCommentError] = useState(false);
const [dropdownOpen, setDropdownOpen] = useState({});

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown')) {
        setDropdownOpen({});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      const response = await userService.getPendingApprovals();
      if (response.success) {
        setApprovals(response.data.map(user => ({
          id: user.id,
          name: user.fullName,
          position: 'Manager',
          status: 'Pending',
          date: user.createdAt,
          email: user.email
        })));
      } else {
        setError('Failed to fetch pending approvals');
      }
    } catch (err) {
      setError('An error occurred while fetching pending approvals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const handleSearch = () => {
    setActiveSearchTerm(searchTerm);
  };

  const handleAction = (id, action) => {
    const user = approvals.find(approval => approval.id === id);
    setSelectedUser(user);
    setOverlayAction(action);
    setShowOverlay(true);
    setShowCommentError(false);
    setReviewComment('');
  };

  const confirmAction = async () => {
    if (!reviewComment.trim()) {
      setShowCommentError(true);
      return;
    }
    try {
      let response;
      if (overlayAction === 'approve') {
        response = await userService.approveUser(selectedUser.id, reviewComment);
      } else {
        response = await userService.rejectUser(selectedUser.id, reviewComment);
      }
      if (response.success) {
        setApprovals(prevApprovals => 
          prevApprovals.map(approval => 
            approval.id === selectedUser.id ? {...approval, status: overlayAction === 'approve' ? 'Approved' : 'Rejected', reviewComment} : approval
          )
        );
      }
    } catch (error) {
      console.error(`An error occurred while ${overlayAction}ing the user:`, error);
    }
    setShowOverlay(false);
    setSelectedUser(null);
    setReviewComment('');
    setShowCommentError(false);
  };

  const handleOverlayClose = () => {
    setShowOverlay(false);
    setReviewComment('');
    setSelectedUser(null);
    setShowCommentError(false);
  };

  const filteredApprovals = approvals.filter(approval => {
      if (!activeSearchTerm) return true;
      const searchLower = activeSearchTerm.toLowerCase();
      const matchesSearch = 
        (approval.name && String(approval.name).toLowerCase().includes(searchLower)) ||
        (approval.email && String(approval.email).toLowerCase().includes(searchLower));
      const matchesStatus = selectedStatus === 'all' || approval.status.toLowerCase() === selectedStatus.toLowerCase();
      return matchesSearch && matchesStatus;
    });

  const highlightMatch = (text, search) => {
    if (!search || !text) return text;
    const textStr = String(text);
    const parts = textStr.split(new RegExp(`(${search})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === search.toLowerCase() ? <mark key={index}>{part}</mark> : part
    );
  };

  return (
    <div className="approvals-page">
      <h1 className="approvals-title">Approvals</h1>
      <div className="search-filter-container">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          <div 
            className="search-icon-wrapper"
            onClick={handleSearch}
            role="button"
            tabIndex={0}
          >
            <FontAwesomeIcon 
              icon={faSearch} 
              className="search-icon"
            />
          </div>
        </div>
        <div className="filter-container">
          <select
            className="filter-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>
      <div className="approvals-content">
        <h2 className="approvals-list-header">Approval Requests <span className="approval-count">{filteredApprovals.length}</span></h2>
        <div className="approvals-table-container">
          {loading ? (
            <div className="loader-container">
              <div className="loader"></div>
              <span>Loading approvals...</span>
            </div>
          ) : error ? (
            <div className="error-message">
              <FontAwesomeIcon icon={faTimes} className="error-icon" />
              {error}
            </div>
          ) : filteredApprovals.length === 0 ? (
            <div className="no-approvals-message">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 8C15 10.2091 13.2091 12 11 12C8.79086 12 7 10.2091 7 8C7 5.79086 8.79086 4 11 4C13.2091 4 15 5.79086 15 8Z" stroke="#059669" strokeWidth="2" />
                <path d="M3 20C3 16.6863 6.58172 14 11 14C15.4183 14 19 16.6863 19 20" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
                <path d="M19 4L23 8M23 4L19 8" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <div>No approval requests found matching your search criteria.</div>
            </div>
          ) : (
            <table className="approvals-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Position</th>
                  <th>Request Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApprovals.map((user) => (
                  <tr key={user.id} className="approval-row">
                    <td>{user.id}</td>
                    <td>{highlightMatch(user.name, activeSearchTerm)}</td>
                    <td>{highlightMatch(user.email, activeSearchTerm)}</td>
                    <td>{user.position}</td>
                    <td>{new Date(user.date).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${user.status === 'Pending' ? 'bg-warning' : user.status === 'Approved' ? 'bg-success' : 'bg-danger'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>
                      {user.status === 'Pending' && (
                        <div className="action-buttons">
                          <button 
                            className="btn btn-success btn-sm" 
                            onClick={() => handleAction(user.id, 'approve')}
                          >
                            <FontAwesomeIcon icon={faCheck} />
                            Approve
                          </button>
                          <button 
                            className="btn btn-danger btn-sm" 
                            onClick={() => handleAction(user.id, 'reject')}
                          >
                            <FontAwesomeIcon icon={faTimes} />
                            Reject
                          </button>
                        </div>
                      )}
                      {(user.status === 'Rejected' || user.status === 'Approved') && user.reviewComment && (
                        <span className="review-comment" title={user.reviewComment}>
                          Comments: {user.reviewComment.substring(0, 20)}...
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal 
        show={showOverlay} 
        onHide={handleOverlayClose}
        centered
        size="lg"
        className="overlay-modal"
      >
        <Modal.Header 
          closeButton 
          className={`overlay-header ${overlayAction === 'approve' ? 'overlay-header-approve' : 'overlay-header-reject'}`}
        >
          <Modal.Title className="overlay-title">
            <FontAwesomeIcon 
              icon={overlayAction === 'approve' ? faCheck : faTimes} 
              className="overlay-title-icon"
            />
            {overlayAction === 'approve' ? 'Approve' : 'Reject'} Request
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="overlay-body">
          {selectedUser && (
            <div className="overlay-user-info">
              <p className="overlay-user-title">
                You are about to {overlayAction} the request for:
              </p>
              <div className="overlay-user-details">
                <p className="overlay-user-detail-row">
                  <strong className="overlay-user-detail-label">Name:</strong> 
                  <span>{selectedUser.name}</span>
                </p>
                <p className="overlay-user-detail-row">
                  <strong className="overlay-user-detail-label">Email:</strong> 
                  <span>{selectedUser.email}</span>
                </p>
                <p className="overlay-user-detail-row">
                  <strong className="overlay-user-detail-label">Position:</strong> 
                  <span>{selectedUser.position}</span>
                </p>
              </div>
            </div>
          )}
          <Form.Group>
            <Form.Label className="overlay-comments-label">
              Review Comments <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={reviewComment}
              onChange={(e) => {
                setReviewComment(e.target.value);
                setShowCommentError(false);
              }}
              placeholder={`Please provide ${overlayAction === 'approve' ? 'approval' : 'rejection'} comments...`}
              isInvalid={showCommentError}
              className="overlay-comments-textarea"
            />
            {showCommentError && (
              <div className="overlay-error-message">
                Please provide review comments before proceeding.
              </div>
            )}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="overlay-footer">
          <Button 
            variant="light" 
            onClick={handleOverlayClose}
            className="overlay-button overlay-button-cancel"
          >
            Cancel
          </Button>
          <Button 
            variant={overlayAction === 'approve' ? 'success' : 'danger'} 
            onClick={confirmAction}
            className={`overlay-button overlay-button-confirm ${overlayAction === 'approve' ? 'overlay-button-confirm-approve' : 'overlay-button-confirm-reject'}`}
          >
            Confirm {overlayAction === 'approve' ? 'Approval' : 'Rejection'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Approvals;
