import axiosInstance from './axios.config';

export const transactionAPI = {
  // Get all transactions with pagination
  getAll: async (page = 0, size = 10, sortBy = 'transactionDate', sortDir = 'DESC') => {
    try {
      console.log('📥 Fetching all transactions...');
      const response = await axiosInstance.get('/api/transactions', {
        params: { page, size, sortBy, sortDir }
      });
      console.log('✅ Transactions fetched:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Get all transactions error:', error);
      throw error;
    }
  },

  // Get transaction by ID
  getById: async (id) => {
    try {
      console.log('📥 Fetching transaction ID:', id);
      const response = await axiosInstance.get(`/api/transactions/${id}`);
      console.log('✅ Transaction found:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Get transaction by ID error:', error);
      throw error;
    }
  },

  // Get transactions by card ID
  getByCard: async (cardId, page = 0, size = 10) => {
    try {
      console.log('📥 Fetching transactions for card ID:', cardId);
      const response = await axiosInstance.get(`/api/transactions/card/${cardId}`, {
        params: { page, size }
      });
      console.log('✅ Card transactions found:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Get transactions by card error:', error);
      throw error;
    }
  },

  // Get transactions by customer ID
  getByCustomer: async (customerId, page = 0, size = 10) => {
    try {
      console.log('📥 Fetching transactions for customer ID:', customerId);
      const response = await axiosInstance.get(`/api/transactions/customer/${customerId}`, {
        params: { page, size }
      });
      console.log('✅ Customer transactions found:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Get transactions by customer error:', error);
      throw error;
    }
  },

  // Create transaction - EXACT backend format
  create: async (transactionData) => {
    try {
      // Backend expects: { cardId, type, amount, description }
      const requestData = {
        cardId: parseInt(transactionData.cardId),
        type: transactionData.type || 'PURCHASE', // PURCHASE or PAYMENT
        amount: parseFloat(transactionData.amount),
        description: transactionData.description || ''
      };

      console.log('🛒 Creating transaction:', requestData);
      const response = await axiosInstance.post('/api/transactions', requestData);
      console.log('✅ Transaction created:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Create transaction error:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  },

  // Purchase - convenience method
  purchase: async (purchaseData) => {
    try {
      const transactionData = {
        cardId: parseInt(purchaseData.cardId),
        type: 'PURCHASE',
        amount: parseFloat(purchaseData.amount),
        description: purchaseData.description || 'Purchase'
      };

      console.log('🛒 Creating purchase:', transactionData);
      const response = await axiosInstance.post('/api/transactions', transactionData);
      console.log('✅ Purchase completed:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Purchase error:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  },

  // Make payment - convenience method
  makePayment: async (paymentData) => {
    try {
      const transactionData = {
        cardId: parseInt(paymentData.cardId),
        type: 'PAYMENT',
        amount: parseFloat(paymentData.amount),
        description: paymentData.description || 'Credit Card Payment'
      };

      console.log('💳 Making payment:', transactionData);
      const response = await axiosInstance.post('/api/transactions', transactionData);
      console.log('✅ Payment completed:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Make payment error:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  },

  // Get daily spending
  getDailySpending: async (cardId) => {
    try {
      console.log('📊 Fetching daily spending for card:', cardId);
      const response = await axiosInstance.get(`/api/transactions/card/${cardId}/daily-spending`);
      console.log('✅ Daily spending:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Get daily spending error:', error);
      throw error;
    }
  },

  // Get total spending
  getTotalSpending: async (cardId) => {
    try {
      console.log('📊 Fetching total spending for card:', cardId);
      const response = await axiosInstance.get(`/api/transactions/card/${cardId}/total-spending`);
      console.log('✅ Total spending:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Get total spending error:', error);
      throw error;
    }
  },

  // Reverse transaction
  reverse: async (id, reason = '') => {
    try {
      console.log('🔄 Reversing transaction ID:', id, 'Reason:', reason);
      const response = await axiosInstance.post(`/api/transactions/${id}/reverse`, null, {
        params: { reason }
      });
      console.log('✅ Transaction reversed:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Reverse transaction error:', error);
      throw error;
    }
  },

  // Get transactions by status
  getByStatus: async (status, page = 0, size = 10) => {
    try {
      console.log('📥 Fetching transactions with status:', status);
      const response = await axiosInstance.get(`/api/transactions/status/${status}`, {
        params: { page, size }
      });
      console.log('✅ Transactions found:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Get transactions by status error:', error);
      throw error;
    }
  },

  // Get transactions by type
  getByType: async (type, page = 0, size = 10) => {
    try {
      console.log('📥 Fetching transactions with type:', type);
      const response = await axiosInstance.get(`/api/transactions/type/${type}`, {
        params: { page, size }
      });
      console.log('✅ Transactions found:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Get transactions by type error:', error);
      throw error;
    }
  },

  // Get transaction statistics for customer
  getStatistics: async (customerId) => {
    try {
      console.log('📊 Fetching statistics for customer:', customerId);
      const response = await axiosInstance.get(`/api/transactions/customer/${customerId}/statistics`);
      console.log('✅ Statistics:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Get statistics error:', error);
      // Return default stats if endpoint doesn't exist
      return {
        data: {
          totalTransactions: 0,
          totalSpending: 0,
          averageTransaction: 0
        }
      };
    }
  },

  // Search transactions
  search: async (searchParams) => {
    try {
      console.log('🔍 Searching transactions:', searchParams);
      const response = await axiosInstance.get('/api/transactions/search', {
        params: searchParams
      });
      console.log('✅ Search results:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Search transactions error:', error);
      throw error;
    }
  }
};