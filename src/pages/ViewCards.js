import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cardAPI } from '../api/cards';
import {
  Container, Box, Paper, Typography, Button, Grid, Card, CardContent,
  CircularProgress, Alert, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, LinearProgress
} from '@mui/material';
import {
  CreditCard, ArrowBack, Block, LockOpen, Edit, Add
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const ViewCards = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [blockDialog, setBlockDialog] = useState({ open: false, cardId: null, reason: '' });

  useEffect(() => {
    loadCards();
  }, [user]);

  const loadCards = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await cardAPI.getByCustomer(user.id);
      const cardsData = response?.data?.data || response?.data || [];
      setCards(Array.isArray(cardsData) ? cardsData : []);
    } catch (err) {
      console.error('Error loading cards:', err);
      setError('Failed to load cards. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockCard = async () => {
    try {
      setActionLoading(true);
      await cardAPI.block(blockDialog.cardId, blockDialog.reason);
      toast.success('Card blocked successfully');
      setBlockDialog({ open: false, cardId: null, reason: '' });
      loadCards();
    } catch (err) {
      toast.error('Failed to block card');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnblockCard = async (cardId) => {
    try {
      setActionLoading(true);
      await cardAPI.unblock(cardId);
      toast.success('Card unblocked successfully');
      loadCards();
    } catch (err) {
      toast.error('Failed to unblock card');
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivateCard = async (cardId) => {
    try {
      setActionLoading(true);
      await cardAPI.activate(cardId);
      toast.success('Card activated successfully');
      loadCards();
    } catch (err) {
      toast.error('Failed to activate card');
    } finally {
      setActionLoading(false);
    }
  };

  const getCardTypeColor = (type) => {
    const colors = {
      SILVER: 'linear-gradient(135deg, #C0C0C0 0%, #E8E8E8 100%)',
      GOLD: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
      PLATINUM: 'linear-gradient(135deg, #E5E4E2 0%, #A8A8A8 100%)'
    };
    return colors[type] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  };

  const getStatusColor = (status) => {
    const colors = {
      ACTIVE: 'success',
      INACTIVE: 'warning',
      BLOCKED: 'error',
      CLOSED: 'default'
    };
    return colors[status] || 'default';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/customer/dashboard')}
          >
            Back to Dashboard
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/customer/apply-card')}
          >
            Apply for New Card
          </Button>
        </Box>

        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            My Credit Cards
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage all your credit cards in one place
          </Typography>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {cards.length === 0 ? (
          <Paper sx={{ p: 5, textAlign: 'center' }}>
            <CreditCard sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Credit Cards Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Apply for your first credit card today!
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/customer/apply-card')}
            >
              Apply Now
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {cards.map((card) => (
              <Grid item xs={12} md={6} key={card.id}>
                <Paper
                  elevation={4}
                  sx={{
                    p: 3,
                    background: getCardTypeColor(card.cardType),
                    color: 'white',
                    borderRadius: 3,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Chip
                        label={card.cardType}
                        size="small"
                        sx={{ bgcolor: 'rgba(255,255,255,0.3)', color: 'white' }}
                      />
                      <Chip
                        label={card.status}
                        size="small"
                        color={getStatusColor(card.status)}
                      />
                    </Box>

                    <Typography variant="h5" fontWeight="bold" sx={{ mb: 1, letterSpacing: 2 }}>
                      **** **** **** {card.cardNumber?.slice(-4)}
                    </Typography>

                    <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                      {card.cardHolderName}
                    </Typography>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                          Credit Limit
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          ₹{card.creditLimit?.toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                          Available
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          ₹{card.availableCredit?.toLocaleString()}
                        </Typography>
                      </Grid>
                    </Grid>

                    <LinearProgress
                      variant="determinate"
                      value={(card.availableCredit / card.creditLimit) * 100}
                      sx={{
                        mb: 2,
                        height: 6,
                        borderRadius: 1,
                        bgcolor: 'rgba(255,255,255,0.3)',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: 'white'
                        }
                      }}
                    />

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {card.status === 'INACTIVE' && (
                        <Button
                          size="small"
                          variant="contained"
                          sx={{ bgcolor: 'white', color: 'primary.main' }}
                          onClick={() => handleActivateCard(card.id)}
                          disabled={actionLoading}
                        >
                          Activate
                        </Button>
                      )}
                      {card.status === 'ACTIVE' && (
                        <Button
                          size="small"
                          variant="contained"
                          sx={{ bgcolor: 'white', color: 'error.main' }}
                          startIcon={<Block />}
                          onClick={() => setBlockDialog({ open: true, cardId: card.id, reason: '' })}
                          disabled={actionLoading}
                        >
                          Block
                        </Button>
                      )}
                      {card.status === 'BLOCKED' && (
                        <Button
                          size="small"
                          variant="contained"
                          sx={{ bgcolor: 'white', color: 'success.main' }}
                          startIcon={<LockOpen />}
                          onClick={() => handleUnblockCard(card.id)}
                          disabled={actionLoading}
                        >
                          Unblock
                        </Button>
                      )}
                      <Button
                        size="small"
                        variant="outlined"
                        sx={{ color: 'white', borderColor: 'white' }}
                        onClick={() => navigate(`/customer/cards/${card.id}/details`)}
                      >
                        View Details
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Block Card Dialog */}
        <Dialog open={blockDialog.open} onClose={() => setBlockDialog({ open: false, cardId: null, reason: '' })}>
          <DialogTitle>Block Credit Card</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Please provide a reason for blocking this card
            </Typography>
            <TextField
              fullWidth
              label="Reason"
              multiline
              rows={3}
              value={blockDialog.reason}
              onChange={(e) => setBlockDialog({ ...blockDialog, reason: e.target.value })}
              placeholder="e.g., Lost card, Suspicious activity"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBlockDialog({ open: false, cardId: null, reason: '' })}>
              Cancel
            </Button>
            <Button
              onClick={handleBlockCard}
              variant="contained"
              color="error"
              disabled={actionLoading || !blockDialog.reason}
            >
              {actionLoading ? <CircularProgress size={20} /> : 'Block Card'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default ViewCards;