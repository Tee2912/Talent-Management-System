import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Box } from '@mui/material';
import Dashboard from './pages/Dashboard';
import Candidates from './pages/Candidates';
import Analytics from './pages/Analytics';
import BiasDetection from './pages/BiasDetection';
import Navigation from './components/Navigation';

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
      
      <Container maxWidth="xl">
        <Box sx={{ mt: 3, mb: 3 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/candidates" element={<Candidates />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/bias-detection" element={<BiasDetection />} />
          </Routes>
        </Box>
      </Container>
    </div>
  );
}

export default App;
