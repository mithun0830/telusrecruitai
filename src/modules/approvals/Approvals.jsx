import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faUserPlus, faSearch, faFilter, faExclamationTriangle, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { Modal, Button, Form, Alert, Dropdown } from 'react-bootstrap';
import { userService } from '../../services/api';
import './Approvals.css';
import { debounce } from 'lodash';

const Approvals = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showRejectError, setShowRejectError] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState({});

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

  useEffect(() => {
    const debouncedSearch = debounce((value) => {
      setDebouncedSearchTerm(value);
    }, 300);

    debouncedSearch(searchTerm);

    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm]);

  const handleApprove = async (id) => {
    if (window.confirm('Are you sure you want to approve this request?')) {
      try {
        const response = await userService.approveUser(id);
        if (response.success) {
          setApprovals(prevApprovals => 
            prevApprovals.map(approval => 
              approval.id === id ? {...approval, status: 'Approved'} : approval
            )
          );
          alert('User approved successfully');
        } else {
          alert(`Failed to approve user: ${response.error}`);
        }
      } catch (error) {
        alert('An error occurred while approving the user');
      }
    }
  };

  const handleReject = (id) => {
    setSelectedUserId(id);
    setShowRejectModal(true);
    setShowRejectError(false);
    setRejectReason('');
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      setShowRejectError(true);
      return;
    }
    try {
      const response = await userService.rejectUser(selectedUserId, rejectReason);
      if (response.success) {
        setApprovals(prevApprovals => 
          prevApprovals.map(approval => 
            approval.id === selectedUserId ? {...approval, status: 'Rejected', rejectReason} : approval
          )
        );
        alert('User rejected successfully');
      } else {
        alert(`Failed to reject user: ${response.error}`);
      }
    } catch (error) {
      alert('An error occurred while rejecting the user');
    }
    setShowRejectModal(false);
    setRejectReason('');
    setSelectedUserId(null);
    setShowRejectError(false);
  };

  const handleModalClose = () => {
    setShowRejectModal(false);
    setRejectReason('');
    setSelectedUserId(null);
    setShowRejectError(false);
  };

  const filteredApprovals = approvals.filter(approval => {
      if (!debouncedSearchTerm) return true;
      const searchLower = debouncedSearchTerm.toLowerCase();
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

  const selectedUser = approvals.find(approval => approval.id === selectedUserId);

  return (
    <div className="approvals-container">
      <h2 className="approvals-title">Approvals</h2>
      <div className="approvals-card">
        {loading && <p className="loading-text">Loading approvals...</p>}
        {error && <Alert variant="danger">{error}</Alert>}
        {!loading && !error && (
          <>
            <div className="search-filter-container">
              <div className="search-container">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FontAwesomeIcon icon={faSearch} className="search-icon" />
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

            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Position</th>
                    <th>Request Date</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApprovals.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{highlightMatch(user.name, debouncedSearchTerm)}</td>
                      <td>{highlightMatch(user.email, debouncedSearchTerm)}</td>
                      <td>{user.position}</td>
                      <td>{new Date(user.date).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge rounded-pill ${user.status === 'Pending' ? 'bg-warning' : user.status === 'Approved' ? 'bg-success' : 'bg-danger'}`}>
                          {user.status}
                        </span>
                      </td>
                      <td>
                        {user.status === 'Pending' && (
                          <div className="d-flex justify-content-end">
                            <div className="dropdown">
                              <button 
                                className="btn btn-link p-0 border-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDropdownOpen(prev => {
                                    const newState = {};
                                    Object.keys(prev).forEach(key => {
                                      newState[key] = false;
                                    });
                                    newState[user.id] = !prev[user.id];
                                    return newState;
                                  });
                                }}
                              >
                                <FontAwesomeIcon icon={faEllipsisV} color="#6B7280" />
                              </button>
                              {dropdownOpen[user.id] && (
                                <div className="dropdown-menu show" style={{ position: 'absolute', right: 0 }}>
                                  <button 
                                    className="dropdown-item d-flex align-items-center"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleApprove(user.id);
                                      setDropdownOpen(prev => ({...prev, [user.id]: false}));
                                    }}
                                  >
                                    <FontAwesomeIcon icon={faCheck} className="me-2 text-success" />
                                    Approve
                                  </button>
                                  <button 
                                    className="dropdown-item d-flex align-items-center"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleReject(user.id);
                                      setDropdownOpen(prev => ({...prev, [user.id]: false}));
                                    }}
                                  >
                                    <FontAwesomeIcon icon={faTimes} className="me-2 text-danger" />
                                    Reject
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        {user.status === 'Rejected' && user.rejectReason && (
                          <span className="text-muted" title={user.rejectReason}>
                            Reason: {user.rejectReason.substring(0, 20)}...
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredApprovals.length === 0 && (
              <div className="text-center py-4 text-muted">
                No approval requests found
              </div>
            )}
          </>
        )}
      </div>

      <Modal show={showRejectModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-warning me-2" />
            Reject Approval Request
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <div className="mb-3">
              <p className="mb-1">You are about to reject the approval request for:</p>
              <div className="bg-light p-3 rounded">
                <p className="mb-1"><strong>Name:</strong> {selectedUser.name}</p>
                <p className="mb-1"><strong>Email:</strong> {selectedUser.email}</p>
                <p className="mb-0"><strong>Position:</strong> {selectedUser.position}</p>
              </div>
            </div>
          )}
          <Form.Group>
            <Form.Label>Rejection Reason <span className="text-danger">*</span></Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={rejectReason}
              onChange={(e) => {
                setRejectReason(e.target.value);
                setShowRejectError(false);
              }}
              placeholder="Please provide a detailed reason for rejection..."
              isInvalid={showRejectError}
            />
            {showRejectError && (
              <Alert variant="danger" className="mt-2 py-2">
                Please provide a reason for rejection before proceeding.
              </Alert>
            )}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmReject}>
            Reject Request
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Approvals;
