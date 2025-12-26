import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cardAPI } from '../api/cards';
import {
  Container, Box, Paper, Typography, TextField, Button, MenuItem,
  Grid, Alert, CircularProgress, Card, CardContent
} from '@mui/material';
import { CreditCard, ArrowBack, Check } from '@mui/icons-material';
import { toast } from 'react-toastify';

const ApplyCard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    customerId: user?.id || '',
    cardType: 'SILVER',
    cardHolderName: `${user?.firstName || ''} ${user?.lastName || ''}`.toUpperCase()
  });

  const cardTypes = [
    { 
      value: 'SILVER', 
      label: 'Silver Card', 
      limit: 50000,
      benefits: ['1% cashback', 'Basic insurance', 'Free ATM withdrawals']
    },
    { 
      value: 'GOLD', 
      label: 'Gold Card', 
      limit: 100000,
      benefits: ['2% cashback', 'Travel insurance', 'Airport lounge access']
    },
    { 
      value: 'PLATINUM', 
      label: 'Platinum Card', 
      limit: 200000,
      benefits: ['3% cashback', 'Premium insurance', 'Concierge service']
    }
  ];

  const selectedCard = cardTypes.find(c => c.value === formData.cardType);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await cardAPI.create(formData);
      console.log('Card created:', response);
      
      toast.success('Card application submitted successfully!');
      setTimeout(() => {
        navigate('/customer/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error creating card:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to apply for card';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      py: 4 
    }}>
      <Container maxWidth="md">
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/customer/dashboard')}
          sx={{ color: 'white', mb: 2 }}
        >
          Back to Dashboard
        </Button>

        <Paper elevation={6} sx={{ p: 4, borderRadius: 3 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <CreditCard sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" fontWeight="bold" color="primary">
              Apply for Credit Card
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Choose the card that fits your lifestyle
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Card Holder Name"
                  name="cardHolderName"
                  value={formData.cardHolderName}
                  onChange={handleChange}
                  required
                  helperText="Name as it will appear on the card"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Select Card Type"
                  name="cardType"
                  value={formData.cardType}
                  onChange={handleChange}
                  required
                >
                  {cardTypes.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <span>{option.label}</span>
                        <span style={{ color: '#666' }}>Limit: ₹{option.limit.toLocaleString()}</span>
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {selectedCard && (
                <Grid item xs={12}>
                  <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {selectedCard.label} Benefits
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        Credit Limit: ₹{selectedCard.limit.toLocaleString()}
                      </Typography>
                      <Box component="ul" sx={{ m: 0, pl: 2 }}>
                        {selectedCard.benefits.map((benefit, index) => (
                          <Box component="li" key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Check sx={{ mr: 1, fontSize: 18 }} />
                            <Typography variant="body2">{benefit}</Typography>
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Note:</strong> Your application will be reviewed and the card will be issued within 2-3 business days.
                  </Typography>
                </Alert>
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ py: 1.5 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Submit Application'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default ApplyCard;