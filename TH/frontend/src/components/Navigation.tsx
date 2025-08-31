import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  useTheme,
  Avatar,
  Divider,
  Typography,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Analytics as AnalyticsIcon,
  Security as SecurityIcon,
  Psychology as PsychologyIcon,
  Chat as ChatIcon,
  Schedule as ScheduleIcon,
  Email as EmailIcon,
  Feedback as FeedbackIcon,
  Event as CalendarIcon,
  Description as ResumeIcon,
} from '@mui/icons-material';

export const drawerWidth = 240;

const navigationItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Candidates', icon: <PeopleIcon />, path: '/candidates' },
  { text: 'Resume Analyzer', icon: <ResumeIcon />, path: '/resume-analyzer' },
  { text: 'Interview Management', icon: <ScheduleIcon />, path: '/interviews' },
  { text: 'Analytics & Reports', icon: <AnalyticsIcon />, path: '/analytics' },
  { text: 'Personality Evaluation', icon: <PsychologyIcon />, path: '/personality' },
  { text: 'AI Chat Assistant', icon: <ChatIcon />, path: '/chat' },
  { text: 'Bias Detection', icon: <SecurityIcon />, path: '/bias-detection' },
  { text: 'Email Notifications', icon: <EmailIcon />, path: '/notifications' },
  { text: 'Interview Feedback', icon: <FeedbackIcon />, path: '/feedback' },
  { text: 'Calendar Integration', icon: <CalendarIcon />, path: '/calendar' },
];

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        display: { xs: 'none', md: 'block' },
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          top: '64px',
          height: 'calc(100vh - 64px)',
          zIndex: 1200,
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(0, 0, 0, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Box sx={{ overflow: 'auto', height: '100%' }}>
        <Box sx={{
          padding: '20px',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Avatar sx={{ 
            width: 40, 
            height: 40,
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 6px 30px rgba(99, 102, 241, 0.6)',
              transform: 'scale(1.05)',
            }
          }}>
            IQ
          </Avatar>
          <Box>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#1a1a1a',
                fontSize: '1rem',
                fontWeight: 600
              }}
            >
              HireIQ Pro
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#666666',
                fontSize: '0.75rem'
              }}
            >
              HireIQ Platform
            </Typography>
          </Box>
        </Box>
        
        <List>
          {navigationItems.map((item, index) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  margin: '4px 12px',
                  borderRadius: '12px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  animationDelay: `${index * 0.1}s`,
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
                    transform: 'translateX(8px)',
                    boxShadow: '0 4px 20px rgba(99, 102, 241, 0.2)',
                  },
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(168, 85, 247, 0.25) 100%)',
                    }
                  }
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: location.pathname === item.path 
                      ? theme.palette.primary.main 
                      : '#555555',
                    minWidth: 40,
                    transition: 'all 0.3s ease'
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{
                    '& .MuiTypography-root': {
                      fontWeight: location.pathname === item.path ? 600 : 400,
                      color: location.pathname === item.path 
                        ? '#1a1a1a'
                        : '#444444',
                      fontSize: '0.9rem',
                      transition: 'all 0.3s ease'
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Divider sx={{ 
          margin: '16px 12px',
          backgroundColor: 'rgba(0, 0, 0, 0.15)'
        }} />
        
        <Box sx={{ 
          padding: '16px 20px',
          textAlign: 'center'
        }}>
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#666666',
              fontSize: '0.7rem'
            }}
          >
            HireIQ Pro © 2024
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
}

export default Navigation;
