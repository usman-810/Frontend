import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api/auth';
import {
  Container, Box, Paper, TextField, Button, Typography,
  Grid, MenuItem, InputAdornment, IconButton, Alert, Divider, Chip, Stack
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  PersonAdd, 
  CreditCard,
  Security,
  TrendingUp,
  Speed
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import CreditCard3D from '../components/CreditCard3D';

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'CUSTOMER'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validateForm = () => {
    // Username validation
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }
    if (formData.username.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }

    // Email validation
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Password validation
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    // Name validation
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }

    // Phone validation
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      setError('Phone number must be exactly 10 digits');
      return false;
    }
    if (!/^\d+$/.test(phoneDigits)) {
      setError('Phone number must contain only digits');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Remove confirmPassword from form data
      const { confirmPassword, ...registerData } = formData;
      
      // Clean phone number - remove all non-digits
      const cleanPhone = registerData.phone.replace(/\D/g, '');
      
      // Prepare data in exact format backend expects
      const dataToSend = {
        username: registerData.username.trim(),
        password: registerData.password,
        email: registerData.email.trim().toLowerCase(),
        firstName: registerData.firstName.trim(),
        lastName: registerData.lastName.trim(),
        phone: parseInt(cleanPhone, 10),
        role: registerData.role
      };

      console.log('📤 Data being sent to API:', dataToSend);
      
      // Call register API
      const result = await authAPI.register(dataToSend);
      
      console.log('✅ Registration successful:', result);
      
      toast.success('Account created successfully! 🎉');
      
      // Store token if returned
      if (result.token) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
      }
      
      // Navigate based on role
      if (formData.role === 'CUSTOMER') {
        setTimeout(() => {
          navigate('/complete-profile', {
            state: {
              userData: {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone
              }
            }
          });
        }, 1000);
      } else {
        setTimeout(() => {
          navigate('/login');
        }, 1000);
      }
      
    } catch (err) {
      console.error('❌ Registration error:', err);
      const errorMsg = err.message || 'An unexpected error occurred. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: <CreditCard sx={{ fontSize: 30 }} />, title: 'Multiple Cards', desc: 'Manage unlimited credit cards' },
    { icon: <Security sx={{ fontSize: 30 }} />, title: 'Bank-Level Security', desc: '256-bit encryption' },
    { icon: <TrendingUp sx={{ fontSize: 30 }} />, title: 'Smart Analytics', desc: 'Track spending patterns' },
    { icon: <Speed sx={{ fontSize: 30 }} />, title: 'Instant Access', desc: 'Real-time updates' }
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
          background: 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3), transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 119, 198, 0.3), transparent 50%)',
          animation: 'pulse 15s ease-in-out infinite',
          '@keyframes pulse': {
            '0%, 100%': { opacity: 0.5 },
            '50%': { opacity: 0.8 }
          }
        }
      }}
    >
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: 4 }}>
        <Grid container spacing={4} alignItems="center">
          {/* Left Side - 3D Cards & Welcome */}
          <Grid item xs={12} md={6}>
            <Box sx={{ color: 'white', pr: { md: 4 } }}>
              {/* Animated Logo */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 4,
                  animation: 'slideInLeft 1s ease-out',
                  '@keyframes slideInLeft': {
                    from: { opacity: 0, transform: 'translateX(-50px)' },
                    to: { opacity: 1, transform: 'translateX(0)' }
                  }
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

              {/* Main Heading with Gradient */}
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
                Your Financial Journey Starts Here
              </Typography>

              <Typography 
                variant="h6" 
                sx={{ mb: 4, opacity: 0.9, fontWeight: 300 }}
              >
                Experience the future of credit card management with cutting-edge technology
              </Typography>

              {/* 3D Credit Cards Showcase */}
              <Box sx={{ mb: 4 }}>
                <Stack spacing={-8} sx={{ mb: 3 }}>
                  <Box 
                    sx={{ 
                      width: '85%',
                      transform: 'rotate(-5deg)',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'rotate(-5deg) scale(1.05)',
                        zIndex: 3
                      }
                    }}
                  >
                    <CreditCard3D type="premium" animate />
                  </Box>
                  <Box 
                    sx={{ 
                      width: '85%',
                      ml: 'auto',
                      transform: 'rotate(3deg)',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'rotate(3deg) scale(1.05)',
                        zIndex: 3
                      }
                    }}
                  >
                    <CreditCard3D type="platinum" />
                  </Box>
                  <Box 
                    sx={{ 
                      width: '85%',
                      transform: 'rotate(-2deg)',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'rotate(-2deg) scale(1.05)',
                        zIndex: 3
                      }
                    }}
                  >
                    <CreditCard3D type="gold" />
                  </Box>
                </Stack>
              </Box>

              {/* Features Grid */}
              <Grid container spacing={2} sx={{ mb: 4 }}>
                {features.map((feature, index) => (
                  <Grid item xs={6} key={index}>
                    <Box 
                      sx={{ 
                        p: 2.5,
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: 3,
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          background: 'rgba(255,255,255,0.1)',
                          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
                        }
                      }}
                    >
                      <Box sx={{ 
                        mb: 1.5, 
                        color: '#667eea',
                        display: 'flex'
                      }}>
                        {feature.icon}
                      </Box>
                      <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        {feature.desc}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              {/* Animated Stats */}
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
                    10K+
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>Active Users</Typography>
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
                    50K+
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>Cards Managed</Typography>
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
                    4.9★
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>User Rating</Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Right Side - Registration Form */}
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={24} 
              sx={{ 
                p: 4, 
                borderRadius: 4,
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                border: '1px solid rgba(255,255,255,0.18)',
                animation: 'slideInRight 1s ease-out',
                '@keyframes slideInRight': {
                  from: { opacity: 0, transform: 'translateX(50px)' },
                  to: { opacity: 1, transform: 'translateX(0)' }
                }
              }}
            >
              {/* Form Header */}
              <Box sx={{ textAlign: 'center', mb: 3 }}>
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
                  <PersonAdd sx={{ fontSize: 40, color: 'white' }} />
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
                  Create Your Account
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Join the revolution in financial management
                </Typography>
              </Box>

              <Divider sx={{ mb: 3 }}>
                <Chip 
                  label="Start Your Journey" 
                  size="small"
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
                  sx={{ mb: 2, whiteSpace: 'pre-line' }}
                  onClose={() => setError('')}
                >
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': { borderColor: '#667eea' },
                          '&.Mui-focused fieldset': { borderColor: '#667eea' }
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': { borderColor: '#667eea' },
                          '&.Mui-focused fieldset': { borderColor: '#667eea' }
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      helperText="Minimum 3 characters"
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': { borderColor: '#667eea' },
                          '&.Mui-focused fieldset': { borderColor: '#667eea' }
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': { borderColor: '#667eea' },
                          '&.Mui-focused fieldset': { borderColor: '#667eea' }
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="1234567890"
                      required
                      disabled={loading}
                      helperText="Enter 10-digit phone number"
                      variant="outlined"
                      inputProps={{ maxLength: 10 }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': { borderColor: '#667eea' },
                          '&.Mui-focused fieldset': { borderColor: '#667eea' }
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      helperText="Minimum 6 characters"
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': { borderColor: '#667eea' },
                          '&.Mui-focused fieldset': { borderColor: '#667eea' }
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
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Confirm Password"
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': { borderColor: '#667eea' },
                          '&.Mui-focused fieldset': { borderColor: '#667eea' }
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      select
                      label="Account Type"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      disabled={loading}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': { borderColor: '#667eea' },
                          '&.Mui-focused fieldset': { borderColor: '#667eea' }
                        }
                      }}
                    >
                      <MenuItem value="CUSTOMER">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonAdd sx={{ fontSize: 20, color: '#667eea' }} />
                          <Box>
                            <Typography variant="body1" fontWeight="bold">Customer Account</Typography>
                            <Typography variant="caption" color="text.secondary">Manage your cards</Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                      <MenuItem value="ADMIN">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Security sx={{ fontSize: 20, color: '#764ba2' }} />
                          <Box>
                            <Typography variant="body1" fontWeight="bold">Admin Account</Typography>
                            <Typography variant="caption" color="text.secondary">Full system access</Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    </TextField>
                  </Grid>
                </Grid>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ 
                    mt: 3, 
                    mb: 2, 
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
                    },
                    '&:disabled': {
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      opacity: 0.7
                    }
                  }}
                  disabled={loading}
                >
                  {loading ? 'Creating Your Account...' : '🚀 Create Account'}
                </Button>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Already have an account?{' '}
                    <Link 
                      to="/login" 
                      style={{ 
                        color: '#667eea', 
                        textDecoration: 'none',
                        fontWeight: 'bold'
                      }}
                    >
                      Sign In
                    </Link>
                  </Typography>
                </Box>

                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    🔒 Secured with 256-bit encryption
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

export default Register;