import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/variables.css';

const Login = () => {
  const [email, setEmail] = useState('rmg_test@example.com');
  const [password, setPassword] = useState('test123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password);
      console.log('Login result:', result); // Debug log
      if (result.success) {
        const user = result.data.user;
        const role = user.role;
        const permissionNames = user.permissionNames || [];
        console.log('User role:', role); // Debug log
        console.log('User permissions:', permissionNames); // Debug log

        let from = location.state?.from?.pathname;
        if (!from) {
          if (role === 'Manager') {
            from = '/mng_dashboard';
          } else if (role === 'RMG') {
            from = '/rmg_dashboard';
          } else {
            // Handle unexpected role
            console.error('Unexpected role:', role); // Debug log
            setError('Invalid user role');
            return;
          }
        }
        navigate(from, { replace: true });
      } else {
        setError(result.message || 'Invalid email or password');
      }
    } catch (err) {
      console.error('Login error:', err); // Debug log
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ background: 'var(--hover-bg)' }}>
      <div className="p-3" style={{ background: 'var(--header-bg)', color: 'var(--text-light)' }}>
        <h4 className="m-0">TelusRecruitAI</h4>
      </div>
      <div className="flex-grow-1 d-flex justify-content-center align-items-center p-3">
        <div className="card shadow-sm" style={{ width: '100%', maxWidth: '450px' }}>
          <div className="card-body p-4">
            <h3 className="text-center mb-2" style={{ color: 'var(--header-bg)' }}>Welcome Back</h3>
            <p className="text-center text-muted mb-4">Sign in to access TelusRecruitAI</p>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="form-control" 
                  id="email" 
                  placeholder="your.email@company.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input 
                  type="password" 
                  className="form-control" 
                  id="password" 
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3 d-flex justify-content-between align-items-center">
                <div className="form-check">
                  <input type="checkbox" className="form-check-input" id="rememberMe" />
                  <label className="form-check-label" htmlFor="rememberMe">Remember me</label>
                </div>
                <Link to="/forgot-password" className="text-decoration-none" style={{ color: 'var(--primary-color)' }}>Forgot password?</Link>
              </div>
              <button 
                type="submit" 
                className="btn btn-primary w-100 mb-3" 
                style={{ background: 'var(--primary-color)', border: 'none' }}
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'SIGN IN'}
              </button>
            </form>
            <div className="text-center mt-3">
              <span className="text-muted">Don't have an account? </span>
              <Link to="/signup" className="text-decoration-none" style={{ color: 'var(--primary-color)' }}>Sign up</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
