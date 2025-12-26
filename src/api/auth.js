import axiosInstance from './axios.config';

export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await axiosInstance.post('/api/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('❌ Login API error:', error);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      console.log('📡 Sending registration data:', userData);
      
      const response = await axiosInstance.post('/api/auth/register', userData);
      
      console.log('✅ Register API response:', response);
      return response.data;
      
    } catch (error) {
      console.error('❌ Register API error:', error);
      console.error('❌ Error response:', error.response?.data);
      
      // Check for validation errors object
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        
        console.error('🔴 VALIDATION ERRORS FOUND:');
        console.error('================================');
        
        // Log each field error separately
        Object.entries(validationErrors).forEach(([field, message]) => {
          console.error(`   ❌ ${field}: ${message}`);
        });
        
        console.error('================================');
        
        // Create formatted error message
        const errorMessages = Object.entries(validationErrors)
          .map(([field, message]) => `${field}: ${message}`)
          .join('\n');
        
        const apiError = new Error(errorMessages || 'Validation failed');
        apiError.response = error.response;
        throw apiError;
      }
      
      // Extract other error messages
      const errorMessage = error?.response?.data?.message 
        || error?.response?.data?.error
        || error?.response?.data?.details
        || (Array.isArray(error?.response?.data) ? error.response.data.join(', ') : null)
        || error?.message 
        || 'Registration failed';
      
      console.error('🔴 Error message:', errorMessage);
      
      const apiError = new Error(errorMessage);
      apiError.response = error.response;
      throw apiError;
    }
  },

  validateToken: async (token) => {
    try {
      const response = await axiosInstance.get('/api/auth/validate', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Validate token error:', error);
      throw error;
    }
  }
};

// Export for backward compatibility
export const register = authAPI.register;
export const login = authAPI.login;