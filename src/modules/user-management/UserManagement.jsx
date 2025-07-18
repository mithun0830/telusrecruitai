import React, { useState, useEffect } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faLock, faLockOpen, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { managerService, authService } from '../../services/api';
import './UserManagement.css';
import { debounce } from 'lodash';

const UserManagement = () => {
  const aestheticColors = [
    '#3498db', // bright blue
    '#2ecc71', // emerald green
    '#e74c3c', // flat red
    '#f39c12', // orange
    '#9b59b6', // amethyst purple
    '#1abc9c', // turquoise
    '#34495e', // wet asphalt
    '#16a085', // green sea
    '#d35400', // pumpkin
    '#8e44ad', // wisteria
  ];

  const getAvatarColor = (userId) => {
    // Use userId to consistently get same color for each user
    const colorIndex = parseInt(userId) % aestheticColors.length;
    return aestheticColors[colorIndex];
  };

  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showConfirmOverlay, setShowConfirmOverlay] = useState(false);
  const [confirmAction, setConfirmAction] = useState({ type: '', userId: '', email: '' });

  const handleMoreOptionsClick = (userId) => {
    setActiveDropdown(activeDropdown === userId ? null : userId);
  };

  const handleConfirmAction = () => {
    if (confirmAction.type === 'block') {
      handleBlockUser(confirmAction.userId, confirmAction.email);
    } else if (confirmAction.type === 'unblock') {
      handleUnblockUser(confirmAction.userId, confirmAction.email);
    }
    setShowConfirmOverlay(false);
    setConfirmAction({ type: '', userId: '', email: '' });
  };

  const handleBlockUser = async (userId, email) => {
    try {
      const response = await authService.updateAccountStatus({
        email: email,
        status: 'INACTIVE'
      });
      if (response.success) {
        setManagers(prevManagers =>
          prevManagers.map(manager =>
            manager.userId === userId
              ? { ...manager, accountStatus: 'INACTIVE' }
              : manager
          )
        );
        setActiveDropdown(null);
      } else {
        console.error('Failed to block user:', response.message);
      }
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };

  const handleUnblockUser = async (userId, email) => {
    try {
      const response = await authService.updateAccountStatus({
        email: email,
        status: 'ACTIVE'
      });
      if (response.success) {
        setManagers(prevManagers =>
          prevManagers.map(manager =>
            manager.userId === userId
              ? { ...manager, accountStatus: 'ACTIVE' }
              : manager
          )
        );
        setActiveDropdown(null);
      } else {
        console.error('Failed to unblock user:', response.message);
      }
    } catch (error) {
      console.error('Error unblocking user:', error);
    }
  };

  const openConfirmOverlay = (type, userId, email) => {
    setConfirmAction({ type, userId, email });
    setShowConfirmOverlay(true);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown')) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const handleSearch = () => {
    setActiveSearchTerm(searchTerm);
  };

  const filteredManagers = managers.filter(manager => {
    if (!activeSearchTerm) return true;
    const searchLower = activeSearchTerm.toLowerCase();
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
              <div className="user-grid">
                {filteredManagers.map((manager) => (
                  <div key={manager.userId} className="user-card">
                    <div className="user-card-header">
                      <div className="user-avatar-name">
                        <div 
                          className="user-avatar"
                          style={{ backgroundColor: getAvatarColor(manager.userId) }}
                        >
                          {manager.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-header-info">
                          <div className="user-header-name">
                            {highlightMatch(manager.username, activeSearchTerm)}
                          </div>
                          <div className="user-header-email">
                            {highlightMatch(manager.email, activeSearchTerm)}
                          </div>
                        </div>
                      </div>
                      <div className="dropdown">
                        <button
                          className="btn-more"
                          title="More options"
                          onClick={() => handleMoreOptionsClick(manager.userId)}
                        >
                          ⋮
                        </button>
                        {activeDropdown === manager.userId && (
                          <div className="dropdown-content">
                            {manager.accountStatus === 'ACTIVE' ? (
                              <button onClick={() => openConfirmOverlay('block', manager.userId, manager.email)}>
                                <FontAwesomeIcon icon={faLock} className="me-2" />
                                INACTIVE
                              </button>
                            ) : ['BLOCKED', 'INACTIVE', 'REJECTED', 'LOCKED'].includes(manager.accountStatus) ? (
                              <button onClick={() => openConfirmOverlay('unblock', manager.userId, manager.email)}>
                                <FontAwesomeIcon icon={faLockOpen} className="me-2" />
                                ACTIVE
                              </button>
                            ) : null}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="user-card-content">
                      <div className="user-details">
                        <div className="detail-item">
                          <span className="detail-label">User ID:</span>
                          <span className="detail-value">{manager.userId}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Employee ID:</span>
                          <span className="detail-value">{manager.employeeId || '-'}</span>
                        </div>
                      </div>
                      <div className="user-status">
                        <span className={`badge rounded-pill ${
                          manager.accountStatus === 'ACTIVE' ? 'bg-success' : 
                          ['BLOCKED', 'INACTIVE', 'REJECTED', 'LOCKED'].includes(manager.accountStatus) ? 'bg-danger' : 
                          'bg-secondary'
                        }`}>
                          {manager.accountStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
      {showConfirmOverlay && (
        <div className="overlay">
          <div className="overlay-content">
            <div className="confirmation-icon">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="40" cy="40" r="40" fill="#059669" fillOpacity="0.1"/>
                <circle cx="40" cy="40" r="32" fill="#059669" fillOpacity="0.15"/>
                <circle cx="40" cy="40" r="24" fill="white"/>
                <path d="M28 40L38 50L52 36" stroke="#059669" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2>Confirm Action</h2>
            <p>Are you sure you want to {confirmAction.type === 'block' ? 'deactivate' : 'activate'} this user?</p>
            <div className="overlay-buttons">
              <button onClick={handleConfirmAction} className="btn-confirm">
                Confirm
              </button>
              <button onClick={() => setShowConfirmOverlay(false)} className="btn-cancel">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
