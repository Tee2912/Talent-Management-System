import React from 'react';
import { Box, keyframes } from '@mui/material';

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideInFromLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

interface PageTransitionProps {
  children: React.ReactNode;
  animation?: 'fadeUp' | 'slideLeft' | 'scale';
  delay?: number;
}

const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  animation = 'fadeUp',
  delay = 0 
}) => {
  const getAnimation = () => {
    switch (animation) {
      case 'slideLeft':
        return slideInFromLeft;
      case 'scale':
        return scaleIn;
      default:
        return fadeInUp;
    }
  };

  return (
    <Box 
      sx={{
        animation: `${getAnimation()} 0.6s cubic-bezier(0.4, 0, 0.2, 1)`,
        animationDelay: `${delay}ms`,
        animationFillMode: 'both',
        willChange: 'transform, opacity'
      }}
    >
      {children}
    </Box>
  );
};

export default PageTransition;
