import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const debouncedSearch = debounce((value) => {
      setDebouncedSearchTerm(value);
    }, 300);

    debouncedSearch(searchTerm);

    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const result = await notificationService.getUnreadNotifications(user?.id);
      if (result.success) {
        setNotifications(result.data.notifications);
        setLoading(false);
      } else {
        setError('Failed to fetch notifications');
        setLoading(false);
      }
    } catch (err) {
      setError('An error occurred while fetching notifications');
      setLoading(false);
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
        // Refresh the notifications list
        fetchNotifications();
      } else {
        setError('Failed to mark notification as read');
      }
    } catch (err) {
      setError('An error occurred while marking notification as read');
      console.error(err);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
      if (!debouncedSearchTerm) return true;
      const searchLower = debouncedSearchTerm.toLowerCase();
      const matchesSearch = 
        (notification.message && notification.message.toLowerCase().includes(searchLower));
      const matchesType = selectedType === 'all' || notification.type === selectedType;
      return matchesSearch && matchesType;
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
    <div className="notifications-container">
      <h2 className="notifications-title">Notifications</h2>
      <div className="notifications-card">
        <div className="search-filter-container">
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search by message or ID..."
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
                <tbody className="unread">
                  {filteredNotifications.map((notification) => (
                    <tr
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ width: '10%' }}>{notification.id}</td>
                      <td style={{ width: '45%' }}>{highlightMatch(notification.message, debouncedSearchTerm)}</td>
                      <td style={{ width: '45%' }}>{new Date(notification.created_at).toLocaleString()}</td>
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
