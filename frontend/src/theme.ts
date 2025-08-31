import React from 'react';
import { createTheme, alpha, keyframes } from '@mui/material/styles';

export const ColorModeContext = React.createContext({ toggleColorMode: () => {} });

// Advanced keyframe animations
const pulseGlow = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); }
  100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

export const createAppTheme = (mode: 'light' | 'dark' = 'dark') => {
  const isDark = mode === 'dark';
  const bgDefault = isDark ? '#0a0b1e' : '#fafbff';
  const bgPaper = isDark ? '#0f1629' : '#ffffff';
  const textPrimary = isDark ? '#f1f5f9' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#475569';

  return createTheme({
    palette: {
      mode,
      primary: { 
        main: '#6366F1', 
        light: '#8B8EF7', 
        dark: '#4338CA', 
        contrastText: '#ffffff' 
      },
      secondary: { 
        main: '#EC4899', 
        light: '#F472B6', 
        dark: '#BE185D', 
        contrastText: '#ffffff' 
      },
      success: { 
        main: '#10B981', 
        light: '#34D399', 
        dark: '#047857' 
      },
      warning: { 
        main: '#F59E0B', 
        light: '#FBBF24', 
        dark: '#D97706' 
      },
      info: { 
        main: '#06B6D4', 
        light: '#67E8F9', 
        dark: '#0891B2' 
      },
      error: {
        main: '#EF4444',
        light: '#F87171',
        dark: '#DC2626'
      },
      background: { default: bgDefault, paper: bgPaper },
      text: { primary: textPrimary, secondary: textSecondary },
    },
    typography: {
      fontFamily: '"Inter", "SF Pro Display", "Segoe UI", "Roboto", -apple-system, BlinkMacSystemFont, sans-serif',
      h1: { 
        fontWeight: 800, 
        fontSize: '3rem', 
        letterSpacing: -0.8,
        background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        lineHeight: 1.2
      },
      h2: { 
        fontWeight: 700, 
        fontSize: '2.25rem', 
        letterSpacing: -0.5,
        lineHeight: 1.3
      },
      h3: { 
        fontWeight: 600, 
        fontSize: '1.75rem', 
        letterSpacing: -0.3,
        lineHeight: 1.4
      },
      h4: { 
        fontWeight: 600, 
        fontSize: '1.375rem', 
        letterSpacing: -0.2,
        lineHeight: 1.5
      },
      h5: { 
        fontWeight: 600, 
        fontSize: '1.125rem',
        lineHeight: 1.5
      },
      h6: { 
        fontWeight: 600, 
        fontSize: '1rem',
        lineHeight: 1.6
      },
      body1: { 
        fontSize: '1rem', 
        lineHeight: 1.7,
        letterSpacing: 0.1
      },
      body2: { 
        fontSize: '0.875rem', 
        lineHeight: 1.6,
        letterSpacing: 0.1
      },
      button: { 
        fontWeight: 600, 
        textTransform: 'none', 
        letterSpacing: 0.5,
        fontSize: '0.875rem'
      },
      caption: {
        fontSize: '0.75rem',
        letterSpacing: 0.4,
        fontWeight: 500
      }
    },
    shape: { borderRadius: 20 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            background: isDark
              ? 'radial-gradient(ellipse at top, #1e1b4b 0%, #0f172a 50%, #020617 100%)'
              : 'radial-gradient(ellipse at top, #f0f9ff 0%, #fafbff 50%, #f8fafc 100%)',
            backgroundAttachment: 'fixed',
            minHeight: '100vh',
            margin: 0,
            padding: 0,
            scrollBehavior: 'smooth',
          },
          '*': {
            scrollbarWidth: 'thin',
            scrollbarColor: isDark ? '#4338CA #1e293b' : '#cbd5e1 #f1f5f9',
          },
          '*::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '*::-webkit-scrollbar-track': {
            background: isDark ? '#1e293b' : '#f1f5f9',
            borderRadius: '4px',
          },
          '*::-webkit-scrollbar-thumb': {
            background: isDark ? '#4338CA' : '#cbd5e1',
            borderRadius: '4px',
            '&:hover': {
              background: isDark ? '#6366F1' : '#94a3b8',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.15)',
            background: isDark
              ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 27, 75, 0.95) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            borderBottom: `1px solid ${alpha(isDark ? '#6366F1' : '#e2e8f0', 0.2)}`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: '0 12px 40px rgba(99, 102, 241, 0.2)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 24,
            border: `1px solid ${alpha('#6366F1', isDark ? 0.15 : 0.1)}`,
            background: isDark
              ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
            boxShadow: isDark 
              ? '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(99, 102, 241, 0.1)' 
              : '0 20px 40px rgba(99, 102, 241, 0.08), 0 0 0 1px rgba(99, 102, 241, 0.05)',
            backdropFilter: 'blur(20px)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: `linear-gradient(90deg, transparent, ${alpha('#6366F1', 0.1)}, transparent)`,
              transition: 'left 0.6s',
            },
            '&:hover': { 
              transform: 'translateY(-8px) scale(1.02)',
              boxShadow: isDark
                ? '0 32px 64px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(99, 102, 241, 0.2)'
                : '0 32px 64px rgba(99, 102, 241, 0.15), 0 0 0 1px rgba(99, 102, 241, 0.1)',
              '&::before': {
                left: '100%',
              },
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 24,
            background: isDark
              ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)',
            border: `1px solid ${alpha('#6366F1', isDark ? 0.12 : 0.08)}`,
            boxShadow: isDark
              ? '0 12px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(99, 102, 241, 0.1)'
              : '0 12px 32px rgba(99, 102, 241, 0.1), 0 0 0 1px rgba(99, 102, 241, 0.05)',
            backdropFilter: 'blur(20px)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: 'none',
            padding: '12px 24px',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
              transition: 'left 0.6s',
            },
            '&:hover': { 
              transform: 'translateY(-2px) scale(1.02)',
              '&::before': {
                left: '100%',
              },
            },
            '&:active': {
              transform: 'translateY(0) scale(0.98)',
            },
          },
          contained: {
            background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
            color: '#fff',
            boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)',
            '&:hover': { 
              background: 'linear-gradient(135deg, #5855E6 0%, #E1398B 100%)',
              boxShadow: '0 12px 35px rgba(99, 102, 241, 0.5)',
            },
            '&:active': {
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.6)',
            },
          },
          outlined: {
            border: `2px solid ${alpha('#6366F1', 0.3)}`,
            color: '#6366F1',
            background: 'transparent',
            '&:hover': {
              border: `2px solid #6366F1`,
              background: alpha('#6366F1', 0.05),
              boxShadow: '0 8px 25px rgba(99, 102, 241, 0.2)',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            fontWeight: 600,
            fontSize: '0.75rem',
            background: isDark
              ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)'
              : 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
            border: `1px solid ${alpha('#6366F1', 0.3)}`,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
            },
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            background: isDark
              ? 'linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(2, 6, 23, 0.98) 100%)'
              : 'linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)',
            borderRight: `1px solid ${alpha('#6366F1', isDark ? 0.2 : 0.15)}`,
            backdropFilter: 'blur(24px)',
            boxShadow: isDark
              ? '8px 0 32px rgba(0, 0, 0, 0.3)'
              : '8px 0 32px rgba(99, 102, 241, 0.08)',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            margin: '2px 8px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&.Mui-selected': {
              background: `linear-gradient(135deg, ${alpha('#6366F1', 0.25)} 0%, ${alpha('#EC4899', 0.25)} 100%)`,
              border: `1px solid ${alpha('#6366F1', 0.4)}`,
              boxShadow: `0 4px 20px ${alpha('#6366F1', 0.2)}`,
              '&::before': {
                content: '""',
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                width: '4px',
                height: '60%',
                background: 'linear-gradient(180deg, #6366F1 0%, #EC4899 100%)',
                borderRadius: '0 2px 2px 0',
              },
            },
            '&:hover': {
              background: `linear-gradient(135deg, ${alpha('#6366F1', 0.15)} 0%, ${alpha('#EC4899', 0.15)} 100%)`,
              transform: 'translateX(4px)',
              boxShadow: `0 4px 16px ${alpha('#6366F1', 0.15)}`,
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              background: alpha('#6366F1', 0.1),
              transform: 'scale(1.1)',
              boxShadow: `0 4px 12px ${alpha('#6366F1', 0.2)}`,
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 16,
              background: alpha(isDark ? '#1e293b' : '#ffffff', 0.8),
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                boxShadow: `0 4px 20px ${alpha('#6366F1', 0.1)}`,
              },
              '&.Mui-focused': {
                boxShadow: `0 4px 20px ${alpha('#6366F1', 0.2)}`,
                transform: 'translateY(-2px)',
              },
            },
          },
        },
      },
    },
  });
};

// Default export retains dark theme for quick usage
export default createAppTheme('dark');

// Export keyframes for use in components
export { pulseGlow, shimmer, floatAnimation, gradientShift };
