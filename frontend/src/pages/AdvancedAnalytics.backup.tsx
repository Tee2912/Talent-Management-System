import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
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
  Chip,
  LinearProgress,
  Alert,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  QuestionAnswer as QuestionIcon,
  CalendarToday as CalendarIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  GetApp as ExportIcon,
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend
);

interface PredictiveMetrics {
  time_to_hire: {
    average_days: number;
    median_days: number;
    fastest_hire: number;
    slowest_hire: number;
  };
  source_effectiveness: Record<string, any>;
  conversion_rates: {
    interview_to_offer: number;
    application_to_interview: number;
    offer_to_hire: number;
  };
  score_analytics: {
    average_scores_by_criteria: Record<string, number>;
    total_interviews_analyzed: number;
  };
  prediction_model: {
    confidence_score: number;
    key_factors: string[];
    success_indicators: string[];
  };
}

interface InterviewerPerformance {
  interviewer_performance: Record<string, any>;
  top_performers: Array<[string, any]>;
  metrics_summary: {
    total_interviewers: number;
    avg_interviews_per_interviewer: number;
    avg_hire_success_rate: number;
  };
}

interface CostAnalysis {
  overall_metrics: {
    cost_per_hire: number;
    total_hiring_costs: number;
    total_hires: number;
    average_time_to_hire: number;
    cost_efficiency_score: string;
  };
  cost_breakdown: Record<string, number>;
  position_analysis: Record<string, any>;
  cost_trends: {
    monthly_trend: Array<{month: string; cost_per_hire: number}>;
  };
  benchmarks: {
    industry_average: number;
    company_target: number;
    best_in_class: number;
  };
}

interface FunnelAnalysis {
  funnel_stages: Array<{
    stage: string;
    count: number;
    conversion_rate: number;
    drop_off_rate: number;
  }>;
  overall_metrics: {
    total_applications: number;
    overall_success_rate: number;
    avg_time_to_hire: number;
    bottleneck_stage: string;
  };
  stage_timing: Record<string, number>;
  position_comparison: Record<string, any>;
  improvement_opportunities: Array<{
    stage: string;
    issue: string;
    recommendation: string;
    potential_impact: string;
  }>;
}

