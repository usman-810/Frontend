import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cardAPI } from '../api/cards';
import { transactionAPI } from '../api/transactions';
import { customerAPI } from '../api/customers';
import {
  Container, Box, Paper, Typography, Button, Grid, Card, CardContent,
  CircularProgress, Alert, Tabs, Tab, Avatar, IconButton, Divider
} from '@mui/material';
import {
  Dashboard, People, CreditCard, Receipt, TrendingUp, Logout,
  Assessment, SupervisorAccount, AccountCircle, Refresh
} from '@mui/icons-material';
import { toast } from 'react-toastify';

// Tab Panel Component
function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalCards: 0,
    totalTransactions: 0,
    activeCards: 0,
    totalRevenue: 0
  });

  const [recentData, setRecentData] = useState({
    customers: [],
    cards: [],
    transactions: []
  });

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load all data
      const [customersRes, cardsRes, transactionsRes] = await Promise.all([
        customerAPI.getAll(0, 10),
        cardAPI.getAll(0, 10),
        transactionAPI.getAll(0, 10)
      ]);

      // Extract data
      const customersData = customersRes?.data?.data?.content || customersRes?.data?.content || [];
      const cardsData = cardsRes?.data?.data?.content || cardsRes?.data?.content || [];
      const transactionsData = transactionsRes?.data?.data?.content || transactionsRes?.data?.content || [];

      // Calculate stats
      setStats({
        totalCustomers: customersData.length,
        totalCards: cardsData.length,
        totalTransactions: transactionsData.length,
        activeCards: cardsData.filter(c => c.status === 'ACTIVE').length,
        totalRevenue: transactionsData
          .filter(t => t.transactionType === 'PURCHASE' && t.status === 'APPROVED')
          .reduce((sum, t) => sum + t.amount, 0)
      });

      setRecentData({
        customers: customersData.slice(0, 5),
        cards: cardsData.slice(0, 5),
        transactions: transactionsData.slice(0, 5)
      });

    } catch (err) {
      console.error('Error loading admin data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Paper elevation={6} sx={{ 
          p: 3, 
          mb: 4, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 3 
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ width: 60, height: 60, bgcolor: 'rgba(255,255,255,0.2)' }}>
                <SupervisorAccount sx={{ fontSize: 40 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  Admin Dashboard
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Welcome, {user?.firstName} {user?.lastName}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton 
                onClick={loadAdminData}
                sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}
              >
                <Refresh />
              </IconButton>
              <Button
                variant="contained"
                startIcon={<Logout />}
                onClick={handleLogout}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}
              >
                Logout
              </Button>
            </Box>
          </Box>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={4} sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 3
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Customers</Typography>
                    <Typography variant="h3" fontWeight="bold">{stats.totalCustomers}</Typography>
                  </Box>
                  <People sx={{ fontSize: 50, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={4} sx={{ 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              borderRadius: 3
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Cards</Typography>
                    <Typography variant="h3" fontWeight="bold">{stats.totalCards}</Typography>
                  </Box>
                  <CreditCard sx={{ fontSize: 50, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={4} sx={{ 
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              borderRadius: 3
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Active Cards</Typography>
                    <Typography variant="h3" fontWeight="bold">{stats.activeCards}</Typography>
                  </Box>
                  <TrendingUp sx={{ fontSize: 50, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={4} sx={{ 
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              color: 'white',
              borderRadius: 3
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Transactions</Typography>
                    <Typography variant="h3" fontWeight="bold">{stats.totalTransactions}</Typography>
                  </Box>
                  <Receipt sx={{ fontSize: 50, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6} sm={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<People />}
                onClick={() => navigate('/admin/customers')}
                sx={{ py: 2, borderRadius: 2, borderWidth: 2 }}
              >
                Manage Customers
              </Button>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<CreditCard />}
                onClick={() => navigate('/admin/cards')}
                sx={{ py: 2, borderRadius: 2, borderWidth: 2 }}
              >
                Manage Cards
              </Button>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Receipt />}
                onClick={() => navigate('/admin/transactions')}
                sx={{ py: 2, borderRadius: 2, borderWidth: 2 }}
              >
                View Transactions
              </Button>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Assessment />}
                onClick={() => navigate('/admin/reports')}
                sx={{ py: 2, borderRadius: 2, borderWidth: 2 }}
              >
                Reports
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Tabs Section */}
        <Paper elevation={3} sx={{ borderRadius: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
              <Tab label="Recent Customers" icon={<People />} />
              <Tab label="Recent Cards" icon={<CreditCard />} />
              <Tab label="Recent Transactions" icon={<Receipt />} />
            </Tabs>
          </Box>

          {/* Recent Customers */}
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Recent Customers
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {recentData.customers.length === 0 ? (
              <Typography color="text.secondary">No customers found</Typography>
            ) : (
              recentData.customers.map((customer) => (
                <Box key={customer.id} sx={{ 
                  p: 2, 
                  mb: 1, 
                  borderRadius: 1, 
                  bgcolor: 'grey.50',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <AccountCircle />
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight="600">
                        {customer.firstName} {customer.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {customer.email}
                      </Typography>
                    </Box>
                  </Box>
                  <Button 
                    size="small" 
                    variant="outlined"
                    onClick={() => navigate(`/admin/customers/${customer.id}`)}
                  >
                    View Details
                  </Button>
                </Box>
              ))
            )}
          </TabPanel>

          {/* Recent Cards */}
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Recent Cards
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {recentData.cards.length === 0 ? (
              <Typography color="text.secondary">No cards found</Typography>
            ) : (
              recentData.cards.map((card) => (
                <Box key={card.id} sx={{ 
                  p: 2, 
                  mb: 1, 
                  borderRadius: 1, 
                  bgcolor: 'grey.50',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Box>
                    <Typography variant="body1" fontWeight="600">
                      {card.cardType} - **** {card.cardNumber?.slice(-4)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Status: {card.status} | Limit: ₹{card.creditLimit?.toLocaleString()}
                    </Typography>
                  </Box>
                  <Button 
                    size="small" 
                    variant="outlined"
                    onClick={() => navigate(`/admin/cards/${card.id}`)}
                  >
                    Manage
                  </Button>
                </Box>
              ))
            )}
          </TabPanel>

          {/* Recent Transactions */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Recent Transactions
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {recentData.transactions.length === 0 ? (
              <Typography color="text.secondary">No transactions found</Typography>
            ) : (
              recentData.transactions.map((txn) => (
                <Box key={txn.id} sx={{ 
                  p: 2, 
                  mb: 1, 
                  borderRadius: 1, 
                  bgcolor: 'grey.50',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Box>
                    <Typography variant="body1" fontWeight="600">
                      {txn.merchantName || 'Transaction'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {txn.transactionType} - {new Date(txn.transactionDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Typography variant="h6" fontWeight="bold" color={
                    txn.transactionType === 'PURCHASE' ? 'error.main' : 'success.main'
                  }>
                    {txn.transactionType === 'PURCHASE' ? '-' : '+'}₹{txn.amount}
                  </Typography>
                </Box>
              ))
            )}
          </TabPanel>
        </Paper>
      </Container>
    </Box>
  );
};

export default AdminDashboard;