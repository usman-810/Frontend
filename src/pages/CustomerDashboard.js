import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cardAPI } from '../api/cards';
import { transactionAPI } from '../api/transactions';
import { 
  Container, Box, Paper, Typography, Button, Grid, Card, CardContent, 
  CircularProgress, Alert, Chip, Avatar, IconButton
} from '@mui/material';
import { 
  CreditCard, Logout, AccountBalance, TrendingUp, 
  Receipt, Settings, Refresh, AccountCircle, Payment, Add,
  ArrowForward, TrendingDown, ShoppingCart
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import Card3DDisplay from '../components/Card3DDisplay';
import AnimatedStats from '../components/AnimatedStats';
import CreditCardItem from '../components/CreditCardItem';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [cards, setCards] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.id) {
      loadCustomerData();
    }
  }, [user]);

  const loadCustomerData = async () => {
    try {
      setLoading(true);
      setError('');

      const cardsResponse = await cardAPI.getByCustomer(user.id);
      const cardsData = cardsResponse?.data?.data || cardsResponse?.data || [];
      setCards(Array.isArray(cardsData) ? cardsData : []);

      const transactionsResponse = await transactionAPI.getByCustomer(user.id, 0, 10);
      const transactionsData = transactionsResponse?.data?.data || transactionsResponse?.data || [];
      setTransactions(Array.isArray(transactionsData) ? transactionsData : []);

    } catch (err) {
      console.error('Error loading customer data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <CircularProgress size={60} sx={{ color: 'white' }} />
        </motion.div>
        <Typography variant="h6" sx={{ mt: 2, color: 'white' }}>
          Loading your dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      py: 4 
    }}>
      <Container maxWidth="xl">
        {/* Animated Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Paper 
            elevation={6} 
            sx={{ 
              p: 4, 
              mb: 4, 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 20, repeat: Infinity }}
              style={{
                position: 'absolute',
                top: '-50%',
                right: '-25%',
                width: '50%',
                height: '200%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                pointerEvents: 'none'
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <Avatar sx={{ 
                    width: 70, 
                    height: 70, 
                    bgcolor: 'rgba(255,255,255,0.2)',
                    border: '3px solid rgba(255,255,255,0.3)'
                  }}>
                    <AccountCircle sx={{ fontSize: 50 }} />
                  </Avatar>
                </motion.div>
                <Box>
                  <Typography variant="h3" fontWeight="bold">
                    Welcome Back! 👋
                  </Typography>
                  <Typography variant="h5" sx={{ opacity: 0.9, mt: 1 }}>
                    {user?.firstName} {user?.lastName}
                  </Typography>
                  <Chip 
                    label={user?.role} 
                    size="small" 
                    icon={<AccountCircle />}
                    sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' }}
                  />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <IconButton 
                    onClick={loadCustomerData}
                    sx={{ 
                      color: 'white', 
                      bgcolor: 'rgba(255,255,255,0.2)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                    }}
                  >
                    <Refresh />
                  </IconButton>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="contained"
                    startIcon={<Logout />}
                    onClick={handleLogout}
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)',
                      px: 3,
                      py: 1.5,
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                    }}
                  >
                    Logout
                  </Button>
                </motion.div>
              </Box>
            </Box>
          </Paper>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Alert 
              severity="error" 
              sx={{ mb: 3, borderRadius: 2 }}
              action={
                <Button color="inherit" size="small" onClick={loadCustomerData}>
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
          </motion.div>
        )}

        {/* Featured Shop Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Paper 
            elevation={8}
            sx={{ 
              p: 4, 
              mb: 4, 
              background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
              color: 'white',
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'scale(1.02)'
              }
            }}
            onClick={() => navigate('/customer/shop')}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{
                position: 'absolute',
                right: 30,
                top: 20,
                fontSize: 100,
                opacity: 0.2
              }}
            >
              🛒
            </motion.div>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                🎉 Shop Now & Save Big!
              </Typography>
              <Typography variant="h6" sx={{ mb: 3, opacity: 0.95 }}>
                Browse amazing products and pay with your credit cards
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<ShoppingCart />}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/customer/shop');
                }}
                sx={{ 
                  bgcolor: 'white',
                  color: '#FF6B6B',
                  fontWeight: 'bold',
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.9)'
                  }
                }}
              >
                Start Shopping
              </Button>
            </Box>
          </Paper>
        </motion.div>

        {/* Animated Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <AnimatedStats
              icon={CreditCard}
              title="Total Cards"
              value={cards.length.toString()}
              color="#667eea"
              delay={0}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AnimatedStats
              icon={AccountBalance}
              title="Active Cards"
              value={cards.filter(c => c.status === 'ACTIVE').length.toString()}
              color="#f093fb"
              delay={0.1}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AnimatedStats
              icon={TrendingUp}
              title="Transactions"
              value={transactions.length.toString()}
              color="#4facfe"
              delay={0.2}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AnimatedStats
              icon={Payment}
              title="Total Limit"
              value={`$${cards.reduce((sum, card) => sum + (card.creditLimit || 0), 0).toLocaleString()}`}
              color="#43e97b"
              delay={0.3}
            />
          </Grid>
        </Grid>

        {/* My Credit Cards Section - Enhanced with Toggle View */}
        {cards.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Paper elevation={6} sx={{ p: 4, borderRadius: 4, mb: 4, bgcolor: 'white' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    💳 My Credit Cards
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Click the eye icon 👁️ to reveal card numbers
                  </Typography>
                </Box>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate('/customer/apply-card')}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: 2,
                      px: 3,
                      py: 1.5,
                      fontWeight: 'bold'
                    }}
                  >
                    Apply for New Card
                  </Button>
                </motion.div>
              </Box>

              {/* Cards Grid */}
              <Grid container spacing={3}>
                {cards.map((card, index) => (
                  <Grid item xs={12} sm={6} md={4} key={card.id}>
                    <CreditCardItem card={card} index={index} />
                  </Grid>
                ))}
              </Grid>

              {/* View All Cards Link */}
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Button
                  variant="outlined"
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/customer/cards')}
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    borderWidth: 2,
                    fontWeight: 'bold',
                    '&:hover': {
                      borderWidth: 2
                    }
                  }}
                >
                  View All Cards & Details
                </Button>
              </Box>
            </Paper>
          </motion.div>
        ) : (
          /* No Cards State */
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Paper
              elevation={6}
              sx={{
                p: 6,
                borderRadius: 4,
                mb: 4,
                textAlign: 'center',
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <CreditCard sx={{ fontSize: 80, color: '#667eea', mb: 2 }} />
              </motion.div>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                No Credit Cards Yet
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Apply for your first credit card to start managing your finances
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<Add />}
                onClick={() => navigate('/customer/apply-card')}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 2,
                  px: 4,
                  py: 1.5
                }}
              >
                Apply for Credit Card
              </Button>
            </Paper>
          </motion.div>
        )}

        <Grid container spacing={3}>
          {/* 3D Card Display */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Paper elevation={6} sx={{ p: 3, borderRadius: 4, height: '100%' }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  🎨 3D Card Preview
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Drag to rotate and explore your card
                </Typography>
                <Card3DDisplay cardType="premium" />
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Chip 
                    label="Interactive 3D Model" 
                    color="primary" 
                    icon={<CreditCard />}
                  />
                </Box>
              </Paper>
            </motion.div>
          </Grid>

          {/* Account Information */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5}>
                <Card elevation={6} sx={{ borderRadius: 4, height: '100%', overflow: 'hidden' }}>
                  <Box sx={{ 
                    p: 2, 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 50, height: 50 }}>
                        <AccountCircle sx={{ fontSize: 30 }} />
                      </Avatar>
                      <Typography variant="h6" fontWeight="bold">
                        Account Details
                      </Typography>
                    </Box>
                  </Box>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                      {[
                        { label: 'USERNAME', value: user?.username },
                        { label: 'EMAIL', value: user?.email },
                        { label: 'PHONE', value: user?.phone },
                        { 
                          label: 'MEMBER SINCE', 
                          value: new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        }
                      ].map((item, index) => (
                        <motion.div key={index} whileHover={{ x: 5 }}>
                          <Box sx={{ 
                            p: 2, 
                            borderRadius: 2, 
                            bgcolor: 'rgba(102, 126, 234, 0.05)',
                            transition: 'all 0.3s',
                            '&:hover': { bgcolor: 'rgba(102, 126, 234, 0.1)' }
                          }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="600">
                              {item.label}
                            </Typography>
                            <Typography variant="body1" fontWeight="600" sx={{ mt: 0.5 }}>
                              {item.value}
                            </Typography>
                          </Box>
                        </motion.div>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Tilt>
            </motion.div>
          </Grid>
        </Grid>

        {/* Recent Transactions */}
        {transactions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Card elevation={6} sx={{ mt: 4, borderRadius: 4 }}>
              <Box sx={{ 
                p: 2.5, 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Receipt sx={{ fontSize: 30 }} />
                  <Typography variant="h6" fontWeight="bold">
                    Recent Transactions
                  </Typography>
                </Box>
              </Box>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  <AnimatePresence>
                    {transactions.map((txn, index) => (
                      <motion.div
                        key={txn.id}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Tilt tiltMaxAngleX={2} tiltMaxAngleY={2}>
                          <Box 
                            sx={{ 
                              py: 2.5, 
                              px: 3,
                              mb: 2,
                              borderRadius: 3,
                              background: index % 2 === 0 
                                ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
                                : 'transparent',
                              border: '2px solid',
                              borderColor: 'transparent',
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              transition: 'all 0.3s',
                              cursor: 'pointer',
                              '&:hover': { 
                                borderColor: '#667eea',
                                transform: 'translateX(10px)',
                                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)'
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar sx={{ 
                                bgcolor: txn.type === 'PURCHASE' 
                                  ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                                  : 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                                background: txn.type === 'PURCHASE' 
                                  ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                                  : 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                                width: 50,
                                height: 50
                              }}>
                                {txn.type === 'PURCHASE' ? <TrendingDown /> : <TrendingUp />}
                              </Avatar>
                              <Box>
                                <Typography variant="body1" fontWeight="700">
                                  {txn.description || 'Transaction'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(txn.transactionDate).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </Typography>
                              </Box>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography 
                                variant="h6" 
                                fontWeight="bold"
                                sx={{
                                  color: txn.type === 'PURCHASE' ? '#f5576c' : '#43e97b'
                                }}
                              >
                                {txn.type === 'PURCHASE' ? '-' : '+'}${txn.amount}
                              </Typography>
                              <Chip 
                                label={txn.status} 
                                size="small"
                                color={txn.status === 'SUCCESS' ? 'success' : 'default'}
                                sx={{ mt: 0.5, fontWeight: 'bold' }}
                              />
                            </Box>
                          </Box>
                        </Tilt>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Card elevation={6} sx={{ mt: 4, borderRadius: 4, mb: 4, overflow: 'hidden' }}>
            <Box sx={{ 
              p: 2.5, 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}>
              <Typography variant="h6" fontWeight="bold">
                ⚡ Quick Actions
              </Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={2}>
                {[
                  { icon: <ShoppingCart />, label: 'Shop Now', path: '/customer/shop', color: '#FF6B6B', featured: true },
                  { icon: <CreditCard />, label: 'View Cards', path: '/customer/cards', color: '#667eea' },
                  { icon: <Receipt />, label: 'Transactions', path: '/customer/transactions', color: '#f093fb' },
                  { icon: <Payment />, label: 'Make Payment', path: '/customer/payment', color: '#4facfe' },
                  { icon: <Settings />, label: 'Settings', path: '/customer/settings', color: '#43e97b' }
                ].map((action, index) => (
                  <Grid item xs={6} sm={action.featured ? 12 : 3} key={index}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.9 + index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10}>
                        <Paper
                          onClick={() => navigate(action.path)}
                          sx={{
                            p: action.featured ? 4 : 3,
                            textAlign: 'center',
                            borderRadius: 3,
                            cursor: 'pointer',
                            background: action.featured 
                              ? `linear-gradient(135deg, ${action.color} 0%, #FF8E53 100%)`
                              : `linear-gradient(135deg, ${action.color}15 0%, ${action.color}30 100%)`,
                            border: action.featured ? 'none' : `2px solid ${action.color}40`,
                            color: action.featured ? 'white' : 'inherit',
                            transition: 'all 0.3s',
                            '&:hover': {
                              boxShadow: `0 8px 32px ${action.color}40`,
                              borderColor: action.color
                            }
                          }}
                        >
                          <Box
                            sx={{
                              width: action.featured ? 80 : 60,
                              height: action.featured ? 80 : 60,
                              borderRadius: '50%',
                              background: action.featured ? 'rgba(255,255,255,0.2)' : action.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: '0 auto',
                              mb: 2,
                              color: 'white',
                              boxShadow: `0 4px 20px ${action.color}60`,
                              fontSize: action.featured ? 40 : 24
                            }}
                          >
                            {action.icon}
                          </Box>
                          <Typography 
                            variant={action.featured ? 'h6' : 'body2'} 
                            fontWeight="700"
                          >
                            {action.label}
                          </Typography>
                          {action.featured && (
                            <Typography variant="caption" sx={{ opacity: 0.9, mt: 1, display: 'block' }}>
                              Browse amazing products
                            </Typography>
                          )}
                          <ArrowForward sx={{ fontSize: 16, mt: 1, opacity: 0.6 }} />
                        </Paper>
                      </Tilt>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
};

export default CustomerDashboard;