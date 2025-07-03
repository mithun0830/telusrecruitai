import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import UserAvatar from '../../components/UserAvatar';
import { 
  faBars, faTachometerAlt, faFileAlt,
  faUserFriends, faCalendarAlt, faChartBar, faBell,
  faSignOutAlt, faCaretDown, faCog
} from '@fortawesome/free-solid-svg-icons';
import '../../styles/variables.css';
import '../../styles/Layout.css';

const menuItems = {
  RMG: [
    { path: '/rmg_dashboard', icon: faTachometerAlt, label: 'Dashboard' },
    { path: '/approvals', icon: faFileAlt, label: 'Approvals' },
    { path: '/candidates', icon: faUserFriends, label: 'Job Openings' },
    { path: '/interviews', icon: faCalendarAlt, label: 'Interviews' },
    { path: '/reports', icon: faChartBar, label: 'Reports' },
    { path: '/notifications', icon: faBell, label: 'Notifications' },
  ],
  Manager: [
    { path: '/mng_dashboard', icon: faTachometerAlt, label: 'Dashboard' },
    { path: '/candidates', icon: faUserFriends, label: 'Candidates' },
  ],
};

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
            {menuItems[user?.role || 'RMG'].map((item) => (
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
