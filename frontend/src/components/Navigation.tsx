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
  alpha,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  PeopleAlt as PeopleIcon,
  Assessment as AnalyticsIcon,
  Event as ScheduleIcon,
  AutoAwesome as AIIcon,
  Article as ResumeIcon,
  CalendarToday as CalendarIcon,
  RateReview as FeedbackIcon,
  PsychologyAlt as PsychologyIcon,
  VerifiedUser as BiasDetectionIcon,
  Forum as ChatIcon,
  MarkunreadMailbox as EmailIcon,
  Tune as SettingsIcon,
  TrackChanges,
} from '@mui/icons-material';

export const drawerWidth = 260;

interface NavigationSection {
  title: string;
  items: {
    text: string;
    icon: React.ReactElement;
    path: string;
  }[];
}

const navigationSections: NavigationSection[] = [
  {
    title: "Overview",
    items: [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    ]
  },
  {
    title: "Candidate Management",
    items: [
      { text: 'Candidates', icon: <PeopleIcon />, path: '/candidates' },
      { text: 'Resume Analyzer', icon: <ResumeIcon />, path: '/resume-analyzer' },
      { text: 'Candidate Chat', icon: <ChatIcon />, path: '/candidate-chat' },
    ]
  },
  {
    title: "Interview Management",
    items: [
      { text: 'Interviews', icon: <ScheduleIcon />, path: '/interviews' },
      { text: 'Calendar Integration', icon: <CalendarIcon />, path: '/calendar' },
      { text: 'Interview Feedback', icon: <FeedbackIcon />, path: '/interview-feedback' },
    ]
  },
  {
    title: "Analytics & Insights",
    items: [
      { text: 'Analytics Dashboard', icon: <AnalyticsIcon />, path: '/analytics' },
    ]
  },
  {
    title: "AI & Assessment",
    items: [
      { text: 'AI Assistant', icon: <AIIcon />, path: '/ai-copilot' },
      { text: 'Personality Evaluation', icon: <PsychologyIcon />, path: '/personality' },
      { text: 'Bias Detection', icon: <BiasDetectionIcon />, path: '/bias-detection' },
    ]
  },
  {
    title: "Communication & Settings",
    items: [
      { text: 'Email Notifications', icon: <EmailIcon />, path: '/email-notifications' },
      { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    ]
  }
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
          top: 0,
          height: '100%',
          zIndex: 1200,
          background: 'transparent',
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Box sx={{
        overflow: 'auto',
        height: '100%',
        pt: '64px',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: alpha(theme.palette.primary.main, 0.3),
          borderRadius: '3px',
        },
      }}>
        <Box sx={{
          padding: '24px',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <Avatar sx={{ 
            width: 48, 
            height: 48,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            boxShadow: `0 6px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.6)}`,
              transform: 'scale(1.08) rotate(10deg)',
            }
          }}>
            <TrackChanges sx={{ color: '#fff' }} />
          </Avatar>
          <Box>
            <Typography 
              variant="h6" 
              sx={{ 
                color: theme.palette.text.primary,
                fontSize: '1.1rem',
                fontWeight: 700,
                lineHeight: 1.2,
              }}
            >
              HireIQ Pro
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: theme.palette.text.secondary,
                fontSize: '0.8rem',
                fontWeight: 500,
              }}
            >
              AI Hiring Platform
            </Typography>
          </Box>
        </Box>
        
        <List sx={{ p: '8px' }}>
          {navigationSections.map((section, sectionIndex) => (
            <React.Fragment key={section.title}>
              <ListItem sx={{ pt: sectionIndex === 0 ? 0 : 2, pb: 1 }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: theme.palette.text.secondary,
                    fontWeight: 600,
                    letterSpacing: '0.8px',
                    paddingLeft: '16px',
                    textTransform: 'uppercase',
                  }}
                >
                  {section.title}
                </Typography>
              </ListItem>
              
              {section.items.map((item, itemIndex) => (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton
                    selected={location.pathname === item.path}
                    onClick={() => handleNavigation(item.path)}
                  >
                    <ListItemIcon 
                      sx={{ 
                        color: location.pathname === item.path 
                          ? theme.palette.primary.main 
                          : alpha(theme.palette.text.secondary, 0.7),
                        minWidth: 40,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: location.pathname === item.path ? 'scale(1.1)' : 'scale(1)',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text} 
                      sx={{
                        '& .MuiTypography-root': {
                          fontWeight: location.pathname === item.path ? 600 : 500,
                          color: location.pathname === item.path 
                            ? theme.palette.text.primary
                            : theme.palette.text.secondary,
                          fontSize: '0.9rem',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
              
              {sectionIndex < navigationSections.length - 1 && (
                <Divider sx={{ 
                  margin: '16px',
                  backgroundColor: alpha(theme.palette.divider, 0.08),
                }} />
              )}
            </React.Fragment>
          ))}
        </List>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Box sx={{ 
          p: '24px',
          textAlign: 'center',
          mt: 2,
        }}>
          <Typography 
            variant="caption" 
            sx={{ 
              color: theme.palette.text.secondary,
              fontSize: '0.75rem',
              fontWeight: 500,
            }}
          >
            &copy; {new Date().getFullYear()} HireIQ Pro
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
}

export default Navigation;
