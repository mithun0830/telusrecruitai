import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signupUser, resetSignupState, setError } from '../../store/slices/signupSlice';
import { Form, Button, Alert, Row, Col } from 'react-bootstrap';
import telusLogo from '../../assets/telus_logo.svg';
import '../../styles/variables.css';
import './Signup.css';

const SignUp = () => {
  const topRef = React.useRef(null);
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
const dispatch = useDispatch();
const { isLoading, error, success } = useSelector((state) => state.signup);
const [successMessage, setSuccessMessage] = useState('');
const [passwordError, setPasswordError] = useState('');
const [confirmPasswordError, setConfirmPasswordError] = useState('');
const navigate = useNavigate();

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

  // Check for password validation errors
  if (passwordError || confirmPasswordError) {
    dispatch(setError('Please fix the password errors before submitting.'));
    return;
  }

  dispatch(signupUser(formData));
};

useEffect(() => {
  if (success || error) { 
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
   
    if (success) {
      setSuccessMessage('Registration successful. Your account is under approval.');
      // Clear the form data
      setFormData({
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
    }
  }
}, [success, error]);

useEffect(() => {
  // Reset signup state when component unmounts
  return () => {
    dispatch(resetSignupState());
  };
}, [dispatch]);

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
      <div className="signup-container">
        <div className="signup-left">
          <img src={telusLogo} alt="Telus Logo" className="telus-logo" />
          <h1>Just a few quick details and you're in. Let's get started.</h1>
        </div>
        <div className="signup-right" ref={topRef}>
          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}
          {successMessage && (
            <Alert variant="success" className="mb-4">
              {successMessage}
            </Alert>
          )}
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>Full Name <span className="required">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Employee ID <span className="required">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Email ID <span className="required">*</span></Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="username@yourcompany.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>Phone Number <span className="required">*</span></Form.Label>
                  <Form.Control
                    type="tel"
                    name="phoneNumber"
                    placeholder="1+ xxx-xxx-xxxx"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
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
              </Col>
            </Row>

            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>Department <span className="required">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Designation <span className="required">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>Cost Center <span className="required">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="costCenter"
                    value={formData.costCenter}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Business Unit</Form.Label>
                  <Form.Control
                    type="text"
                    name="businessUnit"
                    value={formData.businessUnit}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Reporting Manager Email</Form.Label>
              <Form.Control
                type="email"
                name="reportingManagerEmail"
                value={formData.reportingManagerEmail}
                onChange={handleChange}
              />
            </Form.Group>

            <Row className="mb-3">
              <Col>
                <Form.Group>
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
              </Col>
              <Col>
                <Form.Group>
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
              </Col>
            </Row>

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
      </div>
    </div>
  );
};

export default SignUp;
