import React, { useState, useEffect } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { managerService } from '../../services/api';
import './UserManagement.css';
import { debounce } from 'lodash';

const UserManagement = () => {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        setLoading(true);
        const response = await managerService.getAllManagers();
        if (response.success) {
          setManagers(response.data.managers || []);
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError('Failed to fetch managers');
      } finally {
        setLoading(false);
      }
    };

    fetchManagers();
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

  const filteredManagers = managers.filter(manager => {
    if (!debouncedSearchTerm) return true;
    const searchLower = debouncedSearchTerm.toLowerCase();
    return (
      manager.username.toLowerCase().includes(searchLower) ||
      manager.email.toLowerCase().includes(searchLower)
    );
  });

  const highlightMatch = (text, search) => {
    if (!search || !text) return text;
    const parts = text.split(new RegExp(`(${search})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === search.toLowerCase() ? <mark key={index}>{part}</mark> : part
    );
  };

  return (
    <div className="user-management-container">
      <h2 className="user-management-title">User Management</h2>
      <div className="user-management-card">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search by username or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
        </div>
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Account Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredManagers.map((manager) => (
                    <tr key={manager.userId}>
                      <td>{highlightMatch(manager.username, debouncedSearchTerm)}</td>
                      <td>{highlightMatch(manager.email, debouncedSearchTerm)}</td>
                      <td>
                        <span className={`badge rounded-pill bg-${manager.accountStatus === 'Active' ? 'success' : 'warning'}`}>
                          {manager.accountStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredManagers.length === 0 && (
              <div className="text-center py-4 text-muted">
                No managers found
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
