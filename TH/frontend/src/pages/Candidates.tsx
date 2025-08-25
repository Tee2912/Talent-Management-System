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

interface Candidate {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  position_applied: string;
  experience_years: number;
  final_score?: number;
  hiring_decision?: string;
  bias_score?: number;
}

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
          setCandidates(data);
        } else {
          throw new Error('Backend not available');
        }
      } catch (backendError) {
        // Use mock data when backend is not available
        console.log('Backend not available, using mock data for candidates');
        
        const mockCandidates: Candidate[] = [
          {
            id: 1,
            first_name: "Sarah",
            last_name: "Johnson",
            email: "sarah.johnson@email.com",
            position_applied: "Software Engineer",
            experience_years: 5,
            final_score: 4.2,
            hiring_decision: "hired",
            bias_score: 0.15
          },
          {
            id: 2,
            first_name: "Michael",
            last_name: "Chen",
            email: "michael.chen@email.com",
            position_applied: "Product Manager",
            experience_years: 7,
            final_score: 3.8,
            hiring_decision: "on_hold",
            bias_score: 0.23
          },
          {
            id: 3,
            first_name: "Emily",
            last_name: "Rodriguez",
            email: "emily.rodriguez@email.com",
            position_applied: "Data Scientist",
            experience_years: 4,
            final_score: 4.5,
            hiring_decision: "hired",
            bias_score: 0.12
          },
          {
            id: 4,
            first_name: "David",
            last_name: "Thompson",
            email: "david.thompson@email.com",
            position_applied: "UX Designer",
            experience_years: 6,
            final_score: 3.2,
            hiring_decision: "rejected",
            bias_score: 0.67
          },
          {
            id: 5,
            first_name: "Lisa",
            last_name: "Wang",
            email: "lisa.wang@email.com",
            position_applied: "DevOps Engineer",
            experience_years: 8,
            final_score: 4.1,
            hiring_decision: "hired",
            bias_score: 0.18
          },
          {
            id: 6,
            first_name: "James",
            last_name: "Wilson",
            email: "james.wilson@email.com",
            position_applied: "Software Engineer",
            experience_years: 3,
            final_score: 3.6,
            hiring_decision: "on_hold",
            bias_score: 0.34
          },
          {
            id: 7,
            first_name: "Maria",
            last_name: "Garcia",
            email: "maria.garcia@email.com",
            position_applied: "Product Manager",
            experience_years: 5,
            final_score: 4.0,
            hiring_decision: "hired",
            bias_score: 0.21
          },
          {
            id: 8,
            first_name: "Robert",
            last_name: "Kim",
            email: "robert.kim@email.com",
            position_applied: "Data Scientist",
            experience_years: 2,
            final_score: 2.8,
            hiring_decision: "rejected",
            bias_score: 0.45
          }
        ];
        
        setCandidates(mockCandidates);
      }
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDecisionColor = (decision?: string) => {
    switch (decision) {
      case 'hired': return 'success';
      case 'rejected': return 'error';
      case 'on_hold': return 'warning';
      default: return 'default';
    }
  };

  const getBiasColor = (score?: number) => {
    if (!score) return 'default';
    if (score <= 0.3) return 'success';
    if (score <= 0.6) return 'warning';
    return 'error';
  };

  if (loading) {
    return <Typography>Loading candidates...</Typography>;
  }

  return (
    <Box sx={{ ml: '240px', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Candidates</Typography>
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
    </Box>
  );
}

export default Candidates;
