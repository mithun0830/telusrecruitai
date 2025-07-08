import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Form, Button, Alert } from 'react-bootstrap';
import telusLogo from '../../assets/telus_logo.svg';
import '../../styles/variables.css';
import './Signup.css';
import leavesImage from '../../assets/leaves.png';

const SignUp = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    employeeId: '',
    email: '',
    phoneNumber: '',
    department: '',
    designation: '',
    region: '',
    costCenter: '',
    businessUnit: '',
    reportingManagerEmail: '',
    role: '',
    password: '',
    confirmPassword: '',
    managerPermissions: [],
    rmgPermissions: [],
    profilePicture: null
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));

    // Validate password
    if (name === 'password') {
      setPasswordError('');
      if (value.length < 6) {
        setPasswordError('Password must be at least 6 characters long');
      }
      if (formData.confirmPassword && value !== formData.confirmPassword) {
        setConfirmPasswordError('Passwords do not match');
      } else {
        setConfirmPasswordError('');
      }
    }

    // Validate confirm password
    if (name === 'confirmPassword') {
      setConfirmPasswordError('');
      if (value !== formData.password) {
        setConfirmPasswordError('Passwords do not match');
      }
    }
  };

  const handlePermissionChange = (permission) => {
    setFormData(prevState => {
      const permissionType = prevState.role === 'Manager' ? 'managerPermissions' : 'rmgPermissions';
      const currentPermissions = prevState[permissionType] || [];
      
      if (currentPermissions.includes(permission)) {
        return {
          ...prevState,
          [permissionType]: currentPermissions.filter(p => p !== permission)
        };
      } else {
        return {
          ...prevState,
          [permissionType]: [...currentPermissions, permission]
        };
      }
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  // Check for password validation errors
  if (passwordError || confirmPasswordError) {
    setError('Please fix the password errors before submitting.');
    return;
  }

  setIsLoading(true);

  console.log('Submitting form data:', JSON.stringify(formData));

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
    if (!formData.role) return null;

    const permissionType = formData.role === 'Manager' ? 'managerPermissions' : 'rmgPermissions';
    const currentPermissions = formData[permissionType] || [];

    if (formData.role === 'Manager') {
      return (
        <div className="permissions-grid">
          <Form.Check
            type="checkbox"
            label="Dashboard"
            onChange={() => handlePermissionChange('mng_dashboard')}
            checked={currentPermissions.includes('mng_dashboard')}
          />
          <Form.Check
            type="checkbox"
            label="Notification"
            onChange={() => handlePermissionChange('mng_notif')}
            checked={currentPermissions.includes('mng_notif')}
          />
          <Form.Check
            type="checkbox"
            label="Preferences"
            onChange={() => handlePermissionChange('mng_pref')}
            checked={currentPermissions.includes('mng_pref')}
          />
          <Form.Check
            type="checkbox"
            label="Application Status"
            onChange={() => handlePermissionChange('mng_app_status')}
            checked={currentPermissions.includes('mng_app_status')}
          />
          <Form.Check
            type="checkbox"
            label="Job Openings"
            onChange={() => handlePermissionChange('mng_jb')}
            checked={currentPermissions.includes('mng_jb')}
          />
        </div>
      );
    } else if (formData.role === 'RMG') {
      return (
        <div className="permissions-grid">
          <Form.Check
            type="checkbox"
            label="Dashboard"
            onChange={() => handlePermissionChange('rmg_dashboard')}
            checked={currentPermissions.includes('rmg_dashboard')}
          />
          <Form.Check
            type="checkbox"
            label="Approvals"
            onChange={() => handlePermissionChange('rmg_approval')}
            checked={currentPermissions.includes('rmg_approval')}
          />
          <Form.Check
            type="checkbox"
            label="User Management"
            onChange={() => handlePermissionChange('rmg_user_mng')}
            checked={currentPermissions.includes('rmg_user_mng')}
          />
          <Form.Check
            type="checkbox"
            label="Notification"
            onChange={() => handlePermissionChange('rmg_notif')}
            checked={currentPermissions.includes('rmg_notif')}
          />
          <Form.Check
            type="checkbox"
            label="Interview Management"
            onChange={() => handlePermissionChange('rmg_interview_mng')}
            checked={currentPermissions.includes('rmg_interview_mng')}
          />
          <Form.Check
            type="checkbox"
            label="Preferences"
            onChange={() => handlePermissionChange('rmg_pref')}
            checked={currentPermissions.includes('rmg_pref')}
          />
          <Form.Check
            type="checkbox"
            label="Candidate Pool"
            onChange={() => handlePermissionChange('rmg_candidate_pool')}
            checked={currentPermissions.includes('rmg_candidate_pool')}
          />
          <Form.Check
            type="checkbox"
            label="Track Status"
            onChange={() => handlePermissionChange('rmg_track_status')}
            checked={currentPermissions.includes('rmg_track_status')}
          />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="signup-page">
      <header className="login-header">
        <img src={telusLogo} alt="TELUS logo" className="telus-logo" />
      </header>
      <div className="signup-container">
        <div className="signup-card">
          <div className="signup-header-image">
            <img src={telusLogo} alt="TELUS" className="header-logo" />
            <span className="recruit-ai-text">Recruit AI</span>
          </div>
          
          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <div className="form-row">
              <Form.Group className="mb-3">
                <Form.Label>Full Name <span className="required">*</span></Form.Label>
                <Form.Control
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Employee ID <span className="required">*</span></Form.Label>
                <Form.Control
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </div>

            <div className="form-row">
              <Form.Group className="mb-3">
                <Form.Label>Email (TELUS) <span className="required">*</span></Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Phone Number <span className="required">*</span></Form.Label>
                <Form.Control
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </div>

            <div className="form-row">
              <Form.Group className="mb-3">
                <Form.Label>Department <span className="required">*</span></Form.Label>
                <Form.Control
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Designation <span className="required">*</span></Form.Label>
                <Form.Control
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </div>

            <div className="form-row">
              <Form.Group className="mb-3">
                <Form.Label>Region <span className="required">*</span></Form.Label>
                <Form.Select
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Region</option>
                  <option value="North America">North America</option>
                  <option value="Europe">Europe</option>
                  <option value="Asia Pacific">Asia Pacific</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Cost Center <span className="required">*</span></Form.Label>
                <Form.Control
                  type="text"
                  name="costCenter"
                  value={formData.costCenter}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </div>

            <div className="form-row">
              <Form.Group className="mb-3">
                <Form.Label>Business Unit</Form.Label>
                <Form.Control
                  type="text"
                  name="businessUnit"
                  value={formData.businessUnit}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Reporting Manager Email</Form.Label>
                <Form.Control
                  type="email"
                  name="reportingManagerEmail"
                  value={formData.reportingManagerEmail}
                  onChange={handleChange}
                />
              </Form.Group>
            </div>

            <div className="form-row">
              <Form.Group className="mb-3">
                <Form.Label>Role <span className="required">*</span></Form.Label>
                <Form.Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Role</option>
                  <option value="Manager">Manager</option>
                  <option value="RMG">RMG</option>
                </Form.Select>
              </Form.Group>
            </div>

            <div className="form-row">
              <Form.Group className="mb-3">
                <Form.Label>Password <span className="required">*</span></Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                {passwordError && <Form.Text className="text-danger">{passwordError}</Form.Text>}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Confirm Password <span className="required">*</span></Form.Label>
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                {confirmPasswordError && <Form.Text className="text-danger">{confirmPasswordError}</Form.Text>}
              </Form.Group>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Profile Picture (optional)</Form.Label>
              <Form.Control
                type="file"
                name="profilePicture"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const imageUrl = URL.createObjectURL(file);
                    setFormData(prevState => ({
                      ...prevState,
                      profilePicture: imageUrl
                    }));
                  }
                }}
                accept="image/*"
              />
            </Form.Group>

            {formData.role && (
              <Form.Group className="mb-3">
                <Form.Label>Permissions <span className="required">*</span></Form.Label>
                {renderPermissions()}
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label={<>I accept TELUS's <Link to="/terms" className="terms-link">Terms of Use</Link></>}
                required
              />
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="register-button"
              disabled={isLoading}
            >
              {isLoading ? 'Registering...' : 'Register'}
            </Button>

            <div className="footer-links">
              <p>Already registered? <Link to="/login">Sign in here</Link></p>
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
