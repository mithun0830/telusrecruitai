import axios from 'axios';

const API_BASE_URL = 'http://localhost:1998/api';
const NOTIFICATION_BASE_URL = 'http://localhost:8084/api';

// Create axios instances with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const notificationApi = axios.create({
  baseURL: NOTIFICATION_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
const getAccessToken = () => {
  const token = localStorage.getItem('token');
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

// Notification service
export const notificationService = {
  getUnreadNotifications: async (userId) => {
    try {
      const response = await notificationApi.get(`/notifications/unread/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { success: false, data: { count: 0, notifications: [] } };
    }
  },
  markAsRead: async (notificationId) => {
    try {
      const response = await notificationApi.post(`/notifications/${notificationId}/mark-as-read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { success: false };
    }
  }
};

// User service
export const userService = {
  getPendingApprovals: async () => {
    try {
      const token = getAccessToken();
      console.log('Access Token:', token);

      const config = {
        method: 'GET',
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`
        }
      };

      const response = await fetch(`${API_BASE_URL}/users/pending-approvals`, config);
      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        return {
          success: true,
          data: data.data
        };
      }
      return {
        success: false,
        error: 'Invalid response format'
      };
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      const errorResponse = error.response?.data;
      return {
        success: false,
        error: errorResponse?.errors?.[0] || errorResponse?.message || error.message || 'An error occurred while fetching pending approvals'
      };
    }
  },

  approveUser: async (userId) => {
    try {
      const token = getAccessToken();
      const config = {
        method: 'put',
        url: `${API_BASE_URL}/users/${userId}/approve`,
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`
        }
      };
      
      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error('Error approving user:', error);
      throw error;
    }
  },

  rejectUser: async (userId, reason) => {
    try {
      const token = getAccessToken();
      const config = {
        method: 'post',
        url: `${API_BASE_URL}/users/${userId}/reject`,
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`
        },
        data: { reason }
      };
      
      const response = await axios(config);
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
      const errorResponse = error.response?.data;
      return {
        success: false,
        message: errorResponse?.errors?.[0] || errorResponse?.message || error.message || 'An error occurred while rejecting user'
      };
    }
  }
};

// Auth service
export const authService = {
  register: async (userData) => {
    console.log('authService: Starting registration with data:', userData);
    try {
      const requestData = {
        username: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        password: userData.password,
        roleName: userData.roleName,
        firstName: userData.firstName,
        lastName: userData.lastName,
        permissionNames: userData.permissionNames
      };
      console.log('authService: Sending registration request with:', requestData);
      
      const response = await api.post('/auth/register', requestData);
      console.log('authService: Received registration response:', response);
      
      const responseData = response.data;
      console.log('authService: Parsed response data:', responseData);
      
      if (responseData.success) {
        console.log('authService: Registration successful');
        return {
          success: true,
          data: responseData.data
        };
      } else {
        console.log('authService: Registration failed with message:', responseData.message);
        return {
          success: false,
          message: responseData.errors?.[0] || responseData.message || 'Registration failed'
        };
      }
    } catch (error) {
      console.error('authService: Registration error:', error);
      console.log('authService: Error response:', error.response);
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
