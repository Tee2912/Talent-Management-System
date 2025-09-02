import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Warning,
  CheckCircle,
  Analytics,
  Psychology,
  TrendingUp,
  Assessment,
  Security
} from '@mui/icons-material';

interface BiasAnalysis {
  bias_detected: boolean;
  bias_score: number;
  confidence: string;
  bias_level?: string;
  metrics?: any;
  recommendations?: string[];
  analysis_timestamp?: string;
}

interface BiasInsights {
  summary?: any;
  demographics?: any;
  scoring?: any;
  recommendations?: string[];
}

const BiasDetectionPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [biasAnalysis, setBiasAnalysis] = useState<BiasAnalysis | null>(null);
  const [biasInsights, setBiasInsights] = useState<BiasInsights | null>(null);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedAttribute, setSelectedAttribute] = useState('gender');
  const [testText, setTestText] = useState('The candidate seems very aggressive and pushy. Not sure if she would be a good cultural fit for our team.');
  const [textAnalysis, setTextAnalysis] = useState<any>(null);

  useEffect(() => {
    checkHealthStatus();
    loadCandidates();
  }, []);

  const checkHealthStatus = async () => {
    try {
      const response = await fetch('/api/bias-detection/health');
      const data = await response.json();
      setHealthStatus(data);
    } catch (error) {
      console.error('Error checking health status:', error);
    }
  };

  const loadCandidates = async () => {
    try {
      const response = await fetch('/api/v1/candidates');
      const data = await response.json();
      setCandidates(data);
    } catch (error) {
      console.error('Error loading candidates:', error);
    }
  };

  const runBiasAnalysis = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/bias-detection/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          protected_attribute: selectedAttribute,
          candidates: candidates
        })
      });
      const data = await response.json();
      setBiasAnalysis(data);
    } catch (error) {
      console.error('Error running bias analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBiasInsights = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/bias-detection/insights');
      const data = await response.json();
      setBiasInsights(data.insights);
    } catch (error) {
      console.error('Error getting bias insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeText = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/bias-detection/text-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: testText,
          candidate_info: { gender: 'female' }
        })
      });
      const data = await response.json();
      setTextAnalysis(data.text_analysis);
    } catch (error) {
      console.error('Error analyzing text:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBiasLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'success';
    }
  };

  const getBiasScoreColor = (score: number) => {
    if (score > 0.7) return 'error';
    if (score > 0.4) return 'warning';
    if (score > 0.2) return 'info';
    return 'success';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Security />
        Bias Detection Dashboard
      </Typography>

      {/* Health Status */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            System Health Status
          </Typography>
          {healthStatus ? (
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Chip
                  icon={healthStatus.ai_orchestrator_available ? <CheckCircle /> : <Warning />}
                  label={`AI Orchestrator: ${healthStatus.ai_orchestrator_available ? 'Online' : 'Offline'}`}
                  color={healthStatus.ai_orchestrator_available ? 'success' : 'error'}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Chip
                  icon={<Analytics />}
                  label={`Candidates: ${healthStatus.total_candidates}`}
                  color="info"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2">
                  Capabilities: {healthStatus.analysis_capabilities?.join(', ')}
                </Typography>
              </Grid>
            </Grid>
          ) : (
            <CircularProgress size={24} />
          )}
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Demographic Bias Analysis */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Assessment />
                Demographic Bias Analysis
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Protected Attribute</InputLabel>
                <Select
                  value={selectedAttribute}
                  onChange={(e) => setSelectedAttribute(e.target.value)}
                  label="Protected Attribute"
                >
                  <MenuItem value="gender">Gender</MenuItem>
                  <MenuItem value="ethnicity">Ethnicity</MenuItem>
                  <MenuItem value="age">Age</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="contained"
                onClick={runBiasAnalysis}
                disabled={loading}
                fullWidth
                sx={{ mb: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Run Analysis'}
              </Button>

              {biasAnalysis && (
                <Box>
                  <Alert 
                    severity={biasAnalysis.bias_detected ? 'warning' : 'success'}
                    sx={{ mb: 2 }}
                  >
                    {biasAnalysis.bias_detected ? 'Bias Detected' : 'No Significant Bias Detected'}
                  </Alert>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Bias Score
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={biasAnalysis.bias_score * 100}
                          color={getBiasScoreColor(biasAnalysis.bias_score)}
                          sx={{ flexGrow: 1 }}
                        />
                        <Typography variant="body2">
                          {(biasAnalysis.bias_score * 100).toFixed(1)}%
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Confidence
                      </Typography>
                      <Chip 
                        label={biasAnalysis.confidence} 
                        size="small"
                        color={biasAnalysis.confidence === 'high' ? 'success' : 'warning'}
                      />
                    </Grid>
                  </Grid>

                  {biasAnalysis.bias_level && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="textSecondary">
                        Bias Level
                      </Typography>
                      <Chip 
                        label={biasAnalysis.bias_level} 
                        color={getBiasLevelColor(biasAnalysis.bias_level)}
                      />
                    </Box>
                  )}

                  {biasAnalysis.recommendations && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Recommendations
                      </Typography>
                      <List dense>
                        {biasAnalysis.recommendations.map((rec, index) => (
                          <ListItem key={index} sx={{ py: 0 }}>
                            <ListItemText 
                              primary={rec}
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Text Bias Analysis */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Psychology />
                Text Bias Analysis
              </Typography>

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Evaluation Text"
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                sx={{ mb: 2 }}
              />

              <Button
                variant="contained"
                onClick={analyzeText}
                disabled={loading}
                fullWidth
                sx={{ mb: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Analyze Text'}
              </Button>

              {textAnalysis && (
                <Box>
                  <Alert 
                    severity={textAnalysis.bias_detected ? 'warning' : 'success'}
                    sx={{ mb: 2 }}
                  >
                    {textAnalysis.bias_detected ? 'Bias Indicators Found' : 'No Bias Indicators Detected'}
                  </Alert>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Bias Score
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={textAnalysis.bias_score * 100}
                          color={getBiasScoreColor(textAnalysis.bias_score)}
                          sx={{ flexGrow: 1 }}
                        />
                        <Typography variant="body2">
                          {(textAnalysis.bias_score * 100).toFixed(1)}%
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Indicators Found
                      </Typography>
                      <Typography variant="h6">
                        {textAnalysis.total_bias_indicators}
                      </Typography>
                    </Grid>
                  </Grid>

                  {textAnalysis.detected_patterns && Object.keys(textAnalysis.detected_patterns).length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Detected Bias Patterns
                      </Typography>
                      {Object.entries(textAnalysis.detected_patterns).map(([type, patterns]: [string, any]) => (
                        <Box key={type} sx={{ mb: 1 }}>
                          <Chip 
                            label={type.replace('_', ' ')} 
                            size="small"
                            color="warning"
                            sx={{ mr: 1 }}
                          />
                          <Typography variant="caption" display="block">
                            {patterns.join(', ')}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}

                  {textAnalysis.recommendations && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Recommendations
                      </Typography>
                      <List dense>
                        {textAnalysis.recommendations.map((rec: string, index: number) => (
                          <ListItem key={index} sx={{ py: 0 }}>
                            <ListItemText 
                              primary={rec}
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Comprehensive Insights */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp />
                Comprehensive Bias Insights
              </Typography>

              <Button
                variant="contained"
                onClick={getBiasInsights}
                disabled={loading}
                sx={{ mb: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Generate Insights'}
              </Button>

              {biasInsights && (
                <Box>
                  {biasInsights.summary && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Summary
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={3}>
                          <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h4" color="primary">
                              {biasInsights.summary.total_candidates}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Total Candidates
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h4" color="secondary">
                              {(biasInsights.summary.overall_hiring_rate * 100).toFixed(1)}%
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Hiring Rate
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h4" color={biasInsights.summary.bias_risk_level === 'high' ? 'error' : 'success'}>
                              {biasInsights.summary.bias_risk_level || 'Low'}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Risk Level
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h4" color="info">
                              {biasInsights.summary.confidence || 'Medium'}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Confidence
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {biasInsights.recommendations && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Key Recommendations
                      </Typography>
                      <List>
                        {biasInsights.recommendations.map((rec: string, index: number) => (
                          <ListItem key={index}>
                            <ListItemText 
                              primary={rec}
                              primaryTypographyProps={{ variant: 'body1' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BiasDetectionPage;
