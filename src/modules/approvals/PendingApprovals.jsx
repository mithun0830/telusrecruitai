import React, { useState, useEffect } from 'react';
import { userService } from '../../services/api';

const PendingApprovals = () => {
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const handleApprove = async (userId) => {
    try {
      setLoading(true);
      setError('');
      const response = await userService.approveUser(userId);
      if (response.success) {
        // Refresh the list after successful approval
        await fetchPendingApprovals();
      } else {
        setError('Failed to approve user');
      }
    } catch (err) {
      setError('An error occurred while approving user');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingApprovals = async () => {
    try {
      const response = await userService.getPendingApprovals();
      if (response.success) {
        setPendingApprovals(response.data);
      } else {
        setError('Failed to fetch pending approvals');
      }
    } catch (err) {
      setError('An error occurred while fetching pending approvals');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Pending Approvals</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {pendingApprovals.length === 0 ? (
        <p>No pending approvals</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingApprovals.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.firstName}</td>
                <td>{user.lastName}</td>
                <td>{new Date(user.createdAt).toLocaleString()}</td>
                <td>
                  <button 
                    className="btn btn-success btn-sm me-2" 
                    onClick={() => handleApprove(user.id)}
                    disabled={loading}
                  >
                    {loading ? 'Approving...' : 'Approve'}
                  </button>
                  <button className="btn btn-danger btn-sm">Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PendingApprovals;
