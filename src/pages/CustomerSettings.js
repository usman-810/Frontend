import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { customerAPI } from '../api/customers';
import {
  Container, Box, Paper, Typography, Button, TextField, Grid,
  Alert, CircularProgress, Divider, Avatar, MenuItem
} from '@mui/material';
import {
  ArrowBack, Settings, Save, Edit, Person, Email, Phone,
  Home, LocationCity
} from '@mui/icons-material';
import { toast } from 'react-toastify';

// US States constant
const US_STATES = [
  { code: '', name: 'Select State' },
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' }
];

const CustomerSettings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [customerExists, setCustomerExists] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  useEffect(() => {
    if (user?.id) {
      loadCustomerData();
    }
  }, [user]);

  const loadCustomerData = async () => {
    try {
      setLoading(true);
      console.log('📥 Loading customer data for ID:', user.id);
      
      const response = await customerAPI.getById(user.id);
      
      if (response && response.data) {
        // Customer exists
        const customerData = response.data;
        console.log('✅ Customer found:', customerData);
        setCustomerExists(true);
        
        setFormData({
          firstName: customerData.firstName || user?.firstName || '',
          lastName: customerData.lastName || user?.lastName || '',
          email: customerData.email || user?.email || '',
          phone: customerData.phone?.toString() || user?.phone?.toString() || '',
          dateOfBirth: customerData.dateOfBirth?.split('T')[0] || '',
          address: customerData.address || '',
          city: customerData.city || '',
          state: customerData.state || '',
          zipCode: customerData.zipCode || ''
        });
      } else {
        // Customer doesn't exist, use user data
        console.log('ℹ️ Customer profile not found, will create on save');
        setCustomerExists(false);
        
        setFormData({
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          email: user?.email || '',
          phone: user?.phone?.toString() || '',
          dateOfBirth: '',
          address: '',
          city: '',
          state: '',
          zipCode: ''
        });
      }
    } catch (err) {
      console.error('❌ Error loading customer data:', err);
      setCustomerExists(false);
      
      // Use user data as fallback
      setFormData({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone?.toString() || '',
        dateOfBirth: '',
        address: '',
        city: '',
        state: '',
        zipCode: ''
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For phone, only allow digits
    if (name === 'phone') {
      const cleanPhone = value.replace(/\D/g, '');
      if (cleanPhone.length <= 10) {
        setFormData({ ...formData, [name]: cleanPhone });
      }
    } else if (name === 'state') {
      // State must be uppercase 2-letter code
      setFormData({ ...formData, [name]: value.toUpperCase() });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError('Please enter a valid email');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      setError('Phone number must be exactly 10 digits');
      return false;
    }
    
    // Validate state if provided
    if (formData.state && formData.state.trim().length !== 2) {
      setError('State must be a 2-letter code (e.g., CA, NY)');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Clean phone number
      const cleanPhone = formData.phone.replace(/\D/g, '');
      
      // Format the data for API
      const customerData = {
        userId: user.id, // Link customer to user
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: parseInt(cleanPhone, 10),
        dateOfBirth: formData.dateOfBirth ? `${formData.dateOfBirth}T00:00:00` : null,
        address: formData.address.trim() || null,
        city: formData.city.trim() || null,
        // Only send state if it's valid (2 letters)
        state: formData.state.trim().length === 2 ? formData.state.trim().toUpperCase() : null,
        zipCode: formData.zipCode.trim() || null
      };

      console.log('💾 Saving customer data:', customerData);
      
      // Use the smart save method (POST or PUT)
      const result = await customerAPI.save(user.id, customerData);
      
      console.log('✅ Profile saved successfully:', result);
      
      setSuccess(customerExists ? 'Profile updated successfully!' : 'Profile created successfully!');
      toast.success(customerExists ? 'Profile updated!' : 'Profile created!');
      setEditMode(false);
      setCustomerExists(true);
      
      // Reload data to reflect changes
      await loadCustomerData();
    } catch (err) {
      console.error('❌ Error saving profile:', err);
      const errorMessage = err.response?.data?.message 
        || err.response?.data?.error
        || err.message 
        || 'Failed to save profile';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !editMode) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: 4 }}>
      <Container maxWidth="md">
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/customer/dashboard')}
          sx={{ mb: 3 }}
        >
          Back to Dashboard
        </Button>

        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main' }}>
                <Settings sx={{ fontSize: 35 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  Account Settings
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {customerExists ? 'Manage your personal information' : 'Complete your profile'}
                </Typography>
              </Box>
            </Box>
            {!editMode && (
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={() => setEditMode(true)}
              >
                {customerExists ? 'Edit Profile' : 'Complete Profile'}
              </Button>
            )}
          </Box>
        </Paper>

        {!customerExists && !editMode && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Please complete your profile to access all features
          </Alert>
        )}

        {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>{success}</Alert>}

        <Paper elevation={3} sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Personal Information */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Person sx={{ color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight="bold">
                    Personal Information
                  </Typography>
                </Box>
                <Divider />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={!editMode}
                  required
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />
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
                  disabled={!editMode}
                  required
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
                  disabled={!editMode}
                  required
                  InputProps={{
                    startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!editMode}
                  required
                  placeholder="1234567890"
                  helperText="10-digit phone number"
                  inputProps={{ maxLength: 10 }}
                  InputProps={{
                    startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />
                  }}
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
                  disabled={!editMode}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>

              {/* Address Information */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Home sx={{ color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight="bold">
                    Address Information
                  </Typography>
                </Box>
                <Divider />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={!editMode}
                  multiline
                  rows={2}
                  placeholder="Street address, apartment, suite, etc."
                  InputProps={{
                    startAdornment: <Home sx={{ mr: 1, color: 'action.active', alignSelf: 'flex-start', mt: 1 }} />
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!editMode}
                  placeholder="City name"
                  InputProps={{
                    startAdornment: <LocationCity sx={{ mr: 1, color: 'action.active' }} />
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  select
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  disabled={!editMode}
                  helperText="Select your state"
                >
                  {US_STATES.map((state) => (
                    <MenuItem key={state.code} value={state.code}>
                      {state.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="ZIP Code"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  disabled={!editMode}
                  placeholder="12345"
                  inputProps={{ maxLength: 10 }}
                />
              </Grid>

              {editMode && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setEditMode(false);
                        loadCustomerData();
                        setError('');
                        setSuccess('');
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={loading ? null : <Save />}
                      disabled={loading}
                      sx={{ minWidth: 150 }}
                    >
                      {loading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        customerExists ? 'Save Changes' : 'Create Profile'
                      )}
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
          </form>
        </Paper>

        {/* Account Information */}
        <Paper elevation={3} sx={{ p: 4, mt: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Account Information
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Username
              </Typography>
              <Typography variant="body1" fontWeight="600">
                {user?.username}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Account Status
              </Typography>
              <Typography variant="body1" fontWeight="600" color="success.main">
                Active
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Member Since
              </Typography>
              <Typography variant="body1" fontWeight="600">
                {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Account Type
              </Typography>
              <Typography variant="body1" fontWeight="600">
                {user?.role}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default CustomerSettings;