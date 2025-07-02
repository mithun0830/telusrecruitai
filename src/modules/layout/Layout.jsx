import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import UserAvatar from '../../components/UserAvatar';
import { 
  faBars, faTachometerAlt, faFileAlt,
  faUserFriends, faCalendarAlt, faBell,
  faSignOutAlt, faCaretDown, faCog, faUsers,
  faUsersCog, faClipboardList, faListAlt, faBriefcase
} from '@fortawesome/free-solid-svg-icons';
import '../../styles/variables.css';
import '../../styles/Layout.css';

const menuItems = [
  { path: '/rmg_dashboard', icon: faTachometerAlt, label: 'Dashboard', permission: 'rmg_dashboard', role: 'RMG' },
  { path: '/approvals', icon: faFileAlt, label: 'Approvals', permission: 'rmg_approval', role: 'RMG' },
  { path: '/user-management', icon: faUsersCog, label: 'User Management', permission: 'rmg_user_mng', role: 'RMG' },
  { path: '/notifications', icon: faBell, label: 'Notifications', permission: 'rmg_notif', role: 'RMG' },
  { path: '/interviews', icon: faCalendarAlt, label: 'Interview Management', permission: 'rmg_interview_mng', role: 'RMG' },
  { path: '/preferences', icon: faCog, label: 'Preferences', permission: 'rmg_pref', role: 'RMG' },
  { path: '/candidate-pool', icon: faUsers, label: 'Candidate Pool', permission: 'rmg_candidate_pool', role: 'RMG' },
  { path: '/track-status', icon: faClipboardList, label: 'Track Status', permission: 'rmg_track_status', role: 'RMG' },
  { path: '/mng_dashboard', icon: faTachometerAlt, label: 'Dashboard', permission: 'mng_dashboard', role: 'Manager' },
  { path: '/notifications', icon: faBell, label: 'Notifications', permission: 'mng_notif', role: 'Manager' },
  { path: '/preferences', icon: faCog, label: 'Preferences', permission: 'mng_pref', role: 'Manager' },
  { path: '/application-status', icon: faListAlt, label: 'Application Status', permission: 'mng_app_status', role: 'Manager' },
  { path: '/job-openings', icon: faBriefcase, label: 'Job Openings', permission: 'mng_jb', role: 'Manager' },
];

const Layout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  
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
    logout();
    navigate('/login');
  };

  if (isAuthPage) {
    return children;
  }

  return (
    <div className="d-flex flex-column vh-100">
      <header className="navbar navbar-dark" style={{ backgroundColor: 'var(--header-bg)' }}>
        <div className="container-fluid">
          <div className="d-flex align-items-center">
            <button className="btn btn-link text-light me-3" onClick={toggleMenu}>
              <FontAwesomeIcon icon={faBars} />
            </button>
            <span className="navbar-brand mb-0 h1">TelusRecruitAI</span>
          </div>
          <div className="d-flex align-items-center">
            <FontAwesomeIcon icon={faBell} className="text-light me-3" style={{ cursor: 'pointer' }} />
            <div className="dropdown position-relative">
              <div 
                className="d-flex align-items-center user-profile-dropdown" 
                onClick={toggleProfile} 
                style={{ cursor: 'pointer' }}
              >
                <UserAvatar name={user?.username || ''} />
                <div className="d-flex flex-column text-light mx-3">
                  <span>{user?.username || ''}</span>
                  <small className="text-light-50">{user?.role || ''}</small>
                </div>
                <FontAwesomeIcon icon={faCaretDown} className="text-light" />
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
        <aside className={`bg-light ${isMenuOpen ? 'col-md-3 col-lg-2' : 'col-auto'}`}>
          <nav className="nav flex-column">
            {menuItems.filter(item => 
              item.role === user?.role && user?.permissionNames?.includes(item.permission)
            ).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActiveRoute(item.path) ? 'active' : ''}`}
              >
                <FontAwesomeIcon icon={item.icon} className="me-2" />
                {isMenuOpen && <span>{item.label}</span>}
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
