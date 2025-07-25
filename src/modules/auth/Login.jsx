import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError, setError, resetAuthState } from '../../store/slices/authSlice';
import { Form, Button, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import telusLogo from '../../assets/telus_logo.svg';
import loginImg from '../../assets/login.png'
import './Login.css';

const CLIENT_ID = '811abdb0-4b5e-013e-0f7b-7b334b1018e4176721';
const REDIRECT_URI = encodeURIComponent(`${window.location.origin}/callback`);
const DOMAIN = 'https://telus-sandbox.onelogin.com';
const AUTHORIZATION_ENDPOINT = `${DOMAIN}/oidc/2/auth`;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState('email');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isLoading, error, user } = useSelector((state) => state.auth);

  const handleModalClose = () => {
    setShowModal(false);
    dispatch(clearError());
  };

  useEffect(() => {
    if (error) {
      setModalType('error');
      setModalMessage(error);
      setShowModal(true);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step === 'email') {
      // Validate email format
      if (email && email.includes('@')) {
        setStep('password');
      } else {
        dispatch(setError('Please enter a valid email address'));
      }
    } else {
      // Handle password submission
      if (password) {
        try {
          await dispatch(loginUser({ email, password }));
        } catch (err) {
          console.error('Login error:', err);
        }
      } else {
        dispatch(setError('Please enter your password'));
      }
    }
  };

  const handleOneLoginAuth = () => {
    try {
      const state = Math.random().toString(36).substring(7);
      sessionStorage.setItem('onelogin_state', state);
      
      const loginUrl = `${AUTHORIZATION_ENDPOINT}?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=openid profile email&state=${state}`;
      console.log('Redirecting to:', loginUrl);
      window.location.href = loginUrl;
    } catch (err) {
      console.error('OneLogin authentication error:', err);
      dispatch(setError(`OneLogin authentication failed: ${err.message}`));
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

          <Form onSubmit={handleSubmit}>
            {step === 'email' ? (
              <Form.Group className="mb-3">
                <Form.Control
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onClick={handleModalClose}
                  required
                />
              </Form.Group>
            ) : (
              <>
                <Form.Group className="mb-3">
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onClick={() => {
                      setStep('email');
                      handleModalClose();
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onClick={handleModalClose}
                    required
                    autoFocus
                  />
                </Form.Group>
              </>
            )}

            <Button
              variant="primary"
              type="submit"
              disabled={isLoading}
              className="w-100 mb-3"
            >
              {isLoading ? 'Logging in...' : (step === 'email' ? 'Next' : 'Sign in')}
            </Button>

            <Button
              variant="outline-primary"
              onClick={handleOneLoginAuth}
              disabled={isLoading}
              className="w-100 mb-3"
            >
              Login with OneLogin
            </Button>

            <div className="text-center">
              <Link to="/signup" className="text-muted">
                New to TELUS RecuritAI? <span>Register now</span>
              </Link>
            </div>
          </Form>
        </div>
      </div>

      <Modal 
        show={showModal} 
        onHide={handleModalClose} 
        centered
        backdrop="static"
        keyboard={false}
        className="success-modal"
      >
        <Modal.Body className="text-center p-5">
          <div className="success-icon-wrapper mb-4">
            <FontAwesomeIcon 
              icon={modalType === 'success' ? faCheckCircle : faTimesCircle} 
              className={`success-icon ${modalType === 'error' ? 'text-danger' : ''}`}
            />
          </div>
          <h4 className="success-title mb-3">
            {modalType === 'success' ? 'Login Successful!' : 'Login Failed'}
          </h4>
          <p className="success-message mb-4">{modalMessage}</p>
          <Button 
            variant={modalType === 'success' ? 'success' : 'danger'} 
            onClick={handleModalClose}
            className="continue-button"
          >
            {modalType === 'success' ? 'Continue' : 'Try Again'}
          </Button>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Login;
