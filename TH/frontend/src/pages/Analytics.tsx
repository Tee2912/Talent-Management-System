import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Alert,
  Chip,
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function Analytics() {
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [summary, setSummary] = useState<any>(null);
  const [positions, setPositions] = useState<any>(null);
  const [demographics, setDemographics] = useState<any>(null);
  const [timeline, setTimeline] = useState<any>(null);
  const [scores, setScores] = useState<any>(null);
  const [funnel, setFunnel] = useState<any>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const endpoints = [
        '/api/v1/analytics/summary',
        '/api/v1/analytics/positions',
        '/api/v1/analytics/demographics',
        '/api/v1/analytics/timeline',
        '/api/v1/analytics/scores',
        '/api/v1/analytics/conversion-funnel',
      ];

      const responses = await Promise.all(
        endpoints.map(endpoint => fetch(endpoint))
      );

      const data = await Promise.all(
        responses.map(response => response.json())
      );

      setSummary(data[0]);
      setPositions(data[1]);
      setDemographics(data[2]);
      setTimeline(data[3]);
      setScores(data[4]);
      setFunnel(data[5]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch analytics data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ ml: '240px', p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading analytics...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ ml: '240px', p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Chart configurations
  const positionChartData = positions ? {
    labels: Object.keys(positions),
    datasets: [
      {
        label: 'Total Candidates',
        data: Object.values(positions).map((pos: any) => pos.total_candidates),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Hired',
        data: Object.values(positions).map((pos: any) => pos.hired),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  } : null;

  const genderPieData = demographics?.gender ? {
    labels: Object.keys(demographics.gender),
    datasets: [
      {
        data: Object.values(demographics.gender).map((gender: any) => gender.total),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ],
      },
    ],
  } : null;

  const timelineChartData = timeline ? {
    labels: timeline.map((item: any) => item.month),
    datasets: [
      {
        label: 'Applications',
        data: timeline.map((item: any) => item.applications),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
      },
      {
        label: 'Hired',
        data: timeline.map((item: any) => item.hired),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.1,
      },
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  return (
    <Box sx={{ ml: '240px', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Analytics Dashboard
      </Typography>

      {/* Summary Cards */}
      {summary && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Candidates
                </Typography>
                <Typography variant="h4">
                  {summary.total_candidates}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Hired
                </Typography>
                <Typography variant="h4">
                  {summary.total_hired}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Hiring Rate
                </Typography>
                <Typography variant="h4">
                  {summary.hiring_rate?.toFixed(1)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Avg Final Score
                </Typography>
                <Typography variant="h4">
                  {summary.average_scores?.final_score?.toFixed(1) || 'N/A'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Position Analysis" />
          <Tab label="Demographics" />
          <Tab label="Timeline" />
          <Tab label="Score Analysis" />
          <Tab label="Conversion Funnel" />
        </Tabs>
      </Paper>

      {/* Position Analysis Tab */}
      <TabPanel value={currentTab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Candidates by Position
              </Typography>
              {positionChartData && (
                <Bar data={positionChartData} options={chartOptions} />
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Position Details
              </Typography>
              {positions && (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Position</TableCell>
                        <TableCell align="right">Rate</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(positions).map(([position, data]: [string, any]) => (
                        <TableRow key={position}>
                          <TableCell component="th" scope="row">
                            {position}
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              label={`${data.hiring_rate?.toFixed(1)}%`}
                              color={data.hiring_rate > 50 ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Demographics Tab */}
      <TabPanel value={currentTab} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Gender Distribution
              </Typography>
              {genderPieData && (
                <Pie data={genderPieData} options={chartOptions} />
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Hiring Rates by Demographics
              </Typography>
              {demographics && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Gender
                  </Typography>
                  {Object.entries(demographics.gender || {}).map(([gender, data]: [string, any]) => (
                    <Box key={gender} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">{gender}</Typography>
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
                  ))}
                  
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>
                    Ethnicity
                  </Typography>
                  {Object.entries(demographics.ethnicity || {}).map(([ethnicity, data]: [string, any]) => (
                    <Box key={ethnicity} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">{ethnicity}</Typography>
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
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Timeline Tab */}
      <TabPanel value={currentTab} index={2}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Hiring Timeline
          </Typography>
          {timelineChartData && (
            <Line data={timelineChartData} options={chartOptions} />
          )}
        </Paper>
      </TabPanel>

      {/* Score Analysis Tab */}
      <TabPanel value={currentTab} index={3}>
        <Grid container spacing={3}>
          {scores && Object.entries(scores).map(([scoreType, data]: [string, any]) => (
            <Grid item xs={12} md={6} key={scoreType}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {scoreType.replace('_', ' ').toUpperCase()}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Average: {data.average} | Range: {data.min} - {data.max}
                </Typography>
                {data.distribution && (
                  <Box>
                    {Object.entries(data.distribution).map(([range, count]: [string, any]) => (
                      <Box key={range} sx={{ mb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">{range}</Typography>
                          <Typography variant="body2">{count} candidates</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(count / data.count) * 100}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Conversion Funnel Tab */}
      <TabPanel value={currentTab} index={4}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Hiring Conversion Funnel
          </Typography>
          {funnel && (
            <Grid container spacing={2}>
              {Object.entries(funnel.funnel_stages || {}).map(([stage, count]: [string, any]) => (
                <Grid item xs={12} sm={6} md={4} key={stage}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        {stage.replace('_', ' ').toUpperCase()}
                      </Typography>
                      <Typography variant="h5">
                        {count}
                      </Typography>
                      {funnel.conversion_rates && funnel.conversion_rates[`${stage}_rate`] && (
                        <Typography variant="body2" color="textSecondary">
                          {funnel.conversion_rates[`${stage}_rate`].toFixed(1)}% conversion
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </TabPanel>
    </Box>
  );
}

export default Analytics;
