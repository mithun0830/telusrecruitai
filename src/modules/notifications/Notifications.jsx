import React, { useState, useEffect, useMemo } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { notificationService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Notifications.css';
import { debounce } from 'lodash';

const Notifications = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Debounce search term
  const debouncedSearch = useMemo(
    () => debounce((value) => setDebouncedSearchTerm(value), 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, debouncedSearch]);

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
    const searchLower = debouncedSearchTerm.toLowerCase();
    return notifications.filter(notification => {
      const matchesSearch =
        !debouncedSearchTerm ||
        (notification.message && notification.message.toLowerCase().includes(searchLower));
      const matchesType = selectedType === 'all' || notification.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [debouncedSearchTerm, selectedType, notifications]);

  const highlightMatch = (text, search) => {
    if (!search || !text) return text;
    const textStr = String(text);
    const parts = textStr.split(new RegExp(`(${search})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === search.toLowerCase() ? <mark key={index}>{part}</mark> : part
    );
  };

  return (
    <div className="notifications-container">
      <h2 className="notifications-title">Notifications</h2>
      <div className="notifications-card">
        <div className="search-filter-container">
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search by message or ID..."
              aria-label="Search Notifications"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
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
                    <th style={{ width: '10%' }}>ID</th>
                    <th style={{ width: '45%' }}>Message</th>
                    <th style={{ width: '45%' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNotifications.map((notification) => (
                    <tr
                      key={notification.id}
                      tabIndex={0}
                      className="unread"
                      title={notification.message}
                      onClick={() => handleNotificationClick(notification.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleNotificationClick(notification.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>{notification.id}</td>
                      <td>{highlightMatch(notification.message, debouncedSearchTerm)}</td>
                      <td>{new Intl.DateTimeFormat('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      }).format(new Date(notification.created_at))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredNotifications.length === 0 && (
              <div className="text-center py-4 text-muted">
                No notifications found
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Notifications;
