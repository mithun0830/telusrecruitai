import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Form, Button, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import telusLogo from '../../assets/telus_logo.svg';
import leavesImage from '../../assets/leaves.png';
import '../../styles/variables.css';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        const user = result.data.user;
        const role = user.role;

        let from = location.state?.from?.pathname;
        if (!from) {
          if (role === 'Manager') {
            from = '/mng_dashboard';
          } else if (role === 'RMG') {
            from = '/rmg_dashboard';
          } else {
            console.error('Unexpected role:', role);
            setError('Invalid user role');
            return;
          }
        }
        navigate(from, { replace: true });
      } else {
        setError(result.message || 'Invalid email or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <header className="login-header">
        <img src={telusLogo} alt="TELUS logo" className="telus-logo" />
      </header>
      <div className="login-container">
        <div className="login-card card-base">
        <h1>Log in to TelusRecruitAI</h1>
        
        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email ID</Form.Label>
            <Form.Control
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <div className="password-input">
              <Form.Control
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button 
                variant="link"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </Button>
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Text className="forgot-link">
              <Link to="/forgot-password">Forgot your password?</Link>
            </Form.Text>
          </Form.Group>

          <Button
            variant="success"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Log in'}
          </Button>

          <div className="footer-links">
            <p>New to TelusRecruitAI? <Link to="/signup">Register now</Link></p>
          </div>
        </Form>
        </div>
        <div className="leaves-image">
          <img src={leavesImage} alt="Leaves" />
        </div>
      </div>
    </div>
  );
};

export default Login;
