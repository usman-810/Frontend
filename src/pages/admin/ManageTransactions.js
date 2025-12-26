import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { transactionAPI } from '../../api/transactions';
import {
  Container, Box, Paper, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress, Alert, Chip,
  TextField, InputAdornment, MenuItem, Grid, Card, CardContent, Pagination,
  Dialog, DialogTitle, DialogContent, DialogActions, Avatar
} from '@mui/material';
import {
  ArrowBack, Search, FilterList, Receipt, TrendingUp, TrendingDown,
  AccountBalance, Refresh, ShoppingCart, Payment as PaymentIcon, Undo
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const ManageTransactions = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [reverseDialog, setReverseDialog] = useState(false);
  const [reverseReason, setReverseReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    searchTerm: ''
  });

  const [stats, setStats] = useState({
    totalPurchases: 0,
    totalPayments: 0,
    totalRefunds: 0,
    pendingAmount: 0,
    purchaseCount: 0,
    paymentCount: 0,
    refundCount: 0,
    totalTransactions: 0
  });

  useEffect(() => {
    loadTransactions();
  }, [page]);

  useEffect(() => {
    // Reset to page 0 when filters change
    if (page !== 0) {
      setPage(0);
    } else {
      loadTransactions();
    }
  }, [filters]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError('');

      // Load ALL transactions for accurate statistics
      const allResponse = await transactionAPI.getAll(0, 10000);
      const allData = allResponse?.data?.data?.content || 
                      allResponse?.data?.content || 
                      allResponse?.data?.data || 
                      [];
      const allTxns = Array.isArray(allData) ? allData : [];
      setAllTransactions(allTxns);
      calculateStats(allTxns);

      // Load paginated transactions for display
      const response = await transactionAPI.getAll(page, 10);
      const data = response?.data?.data?.content || 
                   response?.data?.content || 
                   response?.data?.data || 
                   [];
      const txns = Array.isArray(data) ? data : [];
      
      setTransactions(txns);
      setTotalPages(response?.data?.data?.totalPages || response?.data?.totalPages || 1);

      console.log('✅ Loaded transactions:', {
        total: allTxns.length,
        currentPage: txns.length,
        page: page
      });

    } catch (err) {
      console.error('Error loading transactions:', err);
      setError('Failed to load transactions');
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (txns) => {
    console.log('📊 Calculating admin stats from', txns.length, 'transactions');

    // Helper function to get transaction type
    const getType = (txn) => txn.type || txn.transactionType;
    const isSuccess = (txn) => txn.status === 'SUCCESS' || txn.status === 'APPROVED';

    // Calculate purchases
    const purchases = txns.filter(t => getType(t) === 'PURCHASE' && isSuccess(t));
    const totalPurchases = purchases.reduce((sum, t) => sum + (t.amount || 0), 0);
    
    // Calculate payments
    const payments = txns.filter(t => getType(t) === 'PAYMENT' && isSuccess(t));
    const totalPayments = payments.reduce((sum, t) => sum + (t.amount || 0), 0);
    
    // Calculate refunds
    const refunds = txns.filter(t => getType(t) === 'REFUND' && isSuccess(t));
    const totalRefunds = refunds.reduce((sum, t) => sum + (t.amount || 0), 0);

    // Calculate pending amount
    const pendingAmount = Math.max(0, totalPurchases - totalPayments);

    const calculatedStats = {
      totalPurchases,
      totalPayments,
      totalRefunds,
      pendingAmount,
      purchaseCount: purchases.length,
      paymentCount: payments.length,
      refundCount: refunds.length,
      totalTransactions: txns.length
    };

    console.log('💰 Admin stats calculated:', calculatedStats);
    setStats(calculatedStats);
  };

  const handleReverseTransaction = async () => {
    if (!reverseReason.trim()) {
      toast.error('Please provide a reason for reversal');
      return;
    }

    setActionLoading(true);
    try {
      await transactionAPI.reverse(selectedTransaction.id, reverseReason);
      toast.success('Transaction reversed successfully');
      setReverseDialog(false);
      setReverseReason('');
      setSelectedTransaction(null);
      loadTransactions();
    } catch (err) {
      console.error('Reverse error:', err);
      toast.error(err.response?.data?.message || 'Failed to reverse transaction');
    } finally {
      setActionLoading(false);
    }
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

  const filteredTransactions = transactions.filter(txn => {
    const txnType = txn.type || txn.transactionType;
    const matchesType = filters.type === 'all' || txnType === filters.type;
    const matchesStatus = filters.status === 'all' || txn.status === filters.status;
    
    let matchesSearch = true;
    if (filters.searchTerm) {
      const search = filters.searchTerm.toLowerCase();
      matchesSearch = (
        txn.merchantName?.toLowerCase().includes(search) ||
        txn.description?.toLowerCase().includes(search) ||
        txn.transactionReference?.toLowerCase().includes(search) ||
        txn.id?.toString().includes(search)
      );
    }
    
    return matchesType && matchesStatus && matchesSearch;
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/admin/dashboard')}
            variant="outlined"
          >
            Back to Dashboard
          </Button>
          <Button
            startIcon={<Refresh />}
            onClick={loadTransactions}
            variant="contained"
          >
            Refresh
          </Button>
        </Box>

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
                  Transaction Management
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Monitor and manage all transactions
                </Typography>
              </Box>
            </Box>
          </Paper>
        </motion.div>

        {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
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
                        Total Purchases
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        ${stats.totalPurchases.toFixed(2)}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: 'block' }}>
                        {stats.purchaseCount} transactions
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <ShoppingCart sx={{ fontSize: 30 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
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
                        Total Payments
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        ${stats.totalPayments.toFixed(2)}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: 'block' }}>
                        {stats.paymentCount} transactions
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <PaymentIcon sx={{ fontSize: 30 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
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
                        Total Refunds
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        ${stats.totalRefunds.toFixed(2)}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: 'block' }}>
                        {stats.refundCount} transactions
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <Undo sx={{ fontSize: 30 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
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
                        {stats.pendingAmount > 0 ? 'Outstanding' : 'All settled'}
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
        </Grid>

        {/* Total Transactions Summary */}
        <Paper elevation={3} sx={{ p: 2, mb: 3, bgcolor: 'primary.light' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">
              📊 Total Transactions: {stats.totalTransactions}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Chip 
                label={`Purchases: ${stats.purchaseCount}`} 
                color="error" 
                variant="outlined"
              />
              <Chip 
                label={`Payments: ${stats.paymentCount}`} 
                color="success" 
                variant="outlined"
              />
              <Chip 
                label={`Refunds: ${stats.refundCount}`} 
                color="info" 
                variant="outlined"
              />
            </Box>
          </Box>
        </Paper>

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
                placeholder="Search by merchant, description, reference..."
                value={filters.searchTerm}
                onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Transaction Type"
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
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
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
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
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Chip
              label={`Showing: ${filteredTransactions.length} of ${transactions.length}`}
              color="primary"
              icon={<Receipt />}
            />
          </Box>
        </Paper>

        {/* Transactions Table */}
        <Paper elevation={3}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date & Time</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Merchant</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Type</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'right' }}>Amount</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Card</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Status</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                      <Receipt sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        No transactions found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {filters.searchTerm || filters.type !== 'all' || filters.status !== 'all'
                          ? 'Try adjusting your search or filters'
                          : 'Transactions will appear here'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((txn, index) => {
                    const txnType = txn.type || txn.transactionType;
                    return (
                      <TableRow 
                        key={txn.id} 
                        hover
                        sx={{
                          bgcolor: index % 2 === 0 ? 'background.default' : 'background.paper',
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight="600">
                            #{txn.id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="600">
                            {new Date(txn.transactionDate).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(txn.transactionDate).toLocaleTimeString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="600">
                            {txn.merchantName || 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {txn.description || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
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
                            {txnType === 'PURCHASE' ? '-' : '+'}${txn.amount?.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            •••• {txn.cardNumber?.slice(-4) || '****'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={txn.status} 
                            size="small"
                            color={getStatusColor(txn.status)}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                setSelectedTransaction(txn);
                                setDetailsDialog(true);
                              }}
                            >
                              Details
                            </Button>
                            {(txn.status === 'APPROVED' || txn.status === 'SUCCESS') && 
                             txnType !== 'PAYMENT' && (
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() => {
                                  setSelectedTransaction(txn);
                                  setReverseDialog(true);
                                }}
                              >
                                Reverse
                              </Button>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
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
                size="large"
              />
            </Box>
          )}
        </Paper>

        {/* Transaction Details Dialog */}
        <Dialog open={detailsDialog} onClose={() => setDetailsDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Receipt color="primary" />
              <Typography variant="h6" fontWeight="bold">
                Transaction Details
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedTransaction && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Transaction ID</Typography>
                  <Typography variant="body1" fontWeight="600">#{selectedTransaction.id}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Reference</Typography>
                  <Typography variant="body1" fontWeight="600">
                    {selectedTransaction.transactionReference || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Date & Time</Typography>
                  <Typography variant="body1" fontWeight="600">
                    {new Date(selectedTransaction.transactionDate).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Type</Typography>
                  <Chip 
                    label={selectedTransaction.type || selectedTransaction.transactionType} 
                    color={getTypeColor(selectedTransaction.type || selectedTransaction.transactionType)} 
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Amount</Typography>
                  <Typography variant="h6" fontWeight="bold" color={
                    (selectedTransaction.type || selectedTransaction.transactionType) === 'PURCHASE' ? 'error.main' : 'success.main'
                  }>
                    ${selectedTransaction.amount?.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Chip label={selectedTransaction.status} color={getStatusColor(selectedTransaction.status)} />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Merchant</Typography>
                  <Typography variant="body1" fontWeight="600">
                    {selectedTransaction.merchantName || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Description</Typography>
                  <Typography variant="body1">{selectedTransaction.description || '-'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Customer ID</Typography>
                  <Typography variant="body1" fontWeight="600">#{selectedTransaction.customerId}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Card</Typography>
                  <Typography variant="body1" fontWeight="600">
                    •••• {selectedTransaction.cardNumber?.slice(-4) || '****'}
                  </Typography>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailsDialog(false)} variant="contained">Close</Button>
          </DialogActions>
        </Dialog>

        {/* Reverse Transaction Dialog */}
        <Dialog open={reverseDialog} onClose={() => !actionLoading && setReverseDialog(false)}>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Undo color="error" />
              <Typography variant="h6" fontWeight="bold">
                Reverse Transaction
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography gutterBottom>
              Are you sure you want to reverse this transaction?
            </Typography>
            {selectedTransaction && (
              <Box sx={{ my: 2, p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
                <Typography variant="body2" gutterBottom>
                  <strong>ID:</strong> #{selectedTransaction.id}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Merchant:</strong> {selectedTransaction.merchantName || 'N/A'}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Amount:</strong> ${selectedTransaction.amount?.toFixed(2)}
                </Typography>
                <Typography variant="body2">
                  <strong>Date:</strong> {new Date(selectedTransaction.transactionDate).toLocaleString()}
                </Typography>
              </Box>
            )}
            <TextField
              fullWidth
              label="Reason for reversal *"
              multiline
              rows={3}
              value={reverseReason}
              onChange={(e) => setReverseReason(e.target.value)}
              placeholder="e.g., Fraudulent transaction, Customer request, System error"
              sx={{ mt: 2 }}
              required
            />
            <Alert severity="warning" sx={{ mt: 2 }}>
              ⚠️ This action will credit the amount back to the customer's account and cannot be undone.
            </Alert>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={() => {
                setReverseDialog(false);
                setReverseReason('');
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleReverseTransaction} 
              color="error" 
              variant="contained"
              disabled={actionLoading || !reverseReason.trim()}
              startIcon={actionLoading ? <CircularProgress size={20} color="inherit" /> : <Undo />}
            >
              {actionLoading ? 'Reversing...' : 'Reverse Transaction'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default ManageTransactions;