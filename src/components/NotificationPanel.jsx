import React from 'react';
import { Link } from 'react-router-dom';
import { getRelativeTime } from '../utils/dateUtils';
import { notificationService } from '../services/api';
import './NotificationPanel.css';

const NotificationPanel = ({ notifications, onClose, onNotificationRead }) => {
  return (
    <div className="notification-panel">
      <div className="notification-header">
        <h6 className="mb-0">Notifications</h6>
        <button className="btn-close" onClick={onClose}></button>
      </div>
      <div className="notification-list">
        {notifications.length > 0 ? (
          notifications.map(notification => (
            <div 
              key={notification.id} 
              className="notification-item"
              onClick={async () => {
                const result = await notificationService.markAsRead(notification.id);
                if (result.success) {
                  onNotificationRead(notification.id);
                }
              }}
            >
              <div className="d-flex justify-content-between align-items-start">
                <div className="notification-message">{notification.message}</div>
                <div className="notification-date ms-2">
                  {getRelativeTime(notification.created_at)}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-notifications">No new notifications</div>
        )}
      </div>
      <div className="notification-footer">
        <Link to="/notifications" onClick={onClose}>View All Notifications</Link>
      </div>
    </div>
  );
};

export default NotificationPanel;
