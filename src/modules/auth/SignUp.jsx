import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Form, Button, Alert, Container, Row, Col, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock, faUserTag } from '@fortawesome/free-solid-svg-icons';
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

    try {
      const result = await register(formData);
      if (result.success) {
        navigate('/login', { state: { message: 'Registration successful. Please log in.' } });
      } else {
        setError(result.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'An error occurred during registration. Please try again.');
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
    <div className="login-page">
      <Container>
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col md={6} lg={5}>
            <Card className="shadow">
              <Card.Body>
                <div className="text-center mb-4">
                  <h2>TelusRecruitAI</h2>
                  <h4>Sign Up</h4>
                  <p className="text-muted">Create your account to get started.</p>
                </div>
                
                {error && (
                  <Alert variant="danger" className="mb-4">
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <div className="input-group">
                      <span className="input-group-text">
                        <FontAwesomeIcon icon={faUser} />
                      </span>
                      <Form.Control
                        type="text"
                        name="firstName"
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="py-2"
                      />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <div className="input-group">
                      <span className="input-group-text">
                        <FontAwesomeIcon icon={faUser} />
                      </span>
                      <Form.Control
                        type="text"
                        name="lastName"
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="py-2"
                      />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <div className="input-group">
                      <span className="input-group-text">
                        <FontAwesomeIcon icon={faEnvelope} />
                      </span>
                      <Form.Control
                        type="email"
                        name="email"
                        placeholder="Work Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="py-2"
                      />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <div className="input-group">
                      <span className="input-group-text">
                        <FontAwesomeIcon icon={faLock} />
                      </span>
                      <Form.Control
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="py-2"
                      />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <div className="input-group">
                      <span className="input-group-text">
                        <FontAwesomeIcon icon={faUserTag} />
                      </span>
                      <Form.Select
                        name="roleName"
                        value={formData.roleName}
                        onChange={handleChange}
                        required
                        className="py-2"
                      >
                        <option value="">Select Role</option>
                        <option value="Manager">Manager</option>
                        <option value="RMG">RMG</option>
                      </Form.Select>
                    </div>
                  </Form.Group>

                  {formData.roleName && (
                    <Form.Group className="mb-4">
                      <Form.Label>Permissions</Form.Label>
                      <div className="permissions-container">
                        {renderPermissions()}
                      </div>
                    </Form.Group>
                  )}

                  <div className="d-grid mb-4">
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={isLoading}
                      className="py-2"
                    >
                      {isLoading ? 'Signing Up...' : 'SIGN UP'}
                    </Button>
                  </div>

                  <div className="text-center">
                    <p className="mb-0 text-muted">
                      Already have an account?{' '}
                      <Link to="/login" className="text-decoration-none fw-bold">
                        Sign In
                      </Link>
                    </p>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default SignUp;
