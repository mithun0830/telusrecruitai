import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { notificationService } from '../../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import UserAvatar from '../../components/UserAvatar';
import NotificationPanel from '../../components/NotificationPanel';
import telusLogo from '../../assets/telus_logo_vertical.png';
import {
  faBars, faTachometerAlt, faFileAlt,
  faUserFriends, faCalendarAlt, faBell,
  faSignOutAlt, faCaretDown, faCog, faUsers,
  faUsersCog, faClipboardList, faListAlt, faBriefcase
} from '@fortawesome/free-solid-svg-icons';
import '../../styles/variables.css';
import '../../styles/Layout.css';

// Add this CSS for the notification badge and bell icon
const notificationBadgeStyle = {
  position: 'absolute',
  top: '-5px',
  right: '-5px',
  backgroundColor: '#dc3545',
  color: '#ffffff',
  borderRadius: '50%',
  padding: '0.2rem 0.4rem',
  fontSize: '0.6rem',
  minWidth: '18px',
  height: '18px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const bellIconStyle = {
  fontSize: '1.6rem',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: '#ffffff',
};

const menuItems = [
  { path: '/interviews', icon: faCalendarAlt, label: 'Interview Management', permission: 'rmg_interview_mng', role: 'RMG' },
  { path: '/rmg_dashboard', icon: faTachometerAlt, label: 'Dashboard', permission: 'rmg_dashboard', role: 'RMG' },
  { path: '/approvals', icon: faFileAlt, label: 'Approvals', permission: 'rmg_approval', role: 'RMG' },
  { path: '/user-management', icon: faUsersCog, label: 'User Management', permission: 'rmg_user_mng', role: 'RMG' },
  { path: '/notifications', icon: faBell, label: 'Notifications', permission: 'rmg_notif', role: 'RMG' },
  // { path: '/preferences', icon: faCog, label: 'Preferences', permission: 'rmg_pref', role: 'RMG' },
  // { path: '/candidate-pool', icon: faUsers, label: 'Candidate Pool', permission: 'rmg_candidate_pool', role: 'RMG' },
  // { path: '/track-status', icon: faClipboardList, label: 'Track Status', permission: 'rmg_track_status', role: 'RMG' },
  // { path: '/mng_dashboard', icon: faTachometerAlt, label: 'Dashboard', permission: 'mng_dashboard', role: 'Manager' },
  // { path: '/preferences', icon: faCog, label: 'Preferences', permission: 'mng_pref', role: 'Manager' },
  // { path: '/application-status', icon: faListAlt, label: 'Application Status', permission: 'mng_app_status', role: 'Manager' },
  { path: '/job-openings', icon: faBriefcase, label: 'Candidates Search', permission: 'mng_jb', role: 'Manager' },
  { path: '/notifications', icon: faBell, label: 'Notifications', permission: 'mng_notif', role: 'Manager' },
];

const Layout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const POLL_INTERVAL = 30000; // 30 seconds
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  console.log("user", user)

  const fetchNotificationsWithRetry = async (retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        const result = await notificationService.getUnreadNotifications(user?.id);
        if (result.success) {
          const unreadNotifications = result.data.notifications.filter(notification => !notification.is_read);
          setNotifications(unreadNotifications.slice(0, 5));
          setNotificationCount(unreadNotifications.length);
          return;
        }
      } catch (error) {
        console.error(`Error fetching notifications (attempt ${i + 1}):`, error);
        if (i === retries - 1) {
          // If this is the last retry, show an error to the user
          alert('Failed to fetch notifications. Please try again later.');
        } else {
          // Wait before the next retry
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchNotificationsWithRetry();
      const interval = setInterval(fetchNotificationsWithRetry, POLL_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleCloseNotifications = () => {
    setShowNotifications(false);
  };

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const notificationContainer = document.querySelector('.notification-panel');
      const bellIcon = document.querySelector('.bell-icon-container');

      if (showNotifications && notificationContainer && bellIcon) {
        if (!notificationContainer.contains(event.target) && !bellIcon.contains(event.target)) {
          setShowNotifications(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (isAuthPage) {
    return children;
  }

  return (
    <div className="d-flex flex-column vh-100">
      <header className="navbar navbar-dark">
        <div className="container-fluid px-2">
          <div className="d-flex align-items-center">
            <button className="btn btn-link me-2" onClick={toggleMenu}>
              <FontAwesomeIcon icon={faBars} />
            </button>
            <img src={telusLogo} alt="TELUS Logo" className="navbar-brand" style={{ height: '50px' }} />
          </div>
          <div className="d-flex align-items-center">
            <div className="bell-icon-container" style={{ position: 'relative', cursor: 'pointer', padding: '0.25rem' }} onClick={handleNotificationClick}>
              <FontAwesomeIcon icon={faBell} style={bellIconStyle} />
              {notificationCount > 0 && (
                <span style={{ ...notificationBadgeStyle, top: '-3px', right: '-3px' }}>{notificationCount}</span>
              )}
              {showNotifications && (
                <NotificationPanel
                  notifications={notifications}
                  onClose={handleCloseNotifications}
                  onNotificationRead={(notificationId) => {
                    // Update local state
                    setNotifications(notifications.filter(n => n.id !== notificationId));
                    setNotificationCount(prev => Math.max(0, prev - 1));
                  }}
                />
              )}
            </div>
            <div className="dropdown position-relative">
              <div
                className="d-flex align-items-center user-profile-dropdown"
                onClick={toggleProfile}
                style={{ cursor: 'pointer' }}
              >
                <UserAvatar name={user?.username || ''} style={{ width: '40px', height: '40px' }} />
                <div className="d-flex flex-column text-light mx-3">
                  <span style={{ fontSize: '1.1rem' }}>{user?.username || ''}</span>
                  <small className="text-light-50" style={{ fontSize: '0.8rem' }}>{user?.role || ''}</small>
                </div>
                <FontAwesomeIcon icon={faCaretDown} className="text-light" style={{ fontSize: '1rem' }} />
              </div>
              <div
                className={`dropdown-menu dropdown-menu-end ${isProfileOpen ? 'show' : ''}`}
              >
                <button className="dropdown-item">
                  <FontAwesomeIcon icon={faCog} className="me-2" />
                  <span>Settings</span>
                </button>
                <button className="dropdown-item" onClick={handleLogout}>
                  <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="d-flex flex-grow-1">
        <aside className={isMenuOpen ? '' : 'col-auto'}>
          <nav className="nav flex-column">
            {menuItems.filter(item =>
              item.role === user?.role && user?.permissionNames?.includes(item.permission)
            ).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActiveRoute(item.path) ? 'active' : ''}`}
              >
                <div>
                  <FontAwesomeIcon icon={item.icon} className="me-2" />
                  {isMenuOpen && <span>{item.label}</span>}
                </div>
              </Link>
            ))}
          </nav>
        </aside>
        <main className="col p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
