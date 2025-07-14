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
    <div className="user-management-page">
      <div className="user-management-header">
        <h1>User Management</h1>
      </div>
      <div className="user-management-content">
        <div className="search-filter-container">
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search by username or email..."
              aria-label="Search Users"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
          </div>
        </div>
        <div className="user-management-list">
          <div className="user-management-list-header">
            <h2>Users <span className="user-count">{filteredManagers.length}</span></h2>
          </div>
          <div className="user-management-table-container">
            {loading ? (
              <div className="loader-container">
                <div className="loader"></div>
                <span>Loading users...</span>
              </div>
            ) : error ? (
              <Alert variant="danger">{error}</Alert>
            ) : (
              <table className="user-management-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Employee ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Account Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredManagers.map((manager) => (
                    <tr key={manager.userId} className="user-row">
                      <td>{manager.userId}</td>
                      <td>{manager.employeeId || '-'}</td>
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
            )}
            {!loading && filteredManagers.length === 0 && (
              <div className="no-users-message">
                <div>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 8C15 10.2091 13.2091 12 11 12C8.79086 12 7 10.2091 7 8C7 5.79086 8.79086 4 11 4C13.2091 4 15 5.79086 15 8Z" stroke="#059669" strokeWidth="2" />
                    <path d="M3 20C3 16.6863 6.58172 14 11 14C15.4183 14 19 16.6863 19 20" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
                    <path d="M19 4L23 8M23 4L19 8" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <div>No users found matching your search criteria.</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
