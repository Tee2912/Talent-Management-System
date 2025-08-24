import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import { 
  People, 
  Work, 
  TrendingUp, 
  Refresh,
  Warning,
  CheckCircle,
  Error,
  Info,
} from '@mui/icons-material';

interface DashboardStats {
  total_candidates: number;
  total_hired: number;
  overall_hiring_rate: number;
  overall_bias_score: number;
  position_breakdown: Record<string, any>;
  demographic_summary: Record<string, any>;
  recent_flags: number[];
}

interface QuickStats {
  total_candidates: number;
  total_hired: number;
  hiring_rate: number;
  average_scores: Record<string, number>;
}

function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [quickStats, setQuickStats] = useState<QuickStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch both bias dashboard and analytics summary
      const [biasResponse, analyticsResponse] = await Promise.all([
        fetch('/api/v1/bias/dashboard'),
        fetch('/api/v1/analytics/summary'),
      ]);

      if (!biasResponse.ok || !analyticsResponse.ok) {
        throw new window.Error('Failed to fetch dashboard data');
      }

      const biasData = await biasResponse.json();
      const analyticsData = await analyticsResponse.json();
      
      setStats(biasData);
      setQuickStats(analyticsData);
      setLastUpdated(new Date());
    } catch (error) {
      const errorMessage = (error as Error)?.message || 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  if (loading) {
    return (
      <Box sx={{ ml: '240px', p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading dashboard...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ ml: '240px', p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={handleRefresh} startIcon={<Refresh />}>
          Retry
        </Button>
      </Box>
    );
  }

  const getBiasScoreColor = (score: number) => {
    if (score <= 0.3) return 'success';
    if (score <= 0.6) return 'warning';
    return 'error';
  };

  const getBiasScoreText = (score: number) => {
    if (score <= 0.3) return 'Low Risk';
    if (score <= 0.6) return 'Medium Risk';
    return 'High Risk';
  };

  const getBiasIcon = (score: number) => {
    if (score <= 0.3) return <CheckCircle />;
    if (score <= 0.6) return <Warning />;
    return <Error />;
  };

  return (
    <Box sx={{ ml: '240px', p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Dashboard
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {lastUpdated && (
            <Typography variant="body2" color="textSecondary">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Typography>
          )}
          <Button
            variant="outlined"
            size="small"
            onClick={handleRefresh}
            startIcon={<Refresh />}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Key Metrics Row */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <People sx={{ mr: 2, color: 'primary.main', fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{stats?.total_candidates || 0}</Typography>
                  <Typography color="textSecondary">Total Candidates</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Work sx={{ mr: 2, color: 'success.main', fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{quickStats?.total_hired || 0}</Typography>
                  <Typography color="textSecondary">Hired</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp sx={{ mr: 2, color: 'info.main', fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">
                    {quickStats?.hiring_rate?.toFixed(1) || 0}%
                  </Typography>
                  <Typography color="textSecondary">Hiring Rate</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {getBiasIcon(stats?.overall_bias_score || 0)}
                <Box sx={{ ml: 2 }}>
                  <Chip
                    label={getBiasScoreText(stats?.overall_bias_score || 0)}
                    color={getBiasScoreColor(stats?.overall_bias_score || 0)}
                    sx={{ mb: 1 }}
                  />
                  <Typography color="textSecondary" variant="body2">
                    Bias Score: {(stats?.overall_bias_score || 0).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Bias Alert */}
        {stats && stats.overall_bias_score > 0.6 && (
          <Grid item xs={12}>
            <Alert severity="warning" icon={<Warning />}>
              <Typography variant="subtitle1" gutterBottom>
                High Bias Risk Detected
              </Typography>
              <Typography variant="body2">
                The hiring process shows signs of potential bias. 
                {stats.recent_flags.length > 0 && 
                  ` ${stats.recent_flags.length} candidates have been flagged for review.`
                }
                Consider reviewing recent hiring decisions and implementing additional fairness measures.
              </Typography>
            </Alert>
          </Grid>
        )}

        {/* Score Overview */}
        {quickStats?.average_scores && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Average Scores
              </Typography>
              {Object.entries(quickStats.average_scores).map(([scoreType, average]) => (
                <Box key={scoreType} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                      {scoreType.replace('_', ' ')}
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {average.toFixed(1)}/100
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={average}
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: average >= 70 ? 'success.main' : average >= 50 ? 'warning.main' : 'error.main'
                      }
                    }}
                  />
                </Box>
              ))}
            </Paper>
          </Grid>
        )}

        {/* Position Breakdown */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Hiring by Position
            </Typography>
            {stats?.position_breakdown && Object.keys(stats.position_breakdown).length > 0 ? (
              Object.entries(stats.position_breakdown).map(([position, data]: [string, any]) => (
                <Box key={position} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{position}</Typography>
                    <Typography variant="body2">
                      {data.hired}/{data.total} ({data.hiring_rate?.toFixed(1)}%)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={data.hiring_rate || 0}
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: data.hiring_rate >= 50 ? 'success.main' : 'warning.main'
                      }
                    }}
                  />
                </Box>
              ))
            ) : (
              <Typography color="textSecondary">No position data available</Typography>
            )}
          </Paper>
        </Grid>

        {/* Demographics Summary */}
        {stats?.demographic_summary && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Demographic Summary
              </Typography>
              
              {stats.demographic_summary.gender && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Gender Distribution
                  </Typography>
                  {Object.entries(stats.demographic_summary.gender).map(([gender, data]: [string, any]) => (
                    <Box key={gender} sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">{gender}</Typography>
                        <Typography variant="body2">
                          {data.hired}/{data.total} ({data.hiring_rate?.toFixed(1)}%)
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}

              {stats.demographic_summary.ethnicity && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Ethnicity Distribution
                  </Typography>
                  {Object.entries(stats.demographic_summary.ethnicity).slice(0, 3).map(([ethnicity, data]: [string, any]) => (
                    <Box key={ethnicity} sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">{ethnicity}</Typography>
                        <Typography variant="body2">
                          {data.hired}/{data.total} ({data.hiring_rate?.toFixed(1)}%)
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>
        )}

        {/* Recent Activity & Alerts */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity & Alerts
            </Typography>
            
            <List>
              {stats?.recent_flags && stats.recent_flags.length > 0 ? (
                <>
                  <ListItem>
                    <ListItemIcon>
                      <Warning color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${stats.recent_flags.length} candidates flagged`}
                      secondary="Requires bias review"
                    />
                  </ListItem>
                  <Divider />
                  {stats.recent_flags.slice(0, 3).map((candidateId) => (
                    <ListItem key={candidateId}>
                      <ListItemIcon>
                        <Info color="info" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`Candidate #${candidateId}`}
                        secondary="Flagged for review"
                      />
                    </ListItem>
                  ))}
                </>
              ) : (
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="No recent flags"
                    secondary="All hiring decisions look fair"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