function AdvancedAnalytics() {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [predictiveMetrics, setPredictiveMetrics] = useState<PredictiveMetrics | null>(null);
  const [interviewerPerformance, setInterviewerPerformance] = useState<InterviewerPerformance | null>(null);
  const [costAnalysis, setCostAnalysis] = useState<CostAnalysis | null>(null);
  const [funnelAnalysis, setFunnelAnalysis] = useState<FunnelAnalysis | null>(null);
  const [questionEffectiveness, setQuestionEffectiveness] = useState<any>(null);
  const [seasonalTrends, setSeasonalTrends] = useState<any>(null);
  
  // Filters
  const [dateRange, setDateRange] = useState('last_30_days');

  const fetchAllAnalytics = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchPredictiveMetrics(),
        fetchInterviewerPerformance(),
        fetchCostAnalysis(),
        fetchFunnelAnalysis(),
        fetchQuestionEffectiveness(),
        fetchSeasonalTrends(),
      ]);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  React.useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchPredictiveMetrics(),
          fetchInterviewerPerformance(),
          fetchCostAnalysis(),
          fetchFunnelAnalysis(),
          fetchQuestionEffectiveness(),
          fetchSeasonalTrends(),
        ]);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const fetchPredictiveMetrics = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/analytics/predictive-metrics');
      if (response.ok) {
        const data = await response.json();
        setPredictiveMetrics(data);
      }
    } catch (error) {
      console.error('Error fetching predictive metrics:', error);
    }
  };

  const fetchInterviewerPerformance = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/analytics/interviewer-performance');
      if (response.ok) {
        const data = await response.json();
        setInterviewerPerformance(data);
      }
    } catch (error) {
      console.error('Error fetching interviewer performance:', error);
    }
  };

  const fetchCostAnalysis = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/analytics/cost-analysis');
      if (response.ok) {
        const data = await response.json();
        setCostAnalysis(data);
      }
    } catch (error) {
      console.error('Error fetching cost analysis:', error);
    }
  };

  const fetchFunnelAnalysis = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/analytics/funnel-analysis');
      if (response.ok) {
        const data = await response.json();
        setFunnelAnalysis(data);
      }
    } catch (error) {
      console.error('Error fetching funnel analysis:', error);
    }
  };

  const fetchQuestionEffectiveness = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/analytics/question-effectiveness');
      if (response.ok) {
        const data = await response.json();
        setQuestionEffectiveness(data);
      }
    } catch (error) {
      console.error('Error fetching question effectiveness:', error);
    }
  };

  const fetchSeasonalTrends = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/analytics/seasonal-trends');
      if (response.ok) {
        const data = await response.json();
        setSeasonalTrends(data);
      }
    } catch (error) {
      console.error('Error fetching seasonal trends:', error);
    }
  };

  const renderPredictiveAnalytics = () => (
    <Box>
      <Typography variant="h5" gutterBottom>
        Predictive Analytics & Success Models
      </Typography>
      
      {predictiveMetrics && (
        <Grid container spacing={3}>
          {/* Time to Hire Metrics */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <ScheduleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Time to Hire Analysis
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Average</Typography>
                    <Typography variant="h4" color="primary">
                      {predictiveMetrics.time_to_hire.average_days} days
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Median</Typography>
                    <Typography variant="h4" color="secondary">
                      {predictiveMetrics.time_to_hire.median_days} days
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Fastest</Typography>
                    <Typography variant="h6" color="success.main">
                      {predictiveMetrics.time_to_hire.fastest_hire} days
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Slowest</Typography>
                    <Typography variant="h6" color="warning.main">
                      {predictiveMetrics.time_to_hire.slowest_hire} days
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Source Effectiveness */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Source Effectiveness
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Source</TableCell>
                        <TableCell align="right">Success Rate</TableCell>
                        <TableCell align="right">Candidates</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(predictiveMetrics.source_effectiveness).map(([source, data]: [string, any]) => (
                        <TableRow key={source}>
                          <TableCell>{source}</TableCell>
                          <TableCell align="right">
                            <Chip 
                              label={`${data.success_rate}%`}
                              color={data.success_rate > 20 ? 'success' : data.success_rate > 10 ? 'warning' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">{data.total_candidates}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Conversion Rates */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Conversion Rates
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Interview to Offer
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={predictiveMetrics.conversion_rates.interview_to_offer} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption">
                    {predictiveMetrics.conversion_rates.interview_to_offer}%
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Prediction Model */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Success Prediction Model
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Confidence Score: {(predictiveMetrics.prediction_model.confidence_score * 100).toFixed(1)}%
                </Typography>
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                  Key Success Factors:
                </Typography>
                {predictiveMetrics.prediction_model.key_factors.map((factor, index) => (
                  <Chip key={index} label={factor} size="small" sx={{ mr: 1, mb: 1 }} />
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );

  const renderInterviewerPerformance = () => (
    <Box>
      <Typography variant="h5" gutterBottom>
        Interviewer Performance Analytics
      </Typography>
      
      {interviewerPerformance && (
        <Grid container spacing={3}>
          {/* Summary Metrics */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="primary">
                      {interviewerPerformance.metrics_summary.total_interviewers}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Interviewers
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="secondary">
                      {interviewerPerformance.metrics_summary.avg_interviews_per_interviewer}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Interviews per Interviewer
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="success.main">
                      {interviewerPerformance.metrics_summary.avg_hire_success_rate}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Hire Success Rate
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Detailed Performance Table */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Individual Performance Metrics
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Interviewer</TableCell>
                        <TableCell>Department</TableCell>
                        <TableCell align="right">Interviews</TableCell>
                        <TableCell align="right">Avg Score</TableCell>
                        <TableCell align="right">Success Rate</TableCell>
                        <TableCell align="right">Efficiency</TableCell>
                        <TableCell align="right">Bias Score</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(interviewerPerformance.interviewer_performance).map(([id, data]: [string, any]) => (
                        <TableRow key={id}>
                          <TableCell>{data.interviewer_info.name}</TableCell>
                          <TableCell>{data.interviewer_info.department}</TableCell>
                          <TableCell align="right">{data.interviews_conducted}</TableCell>
                          <TableCell align="right">{data.average_score_given}</TableCell>
                          <TableCell align="right">
                            <Chip 
                              label={`${data.hire_success_rate}%`}
                              color={data.hire_success_rate > 75 ? 'success' : data.hire_success_rate > 60 ? 'warning' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Chip label={data.efficiency_rating} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell align="right">
                            <Chip 
                              label={data.bias_score.toFixed(2)}
                              color={data.bias_score < 0.2 ? 'success' : data.bias_score < 0.4 ? 'warning' : 'error'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Top Performers */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top Performers
                </Typography>
                {interviewerPerformance.top_performers.slice(0, 3).map(([id, data], index) => (
                  <Box key={id} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h4" sx={{ mr: 2, color: index === 0 ? 'gold' : index === 1 ? 'silver' : '#CD7F32' }}>
                      {index + 1}
                    </Typography>
                    <Box>
                      <Typography variant="subtitle1">{data.interviewer_info.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {data.hire_success_rate}% success rate • {data.interviews_conducted} interviews
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );

  const renderCostAnalysis = () => (
    <Box>
      <Typography variant="h5" gutterBottom>
        <MoneyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Cost Analysis & ROI
      </Typography>
      
      {costAnalysis && (
        <Grid container spacing={3}>
          {/* Overall Metrics */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="primary">
                      ${costAnalysis.overall_metrics.cost_per_hire.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Cost per Hire
                    </Typography>
                    <Typography variant="caption" color="success.main">
                      vs Industry: ${costAnalysis.benchmarks.industry_average.toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="secondary">
                      ${costAnalysis.overall_metrics.total_hiring_costs.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Costs
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="success.main">
                      {costAnalysis.overall_metrics.total_hires}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Hires
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="info.main">
                      {costAnalysis.overall_metrics.cost_efficiency_score}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Efficiency Score
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Cost Breakdown */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Cost Breakdown
                </Typography>
                {Object.entries(costAnalysis.cost_breakdown).map(([category, amount]: [string, any]) => (
                  <Box key={category} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">{category.replace('_', ' ').toUpperCase()}</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        ${amount.toLocaleString()}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(amount / costAnalysis.overall_metrics.total_hiring_costs) * 100} 
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Cost Trends */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Monthly Cost Trends
                </Typography>
                <Line
                  data={{
                    labels: costAnalysis.cost_trends.monthly_trend.map(d => d.month),
                    datasets: [{
                      label: 'Cost per Hire',
                      data: costAnalysis.cost_trends.monthly_trend.map(d => d.cost_per_hire),
                      borderColor: 'rgb(53, 162, 235)',
                      backgroundColor: 'rgba(53, 162, 235, 0.5)',
                      tension: 0.1
                    }]
                  }}
                  options={{
                    responsive: true,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value) {
                            return '$' + value.toLocaleString();
                          }
                        }
                      }
                    }
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Benchmarks */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Industry Benchmarks
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Box textAlign="center">
                      <Typography variant="h5" color="error.main">
                        ${costAnalysis.benchmarks.industry_average.toLocaleString()}
                      </Typography>
                      <Typography variant="body2">Industry Average</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box textAlign="center">
                      <Typography variant="h5" color="warning.main">
                        ${costAnalysis.benchmarks.company_target.toLocaleString()}
                      </Typography>
                      <Typography variant="body2">Company Target</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box textAlign="center">
                      <Typography variant="h5" color="success.main">
                        ${costAnalysis.benchmarks.best_in_class.toLocaleString()}
                      </Typography>
                      <Typography variant="body2">Best in Class</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );

  const renderFunnelAnalysis = () => (
    <Box>
      <Typography variant="h5" gutterBottom>
        Hiring Funnel Analysis
      </Typography>
      
      {funnelAnalysis && (
        <Grid container spacing={3}>
          {/* Funnel Visualization */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Hiring Funnel Stages
                </Typography>
                {funnelAnalysis.funnel_stages.map((stage, index) => (
                  <Box key={stage.stage} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1" fontWeight="bold">
                        {stage.stage}
                      </Typography>
                      <Box>
                        <Typography variant="body2" component="span" sx={{ mr: 2 }}>
                          {stage.count} candidates
                        </Typography>
                        <Chip 
                          label={`${stage.conversion_rate}%`} 
                          size="small"
                          color={stage.conversion_rate > 50 ? 'success' : stage.conversion_rate > 25 ? 'warning' : 'error'}
                        />
                      </Box>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={stage.conversion_rate} 
                      sx={{ 
                        height: 12, 
                        borderRadius: 6,
                        backgroundColor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 6,
                        }
                      }}
                    />
                    {stage.drop_off_rate > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        Drop-off: {stage.drop_off_rate}%
                      </Typography>
                    )}
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Key Metrics */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Key Metrics
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h4" color="primary">
                    {funnelAnalysis.overall_metrics.total_applications}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Applications
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h4" color="success.main">
                    {funnelAnalysis.overall_metrics.overall_success_rate}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Overall Success Rate
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h4" color="warning.main">
                    {funnelAnalysis.overall_metrics.avg_time_to_hire}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Time to Hire (days)
                  </Typography>
                </Box>
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Bottleneck: {funnelAnalysis.overall_metrics.bottleneck_stage}
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          </Grid>

          {/* Improvement Opportunities */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Improvement Opportunities
                </Typography>
                {funnelAnalysis.improvement_opportunities.map((opportunity, index) => (
                  <Accordion key={index}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle1">
                        {opportunity.stage} - {opportunity.issue}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" paragraph>
                        <strong>Recommendation:</strong> {opportunity.recommendation}
                      </Typography>
                      <Typography variant="body2" color="success.main">
                        <strong>Potential Impact:</strong> {opportunity.potential_impact}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );

  const renderQuestionEffectiveness = () => (
    <Box>
      <Typography variant="h5" gutterBottom>
        <QuestionIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Question Effectiveness Analysis
      </Typography>
      
      {questionEffectiveness && (
        <Grid container spacing={3}>
          {/* Top Performing Questions */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top Performing Questions
                </Typography>
                {questionEffectiveness.top_performing_questions.map((question: any, index: number) => (
                  <Box key={question.id} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {question.question}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <Chip label={question.category} size="small" />
                      <Chip label={question.difficulty} size="small" variant="outlined" />
                      <Chip 
                        label={`Score: ${question.effectiveness_score}`} 
                        size="small" 
                        color="success"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Correlation with hire: {(question.correlation_with_hire * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Category Performance */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Category Performance
                </Typography>
                {Object.entries(questionEffectiveness.category_performance).map(([category, data]: [string, any]) => (
                  <Box key={category} sx={{ mb: 2 }}>
                    <Typography variant="subtitle1">{category}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Effectiveness</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {data.avg_effectiveness}/10
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(data.avg_effectiveness / 10) * 100} 
                      sx={{ height: 6, borderRadius: 3, mb: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {data.question_count} questions • Correlation: {(data.avg_correlation * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Recommendations */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recommendations
                </Typography>
                <Grid container spacing={2}>
                  {questionEffectiveness.recommendations.map((rec: any, index: number) => (
                    <Grid item xs={12} md={4} key={index}>
                      <Alert 
                        severity={rec.priority === 'High' ? 'error' : rec.priority === 'Medium' ? 'warning' : 'info'}
                      >
                        <Typography variant="subtitle2" gutterBottom>
                          {rec.type}
                        </Typography>
                        <Typography variant="body2">
                          {rec.description}
                        </Typography>
                      </Alert>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );

  const renderSeasonalTrends = () => (
    <Box>
      <Typography variant="h5" gutterBottom>
        <CalendarIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Seasonal Trends & Predictions
      </Typography>
      
      {seasonalTrends && (
        <Grid container spacing={3}>
          {/* Monthly Trends Chart */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Monthly Hiring Trends
                </Typography>
                <Line
                  data={{
                    labels: seasonalTrends.monthly_trends.map((d: any) => d.month),
                    datasets: [
                      {
                        label: 'Applications',
                        data: seasonalTrends.monthly_trends.map((d: any) => d.applications),
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        yAxisID: 'y',
                      },
                      {
                        label: 'Hires',
                        data: seasonalTrends.monthly_trends.map((d: any) => d.hires),
                        borderColor: 'rgb(255, 99, 132)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        yAxisID: 'y1',
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    scales: {
                      y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                      },
                      y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        grid: {
                          drawOnChartArea: false,
                        },
                      },
                    },
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Seasonal Patterns */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Seasonal Patterns
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Peak Hiring Months
                  </Typography>
                  {seasonalTrends.seasonal_patterns.peak_hiring_months.map((month: string) => (
                    <Chip key={month} label={month} size="small" color="success" sx={{ mr: 1, mb: 1 }} />
                  ))}
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Low Activity Months
                  </Typography>
                  {seasonalTrends.seasonal_patterns.low_activity_months.map((month: string) => (
                    <Chip key={month} label={month} size="small" color="error" sx={{ mr: 1, mb: 1 }} />
                  ))}
                </Box>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Best Conversion Months
                  </Typography>
                  {seasonalTrends.seasonal_patterns.best_conversion_months.map((month: string) => (
                    <Chip key={month} label={month} size="small" color="primary" sx={{ mr: 1, mb: 1 }} />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Next Quarter Predictions */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Next Quarter Predictions
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Month</TableCell>
                        <TableCell align="right">Predicted Applications</TableCell>
                        <TableCell align="right">Predicted Hires</TableCell>
                        <TableCell align="right">Time to Hire</TableCell>
                        <TableCell align="right">Confidence</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {seasonalTrends.next_quarter_predictions.map((prediction: any) => (
                        <TableRow key={prediction.month}>
                          <TableCell>{prediction.month}</TableCell>
                          <TableCell align="right">{prediction.predicted_applications}</TableCell>
                          <TableCell align="right">{prediction.predicted_hires}</TableCell>
                          <TableCell align="right">{prediction.predicted_time_to_hire} days</TableCell>
                          <TableCell align="right">
                            <Chip 
                              label={`${(prediction.confidence * 100).toFixed(0)}%`}
                              size="small"
                              color={prediction.confidence > 0.7 ? 'success' : 'warning'}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Advanced Analytics
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Date Range</InputLabel>
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              label="Date Range"
            >
              <MenuItem value="last_7_days">Last 7 days</MenuItem>
              <MenuItem value="last_30_days">Last 30 days</MenuItem>
              <MenuItem value="last_90_days">Last 90 days</MenuItem>
              <MenuItem value="last_year">Last year</MenuItem>
            </Select>
          </FormControl>
          <Button
            startIcon={<RefreshIcon />}
            onClick={fetchAllAnalytics}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            startIcon={<ExportIcon />}
            variant="outlined"
          >
            Export
          </Button>
        </Box>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Predictive Analytics" />
          <Tab label="Interviewer Performance" />
          <Tab label="Cost Analysis" />
          <Tab label="Funnel Analysis" />
          <Tab label="Question Effectiveness" />
          <Tab label="Seasonal Trends" />
        </Tabs>
      </Box>

      {tabValue === 0 && renderPredictiveAnalytics()}
      {tabValue === 1 && renderInterviewerPerformance()}
      {tabValue === 2 && renderCostAnalysis()}
      {tabValue === 3 && renderFunnelAnalysis()}
      {tabValue === 4 && renderQuestionEffectiveness()}
      {tabValue === 5 && renderSeasonalTrends()}
    </Box>
  );
}

export default AdvancedAnalytics;
