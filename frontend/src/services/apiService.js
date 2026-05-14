import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5050/api';

const apiService = {
  getOptimizedRoute: async () => {
    const response = await axios.get(`${API_BASE}/jobs/optimized`);
    return response.data;
  },

  getRawJobs: async () => {
    const response = await axios.get(`${API_BASE}/jobs`);
    return response.data;
  },

  completeJob: async (id) => {
    try {
      const response = await axios.patch(`${API_BASE}/jobs/${id}/complete`);
      return response.data;
    } catch (_) {
      return { id, status: 'Completed', apiUpdated: false };
    }
  },
};

export default apiService;
