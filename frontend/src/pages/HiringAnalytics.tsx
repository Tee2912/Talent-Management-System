import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  useTheme,
  alpha,
  styled,
  Button,
} from '@mui/material';
import {
  BarChart as TableauIcon,
  OpenInNew as OpenIcon,
} from '@mui/icons-material';

const StyledCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  borderRadius: '16px',
  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  },
}));

function HiringAnalytics() {
  const theme = useTheme();

  const openTableauDashboard = () => {
    window.open('https://public.tableau.com/views/HiringManagementDashboard/TalentDashboard?:language=en-US&:display_count=n&:origin=viz_share_link', '_blank');
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <TableauIcon sx={{ color: theme.palette.primary.main, fontSize: '2rem' }} />
          Hiring Analytics Dashboard
        </Typography>
        <Typography 
          variant="h6" 
          color="text.secondary"
          sx={{ mt: 1, mb: 3 }}
        >
          Interactive Tableau dashboard providing comprehensive insights into hiring metrics, trends, and performance analytics
        </Typography>
      </Box>

      {/* Dashboard Preview and Link */}
      <StyledCard>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Box
            sx={{
              width: '100%',
              height: '400px',
              borderRadius: '12px',
              overflow: 'hidden',
              mb: 3,
              position: 'relative',
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.secondary.light, 0.1)} 100%)`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
            }}
          >
            <img
              src="https://public.tableau.com/static/images/Hi/HiringManagementDashboard/TalentDashboard/1_rss.png"
              alt="Hiring Analytics Dashboard Preview"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
              onClick={openTableauDashboard}
            />
          </Box>
          
          <Typography variant="h6" gutterBottom color="primary">
            Interactive Tableau Dashboard
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Click the button below to open the full interactive Tableau dashboard in a new tab.
            This ensures optimal performance and full functionality of all dashboard features.
          </Typography>
          
          <Button
            variant="contained"
            size="large"
            startIcon={<OpenIcon />}
            onClick={openTableauDashboard}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: '12px',
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              '&:hover': {
                background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
              },
            }}
          >
            Open Tableau Dashboard
          </Button>
        </CardContent>
      </StyledCard>

    </Box>
  );
}

export default HiringAnalytics;
