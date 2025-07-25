import React, { useState, useEffect, useMemo } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { notificationService } from '../../services/api';
import { useSelector } from 'react-redux';
import './Notifications.css';

const Notifications = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useSelector((state) => state.auth.user);

  const handleSearch = () => {
    setActiveSearchTerm(searchTerm);
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const result = await notificationService.getUnreadNotifications(user?.id);
      if (result.success) {
        setNotifications(result.data.notifications);
        setError(null);
      } else {
        setError('Failed to fetch notifications');
      }
    } catch (err) {
      setError('An error occurred while fetching notifications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id]);

  const handleNotificationClick = async (notificationId) => {
    try {
      const result = await notificationService.markAsRead(notificationId);
      if (result.success) {
        fetchNotifications();
      } else {
        setError('Failed to mark notification as read');
      }
    } catch (err) {
      setError('An error occurred while marking notification as read');
      console.error(err);
    }
  };

  const filteredNotifications = useMemo(() => {
    const searchLower = activeSearchTerm.toLowerCase();
    return notifications.filter(notification => {
      const matchesSearch =
        !activeSearchTerm ||
        (notification.message && notification.message.toLowerCase().includes(searchLower));
      const matchesType = selectedType === 'all' || notification.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [activeSearchTerm, selectedType, notifications]);

  const highlightMatch = (text, search) => {
    if (!search || !text) return text;
    const textStr = String(text);
    const parts = textStr.split(new RegExp(`(${search})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === search.toLowerCase() ? <mark key={index}>{part}</mark> : part
    );
  };

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h1>Notifications</h1>
      </div>
      <div className="notifications-content">
        <div className="search-filter-container">
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search by message or ID..."
              aria-label="Search Notifications"
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
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">All Types</option>
              {Array.from(new Set(notifications.map(n => n.type))).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="notifications-list">
          <div className="notifications-list-header">
            <h2>Notifications <span className="notification-count">{filteredNotifications.length}</span></h2>
          </div>
          <div className="notifications-table-container">
            {loading ? (
              <div className="loader-container">
                <div className="loader"></div>
                <span>Loading notifications...</span>
              </div>
            ) : error ? (
              <Alert variant="danger">{error}</Alert>
            ) : (
              <table className="notifications-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Message</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNotifications.map((notification) => (
                    <tr
                      key={notification.id}
                      className={`notification-row ${notification.is_read ? 'read' : 'unread'}`}
                      onClick={() => handleNotificationClick(notification.id)}
                    >
                      <td>{notification.id}</td>
                      <td>{highlightMatch(notification.message, activeSearchTerm)}</td>
                      <td>{new Intl.DateTimeFormat('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      }).format(new Date(notification.created_at))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {!loading && filteredNotifications.length === 0 && (
              <div className="no-notifications-message">
                <div>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 8C15 10.2091 13.2091 12 11 12C8.79086 12 7 10.2091 7 8C7 5.79086 8.79086 4 11 4C13.2091 4 15 5.79086 15 8Z" stroke="#059669" strokeWidth="2" />
                    <path d="M3 20C3 16.6863 6.58172 14 11 14C15.4183 14 19 16.6863 19 20" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
                    <path d="M19 4L23 8M23 4L19 8" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <div>No notifications found matching your search criteria.</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
