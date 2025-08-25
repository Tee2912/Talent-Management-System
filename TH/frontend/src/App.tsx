import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Box } from '@mui/material';
import Dashboard from './pages/Dashboard';
import Candidates from './pages/Candidates';
import InterviewManagement from './pages/InterviewManagement';
import Analytics from './pages/Analytics';
import PersonalityEvaluation from './pages/PersonalityEvaluation';
import CandidateChat from './pages/CandidateChat';
import BiasDetection from './pages/BiasDetection';
import EmailNotifications from './pages/EmailNotifications';
import EnhancedReports from './pages/EnhancedReports';
import InterviewFeedback from './pages/InterviewFeedback';
import CalendarIntegration from './pages/CalendarIntegration';
import Navigation, { drawerWidth } from './components/Navigation';

function App() {
  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Fair Hiring System
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Navigation />
      
      <Box sx={{ 
        marginLeft: { xs: 0, md: `${drawerWidth}px` }, // Responsive: no margin on mobile, sidebar margin on desktop
        minHeight: 'calc(100vh - 64px)', // Full height minus AppBar
        backgroundColor: '#fafafa', // Light background for main content
        transition: 'margin-left 0.3s ease', // Smooth transition
      }}> 
        <Container maxWidth="xl" sx={{ py: 3 }}> {/* Add vertical padding */}
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/candidates" element={<Candidates />} />
            <Route path="/interviews" element={<InterviewManagement />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/personality" element={<PersonalityEvaluation />} />
            <Route path="/chat" element={<CandidateChat />} />
            <Route path="/bias-detection" element={<BiasDetection />} />
            <Route path="/notifications" element={<EmailNotifications />} />
            <Route path="/reports" element={<EnhancedReports />} />
            <Route path="/feedback" element={<InterviewFeedback />} />
            <Route path="/calendar" element={<CalendarIntegration />} />
          </Routes>
        </Container>
      </Box>
    </div>
  );
}

export default App;
