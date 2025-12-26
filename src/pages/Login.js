import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Container, Box, Paper, TextField, Button, Typography,
  InputAdornment, IconButton, Alert, Divider, Chip, Grid, Stack
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Login as LoginIcon,
  CreditCard,
  CheckCircle,
  Fingerprint,
  Shield
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import CreditCard3D from '../components/CreditCard3D';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username.trim() || !formData.password) {
      setError('Please enter both username and password');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const result = await login(formData);
      
      if (result.success) {
        toast.success('Welcome back!');
        setTimeout(() => {
          if (result.user.role === 'ADMIN') {
            navigate('/admin/dashboard');
          } else {
            navigate('/customer/dashboard');
          }
        }, 500);
      } else {
        setError(result.error || 'Login failed. Please try again.');
        toast.error(result.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const securityFeatures = [
    { icon: <Shield />, text: '256-bit Encryption' },
    { icon: <Fingerprint />, text: 'Biometric Auth' },
    { icon: <CheckCircle />, text: 'Two-Factor Auth' },
    { icon: <CheckCircle />, text: 'Fraud Protection' }
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: '#0f0c29',
        backgroundImage: 'linear-gradient(to right, #0f0c29, #302b63, #24243e)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 80% 20%, rgba(120, 119, 198, 0.3), transparent 50%), radial-gradient(circle at 20% 80%, rgba(255, 119, 198, 0.3), transparent 50%)',
          animation: 'pulse 15s ease-in-out infinite',
        }
      }}
    >
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: 4 }}>
        <Grid container spacing={4} alignItems="center">
          {/* Left Side - Welcome Back with 3D Cards */}
          <Grid item xs={12} md={6}>
            <Box sx={{ color: 'white', pr: { md: 4 } }}>
              {/* Animated Logo */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 4,
                  animation: 'slideInLeft 1s ease-out'
                }}
              >
                <Box
                  sx={{
                    p: 1.5,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '15px',
                    mr: 2,
                    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)'
                  }}
                >
                  <CreditCard sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h3" fontWeight="bold">
                  CardHub
                </Typography>
              </Box>

              {/* Main Heading */}
              <Typography 
                variant="h1" 
                fontWeight="bold" 
                sx={{ 
                  mb: 2, 
                  lineHeight: 1.2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '2.5rem', md: '3.5rem' }
                }}
              >
                Welcome Back!
              </Typography>

              <Typography 
                variant="h6" 
                sx={{ mb: 4, opacity: 0.9, fontWeight: 300 }}
              >
                Sign in to access your personalized credit card dashboard
              </Typography>

              {/* Single Large 3D Card */}
              <Box 
                sx={{ 
                  mb: 4,
                  maxWidth: '500px',
                  transform: 'perspective(1000px) rotateY(-10deg)',
                  transition: 'all 0.5s',
                  '&:hover': {
                    transform: 'perspective(1000px) rotateY(0deg) scale(1.05)'
                  }
                }}
              >
                <CreditCard3D type="premium" animate />
              </Box>

              {/* Security Features */}
              <Box 
                sx={{ 
                  p: 3,
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: 3,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  mb: 4
                }}
              >
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <Shield sx={{ mr: 1, color: '#667eea' }} />
                  Bank-Level Security
                </Typography>
                <Grid container spacing={2}>
                  {securityFeatures.map((feature, index) => (
                    <Grid item xs={6} key={index}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ color: '#4ade80', mr: 1 }}>
                          {feature.icon}
                        </Box>
                        <Typography variant="body2">
                          {feature.text}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Trust Indicators */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  gap: 4,
                  p: 3,
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: 3,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <Box>
                  <Typography 
                    variant="h3" 
                    fontWeight="bold"
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    99.9%
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>Uptime</Typography>
                </Box>
                <Box>
                  <Typography 
                    variant="h3" 
                    fontWeight="bold"
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    24/7
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>Support</Typography>
                </Box>
                <Box>
                  <Typography 
                    variant="h3" 
                    fontWeight="bold"
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    10K+
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>Users</Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Right Side - Login Form */}
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={24} 
              sx={{ 
                p: 5, 
                borderRadius: 4,
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                border: '1px solid rgba(255,255,255,0.18)',
                maxWidth: 500,
                mx: 'auto',
                animation: 'slideInRight 1s ease-out',
                '@keyframes slideInRight': {
                  from: {
                    opacity: 0,
                    transform: 'translateX(50px)'
                  },
                  to: {
                    opacity: 1,
                    transform: 'translateX(0)'
                  }
                }
              }}
            >
              {/* Form Header */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Box 
                  sx={{ 
                    display: 'inline-flex',
                    p: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '50%',
                    mb: 2,
                    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)'
                  }}
                >
                  <LoginIcon sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Typography 
                  variant="h4" 
                  fontWeight="bold"
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  Sign In
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Enter your credentials to access your account
                </Typography>
              </Box>

              <Divider sx={{ mb: 3 }}>
                <Chip 
                  label="Secure Login" 
                  size="small"
                  icon={<Shield />}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
              </Divider>

              {error && (
                <Alert 
                  severity="error" 
                  sx={{ mb: 3 }}
                  onClose={() => setError('')}
                >
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  variant="outlined"
                  sx={{ 
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: '#667eea'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea'
                      }
                    }
                  }}
                  autoFocus
                />

                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  variant="outlined"
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: '#667eea'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea'
                      }
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton 
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Box sx={{ textAlign: 'right', mb: 3 }}>
                  <Link 
                    to="/forgot-password" 
                    style={{ 
                      color: '#667eea', 
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      fontWeight: 500
                    }}
                  >
                    Forgot Password?
                  </Link>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ 
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 40px rgba(102, 126, 234, 0.6)'
                    }
                  }}
                  disabled={loading}
                >
                  {loading ? '🔐 Signing In...' : '🚀 Sign In'}
                </Button>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Don't have an account?{' '}
                    <Link 
                      to="/register" 
                      style={{ 
                        color: '#667eea', 
                        textDecoration: 'none',
                        fontWeight: 'bold'
                      }}
                    >
                      Create Account
                    </Link>
                  </Typography>
                </Box>

                {/* Security Badge */}
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                    🔒 Your data is protected with bank-grade encryption
                  </Typography>
                </Box>
              </form>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Login;