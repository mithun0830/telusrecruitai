import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faUserPlus, faSearch, faFilter, faExclamationTriangle, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { Modal, Button, Form, Alert, Dropdown } from 'react-bootstrap';
import './Approvals.css';

const Approvals = () => {
  const [approvals, setApprovals] = useState([
    { id: 'USR_1001', name: 'John Doe', position: 'Manager', status: 'Pending', date: '2025-06-30', email: 'john.doe@telus.com' },
    { id: 'USR_1002', name: 'Jane Smith', position: 'Manager', status: 'Pending', date: '2025-06-30', email: 'jane.smith@telus.com' },
    { id: 'USR_1003', name: 'Mike Johnson', position: 'Manager', status: 'Pending', date: '2025-06-29', email: 'mike.johnson@telus.com' },
    { id: 'USR_1004', name: 'Emily Brown', position: 'Manager', status: 'Pending', date: '2025-06-29', email: 'emily.brown@telus.com' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showRejectError, setShowRejectError] = useState(false);

  const handleApprove = (id) => {
    if (window.confirm('Are you sure you want to approve this request?')) {
      setApprovals(approvals.map(approval => 
        approval.id === id ? {...approval, status: 'Approved'} : approval
      ));
      console.log(`Approved user with id: ${id}`);
    }
  };

  const handleReject = (id) => {
    setSelectedUserId(id);
    setShowRejectModal(true);
    setShowRejectError(false);
    setRejectReason('');
  };

  const confirmReject = () => {
    if (!rejectReason.trim()) {
      setShowRejectError(true);
      return;
    }
    setApprovals(approvals.map(approval => 
      approval.id === selectedUserId ? {...approval, status: 'Rejected', rejectReason} : approval
    ));
    console.log(`Rejected user with id: ${selectedUserId}. Reason: ${rejectReason}`);
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
    const matchesSearch = approval.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         approval.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         approval.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || approval.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const selectedUser = approvals.find(approval => approval.id === selectedUserId);

  return (
    <div className="container-fluid">
      <section className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">Approvals</h2>
          <button className="btn btn-primary">
            <FontAwesomeIcon icon={faUserPlus} className="me-2" />
            CREATE NEW APPROVAL
          </button>
        </div>

        <div className="card shadow">
          <div className="card-body">
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <FontAwesomeIcon icon={faSearch} className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by name, email, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-3">
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <FontAwesomeIcon icon={faFilter} className="text-muted" />
                  </span>
                  <select
                    className="form-select"
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
                      <td className="fw-bold text-muted">{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.position}</td>
                      <td>{new Date(user.date).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${user.status === 'Pending' ? 'bg-warning' : user.status === 'Approved' ? 'bg-success' : 'bg-danger'}`}>
                          {user.status}
                        </span>
                      </td>
                      <td>
                        {user.status === 'Pending' && (
                          <Dropdown align="end">
                            <Dropdown.Toggle variant="link" className="btn-no-arrow p-0">
                              <FontAwesomeIcon icon={faEllipsisV} className="text-muted" />
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item onClick={() => handleApprove(user.id)}>
                                <FontAwesomeIcon icon={faCheck} className="me-2 text-success" />
                                Approve
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => handleReject(user.id)}>
                                <FontAwesomeIcon icon={faTimes} className="me-2 text-danger" />
                                Reject
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
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
              {filteredApprovals.length === 0 && (
                <div className="text-center py-4 text-muted">
                  No approval requests found
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

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
