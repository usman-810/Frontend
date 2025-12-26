import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cardAPI } from '../api/cards';
import { transactionAPI } from '../api/transactions';
import {
  Container, Box, Paper, Typography, Button, TextField, MenuItem,
  Grid, Alert, CircularProgress, Card, CardContent, Divider
} from '@mui/material';
import { ArrowBack, Payment, CreditCard, CheckCircle } from '@mui/icons-material';
import { toast } from 'react-toastify';

const MakePayment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    cardId: '',
    amount: '',
    description: 'Credit Card Payment'
  });

  useEffect(() => {
    loadCards();
  }, [user]);

  const loadCards = async () => {
    try {
      setPageLoading(true);
      const response = await cardAPI.getByCustomer(user.id);
      const cardsData = response?.data?.data || response?.data || [];
      const activeCards = Array.isArray(cardsData) 
        ? cardsData.filter(c => c.status === 'ACTIVE') 
        : [];
      setCards(activeCards);
    } catch (err) {
      console.error('Error loading cards:', err);
      setError('Failed to load cards. Please try again.');
    } finally {
      setPageLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const selectedCard = cards.find(c => c.id === parseInt(formData.cardId));
  const outstandingBalance = selectedCard 
    ? selectedCard.creditLimit - selectedCard.availableCredit 
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.cardId || !formData.amount) {
      setError('Please fill in all required fields');
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      setError('Payment amount must be greater than 0');
      return;
    }

    if (parseFloat(formData.amount) > outstandingBalance) {
      setError('Payment amount cannot exceed outstanding balance');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await transactionAPI.makePayment(
        formData.cardId,
        parseFloat(formData.amount),
        formData.description
      );

      setSuccess(true);
      toast.success('Payment processed successfully!');
      
      setTimeout(() => {
        navigate('/customer/dashboard');
      }, 3000);
    } catch (err) {
      console.error('Error making payment:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to process payment';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (success) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Container maxWidth="sm">
          <Paper elevation={6} sx={{ p: 5, textAlign: 'center', borderRadius: 3 }}>
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" fontWeight="bold" color="success.main" gutterBottom>
              Payment Successful!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Your payment of ₹{parseFloat(formData.amount).toLocaleString()} has been processed successfully.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Redirecting to dashboard...
            </Typography>
            <CircularProgress size={30} />
          </Paper>
        </Container>
      </Box>
    );
  }

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
            <Payment sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" fontWeight="bold" color="primary">
              Make Payment
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Pay your credit card bill
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          {cards.length === 0 ? (
            <Alert severity="warning">
              You don't have any active cards to make payments.
            </Alert>
          ) : (
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Select Card"
                    name="cardId"
                    value={formData.cardId}
                    onChange={handleChange}
                    required
                  >
                    {cards.map((card) => (
                      <MenuItem key={card.id} value={card.id}>
                        {card.cardType} - **** **** **** {card.cardNumber?.slice(-4)}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {selectedCard && (
                  <Grid item xs={12}>
                    <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Card Details
                        </Typography>
                        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.3)', my: 2 }} />
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                              Credit Limit
                            </Typography>
                            <Typography variant="h6" fontWeight="bold">
                              ₹{selectedCard.creditLimit?.toLocaleString()}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                              Available Credit
                            </Typography>
                            <Typography variant="h6" fontWeight="bold">
                              ₹{selectedCard.availableCredit?.toLocaleString()}
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Divider sx={{ bgcolor: 'rgba(255,255,255,0.3)', my: 1 }} />
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                              Outstanding Balance
                            </Typography>
                            <Typography variant="h5" fontWeight="bold">
                              ₹{outstandingBalance.toLocaleString()}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Payment Amount"
                    name="amount"
                    type="number"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
                    }}
                    helperText={selectedCard ? `Maximum: ₹${outstandingBalance.toLocaleString()}` : ''}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description (Optional)"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    multiline
                    rows={2}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Alert severity="info">
                    <Typography variant="body2">
                      <strong>Note:</strong> Payment will be processed instantly and will reflect in your available credit immediately.
                    </Typography>
                  </Alert>
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading || !formData.cardId}
                    sx={{ py: 1.5 }}
                  >
                    {loading ? <CircularProgress size={24} /> : `Pay ₹${formData.amount || '0'}`}
                  </Button>
                </Grid>
              </Grid>
            </form>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default MakePayment;