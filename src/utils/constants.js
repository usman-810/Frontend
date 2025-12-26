export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  VALIDATE: '/api/auth/validate',
  LOGOUT: '/api/auth/logout',
  
  // Customers
  CUSTOMERS: '/api/customers',
  CUSTOMER_BY_ID: (id) => `/api/customers/${id}`,
  CUSTOMER_SEARCH: '/api/customers/search',
  CUSTOMER_STATUS: (status) => `/api/customers/status/${status}`,
  
  // Cards
  CARDS: '/api/cards',
  CARD_BY_ID: (id) => `/api/cards/${id}`,
  CARDS_BY_CUSTOMER: (customerId) => `/api/cards/customer/${customerId}`,
  CARD_ACTIVATE: (id) => `/api/cards/${id}/activate`,
  CARD_BLOCK: (id) => `/api/cards/${id}/block`,
  CARD_UNBLOCK: (id) => `/api/cards/${id}/unblock`,
  
  // Transactions
  TRANSACTIONS: '/api/transactions',
  TRANSACTION_BY_ID: (id) => `/api/transactions/${id}`,
  TRANSACTIONS_BY_CARD: (cardId) => `/api/transactions/card/${cardId}`,
  TRANSACTIONS_BY_CUSTOMER: (customerId) => `/api/transactions/customer/${customerId}`,
};

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  CUSTOMER: 'CUSTOMER'
};



export const CARD_TYPES = ['SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];
export const CARD_STATUS = ['ACTIVE', 'BLOCKED', 'INACTIVE', 'EXPIRED'];
export const TRANSACTION_TYPES = ['PURCHASE', 'PAYMENT', 'REFUND', 'REVERSAL'];