import axiosInstance from './axios.config';

export const customerAPI = {
  // Get all customers with pagination
  getAll: async (page = 0, size = 10, sortBy = 'id', sortDir = 'ASC') => {
    try {
      const response = await axiosInstance.get('/api/customers', {
        params: { page, size, sortBy, sortDir }
      });
      return response;
    } catch (error) {
      console.error('❌ Get all customers error:', error);
      throw error;
    }
  },

  // Get customer by ID
  getById: async (id) => {
    try {
      console.log('📥 Fetching customer with ID:', id);
      const response = await axiosInstance.get(`/api/customers/${id}`);
      console.log('✅ Customer found:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Get customer by ID error:', error);
      
      // If customer not found (404), return null instead of throwing
      if (error.response?.status === 404) {
        console.log('ℹ️ Customer not found (404), returning null');
        return null;
      }
      
      throw error;
    }
  },

  // Create customer (POST)
  create: async (customerData) => {
    try {
      console.log('📤 Creating new customer:', customerData);
      const response = await axiosInstance.post('/api/customers', customerData);
      console.log('✅ Customer created:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Create customer error:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  },

  // Update customer (PUT)
  update: async (id, customerData) => {
    try {
      console.log('📤 Updating customer ID:', id, 'with data:', customerData);
      const response = await axiosInstance.put(`/api/customers/${id}`, customerData);
      console.log('✅ Customer updated:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Update customer error:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  },

  // Smart save - Create or Update (checks if exists first)
  save: async (id, customerData) => {
    try {
      console.log('💾 Smart save for customer ID:', id);
      
      // First check if customer exists
      const existingCustomer = await customerAPI.getById(id);
      
      if (existingCustomer && existingCustomer.data) {
        // Customer exists, use PUT to update
        console.log('📝 Customer exists, updating with PUT...');
        return await customerAPI.update(id, customerData);
      } else {
        // Customer doesn't exist, use POST to create
        console.log('✨ Customer doesn\'t exist, creating with POST...');
        return await customerAPI.create(customerData);
      }
    } catch (error) {
      console.error('❌ Save customer error:', error);
      throw error;
    }
  },

  // Delete customer
  delete: async (id) => {
    try {
      console.log('🗑️ Deleting customer ID:', id);
      const response = await axiosInstance.delete(`/api/customers/${id}`);
      console.log('✅ Customer deleted');
      return response;
    } catch (error) {
      console.error('❌ Delete customer error:', error);
      throw error;
    }
  },

  // Search customers
  search: async (keyword, page = 0, size = 10) => {
    try {
      const response = await axiosInstance.get('/api/customers/search', {
        params: { keyword, page, size }
      });
      return response;
    } catch (error) {
      console.error('❌ Search customers error:', error);
      throw error;
    }
  },

  // Get customers by status
  getByStatus: async (status) => {
    try {
      const response = await axiosInstance.get(`/api/customers/status/${status}`);
      return response;
    } catch (error) {
      console.error('❌ Get customers by status error:', error);
      throw error;
    }
  },

  // Update customer status
  updateStatus: async (id, status) => {
    try {
      console.log('🔄 Updating status for customer ID:', id, 'to:', status);
      const response = await axiosInstance.patch(`/api/customers/${id}/status`, null, {
        params: { status }
      });
      console.log('✅ Status updated');
      return response;
    } catch (error) {
      console.error('❌ Update customer status error:', error);
      throw error;
    }
  },

  // Get customer by user ID (if you have this endpoint)
  getByUserId: async (userId) => {
    try {
      console.log('📥 Fetching customer by user ID:', userId);
      const response = await axiosInstance.get(`/api/customers/user/${userId}`);
      console.log('✅ Customer found by user ID');
      return response;
    } catch (error) {
      console.error('❌ Get customer by user ID error:', error);
      
      if (error.response?.status === 404) {
        console.log('ℹ️ Customer not found for user ID');
        return null;
      }
      
      throw error;
    }
  }
};