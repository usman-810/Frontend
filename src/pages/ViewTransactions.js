import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { transactionAPI } from '../api/transactions';
import { cardAPI } from '../api/cards';
import {
  Container, Box, Paper, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress, Alert, Chip,
  TextField, MenuItem, Grid, Card, CardContent, Avatar, Pagination
} from '@mui/material';
import {
  ArrowBack, Receipt, FilterList, TrendingUp, TrendingDown,
  AccountBalance, Payment, ShoppingCart
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const ViewTransactions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]); // For stats calculation
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({
    cardId: 'all',
    type: 'all',
    status: 'all'
  });
  const [stats, setStats] = useState({
    totalSpent: 0,
    totalPaid: 0,
    pendingAmount: 0,
    totalTransactions: 0
  });

  useEffect(() => {
    loadData();
  }, [user, page, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load cards
      const cardsResponse = await cardAPI.getByCustomer(user.id);
      const cardsData = cardsResponse?.data?.data || cardsResponse?.data || [];
      setCards(Array.isArray(cardsData) ? cardsData : []);

      // Load ALL transactions for stats (no pagination)
      const allTxnResponse = await transactionAPI.getByCustomer(user.id, 0, 1000);
      const allTxnData = allTxnResponse?.data?.data?.content || 
                         allTxnResponse?.data?.content ||
                         allTxnResponse?.data?.data || 
                         allTxnResponse?.data || [];
      const allTxnArray = Array.isArray(allTxnData) ? allTxnData : [];
      setAllTransactions(allTxnArray);
      calculateStats(allTxnArray);

      // Load paginated transactions for display
      let transactionsResponse;
      if (filters.cardId !== 'all') {
        transactionsResponse = await transactionAPI.getByCard(filters.cardId, page, 10);
      } else {
        transactionsResponse = await transactionAPI.getByCustomer(user.id, page, 10);
      }

      const transactionsData = transactionsResponse?.data?.data?.content || 
                               transactionsResponse?.data?.content ||
                               transactionsResponse?.data?.data || 
                               transactionsResponse?.data || [];
      
      setTransactions(Array.isArray(transactionsData) ? transactionsData : []);
      setTotalPages(transactionsResponse?.data?.data?.totalPages || 
                    transactionsResponse?.data?.totalPages || 1);

    } catch (err) {
      console.error('Error loading transactions:', err);
      setError('Failed to load transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (txns) => {
    console.log('📊 Calculating stats from transactions:', txns);

    // Calculate total spent (all successful purchases)
    const spent = txns
      .filter(t => {
        const isPurchase = t.type === 'PURCHASE' || t.transactionType === 'PURCHASE';
        const isSuccess = t.status === 'SUCCESS' || t.status === 'APPROVED';
        return isPurchase && isSuccess;
      })
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    // Calculate total paid (all successful payments)
    const paid = txns
      .filter(t => {
        const isPayment = t.type === 'PAYMENT' || t.transactionType === 'PAYMENT';
        const isSuccess = t.status === 'SUCCESS' || t.status === 'APPROVED';
        return isPayment && isSuccess;
      })
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const pending = Math.max(0, spent - paid); // Ensure non-negative

    console.log('💰 Stats calculated:', {
      totalSpent: spent,
      totalPaid: paid,
      pendingAmount: pending,
      totalTransactions: txns.length
    });

    setStats({
      totalSpent: spent,
      totalPaid: paid,
      pendingAmount: pending,
      totalTransactions: txns.length
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
    setPage(0);
  };

  const getTypeColor = (type) => {
    const colors = {
      PURCHASE: 'error',
      PAYMENT: 'success',
      REFUND: 'info',
      CASHBACK: 'success'
    };
    return colors[type] || 'default';
  };

  const getStatusColor = (status) => {
    const colors = {
      SUCCESS: 'success',
      APPROVED: 'success',
      PENDING: 'warning',
      DECLINED: 'error',
      FAILED: 'error',
      REVERSED: 'default'
    };
    return colors[status] || 'default';
  };

  const getTypeIcon = (type) => {
    return type === 'PURCHASE' ? <ShoppingCart /> : <Payment />;
  };

  const filteredTransactions = transactions.filter(txn => {
    const txnType = txn.type || txn.transactionType;
    const txnStatus = txn.status;
    
    if (filters.type !== 'all' && txnType !== filters.type) return false;
    if (filters.status !== 'all' && txnStatus !== filters.status) return false;
    return true;
  });

  if (loading && page === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: 4 }}>
      <Container maxWidth="xl">
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/customer/dashboard')}
          sx={{ mb: 3 }}
          variant="outlined"
        >
          Back to Dashboard
        </Button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper elevation={3} sx={{ 
            p: 4, 
            mb: 3, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ width: 70, height: 70, bgcolor: 'rgba(255,255,255,0.2)' }}>
                <Receipt sx={{ fontSize: 40 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  Transaction History
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  View and manage all your transactions
                </Typography>
              </Box>
            </Box>
          </Paper>
        </motion.div>

        {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card sx={{ 
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
                color: 'white',
                height: '100%'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                        Total Spent
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        ${stats.totalSpent.toFixed(2)}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: 'block' }}>
                        {allTransactions.filter(t => (t.type || t.transactionType) === 'PURCHASE').length} purchases
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <TrendingDown sx={{ fontSize: 30 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card sx={{ 
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', 
                color: 'white',
                height: '100%'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                        Total Paid
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        ${stats.totalPaid.toFixed(2)}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: 'block' }}>
                        {allTransactions.filter(t => (t.type || t.transactionType) === 'PAYMENT').length} payments
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <TrendingUp sx={{ fontSize: 30 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card sx={{ 
                background: stats.pendingAmount > 0
                  ? 'linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 90%, #2BFF88 100%)'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                height: '100%'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                        Pending Amount
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        ${stats.pendingAmount.toFixed(2)}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: 'block' }}>
                        {stats.pendingAmount > 0 ? 'Outstanding balance' : 'All paid up! 🎉'}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <AccountBalance sx={{ fontSize: 30 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card sx={{ 
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                height: '100%'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                        Total Transactions
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.totalTransactions}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: 'block' }}>
                        All time
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <Receipt sx={{ fontSize: 30 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Filters */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FilterList color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Filters
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Card"
                name="cardId"
                value={filters.cardId}
                onChange={handleFilterChange}
                size="small"
              >
                <MenuItem value="all">All Cards</MenuItem>
                {cards.map((card) => (
                  <MenuItem key={card.id} value={card.id}>
                    {card.cardType} - •••• {card.cardNumber?.slice(-4)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Transaction Type"
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                size="small"
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="PURCHASE">Purchase</MenuItem>
                <MenuItem value="PAYMENT">Payment</MenuItem>
                <MenuItem value="REFUND">Refund</MenuItem>
                <MenuItem value="CASHBACK">Cashback</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                size="small"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="SUCCESS">Success</MenuItem>
                <MenuItem value="APPROVED">Approved</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="DECLINED">Declined</MenuItem>
                <MenuItem value="FAILED">Failed</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Paper>

        {/* Transactions Table */}
        <Paper elevation={3}>
          {filteredTransactions.length === 0 ? (
            <Box sx={{ p: 8, textAlign: 'center' }}>
              <Receipt sx={{ fontSize: 100, color: 'text.disabled', opacity: 0.3, mb: 2 }} />
              <Typography variant="h5" color="text.secondary" gutterBottom>
                No Transactions Found
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {filters.type !== 'all' || filters.status !== 'all' 
                  ? 'Try adjusting your filters'
                  : 'Your transactions will appear here once you start shopping'}
              </Typography>
              {stats.totalTransactions === 0 && (
                <Button
                  variant="contained"
                  startIcon={<ShoppingCart />}
                  onClick={() => navigate('/customer/shop')}
                  size="large"
                >
                  Start Shopping
                </Button>
              )}
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'primary.main' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date & Time</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Reference</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Description</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Type</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'right' }}>Amount</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Status</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Card</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTransactions.map((txn, index) => {
                      const txnType = txn.type || txn.transactionType;
                      return (
                        <TableRow
                          key={txn.id}
                          hover
                          sx={{ 
                            '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                            '&:hover': { bgcolor: 'action.selected' }
                          }}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight="600">
                              {new Date(txn.transactionDate).toLocaleDateString()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(txn.transactionDate).toLocaleTimeString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontFamily="monospace" fontSize="0.75rem">
                              {txn.transactionReference || txn.id}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="600">
                              {txn.description || txn.merchantName || 'Transaction'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={getTypeIcon(txnType)}
                              label={txnType}
                              size="small"
                              color={getTypeColor(txnType)}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              variant="h6"
                              fontWeight="bold"
                              color={txnType === 'PURCHASE' ? 'error.main' : 'success.main'}
                            >
                              {txnType === 'PURCHASE' ? '-' : '+'}
                              ${txn.amount.toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={txn.status}
                              size="small"
                              color={getStatusColor(txn.status)}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              •••• {txn.cardNumber?.slice(-4) || '****'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
                    size="large"
                  />
                </Box>
              )}
            </>
          )}
        </Paper>

        {/* Pay Now Button if there's pending amount */}
        {stats.pendingAmount > 0 && (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Payment />}
              onClick={() => navigate('/customer/payment')}
              color="success"
              sx={{ px: 4, py: 1.5 }}
            >
              Pay Outstanding Balance (${stats.pendingAmount.toFixed(2)})
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default ViewTransactions;