import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { resetAuthState } from '../../store/slices/authSlice';
import { Button } from 'react-bootstrap';
import telusLogo from '../../assets/telus_logo.svg';
import loginImg from '../../assets/login.png'
import './Login.css';

const CLIENT_ID = '811abdb0-4b5e-013e-0f7b-7b334b1018e4176721';
const REDIRECT_URI = encodeURIComponent(`${window.location.origin}/callback`);
const DOMAIN = 'https://telus-sandbox.onelogin.com';
const AUTHORIZATION_ENDPOINT = `${DOMAIN}/oidc/2/auth`;

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isLoading, error, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (error) {
      console.error('Login error:', error);
    }
  }, [error]);

  // Reset auth state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(resetAuthState());
    };
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      if (user.role === 'Manager') {
        navigate('/job-openings', { replace: true });
      } else if (user.role === 'RMG') {
        navigate('/interviews', { replace: true });
      }
    }
  }, [user, navigate]);

  const handleOneLoginAuth = () => {
    try {
      const state = Math.random().toString(36).substring(7);
      sessionStorage.setItem('onelogin_state', state);
      
      // Check if force_login is present in URL
      const urlParams = new URLSearchParams(window.location.search);
      const forceLogin = urlParams.get('force_login');
      const promptParam = forceLogin ? '&prompt=login' : '';
      
      const loginUrl = `${AUTHORIZATION_ENDPOINT}?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=openid profile email&state=${state}${promptParam}`;
      console.log('Redirecting to:', loginUrl);
      window.location.href = loginUrl;
    } catch (err) {
      console.error('OneLogin authentication error:', err);
      console.error(`OneLogin authentication failed: ${err.message}`);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-image">
          <img src={loginImg} alt="TELUS Recruiting" />
        </div>
        <div className="login-form">
          <div className="login-header">
            <div className="telus-logo">
              <img src={telusLogo} alt="TELUS Recruiting" />
            </div>
            <h1 className="login-title">Better hiring,<br />all-together.</h1>
          </div>

          <Button
            variant="primary"
            onClick={handleOneLoginAuth}
            disabled={isLoading}
            className="w-100 mb-3"
          >
            {isLoading ? 'Logging in...' : 'Login with OneLogin'}
          </Button>

          <div className="text-center">
            <Link to="/signup" className="text-muted">
              New to TELUS RecuritAI? <span>Register now</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
