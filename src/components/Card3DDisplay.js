import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import { ContactlessOutlined } from '@mui/icons-material';

const Card3DDisplay = ({ cardType = 'premium' }) => {
  const cardColors = {
    premium: {
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      accent: '#ffd700'
    },
    platinum: {
      gradient: 'linear-gradient(135deg, #2c3e50 0%, #000000 100%)',
      accent: '#e5e5e5'
    },
    gold: {
      gradient: 'linear-gradient(135deg, #f39c12 0%, #f7971e 100%)',
      accent: '#ffffff'
    },
    silver: {
      gradient: 'linear-gradient(135deg, #95a5a6 0%, #bdc3c7 100%)',
      accent: '#2c3e50'
    }
  };

  const selectedCard = cardColors[cardType] || cardColors.premium;

  return (
    <Box sx={{ 
      width: '100%', 
      height: '300px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      perspective: '1500px'
    }}>
      <Tilt
        tiltMaxAngleX={15}
        tiltMaxAngleY={15}
        perspective={1500}
        scale={1.08}
        transitionSpeed={2000}
        glareEnable={true}
        glareMaxOpacity={0.4}
        glareColor="#ffffff"
        glarePosition="all"
        glareBorderRadius="20px"
        style={{ width: '100%', maxWidth: '420px' }}
      >
        <Box
          sx={{
            width: '100%',
            height: '250px',
            background: selectedCard.gradient,
            borderRadius: '20px',
            padding: '30px',
            position: 'relative',
            boxShadow: '0 30px 70px rgba(0,0,0,0.5)',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.1)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.03) 50%, transparent 70%)',
              pointerEvents: 'none'
            }
          }}
        >
          {/* EMV Chip */}
          <Box
            sx={{
              position: 'absolute',
              top: '30px',
              left: '30px',
              width: '50px',
              height: '40px',
              background: `linear-gradient(135deg, ${selectedCard.accent} 0%, ${selectedCard.accent}dd 100%)`,
              borderRadius: '6px',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.4)',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gridTemplateRows: 'repeat(5, 1fr)',
              gap: '1px',
              padding: '3px',
              '&::after': {
                content: '""',
                position: 'absolute',
                inset: '6px',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)',
                borderRadius: '3px'
              }
            }}
          >
            {[...Array(20)].map((_, i) => (
              <Box
                key={i}
                sx={{
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.3), rgba(255,255,255,0.1))',
                  borderRadius: '1px'
                }}
              />
            ))}
          </Box>

          {/* Contactless Symbol */}
          <ContactlessOutlined
            sx={{
              position: 'absolute',
              top: '32px',
              right: '30px',
              fontSize: '38px',
              color: selectedCard.accent,
              opacity: 0.9,
              transform: 'rotate(-90deg)',
              filter: 'drop-shadow(2px 2px 3px rgba(0,0,0,0.3))'
            }}
          />

          {/* Network Logo (WiFi-style bars) */}
          <Box
            sx={{
              position: 'absolute',
              top: '35px',
              right: '75px',
              display: 'flex',
              gap: '2px',
              alignItems: 'flex-end',
              opacity: 0.8
            }}
          >
            {[8, 12, 16, 20].map((height, i) => (
              <Box
                key={i}
                sx={{
                  width: '4px',
                  height: `${height}px`,
                  background: selectedCard.accent,
                  borderRadius: '2px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              />
            ))}
          </Box>

          {/* Card Number */}
          <Box
            sx={{
              position: 'absolute',
              bottom: '85px',
              left: '30px',
              display: 'flex',
              gap: '15px'
            }}
          >
            {['4532', '8765', '2341', '9087'].map((group, index) => (
              <Typography
                key={index}
                sx={{
                  color: 'white',
                  fontSize: '20px',
                  fontFamily: 'Courier New, monospace',
                  fontWeight: '600',
                  letterSpacing: '2px',
                  textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                }}
              >
                {group}
              </Typography>
            ))}
          </Box>

          {/* Cardholder Name */}
          <Box
            sx={{
              position: 'absolute',
              bottom: '40px',
              left: '30px'
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: '9px',
                fontWeight: '600',
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}
            >
              Cardholder Name
            </Typography>
            <Typography
              sx={{
                color: 'white',
                fontSize: '15px',
                fontWeight: '600',
                letterSpacing: '1.5px',
                textShadow: '0 2px 4px rgba(0,0,0,0.4)',
                mt: 0.3,
                textTransform: 'uppercase'
              }}
            >
              John M. Doe
            </Typography>
          </Box>

          {/* Valid Thru */}
          <Box
            sx={{
              position: 'absolute',
              bottom: '40px',
              left: '220px'
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: '9px',
                fontWeight: '600',
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}
            >
              Valid Thru
            </Typography>
            <Typography
              sx={{
                color: 'white',
                fontSize: '15px',
                fontWeight: '600',
                letterSpacing: '1.5px',
                textShadow: '0 2px 4px rgba(0,0,0,0.4)',
                mt: 0.3,
                fontFamily: 'Courier New, monospace'
              }}
            >
              12/28
            </Typography>
          </Box>

          {/* Card Network */}
          <Box
            sx={{
              position: 'absolute',
              bottom: '25px',
              right: '30px',
              display: 'flex',
              gap: '10px',
              alignItems: 'center'
            }}
          >
            {/* Visa-style circles */}
            <Box sx={{ display: 'flex', gap: '0px' }}>
              <Box
                sx={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.9)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                  border: '2px solid rgba(255,255,255,0.5)'
                }}
              />
              <Box
                sx={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.7)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                  marginLeft: '-16px',
                  border: '2px solid rgba(255,255,255,0.5)'
                }}
              />
            </Box>
          </Box>

          {/* Card Type Badge */}
          <Box
            sx={{
              position: 'absolute',
              top: '20px',
              right: '30px',
              padding: '4px 12px',
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.3)'
            }}
          >
            <Typography
              sx={{
                color: 'white',
                fontSize: '11px',
                fontWeight: 'bold',
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}
            >
              {cardType}
            </Typography>
          </Box>

          {/* Holographic effect */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.1) 45%, transparent 50%, rgba(255,255,255,0.1) 55%, transparent 100%)',
              animation: 'shimmer 8s infinite linear',
              pointerEvents: 'none',
              '@keyframes shimmer': {
                '0%': { transform: 'translateX(-100%)' },
                '100%': { transform: 'translateX(100%)' }
              }
            }}
          />

          {/* Magnetic stripe on back (subtle indicator) */}
          <Box
            sx={{
              position: 'absolute',
              top: '60px',
              left: 0,
              right: 0,
              height: '45px',
              background: 'rgba(0,0,0,0.3)',
              backdropFilter: 'blur(5px)',
              opacity: 0.3
            }}
          />

          {/* Security Pattern */}
          <Box
            sx={{
              position: 'absolute',
              bottom: '10px',
              left: '30px',
              display: 'flex',
              gap: '1px'
            }}
          >
            {[...Array(15)].map((_, i) => (
              <Box
                key={i}
                sx={{
                  width: '2px',
                  height: `${Math.random() * 8 + 4}px`,
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '1px'
                }}
              />
            ))}
          </Box>

          {/* CVV Indicator */}
          <Box
            sx={{
              position: 'absolute',
              bottom: '12px',
              right: '110px',
              fontSize: '9px',
              color: 'rgba(255,255,255,0.6)',
              fontFamily: 'monospace',
              letterSpacing: '2px'
            }}
          >
            CVV: •••
          </Box>
        </Box>
      </Tilt>
    </Box>
  );
};

export default Card3DDisplay;