import axios from 'axios';

const API_BASE_URL = 'http://localhost:8082/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
const getAccessToken = () => {
  const token = localStorage.getItem('token'); // Changed from 'accessToken' to 'token'
  console.log('Token from localStorage:', token);
  return token;
};
const setAccessToken = (token) => localStorage.setItem('token', token);
const getRefreshToken = () => localStorage.getItem('refreshToken');
const setRefreshToken = (token) => localStorage.setItem('refreshToken', token);
const removeTokens = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
};

// Request interceptor for adding token to requests
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


// Auth service
// User service for managing user-related operations
export const userService = {
  getPendingApprovals: async () => {
    try {
      const token = getAccessToken();
      console.log('Access Token:', token);

      // Match exact curl request headers
      const config = {
        method: 'GET',
        headers: {
          'Accept': '*/*',
          // 'Authorization': `Bearer ${token}`
        }
      };
      console.log('Request config:', JSON.stringify(config, null, 2));

      console.log('Sending request to:', 'http://localhost:8082/api/users/pending-approvals');
      const response = await fetch('http://localhost:8082/api/users/pending-approvals', config);
      console.log('Pending approvals response status:', response.status);
      console.log('Pending approvals response headers:', JSON.stringify(Object.fromEntries(response.headers), null, 2));
      
      const data = await response.json();
      console.log('Pending approvals response data:', JSON.stringify(data, null, 2));

      // Check if response matches the expected format
      if (data && data.success) {
        return data;
      } else {
        throw new Error(`Invalid response format: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      const errorResponse = error.response?.data;
      return {
        success: false,
        error: errorResponse?.errors?.[0] || errorResponse?.message || error.message || 'An error occurred while fetching pending approvals'
      };
    }
  },

  getPendingApprovalsAxios: async () => {
    try {
      const token = getAccessToken();
      console.log('Access Token:', token);

      // Match exact curl request headers
      const config = {
        method: 'get',
        url: 'http://localhost:8082/api/users/pending-approvals',
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`
        }
      };
      console.log('Axios Request config:', JSON.stringify(config, null, 2));

      const response = await axios(config);
      console.log('Axios Pending approvals response:', response);
      
      // Check if response matches the expected format
      if (response.data && response.data.success) {
        return response.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching pending approvals with Axios:', error);
      console.error('Error response:', error.response?.data);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'An error occurred while fetching pending approvals'
      };
    }
  },

  approveUser: async (userId) => {
    try {
      const token = getAccessToken();
      const config = {
        method: 'put',
        url: `http://localhost:8082/api/users/${userId}/approve`,
        headers: {
          'Accept': '*/*',
          // 'Authorization': `Bearer ${token}`
        }
      };
      console.log('Approve user config:', JSON.stringify(config, null, 2));
      
      const response = await axios(config);
      console.log('Approve user response:', response);
      
      return response.data;
    } catch (error) {
      console.error('Error approving user:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  rejectUser: async (userId, reason) => {
    try {
      const token = getAccessToken();
      const config = {
        method: 'post',
        url: `http://localhost:8082/api/users/${userId}/reject`,
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`
        },
        data: { reason }
      };
      console.log('Reject user config:', JSON.stringify(config, null, 2));
      
      const response = await axios(config);
      console.log('Reject user response:', response);
      
      const responseData = response.data;
      if (responseData.success) {
        return responseData;
      } else {
        return {
          success: false,
          message: responseData.errors?.[0] || responseData.message || 'Rejection failed'
        };
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
      console.error('Error response:', error.response?.data);
      const errorResponse = error.response?.data;
      return {
        success: false,
        message: errorResponse?.errors?.[0] || errorResponse?.message || error.message || 'An error occurred while rejecting user'
      };
    }
  }
};

export const authService = {
register: async (userData) => {
    try {
      const response = await api.post('/auth/register', {
        username: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        password: userData.password,
        roleName: userData.roleName,
        firstName: userData.firstName,
        lastName: userData.lastName,
        permissionNames: userData.permissionNames
      });
      const responseData = response.data;
      if (responseData.success) {
        return {
          success: true,
          data: responseData.data
        };
      } else {
        return {
          success: false,
          message: responseData.errors?.[0] || responseData.message || 'Registration failed'
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorResponse = error.response?.data;
      return {
        success: false,
        message: errorResponse?.errors?.[0] || errorResponse?.message || error.message || 'An error occurred during registration'
      };
    }
  },

  login: async (email, password) => {
    try {
      const loginResponse = await api.post('/auth/login', { email, password });
      const responseData = loginResponse.data;
      console.log('Login response data:', responseData);
      if (responseData.success) {
        localStorage.setItem('token', responseData.data.token);
        setRefreshToken(responseData.data.refreshToken);
        return responseData;
      } else {
        // Handle error response with errors array
        return {
          success: false,
          message: responseData.errors?.[0] || responseData.message || 'Login failed'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorResponse = error.response?.data;
      return {
        success: false,
        message: errorResponse?.errors?.[0] || errorResponse?.message || error.message || 'An error occurred during login'
      };
    }
  },

  logout: () => {
    removeTokens();
  },

  refreshToken: async () => {
    try {
      const refreshToken = getRefreshToken();
      const response = await api.post('/auth/refresh-token', { refreshToken });
      const responseData = response.data;
      if (responseData.success) {
        setAccessToken(responseData.data.token);
        return {
          success: true,
          data: responseData.data
        };
      } else {
        removeTokens();
        return {
          success: false,
          message: responseData.errors?.[0] || responseData.message || 'Token refresh failed'
        };
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      const errorResponse = error.response?.data;
      removeTokens();
      return {
        success: false,
        message: errorResponse?.errors?.[0] || errorResponse?.message || error.message || 'An error occurred during token refresh'
      };
    }
  }
};


export default api;
