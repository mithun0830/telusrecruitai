import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/api';
import '../../styles/variables.css';

const managerPermissions = {
  mng_dashboard: 'Dashboard',
  mng_notif: 'Notification',
  mng_pref: 'Preferences',
  mng_app_status: 'Application Status',
  mng_jb: 'Job Openings'
};

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'Manager', // default role
    permissionNames: [] // array to store selected permissions
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    if (!formData.firstName.trim()) return 'First name is required';
    if (!formData.lastName.trim()) return 'Last name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!formData.email.includes('@')) return 'Invalid email format';
    if (!formData.email.toLowerCase().endsWith('.com')) return 'Please use your work email';
    if (!formData.password) return 'Password is required';
    if (formData.password.length < 8) return 'Password must be at least 8 characters';
    return null;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        permissionNames: checked 
          ? [...prev.permissionNames, name]
          : prev.permissionNames.filter(p => p !== name)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        // Reset permissions when role changes
        permissionNames: name === 'role' ? [] : prev.permissionNames
      }));
    }
    setError('');
    setSuccess('');
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const registrationData = {
        ...formData,
        roleName: formData.role,
        permissionNames: formData.role === 'Manager' ? formData.permissionNames : []
      };
      const result = await authService.register(registrationData);
      
      if (result.success) {
        setSuccess('Sign up successful..!! Account is pending for verification');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          role: 'Manager',
          permissionNames: []
        });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
            <h3 className="text-center mb-2" style={{ color: 'var(--header-bg)' }}>Sign Up</h3>
            <p className="text-center text-muted mb-4">Create your TelusRecruitAI account</p>
            
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            
            {success && (
              <div className="alert alert-success" role="alert">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="firstName" className="form-label">First Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  autoComplete="given-name"
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="lastName" className="form-label">Last Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  autoComplete="family-name"
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label">Work Email</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@company.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="role" className="form-label">Role</label>
                <select
                  className="form-select"
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="Manager">Manager</option>
                </select>
              </div>

              {formData.role === 'Manager' && (
                <div className="mb-4">
                  <label className="form-label">Permissions</label>
                  <div className="d-flex flex-wrap gap-3">
                    {Object.entries(managerPermissions).map(([permission, label]) => (
                      <div className="form-check" key={permission}>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={permission}
                          name={permission}
                          checked={formData.permissionNames.includes(permission)}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor={permission}>
                          {label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary w-100 mb-3"
                disabled={isLoading}
                style={{ background: 'var(--primary-color)', border: 'none' }}
              >
                {isLoading ? 'SIGNING UP...' : 'SIGN UP'}
              </button>

              <div className="text-center mt-3">
                <span className="text-muted">Already have an account? </span>
                <Link to="/login" className="text-decoration-none" style={{ color: 'var(--primary-color)' }}>Login</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
