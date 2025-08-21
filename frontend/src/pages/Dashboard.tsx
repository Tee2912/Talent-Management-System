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
} from '@mui/material';
import { People, Work, TrendingUp, Security } from '@mui/icons-material';

interface DashboardStats {
  totalCandidates: number;
  totalHired: number;
  overallHiringRate: number;
  overallBiasScore: number;
  positionBreakdown: Record<string, any>;
  recentFlags: number[];
}

function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/v1/bias/dashboard');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading dashboard...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 4 }}>
        {error}
      </Alert>
    );
  }

  const getBiasScoreColor = (score: number) => {
    if (score <= 0.3) return 'success';
    if (score <= 0.6) return 'warning';
    return 'error';
  };

  const getBiasScoreText = (score: number) => {
    if (score <= 0.3) return 'Low Bias';
    if (score <= 0.6) return 'Moderate Bias';
    return 'High Bias';
  };

  return (
    <Box sx={{ ml: '240px', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Key Metrics */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <People sx={{ mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h4">{stats?.totalCandidates || 0}</Typography>
                  <Typography color="textSecondary">Total Candidates</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Work sx={{ mr: 2, color: 'success.main' }} />
                <Box>
                  <Typography variant="h4">{stats?.totalHired || 0}</Typography>
                  <Typography color="textSecondary">Hired</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp sx={{ mr: 2, color: 'info.main' }} />
                <Box>
                  <Typography variant="h4">
                    {stats?.overallHiringRate?.toFixed(1) || 0}%
                  </Typography>
                  <Typography color="textSecondary">Hiring Rate</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Security 
                  sx={{ 
                    mr: 2, 
                    color: `${getBiasScoreColor(stats?.overallBiasScore || 0)}.main` 
                  }} 
                />
                <Box>
                  <Typography variant="h6">
                    {getBiasScoreText(stats?.overallBiasScore || 0)}
                  </Typography>
                  <Typography color="textSecondary">
                    Bias Score: {(stats?.overallBiasScore || 0).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Bias Alert */}
        {stats && stats.overallBiasScore > 0.6 && (
          <Grid item xs={12}>
            <Alert severity="warning">
              High bias detected in hiring decisions. 
              {stats.recentFlags.length > 0 && 
                ` ${stats.recentFlags.length} candidates flagged for review.`
              }
            </Alert>
          </Grid>
        )}

        {/* Position Breakdown */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Hiring by Position
            </Typography>
            {stats?.positionBreakdown && Object.keys(stats.positionBreakdown).length > 0 ? (
              Object.entries(stats.positionBreakdown).map(([position, data]: [string, any]) => (
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
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              ))
            ) : (
              <Typography color="textSecondary">No position data available</Typography>
            )}
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            {stats?.recentFlags && stats.recentFlags.length > 0 ? (
              <Box>
                <Typography variant="body2" color="warning.main" gutterBottom>
                  {stats.recentFlags.length} candidates flagged for bias review
                </Typography>
                {stats.recentFlags.slice(0, 5).map((candidateId) => (
                  <Typography key={candidateId} variant="body2" sx={{ ml: 2 }}>
                    • Candidate #{candidateId}
                  </Typography>
                ))}
              </Box>
            ) : (
              <Typography color="textSecondary">No recent flags</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
