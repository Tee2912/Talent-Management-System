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
} from '@mui/material';
import {
  BarChart as TableauIcon,
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

function HiringAnalyticsIframe() {
  const theme = useTheme();

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

      {/* Tableau Dashboard */}
      <StyledCard>
        <CardContent sx={{ p: 1 }}>
          <Box
            sx={{
              width: '100%',
              height: '800px',
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          >
            <iframe
              src="https://public.tableau.com/views/HiringManagementDashboard/TalentDashboard?:language=en-US&:embed=yes&:embed_code_version=3&:loadOrderID=0&:display_count=yes&:origin=viz_share_link"
              width="100%"
              height="100%"
              style={{
                border: 'none',
                borderRadius: '12px',
              }}
              title="Hiring Analytics Dashboard"
              allowFullScreen
            />
          </Box>
        </CardContent>
      </StyledCard>

      {/* Additional Information */}
      <Box sx={{ mt: 3 }}>
        <Paper
          sx={{
            p: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.info.light, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
            borderRadius: '12px',
          }}
        >
          <Typography variant="h6" gutterBottom color="info.main">
            Dashboard Features
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This interactive Tableau dashboard provides real-time insights into your hiring process including:
            candidate pipeline analytics, interview success rates, time-to-hire metrics, diversity statistics,
            cost-per-hire analysis, and performance predictions to help optimize your recruitment strategy.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}

export default HiringAnalyticsIframe;
