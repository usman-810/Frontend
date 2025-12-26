import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import CompleteProfile from './pages/CompleteProfile';
import AdminDashboard from './pages/AdminDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import ApplyCard from './pages/ApplyCard';
import ViewCards from './pages/ViewCards';
import ViewTransactions from './pages/ViewTransactions';
import MakePayment from './pages/MakePayment';
import CustomerSettings from './pages/CustomerSettings';
import Shop from './pages/customer/Shop';

// Admin Pages
import ManageCustomers from './pages/admin/ManageCustomers';
import ManageCards from './pages/admin/ManageCards';
import ManageTransactions from './pages/admin/ManageTransactions';
import Reports from './pages/admin/Reports';

// Enhanced Theme Configuration
const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
      light: '#8b9eff',
      dark: '#4951d6',
      contrastText: '#fff',
    },
    secondary: {
      main: '#764ba2',
      light: '#9d6dc5',
      dark: '#5a3980',
      contrastText: '#fff',
    },
    success: {
      main: '#43e97b',
      light: '#6eef9f',
      dark: '#2fc765',
    },
    error: {
      main: '#f5576c',
      light: '#ff7a8a',
      dark: '#e03a50',
    },
    warning: {
      main: '#ffa726',
      light: '#ffb851',
      dark: '#fb8c00',
    },
    info: {
      main: '#4facfe',
      light: '#7fc0ff',
      dark: '#0f8cfd',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0,0,0,0.05)',
    '0px 4px 8px rgba(0,0,0,0.08)',
    '0px 8px 16px rgba(0,0,0,0.1)',
    '0px 12px 24px rgba(0,0,0,0.12)',
    '0px 16px 32px rgba(0,0,0,0.15)',
    '0px 20px 40px rgba(0,0,0,0.18)',
    '0px 24px 48px rgba(0,0,0,0.2)',
    '0px 28px 56px rgba(0,0,0,0.22)',
    '0px 32px 64px rgba(0,0,0,0.24)',
    // ... rest of shadows
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
          padding: '8px 20px',
          fontSize: '0.95rem',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
        },
        contained: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        },
        sizeLarge: {
          padding: '12px 32px',
          fontSize: '1rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
        elevation2: {
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        },
        elevation3: {
          boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            },
            '&.Mui-focused': {
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          textTransform: 'uppercase',
          fontSize: '0.85rem',
          letterSpacing: '0.5px',
        },
      },
    },
  },
});

// Loading Component
const LoadingScreen = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontSize: '24px',
    fontWeight: 'bold'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ 
        marginBottom: '20px',
        animation: 'spin 2s linear infinite',
        fontSize: '48px'
      }}>
        🔄
      </div>
      <div>Loading...</div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on actual role
    const redirectPath = user.role === 'ADMIN' ? '/admin/dashboard' : '/customer/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

// Public Route (redirect if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }
  
  if (user) {
    const redirectPath = user.role === 'ADMIN' ? '/admin/dashboard' : '/customer/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

// App Routes Component
function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />

      {/* Complete Profile Route - After Registration */}
      <Route path="/complete-profile" element={<CompleteProfile />} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />

      <Route path="/admin/customers" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <ManageCustomers />
        </ProtectedRoute>
      } />

      <Route path="/admin/cards" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <ManageCards />
        </ProtectedRoute>
      } />

      <Route path="/admin/transactions" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <ManageTransactions />
        </ProtectedRoute>
      } />

      <Route path="/admin/reports" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <Reports />
        </ProtectedRoute>
      } />

      {/* Customer Routes */}
      <Route path="/customer/dashboard" element={
        <ProtectedRoute allowedRoles={['CUSTOMER']}>
          <CustomerDashboard />
        </ProtectedRoute>
      } />

      <Route path="/customer/shop" element={
        <ProtectedRoute allowedRoles={['CUSTOMER']}>
          <Shop />
        </ProtectedRoute>
      } />

      <Route path="/customer/apply-card" element={
        <ProtectedRoute allowedRoles={['CUSTOMER']}>
          <ApplyCard />
        </ProtectedRoute>
      } />

      <Route path="/customer/cards" element={
        <ProtectedRoute allowedRoles={['CUSTOMER']}>
          <ViewCards />
        </ProtectedRoute>
      } />

      <Route path="/customer/transactions" element={
        <ProtectedRoute allowedRoles={['CUSTOMER']}>
          <ViewTransactions />
        </ProtectedRoute>
      } />

      <Route path="/customer/payment" element={
        <ProtectedRoute allowedRoles={['CUSTOMER']}>
          <MakePayment />
        </ProtectedRoute>
      } />

      <Route path="/customer/settings" element={
        <ProtectedRoute allowedRoles={['CUSTOMER']}>
          <CustomerSettings />
        </ProtectedRoute>
      } />

      {/* Default Route */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* 404 Not Found - Redirect to appropriate dashboard */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

// Main App Component
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <AuthProvider>
          <AppRoutes />
          <ToastContainer 
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
            style={{
              zIndex: 99999
            }}
            toastStyle={{
              borderRadius: '12px',
              fontWeight: 600,
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;