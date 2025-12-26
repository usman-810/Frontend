import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cardAPI } from '../../api/cards';
import { transactionAPI } from '../../api/transactions';
import {
  Container, Box, Paper, Typography, Button, TextField, Grid,
  Alert, CircularProgress, Card, CardContent, CardMedia,
  MenuItem, Chip, Avatar, Divider, IconButton, Badge, Dialog,
  DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import {
  ArrowBack, ShoppingCart, CreditCard, Store, Payment,
  Add, Remove, Delete, CheckCircle
} from '@mui/icons-material';
import { toast } from 'react-toastify';

// Sample Products Database
const PRODUCTS = [
  {
    id: 1,
    name: 'Premium Wireless Headphones',
    description: 'High-quality wireless headphones with active noise cancellation and 30-hour battery life',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
    category: 'Electronics',
    stock: 50
  },
  {
    id: 2,
    name: 'Smart Watch Pro',
    description: 'Advanced fitness tracker with heart rate monitor, GPS, and sleep tracking',
    price: 399.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
    category: 'Electronics',
    stock: 30
  },
  {
    id: 3,
    name: 'Laptop Backpack',
    description: 'Durable travel backpack with padded laptop compartment and USB charging port',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
    category: 'Accessories',
    stock: 100
  },
  {
    id: 4,
    name: 'Wireless Gaming Mouse',
    description: 'Ergonomic gaming mouse with RGB lighting and programmable buttons',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500',
    category: 'Electronics',
    stock: 75
  },
  {
    id: 5,
    name: 'Smart Coffee Maker',
    description: 'WiFi-enabled coffee maker with mobile app control and programmable brewing',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500',
    category: 'Home Appliances',
    stock: 40
  },
  {
    id: 6,
    name: 'Premium Yoga Mat',
    description: 'Eco-friendly non-slip yoga mat with alignment markers and carrying strap',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500',
    category: 'Fitness',
    stock: 120
  },
  {
    id: 7,
    name: 'Bluetooth Speaker',
    description: 'Portable waterproof speaker with 360° sound and 12-hour battery',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500',
    category: 'Electronics',
    stock: 60
  },
  {
    id: 8,
    name: 'Designer Sunglasses',
    description: 'UV protection sunglasses with polarized lenses and premium frame',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500',
    category: 'Accessories',
    stock: 85
  },
  {
    id: 9,
    name: 'Mechanical Keyboard',
    description: 'RGB backlit mechanical keyboard with tactile switches',
    price: 159.99,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500',
    category: 'Electronics',
    stock: 45
  }
];

const Shop = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cart, setCart] = useState([]);
  const [selectedCard, setSelectedCard] = useState('');
  const [processingPurchase, setProcessingPurchase] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadCards();
    }
  }, [user]);

  const loadCards = async () => {
    try {
      setLoading(true);
      const response = await cardAPI.getByCustomer(user.id);
      const cardsData = response?.data?.data || response?.data || [];
      
      // Filter only active cards
      const activeCards = cardsData.filter(card => card.status === 'ACTIVE');
      setCards(Array.isArray(activeCards) ? activeCards : []);
      
      if (activeCards.length === 0) {
        toast.warning('No active credit cards found. Please apply for a card first.');
      }
    } catch (err) {
      console.error('Error loading cards:', err);
      toast.error('Failed to load your credit cards');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast.error('Maximum stock reached for this item');
        return;
      }
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
      toast.success(`Added another ${product.name} to cart!`);
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
      toast.success(`${product.name} added to cart!`);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
    toast.info('Item removed from cart');
  };

  const updateQuantity = (productId, newQuantity) => {
    const product = PRODUCTS.find(p => p.id === productId);
    
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    if (newQuantity > product.stock) {
      toast.error('Maximum stock reached');
      return;
    }
    
    setCart(cart.map(item => 
      item.id === productId 
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }
    
    if (cards.length === 0) {
      toast.error('Please apply for a credit card first!');
      navigate('/customer/apply-card');
      return;
    }
    
    setCheckoutOpen(true);
  };

  const handlePurchase = async () => {
    if (!selectedCard) {
      setError('Please select a credit card');
      return;
    }

    const selectedCardData = cards.find(card => card.id === parseInt(selectedCard));
    const total = getTotal();

    // Check if card has sufficient balance
    if (selectedCardData.availableCredit < total) {
      setError(`Insufficient credit! Available: $${selectedCardData.availableCredit.toFixed(2)}, Required: $${total.toFixed(2)}`);
      return;
    }

    setProcessingPurchase(true);
    setError('');

    try {
      // Create a description of all items
      const itemsList = cart.map(item => `${item.quantity}x ${item.name}`).join(', ');
      
      // Prepare transaction data matching backend format exactly
      const transactionData = {
        cardId: parseInt(selectedCard),
        type: 'PURCHASE',
        amount: parseFloat(total.toFixed(2)),
        description: `Purchase from CardHub Store: ${itemsList}`
      };

      console.log('📤 Sending transaction data:', transactionData);
      
      // Create transaction
      const response = await transactionAPI.create(transactionData);
      
      console.log('✅ Transaction response:', response.data);

      // Handle success response
      if (response.data && response.data.success) {
        const txnData = response.data.data;
        setSuccess(`🎉 Purchase completed! Transaction: ${txnData.transactionReference}`);
        toast.success(`🎉 Purchase successful! 
Transaction ID: ${txnData.transactionReference}
Amount: $${txnData.amount}
New Balance: $${txnData.newBalance}`, {
          position: 'top-center',
          autoClose: 5000
        });
      } else {
        setSuccess(`🎉 Purchase completed! Total: $${total.toFixed(2)}`);
        toast.success('🎉 Purchase completed successfully!');
      }
      
      // Clear cart and close dialog
      setCart([]);
      setSelectedCard('');
      setCheckoutOpen(false);
      
      // Reload cards to show updated balance
      await loadCards();

      // Redirect to transactions page after 3 seconds
      setTimeout(() => {
        navigate('/customer/transactions');
      }, 3000);

    } catch (err) {
      console.error('❌ Purchase error:', err);
      const errorMsg = err.response?.data?.message 
        || err.response?.data?.error
        || err.message 
        || 'Purchase failed. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setProcessingPurchase(false);
    }
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/customer/dashboard')}
            variant="outlined"
          >
            Back to Dashboard
          </Button>
          
          <Badge badgeContent={getTotalItems()} color="error">
            <Button
              variant="contained"
              startIcon={<ShoppingCart />}
              onClick={handleCheckout}
              disabled={cart.length === 0}
              size="large"
            >
              Cart ${getTotal().toFixed(2)}
            </Button>
          </Badge>
        </Box>

        {/* Store Header */}
        <Paper elevation={3} sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.2)' }}>
              <Store sx={{ fontSize: 50 }} />
            </Avatar>
            <Box>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                CardHub Store
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.95 }}>
                Shop with your credit cards • Free shipping on orders over $100 • Secure checkout
              </Typography>
            </Box>
          </Box>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>{success}</Alert>}

        {/* Products Grid */}
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
          🔥 Featured Products
        </Typography>

        <Grid container spacing={3}>
          {PRODUCTS.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s',
                  borderRadius: 2,
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 8
                  }
                }}
              >
                <CardMedia
                  component="img"
                  height="240"
                  image={product.image}
                  alt={product.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                    <Chip 
                      label={product.category} 
                      size="small" 
                      color="primary"
                      sx={{ fontWeight: 'bold' }}
                    />
                    <Chip 
                      label={`${product.stock} in stock`} 
                      size="small" 
                      variant="outlined"
                      color={product.stock > 50 ? 'success' : 'warning'}
                    />
                  </Box>
                  
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {product.name}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                    {product.description}
                  </Typography>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Typography variant="h5" color="primary" fontWeight="bold">
                      ${product.price.toFixed(2)}
                    </Typography>
                    
                    <Button
                      variant="contained"
                      startIcon={<ShoppingCart />}
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                      sx={{ borderRadius: 2 }}
                    >
                      Add to Cart
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Checkout Dialog */}
        <Dialog 
          open={checkoutOpen} 
          onClose={() => !processingPurchase && setCheckoutOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Payment sx={{ fontSize: 30 }} />
              <Typography variant="h5" fontWeight="bold">
                Secure Checkout
              </Typography>
            </Box>
          </DialogTitle>
          
          <DialogContent sx={{ mt: 2 }}>
            {/* Cart Items */}
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              📦 Order Summary
            </Typography>
            
            <Paper variant="outlined" sx={{ p: 2, mb: 3, maxHeight: 300, overflow: 'auto' }}>
              {cart.map((item) => (
                <Box 
                  key={item.id} 
                  sx={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                    pb: 2,
                    borderBottom: '1px solid #e0e0e0',
                    '&:last-child': { borderBottom: 'none' }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                    <img 
                      src={item.image} 
                      alt={item.name}
                      style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }}
                    />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {item.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ${item.price.toFixed(2)} each
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, border: '1px solid #ddd', borderRadius: 1, p: 0.5 }}>
                      <IconButton 
                        size="small"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={processingPurchase}
                      >
                        <Remove fontSize="small" />
                      </IconButton>
                      <Typography sx={{ minWidth: 30, textAlign: 'center', fontWeight: 'bold' }}>
                        {item.quantity}
                      </Typography>
                      <IconButton 
                        size="small"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={processingPurchase}
                      >
                        <Add fontSize="small" />
                      </IconButton>
                    </Box>
                    
                    <Typography variant="h6" fontWeight="bold" sx={{ minWidth: 90, textAlign: 'right' }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </Typography>
                    
                    <IconButton 
                      color="error"
                      onClick={() => removeFromCart(item.id)}
                      disabled={processingPurchase}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Paper>

            {/* Total */}
            <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.light', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight="bold">
                  Total Amount:
                </Typography>
                <Typography variant="h3" fontWeight="bold" color="primary.main">
                  ${getTotal().toFixed(2)}
                </Typography>
              </Box>
            </Paper>

            {/* Card Selection */}
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              💳 Select Payment Card
            </Typography>
            
            {cards.length === 0 ? (
              <Alert severity="warning">
                No active credit cards available. 
                <Button 
                  size="small" 
                  onClick={() => navigate('/customer/apply-card')}
                  sx={{ ml: 2 }}
                  variant="contained"
                >
                  Apply for Card
                </Button>
              </Alert>
            ) : (
              <TextField
                fullWidth
                select
                label="Choose Credit Card"
                value={selectedCard}
                onChange={(e) => {
                  setSelectedCard(e.target.value);
                  setError('');
                }}
                required
                disabled={processingPurchase}
                sx={{ mb: 2 }}
              >
                {cards.map((card) => (
                  <MenuItem key={card.id} value={card.id}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <Box>
                        <Typography fontWeight="bold">
                          {card.cardType} •••• {card.cardNumber?.slice(-4)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Available Credit: ${card.availableCredit.toFixed(2)}
                        </Typography>
                      </Box>
                      {card.availableCredit >= getTotal() && (
                        <CheckCircle color="success" />
                      )}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </DialogContent>
          
          <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5' }}>
            <Button 
              onClick={() => setCheckoutOpen(false)}
              disabled={processingPurchase}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              size="large"
              startIcon={processingPurchase ? <CircularProgress size={20} color="inherit" /> : <Payment />}
              onClick={handlePurchase}
              disabled={processingPurchase || !selectedCard || cards.length === 0}
              sx={{ minWidth: 200 }}
            >
              {processingPurchase ? 'Processing...' : `Complete Purchase $${getTotal().toFixed(2)}`}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Shop;