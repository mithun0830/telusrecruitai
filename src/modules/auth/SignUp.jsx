import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Form, Button, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import telusLogo from '../../assets/telus_logo.svg';
import leavesImage from '../../assets/leaves.png';
import '../../styles/variables.css';
import './Login.css';

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    roleName: '',
    permissionNames: []
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handlePermissionChange = (permission) => {
    setFormData(prevState => {
      const permissions = prevState.permissionNames || [];
      if (permissions.includes(permission)) {
        return {
          ...prevState,
          permissionNames: permissions.filter(p => p !== permission)
        };
      } else {
        return {
          ...prevState,
          permissionNames: [...permissions, permission]
        };
      }
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setIsLoading(true);

  console.log('Submitting form data:', formData);

  try {
    console.log('Calling register function');
    const result = await register(formData);
    console.log('Register function result:', result);

    if (result.success) {
      console.log('Registration successful, navigating to login');
      navigate('/login', { state: { message: 'Registration successful. Please log in.' } });
    } else {
      console.log('Registration failed:', result.message);
      setError(result.message || 'Registration failed. Please try again.');
    }
  } catch (err) {
    console.error('Registration error:', err);
    if (err.response && err.response.data) {
      console.log('Error response data:', err.response.data);
      setError(err.response.data.message || 'An error occurred during registration. Please try again.');
    } else {
      setError('An error occurred during registration. Please try again.');
    }
  } finally {
    setIsLoading(false);
  }
};

  const renderPermissions = () => {
    if (formData.roleName === 'Manager') {
      return (
        <>
          <Form.Check
            type="checkbox"
            label="Dashboard"
            onChange={() => handlePermissionChange('mng_dashboard')}
            checked={formData.permissionNames?.includes('mng_dashboard')}
            className="mb-2"
          />
          <Form.Check
            type="checkbox"
            label="Notification"
            onChange={() => handlePermissionChange('mng_notif')}
            checked={formData.permissionNames?.includes('mng_notif')}
            className="mb-2"
          />
          <Form.Check
            type="checkbox"
            label="Preferences"
            onChange={() => handlePermissionChange('mng_pref')}
            checked={formData.permissionNames?.includes('mng_pref')}
            className="mb-2"
          />
          <Form.Check
            type="checkbox"
            label="Application Status"
            onChange={() => handlePermissionChange('mng_app_status')}
            checked={formData.permissionNames?.includes('mng_app_status')}
            className="mb-2"
          />
          <Form.Check
            type="checkbox"
            label="Job Openings"
            onChange={() => handlePermissionChange('mng_jb')}
            checked={formData.permissionNames?.includes('mng_jb')}
            className="mb-2"
          />
        </>
      );
    } else if (formData.roleName === 'RMG') {
      return (
        <>
          <Form.Check
            type="checkbox"
            label="Dashboard"
            onChange={() => handlePermissionChange('rmg_dashboard')}
            checked={formData.permissionNames?.includes('rmg_dashboard')}
            className="mb-2"
          />
          <Form.Check
            type="checkbox"
            label="Approvals"
            onChange={() => handlePermissionChange('rmg_approval')}
            checked={formData.permissionNames?.includes('rmg_approval')}
            className="mb-2"
          />
          <Form.Check
            type="checkbox"
            label="User Management"
            onChange={() => handlePermissionChange('rmg_user_mng')}
            checked={formData.permissionNames?.includes('rmg_user_mng')}
            className="mb-2"
          />
          <Form.Check
            type="checkbox"
            label="Notification"
            onChange={() => handlePermissionChange('rmg_notif')}
            checked={formData.permissionNames?.includes('rmg_notif')}
            className="mb-2"
          />
          <Form.Check
            type="checkbox"
            label="Interview Management"
            onChange={() => handlePermissionChange('rmg_interview_mng')}
            checked={formData.permissionNames?.includes('rmg_interview_mng')}
            className="mb-2"
          />
          <Form.Check
            type="checkbox"
            label="Preferences"
            onChange={() => handlePermissionChange('rmg_pref')}
            checked={formData.permissionNames?.includes('rmg_pref')}
            className="mb-2"
          />
          <Form.Check
            type="checkbox"
            label="Candidate Pool"
            onChange={() => handlePermissionChange('rmg_candidate_pool')}
            checked={formData.permissionNames?.includes('rmg_candidate_pool')}
            className="mb-2"
          />
          <Form.Check
            type="checkbox"
            label="Track Status"
            onChange={() => handlePermissionChange('rmg_track_status')}
            checked={formData.permissionNames?.includes('rmg_track_status')}
          />
        </>
      );
    }
    return null;
  };

  return (
    <div className="login-page signup">
      <header className="login-header">
        <img src={telusLogo} alt="TELUS logo" className="telus-logo" />
      </header>
      <div className="login-container">
        <div className="signup-card card-base">
          <h1>Register to TelusRecruitAI</h1>
          
          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Work Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <div className="password-input">
              <Form.Control
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
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
            <Form.Label>Role</Form.Label>
            <Form.Select
              name="roleName"
              value={formData.roleName}
              onChange={handleChange}
              required
            >
              <option value="">Select Role</option>
              <option value="Manager">Manager</option>
              <option value="RMG">RMG</option>
            </Form.Select>
          </Form.Group>

          {formData.roleName && (
            <Form.Group className="mb-4">
              <Form.Label>Permissions</Form.Label>
              <div className="permissions-container">
                {renderPermissions()}
              </div>
            </Form.Group>
          )}

          <Button
            variant="success"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Signing Up...' : 'Sign Up'}
          </Button>

          <div className="footer-links">
            <p>Already have an account? <Link to="/login">Sign In</Link></p>
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

export default SignUp;
