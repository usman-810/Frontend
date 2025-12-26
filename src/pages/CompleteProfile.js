import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { customerAPI } from '../api/customers';
import {
  Container, Box, Paper, Typography, TextField, Button, Grid,
  Alert, CircularProgress, Stepper, Step, StepLabel
} from '@mui/material';
import { PersonAdd, ArrowForward, CheckCircle } from '@mui/icons-material';
import { toast } from 'react-toastify';

const CompleteProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userData = location.state?.userData; // Data passed from registration

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: userData?.firstName || '',
    lastName: userData?.lastName || '',
    email: userData?.email || '',
    phone: userData?.phone || '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create customer record
      const customerData = {
        ...formData,
        dateOfBirth: formData.dateOfBirth ? `${formData.dateOfBirth}T00:00:00` : null
      };

      await customerAPI.create(customerData);
      
      toast.success('Profile completed successfully! Please login.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Error creating customer:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to complete profile';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    toast.info('You can complete your profile later in Settings');
    navigate('/login');
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      py: 4 
    }}>
      <Container maxWidth="md">
        <Paper elevation={6} sx={{ p: 4, borderRadius: 3 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <PersonAdd sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
              Complete Your Profile
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please provide additional information to complete your registration
            </Typography>
          </Box>

          {/* Stepper */}
          <Stepper activeStep={1} sx={{ mb: 4 }}>
            <Step completed>
              <StepLabel>Account Created</StepLabel>
            </Step>
            <Step>
              <StepLabel>Complete Profile</StepLabel>
            </Step>
            <Step>
              <StepLabel>Start Using</StepLabel>
            </Step>
          </Stepper>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Personal Information */}
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                  Personal Information
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  disabled
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
                  disabled
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  disabled
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                  helperText="You must be 18 years or older"
                />
              </Grid>

              {/* Address Information */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                  Address Information
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  multiline
                  rows={2}
                  placeholder="Street address, apartment, suite, etc."
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Maharashtra, Delhi"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ZIP Code"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 400001"
                />
              </Grid>

              {/* Info Alert */}
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="body2">
                    This information is required for credit card applications and KYC compliance.
                  </Typography>
                </Alert>
              </Grid>

              {/* Buttons */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
                  <Button
                    variant="outlined"
                    onClick={handleSkip}
                    disabled={loading}
                  >
                    Skip for Now
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward />}
                    disabled={loading}
                    sx={{ minWidth: 200 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Complete Profile'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>

        {/* Benefits Section */}
        <Paper elevation={3} sx={{ p: 3, mt: 3, textAlign: 'center' }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Why complete your profile?
          </Typography>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={4}>
              <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="body2">
                Apply for credit cards instantly
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="body2">
                Faster application processing
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="body2">
                Better credit limits
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default CompleteProfile;