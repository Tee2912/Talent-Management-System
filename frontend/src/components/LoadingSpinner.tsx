import React from 'react';
import { Box, keyframes } from '@mui/material';

const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  message = 'Loading...' 
}) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return { outer: 40, inner: 30, dot: 6 };
      case 'large':
        return { outer: 120, inner: 90, dot: 18 };
      default:
        return { outer: 80, inner: 60, dot: 12 };
    }
  };

  const sizes = getSize();

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 200,
      position: 'relative'
    }}>
      <Box sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Outer Ring */}
        <Box sx={{
          position: 'absolute',
          width: sizes.outer,
          height: sizes.outer,
          border: '2px solid rgba(99, 102, 241, 0.2)',
          borderRadius: '50%',
          animation: `${spin} 3s linear infinite`
        }} />
        
        {/* Inner Ring */}
        <Box sx={{
          position: 'absolute',
          width: sizes.inner,
          height: sizes.inner,
          border: '2px solid rgba(168, 85, 247, 0.3)',
          borderTop: '2px solid #a855f7',
          borderRadius: '50%',
          animation: `${spin} 1.5s linear infinite reverse`
        }} />
        
        {/* Center Dot */}
        <Box sx={{
          width: sizes.dot,
          height: sizes.dot,
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
          borderRadius: '50%',
          animation: `${pulse} 2s ease-in-out infinite`,
          boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)'
        }} />
      </Box>
    </Box>
  );
};

export default LoadingSpinner;
