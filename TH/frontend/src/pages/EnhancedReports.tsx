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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  Assessment as ReportsIcon,
  TrendingUp as TrendingUpIcon,
  Download as DownloadIcon,
  Schedule as ScheduleIcon,
  Create as CreateIcon,
  Visibility as ViewIcon,
  BarChart as BarChartIcon,
  AttachMoney as MoneyIcon,
  Group as GroupIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement
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
      id={`reports-tabpanel-${index}`}
      aria-labelledby={`reports-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function EnhancedReports() {
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [executiveSummary, setExecutiveSummary] = useState<any>(null);
  const [detailedMetrics, setDetailedMetrics] = useState<any>(null);
  const [performanceTrends, setPerformanceTrends] = useState<any>(null);
  const [benchmarks, setBenchmarks] = useState<any>(null);
  const [customReports, setCustomReports] = useState<any>(null);
  const [kpiDashboard, setKpiDashboard] = useState<any>(null);
  const [realTimeDashboard, setRealTimeDashboard] = useState<any>(null);
  
  // Dialog states
  const [createReportDialogOpen, setCreateReportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  
  // Form states
  const [reportForm, setReportForm] = useState({
    name: '',
    description: '',
    frequency: 'weekly',
    metrics: [],
    recipients: ''
  });
  const [exportForm, setExportForm] = useState({
    format: 'pdf',
    report_type: 'executive_summary',
    date_range: '1month'
  });

  useEffect(() => {
    fetchData();
    
    // Set up real-time data refresh
    const interval = setInterval(fetchRealTimeData, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to fetch from backend first, fall back to mock data if backend is not available
      try {
        const [
          summaryRes,
          metricsRes,
          trendsRes,
          benchmarksRes,
          reportsRes,
          kpiRes
        ] = await Promise.all([
          fetch('/api/v1/reports/executive-summary'),
          fetch('/api/v1/reports/detailed-metrics'),
          fetch('/api/v1/reports/performance-trends'),
          fetch('/api/v1/reports/benchmarks'),
          fetch('/api/v1/reports/custom-reports'),
          fetch('/api/v1/reports/kpi-dashboard')
        ]);

        if (summaryRes.ok && metricsRes.ok && trendsRes.ok && benchmarksRes.ok && reportsRes.ok && kpiRes.ok) {
          const [
            summaryData,
            metricsData,
            trendsData,
            benchmarksData,
            reportsData,
            kpiData
          ] = await Promise.all([
            summaryRes.json(),
            metricsRes.json(),
            trendsRes.json(),
            benchmarksRes.json(),
            reportsRes.json(),
            kpiRes.json()
          ]);

          setExecutiveSummary(summaryData.summary);
          setDetailedMetrics(metricsData.metrics);
          setPerformanceTrends(trendsData.trends);
          setBenchmarks(benchmarksData.benchmarks);
          setCustomReports(reportsData.reports);
          setKpiDashboard(kpiData.dashboard);
        } else {
          throw new Error('Backend not available');
        }
      } catch (backendError) {
        // Use mock data when backend is not available
        console.log('Backend not available, using mock data for reports');
        
        const mockExecutiveSummary = {
          total_candidates: 234,
          total_interviews: 156,
          total_hires: 23,
          current_month_applications: 45,
          conversion_rate: 9.8,
          average_time_to_hire: 18.5,
          diversity_metrics: {
            gender_distribution: { male: 52, female: 48 },
            ethnicity_distribution: { caucasian: 45, asian: 25, hispanic: 15, african_american: 10, other: 5 }
          },
          top_performing_positions: [
            { position: "Software Engineer", applications: 89, conversion_rate: 12.4 },
            { position: "Product Manager", applications: 67, conversion_rate: 8.9 },
            { position: "Data Scientist", applications: 45, conversion_rate: 11.1 }
          ],
          recent_trends: {
            application_trend: "up",
            conversion_trend: "stable",
            time_to_hire_trend: "down"
          }
        };

        const mockDetailedMetrics = {
          recruitment_funnel: {
            applications: 234,
            screening: 145,
            interviews: 89,
            offers: 34,
            hires: 23
          },
          source_effectiveness: [
            { source: "LinkedIn", applications: 89, conversion_rate: 11.2 },
            { source: "Indeed", applications: 67, conversion_rate: 8.9 },
            { source: "Company Website", applications: 45, conversion_rate: 15.6 },
            { source: "Referrals", applications: 33, conversion_rate: 21.2 }
          ],
          interviewer_performance: [
            { name: "Sarah Wilson", interviews_conducted: 23, avg_rating: 4.2, completion_rate: 95.7 },
            { name: "Mike Chen", interviews_conducted: 19, avg_rating: 4.5, completion_rate: 100 },
            { name: "Lisa Johnson", interviews_conducted: 17, avg_rating: 4.1, completion_rate: 94.1 }
          ]
        };

        const mockPerformanceTrends = {
          monthly_data: [
            { month: "Jan", applications: 89, interviews: 45, hires: 12 },
            { month: "Feb", applications: 76, interviews: 38, hires: 9 },
            { month: "Mar", applications: 92, interviews: 52, hires: 15 },
            { month: "Apr", applications: 108, interviews: 61, hires: 18 },
            { month: "May", applications: 95, interviews: 58, hires: 16 }
          ],
          quality_metrics: {
            candidate_satisfaction: [4.2, 4.3, 4.1, 4.4, 4.5],
            interview_feedback_scores: [4.1, 4.2, 4.0, 4.3, 4.4],
            time_to_fill_positions: [22, 20, 18, 19, 17]
          }
        };

        const mockBenchmarks = {
          industry_comparison: {
            time_to_hire: { company: 18.5, industry_avg: 23.2, percentile: 75 },
            conversion_rate: { company: 9.8, industry_avg: 7.5, percentile: 68 },
            candidate_satisfaction: { company: 4.3, industry_avg: 3.9, percentile: 82 }
          },
          internal_benchmarks: {
            departments: [
              { department: "Engineering", time_to_hire: 16.2, conversion_rate: 11.5 },
              { department: "Marketing", time_to_hire: 19.8, conversion_rate: 8.9 },
              { department: "Sales", time_to_hire: 21.5, conversion_rate: 7.2 }
            ]
          }
        };

        const mockCustomReports = [
          {
            id: 1,
            name: "Weekly Hiring Report",
            description: "Weekly summary of hiring activities",
            created_by: "HR Manager",
            created_at: "2024-01-15T10:00:00",
            last_run: "2024-01-22T09:00:00",
            frequency: "weekly",
            metrics: ["applications", "interviews", "hires"]
          },
          {
            id: 2,
            name: "Diversity Analytics",
            description: "Detailed diversity and inclusion metrics",
            created_by: "D&I Specialist",
            created_at: "2024-01-10T14:30:00",
            last_run: "2024-01-21T16:00:00",
            frequency: "monthly",
            metrics: ["diversity", "inclusion", "bias_detection"]
          }
        ];

        const mockKpiDashboard = {
          primary_kpis: [
            { name: "Time to Hire", value: 18.5, target: 20, trend: "down", unit: "days" },
            { name: "Conversion Rate", value: 9.8, target: 10, trend: "up", unit: "%" },
            { name: "Quality of Hire", value: 4.3, target: 4.0, trend: "up", unit: "/5" },
            { name: "Cost per Hire", value: 3200, target: 3500, trend: "down", unit: "$" }
          ],
          secondary_kpis: [
            { name: "Candidate Satisfaction", value: 4.2, trend: "stable" },
            { name: "Interview Show Rate", value: 87, trend: "up" },
            { name: "Offer Acceptance", value: 78, trend: "stable" }
          ]
        };

        setExecutiveSummary(mockExecutiveSummary);
        setDetailedMetrics(mockDetailedMetrics);
        setPerformanceTrends(mockPerformanceTrends);
        setBenchmarks(mockBenchmarks);
        setCustomReports(mockCustomReports);
        setKpiDashboard(mockKpiDashboard);
      }
      
      await fetchRealTimeData();
    } catch (error) {
      setError('Failed to fetch reports data');
    } finally {
      setLoading(false);
    }
  };

  const fetchRealTimeData = async () => {
    try {
      const response = await fetch('/api/v1/reports/real-time-dashboard');
      const data = await response.json();
      setRealTimeDashboard(data.dashboard);
    } catch (error) {
      console.error('Failed to fetch real-time data:', error);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleCreateReport = async () => {
    try {
      const response = await fetch('/api/v1/reports/custom-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...reportForm,
          recipients: reportForm.recipients.split(',').map((email: string) => email.trim())
        })
      });

      if (response.ok) {
        setCreateReportDialogOpen(false);
        setReportForm({ name: '', description: '', frequency: 'weekly', metrics: [], recipients: '' });
        fetchData();
        alert('Custom report created successfully!');
      } else {
        alert('Failed to create report');
      }
    } catch (error) {
      alert('Error creating report');
    }
  };

  const handleExportReport = async () => {
    try {
      const response = await fetch('/api/v1/reports/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exportForm)
      });

      const data = await response.json();
      if (data.success) {
        setExportDialogOpen(false);
        alert(`Report export initiated. Download will be available at: ${data.export.download_url}`);
      } else {
        alert('Failed to export report');
      }
    } catch (error) {
      alert('Error exporting report');
    }
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: false }
    }
  };

  if (loading) {
    return (
      <Box sx={{ ml: '240px', p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading reports...</Typography>
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

  return (
    <Box sx={{ ml: '240px', p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <ReportsIcon /> Enhanced Reporting Dashboard
      </Typography>

      {/* Real-time Metrics Summary */}
      {realTimeDashboard && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary">
                  {realTimeDashboard.live_metrics?.active_interviews || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Active Interviews
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary">
                  {realTimeDashboard.live_metrics?.applications_today || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Applications Today
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary">
                  {realTimeDashboard.live_metrics?.interviews_scheduled_today || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Interviews Scheduled
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary">
                  {realTimeDashboard.live_metrics?.offers_pending || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Pending Offers
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Action Buttons */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<CreateIcon />}
          onClick={() => setCreateReportDialogOpen(true)}
        >
          Create Custom Report
        </Button>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={() => setExportDialogOpen(true)}
        >
          Export Report
        </Button>
        <Button
          variant="outlined"
          startIcon={<ScheduleIcon />}
        >
          Schedule Report
        </Button>
      </Box>

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
          <Tab label="Executive Summary" icon={<ReportsIcon />} />
          <Tab label="KPI Dashboard" icon={<SpeedIcon />} />
          <Tab label="Performance Trends" icon={<TrendingUpIcon />} />
          <Tab label="Benchmarks" icon={<BarChartIcon />} />
          <Tab label="Custom Reports" icon={<CreateIcon />} />
        </Tabs>
      </Paper>

      {/* Executive Summary Tab */}
      <TabPanel value={currentTab} index={0}>
        {executiveSummary && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <GroupIcon /> Hiring Metrics
                  </Typography>
                  <Typography variant="h4" color="primary" gutterBottom>
                    {executiveSummary.total_hires}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Total Hires
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    {executiveSummary.total_candidates}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Candidates
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SpeedIcon /> Efficiency
                  </Typography>
                  <Typography variant="h4" color="primary" gutterBottom>
                    {executiveSummary.average_time_to_hire}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Avg. Time to Hire (days)
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    {executiveSummary.interviewer_efficiency}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Interviewer Efficiency
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MoneyIcon /> Cost & Quality
                  </Typography>
                  <Typography variant="h4" color="primary" gutterBottom>
                    ${executiveSummary.cost_per_hire?.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Cost per Hire
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    {executiveSummary.quality_of_hire_score}/5
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Quality of Hire
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </TabPanel>

      {/* KPI Dashboard Tab */}
      <TabPanel value={currentTab} index={1}>
        {kpiDashboard && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Primary KPIs</Typography>
            </Grid>
            {kpiDashboard.primary_kpis?.map((kpi: any, index: number) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {kpi.name}
                    </Typography>
                    <Typography variant="h4" color="primary" gutterBottom>
                      {kpi.value} {kpi.unit}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Target: {kpi.target} {kpi.unit}
                    </Typography>
                    <Chip
                      label={kpi.status}
                      color={
                        kpi.status === 'exceeding' ? 'success' :
                        kpi.status === 'on_track' ? 'primary' : 'warning'
                      }
                      size="small"
                    />
                    <LinearProgress
                      variant="determinate"
                      value={(kpi.value / kpi.target) * 100}
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Performance Trends Tab */}
      <TabPanel value={currentTab} index={2}>
        {performanceTrends && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Monthly Hiring Trends
                </Typography>
                {performanceTrends.monthly_hiring && (
                  <Line
                    data={{
                      labels: performanceTrends.monthly_hiring.map((item: any) => item.month),
                      datasets: [
                        {
                          label: 'Hires',
                          data: performanceTrends.monthly_hiring.map((item: any) => item.hires),
                          borderColor: 'rgb(75, 192, 192)',
                          backgroundColor: 'rgba(75, 192, 192, 0.2)',
                          tension: 0.1
                        },
                        {
                          label: 'Applications',
                          data: performanceTrends.monthly_hiring.map((item: any) => item.applications),
                          borderColor: 'rgb(54, 162, 235)',
                          backgroundColor: 'rgba(54, 162, 235, 0.2)',
                          tension: 0.1,
                          yAxisID: 'y1'
                        }
                      ]
                    }}
                    options={{
                      ...chartOptions,
                      scales: {
                        y: { type: 'linear', display: true, position: 'left' },
                        y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false } }
                      }
                    }}
                  />
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Source Effectiveness
                </Typography>
                {performanceTrends.source_effectiveness && (
                  <Pie
                    data={{
                      labels: performanceTrends.source_effectiveness.map((item: any) => item.source),
                      datasets: [
                        {
                          data: performanceTrends.source_effectiveness.map((item: any) => item.hires),
                          backgroundColor: [
                            '#FF6384',
                            '#36A2EB',
                            '#FFCE56',
                            '#4BC0C0',
                            '#9966FF'
                          ]
                        }
                      ]
                    }}
                    options={chartOptions}
                  />
                )}
              </Paper>
            </Grid>
          </Grid>
        )}
      </TabPanel>

      {/* Benchmarks Tab */}
      <TabPanel value={currentTab} index={3}>
        {benchmarks && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Company vs Industry Benchmarks
                </Typography>
                {benchmarks.company_vs_industry && (
                  <Bar
                    data={{
                      labels: Object.keys(benchmarks.company_vs_industry),
                      datasets: [
                        {
                          label: 'Company',
                          data: Object.values(benchmarks.company_vs_industry).map((item: any) => item.company),
                          backgroundColor: 'rgba(75, 192, 192, 0.6)'
                        },
                        {
                          label: 'Industry Average',
                          data: Object.values(benchmarks.company_vs_industry).map((item: any) => item.industry),
                          backgroundColor: 'rgba(54, 162, 235, 0.6)'
                        }
                      ]
                    }}
                    options={chartOptions}
                  />
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Performance Summary
                </Typography>
                {benchmarks.company_vs_industry && Object.entries(benchmarks.company_vs_industry).map(([key, value]: [string, any]) => (
                  <Box key={key} sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      {key.replace(/_/g, ' ').toUpperCase()}
                    </Typography>
                    <Chip
                      label={value.performance}
                      color={value.performance.includes('better') ? 'success' : 'warning'}
                      size="small"
                    />
                  </Box>
                ))}
              </Paper>
            </Grid>
          </Grid>
        )}
      </TabPanel>

      {/* Custom Reports Tab */}
      <TabPanel value={currentTab} index={4}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Report Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Frequency</TableCell>
                <TableCell>Last Generated</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customReports?.map((report: any) => (
                <TableRow key={report.id}>
                  <TableCell>{report.name}</TableCell>
                  <TableCell>{report.description}</TableCell>
                  <TableCell>
                    <Chip label={report.frequency} size="small" />
                  </TableCell>
                  <TableCell>
                    {new Date(report.last_generated).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button size="small" startIcon={<ViewIcon />}>
                      View
                    </Button>
                    <Button size="small" startIcon={<DownloadIcon />}>
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Create Report Dialog */}
      <Dialog open={createReportDialogOpen} onClose={() => setCreateReportDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Custom Report</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Report Name"
              value={reportForm.name}
              onChange={(e) => setReportForm(prev => ({ ...prev, name: e.target.value }))}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={reportForm.description}
              onChange={(e) => setReportForm(prev => ({ ...prev, description: e.target.value }))}
            />
            <FormControl fullWidth>
              <InputLabel>Frequency</InputLabel>
              <Select
                value={reportForm.frequency}
                onChange={(e) => setReportForm(prev => ({ ...prev, frequency: e.target.value }))}
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="quarterly">Quarterly</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Recipients (comma-separated emails)"
              value={reportForm.recipients}
              onChange={(e) => setReportForm(prev => ({ ...prev, recipients: e.target.value }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateReportDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateReport} variant="contained">Create Report</Button>
        </DialogActions>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Export Report</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Format</InputLabel>
              <Select
                value={exportForm.format}
                onChange={(e) => setExportForm(prev => ({ ...prev, format: e.target.value }))}
              >
                <MenuItem value="pdf">PDF</MenuItem>
                <MenuItem value="excel">Excel</MenuItem>
                <MenuItem value="csv">CSV</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={exportForm.report_type}
                onChange={(e) => setExportForm(prev => ({ ...prev, report_type: e.target.value }))}
              >
                <MenuItem value="executive_summary">Executive Summary</MenuItem>
                <MenuItem value="detailed_metrics">Detailed Metrics</MenuItem>
                <MenuItem value="performance_trends">Performance Trends</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Date Range</InputLabel>
              <Select
                value={exportForm.date_range}
                onChange={(e) => setExportForm(prev => ({ ...prev, date_range: e.target.value }))}
              >
                <MenuItem value="1week">Last Week</MenuItem>
                <MenuItem value="1month">Last Month</MenuItem>
                <MenuItem value="3months">Last 3 Months</MenuItem>
                <MenuItem value="1year">Last Year</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleExportReport} variant="contained">Export</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default EnhancedReports;
