import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { People } from '@mui/icons-material';
import { Candidate, MOCK_CANDIDATES } from '../constants/mockData';
import { BIAS_SCORE_THRESHOLDS, HIRING_DECISIONS } from '../constants/candidates';
import PageTransition from '../components/PageTransition';

function Candidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      // Try to fetch from backend first, fall back to mock data if backend is not available
      try {
        const response = await fetch('/api/v1/candidates/');
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            setCandidates(data);
          } else {
            console.log('Backend returned no candidates, using mock data');
            setCandidates(MOCK_CANDIDATES);
          }
        } else {
          throw new Error('Backend not available');
        }
      } catch (backendError) {
        // Use mock data when backend is not available
        console.log('Backend not available, using mock data for candidates');
        setCandidates(MOCK_CANDIDATES);
      }
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDecisionColor = (decision?: string) => {
    switch (decision) {
      case HIRING_DECISIONS.HIRED: return 'success';
      case HIRING_DECISIONS.REJECTED: return 'error';
      case HIRING_DECISIONS.ON_HOLD: return 'warning';
      default: return 'default';
    }
  };

  const getBiasColor = (score?: number) => {
    if (!score) return 'default';
    if (score <= BIAS_SCORE_THRESHOLDS.LOW) return 'success';
    if (score <= BIAS_SCORE_THRESHOLDS.MEDIUM) return 'warning';
    return 'error';
  };

  if (loading) {
    return <Typography>Loading candidates...</Typography>;
  }

  return (
    <PageTransition animation="slideLeft">
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <People />
            Candidates
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Add Candidate
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Position</TableCell>
              <TableCell>Experience</TableCell>
              <TableCell>Resume Score</TableCell>
              <TableCell>Technical Score</TableCell>
              <TableCell>Interview Score</TableCell>
              <TableCell>Final Score</TableCell>
              <TableCell>Decision</TableCell>
              <TableCell>Bias Score</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {candidates.map((candidate) => (
              <TableRow key={candidate.id}>
                <TableCell>
                  {candidate.first_name} {candidate.last_name}
                </TableCell>
                <TableCell>{candidate.email}</TableCell>
                <TableCell>{candidate.position_applied}</TableCell>
                <TableCell>{candidate.experience_years} years</TableCell>
                <TableCell>
                  {candidate.resume_score ? candidate.resume_score.toFixed(1) : 'N/A'}
                </TableCell>
                <TableCell>
                  {candidate.technical_score ? candidate.technical_score.toFixed(1) : 'N/A'}
                </TableCell>
                <TableCell>
                  {candidate.interview_score ? candidate.interview_score.toFixed(1) : 'N/A'}
                </TableCell>
                <TableCell>
                  {candidate.final_score ? candidate.final_score.toFixed(1) : 'N/A'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={candidate.hiring_decision || 'Pending'}
                    color={getDecisionColor(candidate.hiring_decision)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {candidate.bias_score ? (
                    <Chip
                      label={candidate.bias_score.toFixed(2)}
                      color={getBiasColor(candidate.bias_score)}
                      size="small"
                    />
                  ) : 'N/A'}
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    onClick={() => setSelectedCandidate(candidate)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Candidate Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Candidate</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="First Name" fullWidth />
            <TextField label="Last Name" fullWidth />
            <TextField label="Email" type="email" fullWidth />
            <TextField label="Position Applied" fullWidth />
            <TextField label="Experience (years)" type="number" fullWidth />
            <FormControl fullWidth>
              <InputLabel>Gender</InputLabel>
              <Select>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="non_binary">Non-binary</MenuItem>
                <MenuItem value="prefer_not_to_say">Prefer not to say</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained">Add Candidate</Button>
        </DialogActions>
      </Dialog>

      {/* Candidate Detail Dialog */}
      <Dialog 
        open={selectedCandidate !== null} 
        onClose={() => setSelectedCandidate(null)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          Candidate Details - {selectedCandidate?.first_name} {selectedCandidate?.last_name}
        </DialogTitle>
        <DialogContent>
          {selectedCandidate && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
              {/* Position Applied */}
              <Box>
                <Typography variant="h6" gutterBottom color="primary">
                  Position Applied
                </Typography>
                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="h5" color="primary" fontWeight="bold">
                    {selectedCandidate.position_applied}
                  </Typography>
                </Box>
              </Box>

              {/* Basic Information */}
              <Box>
                <Typography variant="h6" gutterBottom color="primary">
                  Basic Information
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">Full Name</Typography>
                    <Typography variant="body1">
                      {selectedCandidate.first_name} {selectedCandidate.last_name}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">Age</Typography>
                    <Typography variant="body1">{selectedCandidate.age || 'N/A'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">Email</Typography>
                    <Typography variant="body1">{selectedCandidate.email}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">Phone</Typography>
                    <Typography variant="body1">{selectedCandidate.phone || 'N/A'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">Gender</Typography>
                    <Typography variant="body1">{selectedCandidate.gender || 'N/A'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">Ethnicity</Typography>
                    <Typography variant="body1">{selectedCandidate.ethnicity || 'N/A'}</Typography>
                  </Box>
                </Box>
              </Box>

              {/* Skills and Experience */}
              <Box>
                <Typography variant="h6" gutterBottom color="primary">
                  Skills and Experience
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">Years of Experience</Typography>
                    <Typography variant="h6" color="primary">
                      {selectedCandidate.experience_years} years
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">Education Level</Typography>
                    <Typography variant="body1">{selectedCandidate.education_level || 'N/A'}</Typography>
                  </Box>
                  <Box sx={{ gridColumn: '1 / -1' }}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Technical Skills
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedCandidate.skills && selectedCandidate.skills.length > 0 ? (
                        selectedCandidate.skills.map((skill, index) => (
                          <Chip
                            key={index}
                            label={skill}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        ))
                      ) : (
                        <Typography variant="body2" color="textSecondary">N/A</Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Evaluation Scores */}
              <Box>
                <Typography variant="h6" gutterBottom color="primary">
                  Evaluation Scores
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">Resume Analysis Score</Typography>
                    <Typography variant="h5" color="primary">
                      {selectedCandidate.resume_score ? selectedCandidate.resume_score.toFixed(1) : 'N/A'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">Technical Interview Score</Typography>
                    <Typography variant="h5" color="primary">
                      {selectedCandidate.technical_score ? selectedCandidate.technical_score.toFixed(1) : 'N/A'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">Interview Score</Typography>
                    <Typography variant="h5" color="primary">
                      {selectedCandidate.interview_score ? selectedCandidate.interview_score.toFixed(1) : 'N/A'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">Final Score</Typography>
                    <Typography variant="h4" color="success.main">
                      {selectedCandidate.final_score ? selectedCandidate.final_score.toFixed(1) : 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Hiring Decision & Analysis */}
              <Box>
                <Typography variant="h6" gutterBottom color="primary">
                  Hiring Decision & Analysis
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">Hiring Decision</Typography>
                    <Chip
                      label={selectedCandidate.hiring_decision || 'Pending'}
                      color={getDecisionColor(selectedCandidate.hiring_decision)}
                      size="medium"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">Bias Score</Typography>
                    <Chip
                      label={selectedCandidate.bias_score ? selectedCandidate.bias_score.toFixed(2) : 'N/A'}
                      color={getBiasColor(selectedCandidate.bias_score)}
                      size="medium"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="primary">
            View Full Resume
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <Button onClick={() => setSelectedCandidate(null)}>Close</Button>
          <Button variant="contained" color="primary">
            Edit Candidate
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
    </PageTransition>
  );
}

export default Candidates;
