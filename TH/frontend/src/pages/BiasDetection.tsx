import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  TextField,
  Grid,
  Chip,
} from '@mui/material';
import { Security, Warning, CheckCircle } from '@mui/icons-material';

function BiasDetection() {
  const [biasScore, setBiasScore] = useState<number | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  const runBiasAnalysis = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch('/api/v1/bias/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidate_ids: [], // Analyze all candidates
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setBiasScore(data.overall_bias_score);
        setRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error('Bias analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const getBiasIcon = (score: number) => {
    if (score <= 0.3) return <CheckCircle sx={{ color: 'success.main' }} />;
    if (score <= 0.6) return <Warning sx={{ color: 'warning.main' }} />;
    return <Security sx={{ color: 'error.main' }} />;
  };

  const getBiasColor = (score: number) => {
    if (score <= 0.3) return 'success';
    if (score <= 0.6) return 'warning';
    return 'error';
  };

  const getBiasText = (score: number) => {
    if (score <= 0.3) return 'Low Bias Detected';
    if (score <= 0.6) return 'Moderate Bias Detected';
    return 'High Bias Detected';
  };

  return (
    <Box sx={{ ml: '240px', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Bias Detection
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Run Bias Analysis
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Analyze all hiring decisions for potential bias in the recruitment process.
              </Typography>
              <Button
                variant="contained"
                onClick={runBiasAnalysis}
                disabled={analyzing}
                startIcon={<Security />}
              >
                {analyzing ? 'Analyzing...' : 'Run Analysis'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {biasScore !== null && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {getBiasIcon(biasScore)}
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    Analysis Results
                  </Typography>
                </Box>
                <Chip
                  label={getBiasText(biasScore)}
                  color={getBiasColor(biasScore)}
                  sx={{ mb: 2 }}
                />
                <Typography variant="body2">
                  Overall Bias Score: {biasScore.toFixed(3)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {recommendations.length > 0 && (
          <Grid item xs={12}>
            <Alert severity="info">
              <Typography variant="h6" gutterBottom>
                Recommendations
              </Typography>
              <ul>
                {recommendations.map((rec, index) => (
                  <li key={index}>
                    <Typography variant="body2">{rec}</Typography>
                  </li>
                ))}
              </ul>
            </Alert>
          </Grid>
        )}

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                About Bias Detection
              </Typography>
              <Typography variant="body2" paragraph>
                Our bias detection system analyzes hiring decisions using machine learning
                algorithms to identify potential discrimination based on demographic factors.
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Fairness Metrics:</strong>
              </Typography>
              <ul>
                <li>
                  <Typography variant="body2">
                    <strong>Demographic Parity:</strong> Equal hiring rates across demographic groups
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    <strong>Equalized Odds:</strong> Equal true positive and false positive rates
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    <strong>Calibration:</strong> Consistent score interpretation across groups
                  </Typography>
                </li>
              </ul>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default BiasDetection;
