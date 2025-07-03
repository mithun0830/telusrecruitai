import React, { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Alert } from 'react-bootstrap';
import { getRelativeTime } from '../../utils/dateUtils';
import './Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const result = await notificationService.getUnreadNotifications(user?.id);
      if (result.success) {
        setNotifications(result.data.notifications);
      } else {
        setError('Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('An error occurred while fetching notifications');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      const result = await notificationService.markAsRead(notificationId);
      if (result.success) {
        setNotifications(notifications.filter(n => n.id !== notificationId));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id, fetchNotifications]);

  if (loading) {
    return <div className="text-center p-4">Loading notifications...</div>;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col">
          <h2 className="mb-4">Notifications</h2>
          <div className="card shadow">
            <div className="card-body">
              {notifications.length > 0 ? (
                <div className="notification-list">
                  {notifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className="notification-item p-3 border-bottom"
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="notification-content w-100">
                          <div className="d-flex justify-content-between align-items-start">
                            <p className="mb-1">{notification.message}</p>
                            <small className="text-muted ms-2">
                              {getRelativeTime(notification.created_at)}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted">
                  No notifications found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
