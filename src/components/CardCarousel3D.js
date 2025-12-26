import React, { useState } from 'react';
import { Box, Typography, IconButton, Paper } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

const CardCarousel3D = ({ cards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const nextCard = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const prevCard = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const cardVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      rotateY: direction > 0 ? 45 : -45,
      scale: 0.8
    }),
    center: {
      x: 0,
      opacity: 1,
      rotateY: 0,
      scale: 1
    },
    exit: (direction) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      rotateY: direction < 0 ? 45 : -45,
      scale: 0.8
    })
  };

  return (
    <Box sx={{ position: 'relative', height: '400px', display: 'flex', alignItems: 'center' }}>
      {/* Previous Button */}
      <IconButton
        onClick={prevCard}
        sx={{
          position: 'absolute',
          left: 0,
          zIndex: 10,
          background: 'rgba(255,255,255,0.9)',
          boxShadow: 2,
          '&:hover': { background: 'rgba(255,255,255,1)', transform: 'scale(1.1)' }
        }}
      >
        <ChevronLeft />
      </IconButton>

      {/* Card Display */}
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', perspective: '1000px' }}>
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
              rotateY: { duration: 0.4 },
              scale: { duration: 0.3 }
            }}
            style={{
              position: 'absolute',
              width: '100%',
              maxWidth: '500px'
            }}
          >
            <Tilt
              tiltMaxAngleX={10}
              tiltMaxAngleY={10}
              perspective={1000}
              scale={1.02}
              transitionSpeed={2000}
              glareEnable={true}
              glareMaxOpacity={0.3}
            >
              <Paper
                elevation={10}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  background: cards[currentIndex].gradient,
                  color: 'white',
                  minHeight: '280px',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'grab',
                  '&:active': { cursor: 'grabbing' }
                }}
              >
                {/* Animated Background Pattern */}
                <motion.div
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  style={{
                    position: 'absolute',
                    top: '-50%',
                    right: '-50%',
                    width: '200%',
                    height: '200%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                    pointerEvents: 'none'
                  }}
                />

                {/* Card Content */}
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  {/* Card Type Badge */}
                  <Box
                    sx={{
                      display: 'inline-block',
                      px: 2,
                      py: 0.5,
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: 2,
                      mb: 3
                    }}
                  >
                    <Typography variant="caption" fontWeight="bold">
                      {cards[currentIndex].type}
                    </Typography>
                  </Box>

                  {/* Chip */}
                  <Box
                    sx={{
                      width: '50px',
                      height: '40px',
                      background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                      borderRadius: 1,
                      mb: 3,
                      boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                    }}
                  />

                  {/* Card Number */}
                  <Typography
                    variant="h5"
                    sx={{
                      fontFamily: 'monospace',
                      letterSpacing: 3,
                      mb: 3,
                      textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                    }}
                  >
                    •••• •••• •••• {cards[currentIndex].lastFour}
                  </Typography>

                  {/* Card Holder and Expiry */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        CARD HOLDER
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {cards[currentIndex].holder}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        EXPIRES
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {cards[currentIndex].expiry}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Card Brand */}
                  <Box sx={{ position: 'absolute', bottom: 20, right: 20 }}>
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      sx={{ fontStyle: 'italic', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
                    >
                      {cards[currentIndex].brand}
                    </Typography>
                  </Box>

                  {/* Balance Display */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 20,
                      right: 20,
                      textAlign: 'right'
                    }}
                  >
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      AVAILABLE BALANCE
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      ${cards[currentIndex].balance}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Tilt>
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* Next Button */}
      <IconButton
        onClick={nextCard}
        sx={{
          position: 'absolute',
          right: 0,
          zIndex: 10,
          background: 'rgba(255,255,255,0.9)',
          boxShadow: 2,
          '&:hover': { background: 'rgba(255,255,255,1)', transform: 'scale(1.1)' }
        }}
      >
        <ChevronRight />
      </IconButton>

      {/* Indicator Dots */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 1,
          zIndex: 10
        }}
      >
        {cards.map((_, index) => (
          <Box
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1);
              setCurrentIndex(index);
            }}
            sx={{
              width: currentIndex === index ? 30 : 10,
              height: 10,
              borderRadius: 5,
              background: currentIndex === index ? '#667eea' : 'rgba(0,0,0,0.2)',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default CardCarousel3D;