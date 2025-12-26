import React from 'react';
import { Box, Typography } from '@mui/material';
import Tilt from 'react-parallax-tilt';
import { ContactlessOutlined, WifiOutlined } from '@mui/icons-material';

const CreditCard3D = ({ type = 'premium', animate = false }) => {
  const cardTypes = {
    premium: {
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      accent: '#ffd700'
    },
    platinum: {
      gradient: 'linear-gradient(135deg, #2d3436 0%, #000000 100%)',
      accent: '#e5e5e5'
    },
    gold: {
      gradient: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
      accent: '#ffffff'
    }
  };

  const selectedCard = cardTypes[type] || cardTypes.premium;

  return (
    <Tilt
      tiltMaxAngleX={15}
      tiltMaxAngleY={15}
      perspective={1000}
      scale={1.05}
      transitionSpeed={1000}
      glareEnable={true}
      glareMaxOpacity={0.3}
      style={{ width: '100%', height: '100%' }}
    >
      <Box
        sx={{
          width: '100%',
          height: '220px',
          background: selectedCard.gradient,
          borderRadius: '20px',
          padding: '25px',
          position: 'relative',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          animation: animate ? 'float 6s ease-in-out infinite' : 'none',
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-20px)' }
          }
        }}
      >
        {/* Card Chip */}
        <Box
          sx={{
            position: 'absolute',
            top: '25px',
            left: '25px',
            width: '50px',
            height: '40px',
            background: selectedCard.accent,
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
          }}
        />

        {/* Contactless Icon */}
        <ContactlessOutlined
          sx={{
            position: 'absolute',
            top: '25px',
            right: '25px',
            fontSize: '35px',
            color: selectedCard.accent,
            opacity: 0.8
          }}
        />

        {/* Card Number */}
        <Box
          sx={{
            position: 'absolute',
            bottom: '70px',
            left: '25px',
            display: 'flex',
            gap: '15px'
          }}
        >
          {['••••', '••••', '••••', '1234'].map((group, index) => (
            <Typography
              key={index}
              sx={{
                color: 'white',
                fontSize: '18px',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                letterSpacing: '2px'
              }}
            >
              {group}
            </Typography>
          ))}
        </Box>

        {/* Card Holder */}
        <Box sx={{ position: 'absolute', bottom: '35px', left: '25px' }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            CARD HOLDER
          </Typography>
          <Typography variant="body2" fontWeight="bold" sx={{ color: 'white' }}>
            YOUR NAME
          </Typography>
        </Box>

        {/* Brand */}
        <Box sx={{ position: 'absolute', bottom: '15px', right: '25px' }}>
          <Typography variant="h6" fontWeight="bold" sx={{ color: selectedCard.accent }}>
            CardHub
          </Typography>
        </Box>
      </Box>
    </Tilt>
  );
};

export default CreditCard3D;