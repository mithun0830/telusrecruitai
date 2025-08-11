import axios from 'axios';
import { clearAllCookies } from '../utils/cookieUtils';

const ONELOGIN_DOMAIN = 'https://telus-sandbox.onelogin.com';
const ONELOGIN_LOGOUT_URL = `${ONELOGIN_DOMAIN}/oidc/2/logout`;
const ONELOGIN_END_SESSION_URL = `${ONELOGIN_DOMAIN}/oidc/2/logout`;
// const API_BASE_URL = 'https://recruitai-authentication-865090871947.asia-south1.run.app/api';
const API_BASE_URL = 'http://localhost:1998/api';
const NOTIFICATION_BASE_URL = 'https://notification-service-865090871947.asia-south1.run.app/api';
// const AI_SEARCH_BASE_URL = 'https://aimatch-lock-865090871947.asia-south1.run.app/api';
const AI_SEARCH_BASE_URL = 'https://mark-ai-865090871947.asia-south1.run.app/api';
const Google_Calendar_API_BASE_URL = 'https://google-calendar-app-865090871947.asia-south1.run.app/api';
const INTERVIEW_ROUNDS_API_BASE_URL = 'https://interview-hub-865090871947.asia-south1.run.app/api';
const AI_FEEDBACK_BASE_URL = 'https://feedback-api-865090871947.us-central1.run.app/api';


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

