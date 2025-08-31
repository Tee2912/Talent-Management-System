import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, AppBar, Toolbar, Typography, Container, Box } from '@mui/material';
import theme from './theme';
import Dashboard from './pages/Dashboard';
import Candidates from './pages/Candidates';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import InterviewManagement from './pages/InterviewManagement';
import Analytics from './pages/Analytics';
import PersonalityEvaluation from './pages/PersonalityEvaluation';
import CandidateChat from './pages/CandidateChat';
import BiasDetection from './pages/BiasDetection';
import EmailNotifications from './pages/EmailNotifications';
import InterviewFeedback from './pages/InterviewFeedback';
import CalendarIntegration from './pages/CalendarIntegration';
import Navigation, { drawerWidth } from './components/Navigation';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div>
      <AppBar position="sticky" sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
      }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ 
            flexGrow: 1, 
            fontWeight: 700,
            letterSpacing: '0.5px',
          }}>
            🎯 HireIQ Pro - AI-Powered Hiring Platform
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Navigation />
      
      <Box sx={{ 
        marginLeft: { xs: 0, md: `${drawerWidth}px` }, // Responsive: no margin on mobile, sidebar margin on desktop
        minHeight: 'calc(100vh - 64px)', // Full height minus AppBar
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', // Enhanced gradient background
        transition: 'margin-left 0.3s ease', // Smooth transition
      }}> 
        <Container maxWidth="xl" sx={{ py: 3 }}> {/* Add vertical padding */}
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/candidates" element={<Candidates />} />
            <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
            <Route path="/interviews" element={<InterviewManagement />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/reports" element={<Analytics />} />
            <Route path="/personality" element={<PersonalityEvaluation />} />
            <Route path="/chat" element={<CandidateChat />} />
            <Route path="/bias-detection" element={<BiasDetection />} />
            <Route path="/notifications" element={<EmailNotifications />} />
            <Route path="/feedback" element={<InterviewFeedback />} />
            <Route path="/calendar" element={<CalendarIntegration />} />
          </Routes>
        </Container>
      </Box>
    </div>
    </ThemeProvider>
  );
}

export default App;
