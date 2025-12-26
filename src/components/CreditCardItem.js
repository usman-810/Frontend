import React, { useState } from 'react';
import { Box, Paper, Typography, IconButton, Chip } from '@mui/material';
import { Visibility, VisibilityOff, CreditCard } from '@mui/icons-material';
import { motion } from 'framer-motion';
import Tilt from 'react-parallax-tilt';

const CreditCardItem = ({ card, index }) => {
  const [showNumber, setShowNumber] = useState(false);

  const getCardGradient = (type) => {
    const gradients = {
      SILVER: 'linear-gradient(135deg, #C0C0C0 0%, #E8E8E8 100%)',
      GOLD: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
      PLATINUM: 'linear-gradient(135deg, #E5E4E2 0%, #B8B8B8 100%)',
      PREMIUM: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
    };
    return gradients[card.cardType] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  };

  const formatCardNumber = (number) => {
    if (!number) return '•••• •••• •••• ••••';
    if (showNumber) {
      return number.match(/.{1,4}/g)?.join(' ') || number;
    }
    return `•••• •••• •••• ${number.slice(-4)}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      ACTIVE: '#43e97b',
      INACTIVE: '#f5a623',
      BLOCKED: '#f5576c',
      CLOSED: '#95a5a6'
    };
    return colors[status] || '#95a5a6';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Tilt
        tiltMaxAngleX={10}
        tiltMaxAngleY={10}
        perspective={1000}
        scale={1.02}
        transitionSpeed={2000}
      >
        <Paper
          elevation={8}
          sx={{
            position: 'relative',
            borderRadius: 4,
            overflow: 'hidden',
            background: getCardGradient(card.cardType),
            color: 'white',
            minHeight: 220,
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.3)'
            }
          }}
        >
          {/* Card Type Badge */}
          <Box sx={{ position: 'absolute', top: 15, left: 15 }}>
            <Chip
              label={card.cardType}
              size="small"
              sx={{
                bgcolor: 'rgba(255,255,255,0.25)',
                color: 'white',
                fontWeight: 'bold',
                backdropFilter: 'blur(10px)'
              }}
            />
          </Box>

          {/* Status Badge */}
          <Box sx={{ position: 'absolute', top: 15, right: 15 }}>
            <Chip
              label={card.status}
              size="small"
              sx={{
                bgcolor: getStatusColor(card.status),
                color: 'white',
                fontWeight: 'bold'
              }}
            />
          </Box>

          {/* Card Brand */}
          <Box sx={{ p: 3, pt: 8 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <CreditCard sx={{ fontSize: 30 }} />
              <Typography variant="h6" fontWeight="bold">
                CardHub
              </Typography>
            </Box>

            {/* EMV Chip */}
            <Box
              sx={{
                width: 45,
                height: 35,
                borderRadius: 1.5,
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
            >
              <Box
                sx={{
                  width: 35,
                  height: 25,
                  borderRadius: 1,
                  background: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)'
                }}
              />
            </Box>

            {/* Card Number with Toggle */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography
                variant="h5"
                fontWeight="bold"
                letterSpacing={2}
                sx={{
                  fontFamily: 'Courier New, monospace',
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                {formatCardNumber(card.cardNumber)}
              </Typography>
              <IconButton
                onClick={() => setShowNumber(!showNumber)}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.3)'
                  }
                }}
                size="small"
              >
                {showNumber ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </Box>

            {/* Card Holder & Expiry */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <Box>
                <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.65rem' }}>
                  CARD HOLDER
                </Typography>
                <Typography variant="body2" fontWeight="bold" sx={{ textTransform: 'uppercase' }}>
                  {card.cardholderName || 'CARDHUB MEMBER'}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.65rem' }}>
                  EXPIRES
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {card.expiryDate || 'MM/YY'}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Card Details Footer */}
          <Box
            sx={{
              mt: 'auto',
              p: 2,
              background: 'rgba(0,0,0,0.2)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Credit Limit
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                ${card.creditLimit?.toLocaleString() || '0'}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Available
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="#43e97b">
                ${card.availableCredit?.toLocaleString() || '0'}
              </Typography>
            </Box>
          </Box>

          {/* Decorative Pattern */}
          <Box
            sx={{
              position: 'absolute',
              right: -50,
              bottom: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
              pointerEvents: 'none'
            }}
          />
        </Paper>
      </Tilt>
    </motion.div>
  );
};

export default CreditCardItem;