import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError, setError, resetAuthState } from '../../store/slices/authSlice';
import { Form, Button, Alert } from 'react-bootstrap';
import telusLogo from '../../assets/telus_logo.svg';
import loginImg from '../../assets/login.png'
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState('email');
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { isLoading, error, user } = useSelector((state) => state.auth);

  const handleClearError = () => dispatch(clearError());

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

  return (
    <div className="login-page">
      <div className="login-container">
        {/* <div className="login-image"></div> */}
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

          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            {step === 'email' ? (
              <Form.Group className="mb-3">
                <Form.Control
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onClick={handleClearError}
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
                      handleClearError();
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
                    onClick={handleClearError}
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
              className="w-100"
            >
              {isLoading ? 'Logging in...' : (step === 'email' ? 'Next' : 'Sign in')}
            </Button>

            <div className="text-center">
              <Link to="/signup" className="text-muted">
                New to TELUS RecuritAI? <span>Register now</span>
              </Link>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;
