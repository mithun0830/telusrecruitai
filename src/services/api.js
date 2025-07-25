import axios from 'axios';

const ONELOGIN_URL = 'https://telusrecruitai.onelogin.com';
const API_BASE_URL = 'https://recruitai-authentication-865090871947.asia-south1.run.app/api';
const NOTIFICATION_BASE_URL = 'https://notification-service-865090871947.asia-south1.run.app/api';
const AI_SEARCH_BASE_URL = 'https://aimatch-lock-865090871947.asia-south1.run.app/api';
const Google_Calendar_API_BASE_URL = 'https://google-calendar-app-865090871947.asia-south1.run.app/api';
const INTERVIEW_ROUNDS_API_BASE_URL = 'https://interview-hub-865090871947.asia-south1.run.app/api';

// Create axios instances with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const ai_api = axios.create({
  baseURL: AI_SEARCH_BASE_URL,
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

const googleApi = axios.create({
  baseURL: Google_Calendar_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const interviewApi = axios.create({
  baseURL: INTERVIEW_ROUNDS_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Error handler function
const handleAxiosError = (error) => {
  if (!error.response) {
    // Network error
    return Promise.reject({
      success: false,
      message: 'Network error. Please check your internet connection.'
    });
  }

  console.error('API Error:', error.response);
  const { data } = error.response;
  console.error('data:', data);
  const { statusCode } = data;

  console.error('statusCode Error:', statusCode);

  // Prioritize the error message from response.errors.message
  const errorMessage = data?.errors?.message || data?.message || data?.errors?.[0] || 'An error occurred';

  switch (statusCode) {
    case 400:
      return Promise.reject({
        success: false,
        message: errorMessage || 'Invalid request'
      });
    case 401:
      // Clear tokens on authentication error
      removeTokens();
      return Promise.reject({
        success: false,
        message: errorMessage || 'Your session has expired. Please login again.'
      });
    case 403:
      return Promise.reject({
        success: false,
        message: errorMessage || 'You do not have permission to perform this action'
      });
    case 404:
      return Promise.reject({
        success: false,
        message: errorMessage || 'Resource not found'
      });
    case 409:
      return Promise.reject({
        success: false,
        message: errorMessage || 'Dulplicate entry or conflict'
      });
    case 422:
      return Promise.reject({
        success: false,
        message: errorMessage || 'Validation error'
      });
    case 500:
      return Promise.reject({
        success: false,
        message: errorMessage || 'Internal server error. Please try again later.'
      });
    default:
      return Promise.reject({
        success: false,
        message: errorMessage || 'Something went wrong. Please try again.'
      });
  }
};

// Response success handler
const handleAxiosSuccess = (response) => {
  return {
    success: true,
    data: response.data?.data || response.data,
    message: response.data?.message
  };
};



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

// Request interceptors for adding token to requests
const addTokenInterceptor = (axiosInstance) => {
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = getAccessToken();
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
};

// Response interceptors for handling responses and errors
const addResponseInterceptor = (axiosInstance) => {
  axiosInstance.interceptors.response.use(
    (response) => handleAxiosSuccess(response),
    (error) => handleAxiosError(error)
  );
};

// Add interceptors to all axios instances
addTokenInterceptor(api);
addTokenInterceptor(ai_api);
addTokenInterceptor(notificationApi);

addResponseInterceptor(api);
addResponseInterceptor(ai_api);
addResponseInterceptor(notificationApi);

// Notification service
export const notificationService = {
  getUnreadNotifications: async (userId) => {
<<<<<<< HEAD
    try {
      const response = await notificationApi.get(`/notifications/unread/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return {
        success: false,
        data: { count: 0, notifications: [] },
        statusCode: error.response?.status || 500,
        errors: {
          message: error.response?.data?.errors?.message || 'An unexpected error occurred while fetching notifications. Please try again later.'
        },
        timestamp: Date.now()
      };
    }
  },
  markAsRead: async (notificationId) => {
    try {
      const response = await notificationApi.post(`/notifications/${notificationId}/mark-as-read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return {
        success: false,
        data: null,
        statusCode: error.response?.status || 500,
        errors: {
          message: error.response?.data?.errors?.message || 'An unexpected error occurred while marking notification as read. Please try again later.'
        },
        timestamp: Date.now()
      };
    }
=======
    return await notificationApi.get(`/notifications/unread/${userId}`);
  },
  markAsRead: async (notificationId) => {
    return await notificationApi.put(`/notifications/${notificationId}/mark-as-read`);
  },
  process: async (data) => {
    return await notificationApi.post('/notifications/process', data);
>>>>>>> stagging
  }
};

// User service
export const userService = {
  getPendingApprovals: async () => {
<<<<<<< HEAD
    try {
      const token = getAccessToken();
      console.log('Access Token:', token);

      const response = await api.get('/users/pending-approvals');
      const responseData = response.data;

      if (responseData.success && Array.isArray(responseData.data)) {
        return responseData;
      }
      return responseData;
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      return {
        success: false,
        data: null,
        statusCode: error.response?.status || 500,
        errors: {
          message: error.response?.data?.errors?.message || 'An unexpected error occurred while fetching approvals. Please try again later.'
        },
        timestamp: Date.now()
      };
    }
  },

  approveUser: async (userId) => {
    try {
      const response = await api.put(`/users/${userId}/approve`);
      return response.data;
    } catch (error) {
      console.error('Error approving user:', error);
      return {
        success: false,
        data: null,
        statusCode: error.response?.status || 500,
        errors: {
          message: error.response?.data?.errors?.message || 'An unexpected error occurred while approving user. Please try again later.'
        },
        timestamp: Date.now()
      };
    }
  },

  rejectUser: async (userId, reason) => {
    try {
      const response = await api.put(`/users/${userId}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error rejecting user:', error);
      return {
        success: false,
        data: null,
        statusCode: error.response?.status || 500,
        errors: {
          message: error.response?.data?.errors?.message || 'An unexpected error occurred while rejecting user. Please try again later.'
        },
        timestamp: Date.now()
      };
    }
=======
    return await api.get('/users/pending-approvals');
  },

  approveUser: async (userId) => {
    return await api.put(`/users/${userId}/approve`);
  },

  rejectUser: async (userId, reason) => {
    return await api.put(`/users/${userId}/reject`, { reason });
>>>>>>> stagging
  }
};

// Auth service
export const authService = {
  register: async (userData) => {
<<<<<<< HEAD
    console.log('authService: Starting registration with data:', userData);
    try {
      const requestData = {
        username:userData.fullName,
        fullName: userData.fullName,
        employeeId:userData.employeeId,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        department: userData.department,
        designation: userData.designation,
        region: userData.region,
        costCenter: userData.costCenter,
        businessUnit: userData.businessUnit,
        reportingManagerEmail: userData.reportingManagerEmail,
        roleName: userData.role,
        password: userData.password,
        confirmPassword: userData.confirmPassword,
        permissionNames: userData.managerPermissions,
        profilePicture: userData.profilePicture,
      };
      console.log('authService: Sending registration request with:', requestData);
      
      const response = await api.post('/auth/register', requestData);
      console.log('authService: Received registration response:', response);
      
      const responseData = response.data;
      console.log('authService: Parsed response data:', responseData);
      
      if (responseData.success) {
        console.log('authService: Registration successful');
        return responseData;
      } else {
        console.log('authService: Registration failed with message:', responseData.errors?.message);
        return responseData;
      }
    } catch (error) {
      console.error('authService: Registration error:', error);
      console.log('authService: Error response:', error.response);
      return {
        success: false,
        data: null,
        statusCode: error.response?.status || 500,
        errors: {
          message: error.response?.data?.errors?.message || 'An unexpected error occurred during registration. Please try again later.'
        },
        timestamp: Date.now()
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
        return responseData;
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        data: null,
        statusCode: error.response?.status || 500,
        errors: {
          message: error.response?.data?.errors?.message || 'An unexpected error occurred during login. Please try again later.'
        },
        timestamp: Date.now()
      };
=======
    const requestData = {
      username: userData.fullName,
      fullName: userData.fullName,
      employeeId: userData.employeeId,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
      department: userData.department,
      designation: userData.designation,
      region: userData.region,
      costCenter: userData.costCenter,
      businessUnit: userData.businessUnit,
      reportingManagerEmail: userData.reportingManagerEmail,
      roleName: userData.role,
      password: userData.password,
      confirmPassword: userData.confirmPassword,
      permissionNames: userData.managerPermissions,
      profilePicture: userData.profilePicture,
    };

    return await api.post('/auth/register', requestData);
  },

  exchangeOneLoginToken: async (code) => {
    const response = await api.post('/auth/exchange', { code: code });
    return response;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.success) {
      setAccessToken(response.data.token);
      setRefreshToken(response.data.refreshToken);
>>>>>>> stagging
    }
    return response;
  },

  logout: () => {
    removeTokens();
  },

  refreshToken: async () => {
    try {
      const refreshToken = getRefreshToken();
      const response = await api.post('/auth/refresh-token', { refreshToken });
<<<<<<< HEAD
      const responseData = response.data;
      if (responseData.success) {
        setAccessToken(responseData.data.token);
        return responseData;
      } else {
        removeTokens();
        return responseData;
=======
      if (response.success) {
        setAccessToken(response.data.token);
      } else {
        removeTokens();
>>>>>>> stagging
      }
      return response;
    } catch (error) {
<<<<<<< HEAD
      console.error('Token refresh error:', error);
      removeTokens();
      return {
        success: false,
        data: null,
        statusCode: error.response?.status || 500,
        errors: {
          message: error.response?.data?.errors?.message || 'An unexpected error occurred during token refresh. Please try again later.'
        },
        timestamp: Date.now()
      };
=======
      removeTokens();
      throw error;
>>>>>>> stagging
    }
  },

  updateAccountStatus: async (data) => {
    return await api.post('/auth/update-account-status', data);
  },

};

// Candidate service
export const candidateService = {
  searchCandidates: async (searchString) => {
<<<<<<< HEAD
    try {
      const response = await ai_api.post(`/resumes/match-new`, null, {
        params: { jd: searchString }
      });
      const responseData = response.data;
      console.log('Candidate search response data:', responseData);
      return responseData;
    } catch (error) {
      console.error('Candidate search error:', error);
      return {
        success: false,
        data: null,
        statusCode: error.response?.status || 500,
        errors: {
          message: error.response?.data?.errors?.message || 'An unexpected error occurred during candidate search. Please try again later.'
        },
        timestamp: Date.now()
      };
    }
=======
    return await ai_api.post(`/resumes/match-new`, null, {
      params: { jd: searchString }
    });
  },
  searchExternalCandidates: async (searchString) => {
    return await ai_api.post(`/candidates/generate-candidates`, { jd: searchString });
  },
  generateJobDescription: async (prompt) => {
    return await ai_api.post('/job-descriptions/generate', { prompt });
  },
  lockCandidate: async (candidate, currentUserId) => {
    const requestBody = {
      resumeId: candidate.resume.id,
      managerId: candidate.managerID,
      name: candidate.resume.name,
      email: candidate.resume.email,
      phoneNumber: candidate.resume.phoneNumber,
      score: candidate.score,
      executiveSummary: candidate.analysis?.executiveSummary || '',
      keyStrengths: candidate.analysis?.keyStrengths?.map(s => s.strength) || [],
      improvementAreas: candidate.analysis?.improvementAreas?.map(a => a.gap) || [],
      technicalSkills: candidate.analysis?.categoryScores?.technicalSkills || 0,
      experience: candidate.analysis?.categoryScores?.experience || 0,
      education: candidate.analysis?.categoryScores?.education || 0,
      softSkills: candidate.analysis?.categoryScores?.softSkills || 0,
      achievements: candidate.analysis?.categoryScores?.achievements || 0,
      recommendationType: candidate.analysis?.recommendation?.type || '',
      recommendationReason: candidate.analysis?.recommendation?.reason || '',
      managerId: currentUserId,
      locked: true,
      status: "INITIATE"
    };
    return await ai_api.post('/resume-locks/lock', requestBody);
  },
  unlockCandidate: async (candidate, currentUserId) => {
    const requestBody = {
      resumeId: candidate.resume.id,
      managerId: candidate.managerID,
      name: candidate.resume.name,
      email: candidate.resume.email,
      phoneNumber: candidate.resume.phoneNumber,
      score: candidate.score,
      executiveSummary: candidate.analysis?.executiveSummary || '',
      keyStrengths: candidate.analysis?.keyStrengths?.map(s => s.strength) || [],
      improvementAreas: candidate.analysis?.improvementAreas?.map(a => a.gap) || [],
      technicalSkills: candidate.analysis?.categoryScores?.technicalSkills || 0,
      experience: candidate.analysis?.categoryScores?.experience || 0,
      education: candidate.analysis?.categoryScores?.education || 0,
      softSkills: candidate.analysis?.categoryScores?.softSkills || 0,
      achievements: candidate.analysis?.categoryScores?.achievements || 0,
      recommendationType: candidate.analysis?.recommendation?.type || '',
      recommendationReason: candidate.analysis?.recommendation?.reason || '',
      managerId: currentUserId,
      locked: false,
      status: "INITIATE"
    };
    return await ai_api.post('/resume-locks/unlock', requestBody);
  },

  getMatchingInterviewers: async (jobDescription) => {
    return await ai_api.post(`/interviewer-matching/job-description`, {
      jobDescription: jobDescription
    });
  },

  sendChatMessage: async (resumeId, message) => {
    return await ai_api.post('/chat/message', {
      currentResumeId: resumeId,
      message: message
    });
  },
  generateQuestions: async (jobDescription) => {
    return await ai_api.post('/job-descriptions/generate-questions', {
      jobDescription: jobDescription
    });
>>>>>>> stagging
  }
};

// Manager service
export const managerService = {
  getManagerStats: async () => {
    return await api.get('/managers');
  },
  getAllManagers: async () => {
    return await api.get('/managers');
  }
};

export const interviewService = {
  getInterviewRounds: async () => {
    return await interviewApi.get('/interview-rounds');
  },

  shortlistCandidates: async (data) => {
    return await interviewApi.post('/candidates/shortlist', data);
  },

  getFreeSlots: async (requestBody) => {
    return await googleApi.post('/free-slots', requestBody);
  },

  scheduleMeeting: async (requestBody) => {
    return await googleApi.post('/schedule-meeting', requestBody)
  },

  updateInterviewStatus: async (requestBody) => {
    return await interviewApi.put('/interviews/update-status', requestBody);
  },
};


export default api;