const aiFeedbackApi = axios.create({
  baseURL: AI_FEEDBACK_BASE_URL,
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
  // Special handling for chat messages
  if (response.config?.url?.includes('/chat/message')) {
    return {
      success: true,
      data: response.data
    };
  }

  // For responses with only a message (like status updates)
  if (response.status === 200 && response.data?.message && !response.data?.data) {
    return {
      success: true,
      message: response.data.message
    };
  }
  
  // For responses with data
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
const setIdToken = (token) => localStorage.setItem('idToken', token);
const getIdToken = () => localStorage.getItem('idToken');
const removeTokens = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('idToken');
  localStorage.removeItem('user');
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
addTokenInterceptor(interviewApi);
// Note: aiFeedbackApi doesn't need token interceptor as it's localhost

addResponseInterceptor(api);
addResponseInterceptor(ai_api);
addResponseInterceptor(notificationApi);
addResponseInterceptor(interviewApi);
addResponseInterceptor(aiFeedbackApi);

// Notification service
export const notificationService = {
  getUnreadNotifications: async (userId) => {
    return await notificationApi.get(`/notifications/unread/${userId}`);
  },
  markAsRead: async (notificationId) => {
    return await notificationApi.put(`/notifications/${notificationId}/mark-as-read`);
  },
  process: async (data) => {
    return await notificationApi.post('/notifications/process', data);
  }
};

// User service
export const userService = {
  getPendingApprovals: async () => {
    return await api.get('/users/pending-approvals');
  },

  approveUser: async (userId) => {
    return await api.put(`/users/${userId}/approve`);
  },

  rejectUser: async (userId, reason) => {
    return await api.put(`/users/${userId}/reject`, { reason });
  }
};

// Auth service
export const authService = {
  exchangeOneLoginToken: async (code) => {
    const response = await api.post('/auth/exchange', { code: code });
    if (response.success && response.data.idToken) {
      setIdToken(response.data.idToken);
      if (response.data.token) {
        setAccessToken(response.data.token);
      }
      if (response.data.refreshToken) {
        setRefreshToken(response.data.refreshToken);
      }
    }
    return response;
  },

  logout: () => {
    const idToken = getIdToken();
    const redirectUri = encodeURIComponent(`${window.location.origin}/login`);

    // Remove all tokens and cookies
    removeTokens();
    clearAllCookies();

     console.log('idToken:', idToken);

    // Redirect to OneLogin logout URL if we have an id_token
    if (idToken) {
      window.location.href = `${ONELOGIN_END_SESSION_URL}?id_token_hint=${idToken}&post_logout_redirect_uri=${redirectUri}&prompt=login`;
    } else {
      // If no id_token, just redirect to login page with force_login parameter
      window.location.href = `${window.location.origin}/login?force_login=true`;
    }
  },

  refreshToken: async () => {
    try {
      const refreshToken = getRefreshToken();
      const response = await api.post('/auth/refresh-token', { refreshToken });
      if (response.success) {
        setAccessToken(response.data.token);
      } else {
        removeTokens();
      }
      return response;
    } catch (error) {
      removeTokens();
      throw error;
    }
  },

  updateAccountStatus: async (data) => {
    return await api.post('/auth/update-account-status', data);
  },

};

// Candidate service
export const candidateService = {
  searchCandidates: async (searchString) => {
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

  getManagerForCandidate: async (managerId) => {
    console.log('🔄 API Service: Calling manager endpoint for ID:', managerId);
    try {
      const response = await interviewApi.get(`/candidates/${managerId}/manager`);
      console.log('📋 API Service: Raw response received:', response);
      return response;
    } catch (error) {
      console.error('❌ API Service: Error in getManagerForCandidate:', error);
      console.error('❌ API Service: Error response:', error.response);
      throw error;
    }
  },

  getHRPersonnel: async () => {
    console.log('🔄 API Service: Calling HR endpoint');
    try {
      // Use the full HR API URL
      const response = await axios.get('https://recruitai-authentication-865090871947.asia-south1.run.app/api/hr', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('📋 API Service: HR Raw response received:', response);
      
      // Handle the response in the same format as other services
      return {
        success: true,
        data: response.data?.data || response.data,
        message: response.data?.message
      };
    } catch (error) {
      console.error('❌ API Service: Error in getHRPersonnel:', error);
      console.error('❌ API Service: Error response:', error.response);
      throw error;
    }
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
  }
};

// Manager service
export const managerService = {
  getManagerStats: async () => {
    return await api.get('/managers');
  },
  getAllManagers: async () => {
    return await api.get('/managers');
  },
  getManagerById: async (managerId) => {
    return await api.get(`/users/${managerId}`);
  }
};

export const interviewService = {
  getInterviewRounds: async () => {
    return await interviewApi.get('/interview-rounds');
  },

  shortlistCandidates: async (data) => {
    return await interviewApi.post('/candidates/shortlist', data);
  },

  getShortlistedCandidates: async (managerId) => {
    const response = await interviewApi.get(`/candidates/interview-history?managerId=${managerId}`);
    // The API response is already in the correct format
    return response.data;
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

  saveFeedback: async (feedbackData) => {
    return await interviewApi.put('/interviews/update-status', feedbackData);
  },
};

// AI Feedback service for Google Drive integration
export const aiFeedbackService = {
  // Check if candidate folder exists in Google Drive
  checkCandidateFolder: async (candidateEmail) => {
    return await aiFeedbackApi.get(`/check-candidate-folder/${candidateEmail}`);
  },

  // Generate feedback for candidate from Google Drive files
  generateFeedbackForCandidate: async (candidateEmail, metadata = {}) => {
    return await aiFeedbackApi.post('/generate-feedback-for-candidate', {
      candidateEmail,
      metadata
    });
  },

  // Get questions asked by interviewer for candidate
  getQuestionsAsked: async (candidateEmail) => {
    return await aiFeedbackApi.post(`/get-questions-asked/${candidateEmail}`);
  },

  // Get JD relevance analysis for candidate
  getJdRelevance: async (candidateEmail) => {
    return await aiFeedbackApi.post('/get-jd-relevance', {
      candidateEmail
    });
  },

  // Get feedback history
  getFeedbackHistory: async () => {
    return await aiFeedbackApi.get('/feedback-history');
  },

  // Delete specific feedback
  deleteFeedback: async (feedbackIndex) => {
    return await aiFeedbackApi.delete(`/delete-feedback/${feedbackIndex}`);
  },

  // Save feedback
  saveFeedback: async (feedbackData) => {
    return await aiFeedbackApi.post('/save-feedback', feedbackData);
  }
};


export default api;
