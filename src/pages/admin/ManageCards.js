import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cardAPI } from '../../api/cards';
import { customerAPI } from '../../api/customers';
import {
  Container, Box, Paper, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress, Alert, Chip,
  TextField, InputAdornment, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, Grid, MenuItem, Pagination, LinearProgress
} from '@mui/material';
import {
  ArrowBack, Search, Add, Block, LockOpen, Edit, Close,
  CreditCard, CheckCircle
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const ManageCards = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedCard, setSelectedCard] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [issueDialog, setIssueDialog] = useState(false);
  const [editLimitDialog, setEditLimitDialog] = useState(false);
  const [blockDialog, setBlockDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [issueForm, setIssueForm] = useState({
    customerId: '',
    cardType: 'SILVER',
    cardHolderName: ''
  });

  const [limitForm, setLimitForm] = useState({
    creditLimit: '',
    dailyLimit: ''
  });

  const [blockReason, setBlockReason] = useState('');

  useEffect(() => {
    loadCards();
    loadCustomers();
  }, [page, searchTerm]);

  const loadCards = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await cardAPI.getAll(page, 10);
      const data = response?.data?.data?.content || response?.data?.content || response?.data?.data || [];
      setCards(Array.isArray(data) ? data : []);
      setTotalPages(response?.data?.data?.totalPages || response?.data?.totalPages || 1);

    } catch (err) {
      console.error('Error loading cards:', err);
      setError('Failed to load cards');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await customerAPI.getAll(0, 100);
      const data = response?.data?.data?.content || response?.data?.content || [];
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading customers:', err);
    }
  };

  const handleIssueCard = async () => {
    setActionLoading(true);
    try {
      await cardAPI.create(issueForm);
      toast.success('Card issued successfully');
      setIssueDialog(false);
      setIssueForm({ customerId: '', cardType: 'SILVER', cardHolderName: '' });
      loadCards();
    } catch (err) {
      toast.error('Failed to issue card');
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivateCard = async (cardId) => {
    try {
      await cardAPI.activate(cardId);
      toast.success('Card activated successfully');
      loadCards();
    } catch (err) {
      toast.error('Failed to activate card');
    }
  };

  const handleBlockCard = async () => {
    setActionLoading(true);
    try {
      await cardAPI.block(selectedCard.id, blockReason);
      toast.success('Card blocked successfully');
      setBlockDialog(false);
      setBlockReason('');
      loadCards();
    } catch (err) {
      toast.error('Failed to block card');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnblockCard = async (cardId) => {
    try {
      await cardAPI.unblock(cardId);
      toast.success('Card unblocked successfully');
      loadCards();
    } catch (err) {
      toast.error('Failed to unblock card');
    }
  };

  const handleUpdateLimits = async () => {
    setActionLoading(true);
    try {
      if (limitForm.creditLimit) {
        await cardAPI.updateCreditLimit(selectedCard.id, parseFloat(limitForm.creditLimit));
      }
      if (limitForm.dailyLimit) {
        await cardAPI.updateDailyLimit(selectedCard.id, parseFloat(limitForm.dailyLimit));
      }
      toast.success('Limits updated successfully');
      setEditLimitDialog(false);
      loadCards();
    } catch (err) {
      toast.error('Failed to update limits');
    } finally {
      setActionLoading(false);
    }
  };

  const getCardTypeColor = (type) => {
    const colors = {
      SILVER: '#C0C0C0',
      GOLD: '#FFD700',
      PLATINUM: '#E5E4E2'
    };
    return colors[type] || '#667eea';
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

  if (loading && page === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: 4 }}>
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/admin/dashboard')}
          >
            Back to Dashboard
          </Button>
        </Box>

        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Card Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage all credit cards
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setIssueDialog(true)}
            >
              Issue New Card
            </Button>
          </Box>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {/* Search */}
        <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search by card number, customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Paper>

        {/* Cards Table */}
        <Paper elevation={3}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Card Number</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Card Holder</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Type</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Credit Limit</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Available</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cards.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="text.secondary">No cards found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  cards.map((card) => (
                    <TableRow key={card.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="600" sx={{ letterSpacing: 1 }}>
                          **** **** **** {card.cardNumber?.slice(-4)}
                        </Typography>
                      </TableCell>
                      <TableCell>{card.cardHolderName || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={card.cardType}
                          size="small"
                          sx={{
                            bgcolor: getCardTypeColor(card.cardType),
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      </TableCell>
                      <TableCell>₹{card.creditLimit?.toLocaleString()}</TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="600">
                            ₹{card.availableCredit?.toLocaleString()}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={(card.availableCredit / card.creditLimit) * 100}
                            sx={{ mt: 0.5, height: 4, borderRadius: 1 }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={card.status}
                          size="small"
                          color={getStatusColor(card.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => {
                              setSelectedCard(card);
                              setViewDialog(true);
                            }}
                          >
                            <CreditCard />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => {
                              setSelectedCard(card);
                              setLimitForm({
                                creditLimit: card.creditLimit,
                                dailyLimit: card.dailyLimit
                              });
                              setEditLimitDialog(true);
                            }}
                          >
                            <Edit />
                          </IconButton>
                          {card.status === 'INACTIVE' && (
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleActivateCard(card.id)}
                            >
                              <CheckCircle />
                            </IconButton>
                          )}
                          {card.status === 'ACTIVE' && (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                setSelectedCard(card);
                                setBlockDialog(true);
                              }}
                            >
                              <Block />
                            </IconButton>
                          )}
                          {card.status === 'BLOCKED' && (
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleUnblockCard(card.id)}
                            >
                              <LockOpen />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <Pagination
                count={totalPages}
                page={page + 1}
                onChange={(e, value) => setPage(value - 1)}
                color="primary"
              />
            </Box>
          )}
        </Paper>

        {/* View Card Dialog */}
        <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Card Details</DialogTitle>
          <DialogContent>
            {selectedCard && (
              <Box sx={{
                p: 3,
                background: `linear-gradient(135deg, ${getCardTypeColor(selectedCard.cardType)} 0%, ${getCardTypeColor(selectedCard.cardType)}99 100%)`,
                color: 'white',
                borderRadius: 2,
                mb: 3
              }}>
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 2, letterSpacing: 2 }}>
                  **** **** **** {selectedCard.cardNumber?.slice(-4)}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {selectedCard.cardHolderName}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>Credit Limit</Typography>
                    <Typography variant="h6" fontWeight="bold">
                      ₹{selectedCard.creditLimit?.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>Available Credit</Typography>
                    <Typography variant="h6" fontWeight="bold">
                      ₹{selectedCard.availableCredit?.toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
            {selectedCard && (
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Card Type</Typography>
                  <Typography variant="body1" fontWeight="600">{selectedCard.cardType}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Chip label={selectedCard.status} color={getStatusColor(selectedCard.status)} />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Daily Limit</Typography>
                  <Typography variant="body1" fontWeight="600">
                    ₹{selectedCard.dailyLimit?.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Expiry Date</Typography>
                  <Typography variant="body1" fontWeight="600">
                    {selectedCard.expiryDate ? new Date(selectedCard.expiryDate).toLocaleDateString() : '-'}
                  </Typography>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Issue Card Dialog */}
        <Dialog open={issueDialog} onClose={() => setIssueDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Issue New Card</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Select Customer"
                  value={issueForm.customerId}
                  onChange={(e) => setIssueForm({ ...issueForm, customerId: e.target.value })}
                  required
                >
                  {customers.map((customer) => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.firstName} {customer.lastName} - {customer.email}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Card Holder Name"
                  value={issueForm.cardHolderName}
                  onChange={(e) => setIssueForm({ ...issueForm, cardHolderName: e.target.value.toUpperCase() })}
                  required
                  placeholder="As it will appear on card"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Card Type"
                  value={issueForm.cardType}
                  onChange={(e) => setIssueForm({ ...issueForm, cardType: e.target.value })}
                >
                  <MenuItem value="SILVER">Silver - ₹50,000 limit</MenuItem>
                  <MenuItem value="GOLD">Gold - ₹1,00,000 limit</MenuItem>
                  <MenuItem value="PLATINUM">Platinum - ₹2,00,000 limit</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIssueDialog(false)}>Cancel</Button>
            <Button
              onClick={handleIssueCard}
              variant="contained"
              disabled={actionLoading || !issueForm.customerId || !issueForm.cardHolderName}
            >
              {actionLoading ? <CircularProgress size={20} /> : 'Issue Card'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Limits Dialog */}
        <Dialog open={editLimitDialog} onClose={() => setEditLimitDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Update Card Limits</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Credit Limit"
                  type="number"
                  value={limitForm.creditLimit}
                  onChange={(e) => setLimitForm({ ...limitForm, creditLimit: e.target.value })}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Daily Limit"
                  type="number"
                  value={limitForm.dailyLimit}
                  onChange={(e) => setLimitForm({ ...limitForm, dailyLimit: e.target.value })}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditLimitDialog(false)}>Cancel</Button>
            <Button
              onClick={handleUpdateLimits}
              variant="contained"
              disabled={actionLoading}
            >
              {actionLoading ? <CircularProgress size={20} /> : 'Update Limits'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Block Card Dialog */}
        <Dialog open={blockDialog} onClose={() => setBlockDialog(false)}>
          <DialogTitle>Block Card</DialogTitle>
          <DialogContent>
            <Typography gutterBottom>
              Are you sure you want to block this card?
            </Typography>
            <TextField
              fullWidth
              label="Reason for blocking"
              multiline
              rows={3}
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              sx={{ mt: 2 }}
              placeholder="e.g., Suspected fraud, Lost card, Customer request"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBlockDialog(false)}>Cancel</Button>
            <Button
              onClick={handleBlockCard}
              color="error"
              variant="contained"
              disabled={actionLoading || !blockReason}
            >
              {actionLoading ? <CircularProgress size={20} /> : 'Block Card'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default ManageCards;