import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Box, IconButton, Tooltip, useTheme } from '@mui/material';
import { DarkMode, LightMode, NotificationsNone, HelpOutline, TrackChanges } from '@mui/icons-material';
import PageTransition from './components/PageTransition';
import DashboardPersonalized from './pages/DashboardPersonalized';
import Candidates from './pages/Candidates';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import InterviewManagement from './pages/InterviewManagement';
import ConsolidatedAnalytics from './pages/ConsolidatedAnalytics';
import HiringAnalytics from './pages/HiringAnalytics';
import PersonalityEvaluation from './pages/PersonalityEvaluation';
import AICopilot from './pages/AICopilot';
import Settings from './pages/Settings';
import BiasDetection from './pages/BiasDetection';
import CalendarIntegration from './pages/CalendarIntegration';
import InterviewFeedback from './pages/InterviewFeedback';
import CandidateChat from './pages/CandidateChat';
import EmailNotifications from './pages/EmailNotifications';
import Navigation, { drawerWidth } from './components/Navigation';
import { ColorModeContext } from './theme';

function App() {
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);
  return (
  <>
      <div>
  <AppBar position="sticky">
        <Toolbar>
          <TrackChanges sx={{ mr: 1, fontSize: '2rem', color: 'primary.main' }} />
          <Typography variant="h6" component="div" sx={{ 
            flexGrow: 1, 
            fontWeight: 700,
            letterSpacing: '0.5px',
          }}>
            HireIQ Pro
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Tooltip title="Notifications">
              <IconButton 
                size="large" 
                sx={{
                  color: theme.palette.mode === 'dark' ? 'white' : 'text.primary',
                  transition: 'transform 0.2s ease',
                  '&:hover': { transform: 'translateY(-2px) rotate(-2deg)' }
                }}
              >
                <NotificationsNone />
              </IconButton>
            </Tooltip>
            <Tooltip title="Help & Shortcuts">
              <IconButton 
                size="large" 
                sx={{
                  color: theme.palette.mode === 'dark' ? 'white' : 'text.primary',
                  transition: 'transform 0.2s ease',
                  '&:hover': { transform: 'translateY(-2px) rotate(2deg)' }
                }}
              >
                <HelpOutline />
              </IconButton>
            </Tooltip>
            <Tooltip title={theme.palette.mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
              <IconButton 
                onClick={colorMode.toggleColorMode} 
                size="large" 
                aria-label="toggle theme" 
                sx={{
                  color: theme.palette.mode === 'dark' ? 'white' : 'text.primary',
                  transition: 'transform 0.2s ease',
                  '&:hover': { transform: 'translateY(-2px) scale(1.05)' }
                }}
              >
                {theme.palette.mode === 'dark' ? <LightMode /> : <DarkMode />}
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Navigation />
      
      <Box sx={{ 
        marginLeft: { xs: 0, md: `${drawerWidth}px` },
        minHeight: 'calc(100vh - 64px)',
        transition: 'margin-left 0.3s ease',
      }}> 
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <PageTransition animation="fadeUp">
            <Routes>
              <Route path="/" element={<DashboardPersonalized />} />
              <Route path="/candidates" element={<Candidates />} />
              <Route path="/candidate-chat" element={<CandidateChat />} />
              <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
              <Route path="/interviews" element={<InterviewManagement />} />
              <Route path="/calendar" element={<CalendarIntegration />} />
              <Route path="/interview-feedback" element={<InterviewFeedback />} />
              <Route path="/analytics" element={<ConsolidatedAnalytics />} />
              <Route path="/hiring-analytics" element={<HiringAnalytics />} />
              <Route path="/advanced-analytics" element={<ConsolidatedAnalytics />} />
              <Route path="/reports" element={<ConsolidatedAnalytics />} />
              <Route path="/ai-copilot" element={<AICopilot />} />
              <Route path="/personality" element={<PersonalityEvaluation />} />
              <Route path="/bias-detection" element={<BiasDetection />} />
              <Route path="/email-notifications" element={<EmailNotifications />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/notifications" element={<Settings />} />
            </Routes>
          </PageTransition>
        </Container>
      </Box>
    </div>
    </>
  );
}

export default App;
