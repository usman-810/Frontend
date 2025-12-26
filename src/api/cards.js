import axiosInstance from './axios.config';

export const cardAPI = {
  // Get all cards with pagination
  getAll: async (page = 0, size = 10) => {
    try {
      const response = await axiosInstance.get('/api/cards', {
        params: { page, size }
      });
      return response;
    } catch (error) {
      console.error('Get all cards error:', error);
      throw error;
    }
  },

  // Get card by ID
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`/api/cards/${id}`);
      return response;
    } catch (error) {
      console.error('Get card by ID error:', error);
      throw error;
    }
  },

  // Get cards by customer ID
  getByCustomer: async (customerId) => {
    try {
      const response = await axiosInstance.get(`/api/cards/customer/${customerId}`);
      return response;
    } catch (error) {
      console.error('Get cards by customer error:', error);
      throw error;
    }
  },

  // Issue new card
  create: async (cardData) => {
    try {
      const response = await axiosInstance.post('/api/cards', cardData);
      return response;
    } catch (error) {
      console.error('Create card error:', error);
      throw error;
    }
  },

  // Activate card
  activate: async (id) => {
    try {
      const response = await axiosInstance.patch(`/api/cards/${id}/activate`);
      return response;
    } catch (error) {
      console.error('Activate card error:', error);
      throw error;
    }
  },

  // Block card
  block: async (id, reason = '') => {
    try {
      const response = await axiosInstance.patch(`/api/cards/${id}/block`, null, {
        params: { reason }
      });
      return response;
    } catch (error) {
      console.error('Block card error:', error);
      throw error;
    }
  },

  // Unblock card
  unblock: async (id) => {
    try {
      const response = await axiosInstance.patch(`/api/cards/${id}/unblock`);
      return response;
    } catch (error) {
      console.error('Unblock card error:', error);
      throw error;
    }
  },

  // Update credit limit
  updateCreditLimit: async (id, limit) => {
    try {
      const response = await axiosInstance.patch(`/api/cards/${id}/credit-limit`, null, {
        params: { limit }
      });
      return response;
    } catch (error) {
      console.error('Update credit limit error:', error);
      throw error;
    }
  },

  // Update daily limit
  updateDailyLimit: async (id, limit) => {
    try {
      const response = await axiosInstance.patch(`/api/cards/${id}/daily-limit`, null, {
        params: { limit }
      });
      return response;
    } catch (error) {
      console.error('Update daily limit error:', error);
      throw error;
    }
  },

  // Get cards by status
  getByStatus: async (status) => {
    try {
      const response = await axiosInstance.get(`/api/cards/status/${status}`);
      return response;
    } catch (error) {
      console.error('Get cards by status error:', error);
      throw error;
    }
  },

  // Get cards by type
  getByType: async (type) => {
    try {
      const response = await axiosInstance.get(`/api/cards/type/${type}`);
      return response;
    } catch (error) {
      console.error('Get cards by type error:', error);
      throw error;
    }
  }
};