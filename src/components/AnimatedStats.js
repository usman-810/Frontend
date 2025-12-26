import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { TrendingUp } from '@mui/icons-material';

const AnimatedStats = ({ icon: Icon, title, value, color, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.05, y: -5 }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${color}15 0%, ${color}30 100%)`,
          border: `2px solid ${color}40`,
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'all 0.3s',
          '&:hover': {
            boxShadow: `0 8px 32px ${color}40`
          }
        }}
      >
        {/* Animated Background Circle */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
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
            background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
            pointerEvents: 'none'
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                background: color,
                display: 'flex',
                color: 'white'
              }}
            >
              <Icon sx={{ fontSize: 30 }} />
            </Box>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <TrendingUp sx={{ color: '#4ade80', fontSize: 30 }} />
            </motion.div>
          </Box>

          <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight="500">
            {title}
          </Typography>
        </Box>
      </Paper>
    </motion.div>
  );
};

export default AnimatedStats;