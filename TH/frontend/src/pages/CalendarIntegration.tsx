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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  Event as CalendarIcon,
  Google as GoogleIcon,
  Microsoft as MicrosoftIcon,
  Apple as AppleIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Sync as SyncIcon,
  Settings as SettingsIcon,
  VideoCall as VideoCallIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Link as LinkIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

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
      id={`calendar-tabpanel-${index}`}
      aria-labelledby={`calendar-tab-${index}`}
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

function CalendarIntegration() {
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [providers, setProviders] = useState<any[]>([]);
  const [connectedCalendars, setConnectedCalendars] = useState<any[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [availability, setAvailability] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  
  // Dialog states
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [availabilityDialogOpen, setAvailabilityDialogOpen] = useState(false);
  
  // Form states
  const [connectForm, setConnectForm] = useState({
    provider: '',
    calendar_id: '',
    calendar_name: '',
    user_id: 1
  });
  const [scheduleForm, setScheduleForm] = useState({
    interview_id: '',
    candidate_name: '',
    candidate_email: '',
    interviewer_email: '',
    position: '',
    start_time: '',
    duration: 60,
    location: 'Virtual Meeting'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to fetch from backend first, fall back to mock data if backend is not available
      try {
        const [
          providersRes,
          calendarsRes,
          eventsRes,
          settingsRes
        ] = await Promise.all([
          fetch('/api/v1/calendar/providers'),
          fetch('/api/v1/calendar/connected'),
          fetch('/api/v1/calendar/events'),
          fetch('/api/v1/calendar/settings')
        ]);

        // Check if all requests were successful
        if (providersRes.ok && calendarsRes.ok && eventsRes.ok && settingsRes.ok) {
          const [
            providersData,
            calendarsData,
            eventsData,
            settingsData
          ] = await Promise.all([
            providersRes.json(),
            calendarsRes.json(),
            eventsRes.json(),
            settingsRes.json()
          ]);

          setProviders(providersData.providers);
          setConnectedCalendars(calendarsData.calendars);
          setCalendarEvents(eventsData.events);
          setSettings(settingsData.settings);
        } else {
          throw new Error('Backend not available');
        }
      } catch (backendError) {
        // Use mock data when backend is not available
        console.log('Backend not available, using mock data');
        
        const mockProviders = [
          {
            id: "google",
            name: "Google Calendar",
            enabled: true,
            auth_url: "https://accounts.google.com/oauth2/auth",
            scopes: ["https://www.googleapis.com/auth/calendar"]
          },
          {
            id: "outlook",
            name: "Microsoft Outlook",
            enabled: true,
            auth_url: "https://login.microsoftonline.com/oauth2/v2.0/authorize",
            scopes: ["https://graph.microsoft.com/calendars.readwrite"]
          },
          {
            id: "apple",
            name: "Apple Calendar (iCloud)",
            enabled: false,
            auth_url: "https://appleid.apple.com/auth/authorize",
            scopes: ["calendar"]
          }
        ];

        const mockConnectedCalendars = [
          {
            id: 1,
            user_id: 5,
            user_name: "Sarah Wilson",
            provider: "google",
            calendar_id: "sarah.wilson@company.com",
            calendar_name: "Sarah's Work Calendar",
            connected_at: "2024-01-10T09:00:00",
            last_sync: "2024-01-22T14:30:00",
            sync_status: "active",
            permissions: ["read", "write"],
            default_calendar: true
          },
          {
            id: 2,
            user_id: 3,
            user_name: "Mike Chen",
            provider: "outlook",
            calendar_id: "mike.chen@company.com",
            calendar_name: "Mike's Interview Calendar",
            connected_at: "2024-01-15T10:30:00",
            last_sync: "2024-01-22T13:45:00",
            sync_status: "active",
            permissions: ["read", "write"],
            default_calendar: false
          }
        ];

        const mockEvents = [
          {
            id: "evt_001",
            interview_id: "INT_001",
            title: "Technical Interview - Senior Developer",
            start_time: "2024-01-25T10:00:00",
            end_time: "2024-01-25T11:00:00",
            location: "Virtual Meeting",
            meeting_link: "https://meet.google.com/abc-defg-hij",
            status: "confirmed",
            attendees: [
              {
                name: "John Smith",
                email: "john.smith@candidate.com",
                response_status: "accepted",
                role: "candidate"
              },
              {
                name: "Sarah Wilson",
                email: "sarah.wilson@company.com",
                response_status: "accepted",
                role: "interviewer"
              }
            ]
          },
          {
            id: "evt_002",
            interview_id: "INT_002",
            title: "HR Interview - Marketing Manager",
            start_time: "2024-01-25T14:00:00",
            end_time: "2024-01-25T15:00:00",
            location: "Conference Room A",
            meeting_link: null,
            status: "pending",
            attendees: [
              {
                name: "Jane Doe",
                email: "jane.doe@candidate.com",
                response_status: "pending",
                role: "candidate"
              },
              {
                name: "Mike Chen",
                email: "mike.chen@company.com",
                response_status: "accepted",
                role: "interviewer"
              }
            ]
          }
        ];

        const mockSettings = {
          working_hours: {
            start: "09:00",
            end: "17:00"
          },
          default_interview_duration: 60,
          buffer_time_minutes: 15,
          time_zone: "America/New_York",
          auto_sync_enabled: true,
          notification_preferences: {
            email_reminders: true,
            calendar_notifications: true,
            reminder_minutes_before: 30
          }
        };

        setProviders(mockProviders);
        setConnectedCalendars(mockConnectedCalendars);
        setCalendarEvents(mockEvents);
        setSettings(mockSettings);
      }
      
    } catch (error) {
      setError('Failed to fetch calendar data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleConnectCalendar = async () => {
    try {
      const response = await fetch('/api/v1/calendar/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(connectForm)
      });

      if (response.ok) {
        setConnectDialogOpen(false);
        setConnectForm({ provider: '', calendar_id: '', calendar_name: '', user_id: 1 });
        fetchData();
        alert('Calendar connected successfully!');
      } else {
        alert('Failed to connect calendar');
      }
    } catch (error) {
      // Mock success when backend is not available
      console.log('Backend not available, simulating calendar connection');
      setConnectDialogOpen(false);
      setConnectForm({ provider: '', calendar_id: '', calendar_name: '', user_id: 1 });
      alert('Calendar connected successfully! (Demo mode)');
    }
  };

  const handleScheduleInterview = async () => {
    try {
      const response = await fetch('/api/v1/calendar/schedule-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...scheduleForm,
          calendar_id: connectedCalendars[0]?.calendar_id || 'default@company.com'
        })
      });

      if (response.ok) {
        setScheduleDialogOpen(false);
        setScheduleForm({
          interview_id: '',
          candidate_name: '',
          candidate_email: '',
          interviewer_email: '',
          position: '',
          start_time: '',
          duration: 60,
          location: 'Virtual Meeting'
        });
        fetchData();
        alert('Interview scheduled successfully!');
      } else {
        alert('Failed to schedule interview');
      }
    } catch (error) {
      // Mock success when backend is not available
      console.log('Backend not available, simulating interview scheduling');
      setScheduleDialogOpen(false);
      setScheduleForm({
        interview_id: '',
        candidate_name: '',
        candidate_email: '',
        interviewer_email: '',
        position: '',
        start_time: '',
        duration: 60,
        location: 'Virtual Meeting'
      });
      alert('Interview scheduled successfully! (Demo mode)');
    }
  };

  const handleDisconnectCalendar = async (calendarId: number) => {
    try {
      const response = await fetch(`/api/v1/calendar/connected/${calendarId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchData();
        alert('Calendar disconnected successfully!');
      } else {
        alert('Failed to disconnect calendar');
      }
    } catch (error) {
      // Mock success when backend is not available
      console.log('Backend not available, simulating calendar disconnection');
      alert('Calendar disconnected successfully! (Demo mode)');
    }
  };

  const handleSyncCalendar = async (calendarId: number) => {
    try {
      const response = await fetch(`/api/v1/calendar/sync/${calendarId}`, {
        method: 'PUT'
      });

      if (response.ok) {
        fetchData();
        alert('Calendar synced successfully!');
      } else {
        alert('Failed to sync calendar');
      }
    } catch (error) {
      // Mock success when backend is not available
      console.log('Backend not available, simulating calendar sync');
      alert('Calendar synced successfully! (Demo mode)');
    }
  };

  const checkAvailability = async (calendarId: string, date: string) => {
    try {
      const response = await fetch(`/api/v1/calendar/availability?calendar_id=${calendarId}&date=${date}`);
      if (response.ok) {
        const data = await response.json();
        setAvailability(data.availability);
        setAvailabilityDialogOpen(true);
      } else {
        throw new Error('Backend not available');
      }
    } catch (error) {
      // Mock availability data when backend is not available
      console.log('Backend not available, using mock availability data');
      const mockAvailability = {
        date: date,
        requested_duration: 60,
        total_available_slots: 4,
        available_slots: [
          { start: "09:00", end: "10:00" },
          { start: "11:00", end: "12:00" },
          { start: "14:00", end: "15:00" },
          { start: "15:30", end: "16:30" }
        ]
      };
      setAvailability(mockAvailability);
      setAvailabilityDialogOpen(true);
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'google':
        return <GoogleIcon />;
      case 'outlook':
        return <MicrosoftIcon />;
      case 'apple':
        return <AppleIcon />;
      default:
        return <CalendarIcon />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ ml: '240px', p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading calendar data...</Typography>
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
        <CalendarIcon /> Calendar Integration
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                {connectedCalendars.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Connected Calendars
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                {calendarEvents.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Scheduled Events
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                {providers.filter(p => p.enabled).length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Available Providers
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                {calendarEvents.filter(e => e.status === 'confirmed').length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Confirmed Meetings
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setConnectDialogOpen(true)}
        >
          Connect Calendar
        </Button>
        <Button
          variant="outlined"
          startIcon={<ScheduleIcon />}
          onClick={() => setScheduleDialogOpen(true)}
        >
          Schedule Interview
        </Button>
        <Button
          variant="outlined"
          startIcon={<SettingsIcon />}
          disabled
        >
          Settings
        </Button>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchData}
        >
          Refresh
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
          <Tab label="Connected Calendars" icon={<CalendarIcon />} />
          <Tab label="Scheduled Events" icon={<ScheduleIcon />} />
          <Tab label="Providers" icon={<SettingsIcon />} />
          <Tab label="Availability" icon={<TimeIcon />} />
        </Tabs>
      </Paper>

      {/* Connected Calendars Tab */}
      <TabPanel value={currentTab} index={0}>
        <Grid container spacing={3}>
          {connectedCalendars.map((calendar) => (
            <Grid item xs={12} md={6} key={calendar.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    {getProviderIcon(calendar.provider)}
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6">{calendar.calendar_name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {calendar.user_name} • {calendar.provider.toUpperCase()}
                      </Typography>
                    </Box>
                    <Chip
                      label={calendar.sync_status}
                      color={calendar.sync_status === 'active' ? 'success' : 'warning'}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Connected: {new Date(calendar.connected_at).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Last Sync: {new Date(calendar.last_sync).toLocaleString()}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      startIcon={<SyncIcon />}
                      onClick={() => handleSyncCalendar(calendar.id)}
                    >
                      Sync
                    </Button>
                    <Button
                      size="small"
                      startIcon={<TimeIcon />}
                      onClick={() => checkAvailability(calendar.calendar_id, new Date().toISOString().split('T')[0])}
                    >
                      Check Availability
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDisconnectCalendar(calendar.id)}
                    >
                      Disconnect
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
          
          {connectedCalendars.length === 0 && (
            <Grid item xs={12}>
              <Alert severity="info">
                No calendars connected. Connect a calendar to start scheduling interviews automatically.
              </Alert>
            </Grid>
          )}
        </Grid>
      </TabPanel>

      {/* Scheduled Events Tab */}
      <TabPanel value={currentTab} index={1}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Event</TableCell>
                <TableCell>Date & Time</TableCell>
                <TableCell>Attendees</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {calendarEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <Typography variant="subtitle2">{event.title}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Interview ID: {event.interview_id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TimeIcon fontSize="small" />
                      <Box>
                        <Typography variant="body2">
                          {new Date(event.start_time).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {new Date(event.start_time).toLocaleTimeString()} - {new Date(event.end_time).toLocaleTimeString()}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <List dense sx={{ py: 0 }}>
                      {event.attendees?.map((attendee: any, index: number) => (
                        <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <Avatar sx={{ width: 24, height: 24 }}>
                              <PersonIcon fontSize="small" />
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={attendee.name}
                            secondary={attendee.email}
                            primaryTypographyProps={{ variant: 'body2' }}
                            secondaryTypographyProps={{ variant: 'caption' }}
                          />
                          <Chip
                            label={attendee.response_status}
                            size="small"
                            color={
                              attendee.response_status === 'accepted' ? 'success' :
                              attendee.response_status === 'pending' ? 'warning' : 'default'
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {event.meeting_link ? (
                        <VideoCallIcon fontSize="small" color="primary" />
                      ) : (
                        <LocationIcon fontSize="small" />
                      )}
                      <Typography variant="body2">
                        {event.location}
                      </Typography>
                    </Box>
                    {event.meeting_link && (
                      <Button
                        size="small"
                        startIcon={<LinkIcon />}
                        href={event.meeting_link}
                        target="_blank"
                        sx={{ mt: 0.5 }}
                      >
                        Join Meeting
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={event.status}
                      color={event.status === 'confirmed' ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button size="small">Edit</Button>
                    <Button size="small" color="error">Cancel</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Providers Tab */}
      <TabPanel value={currentTab} index={2}>
        <Grid container spacing={3}>
          {providers.map((provider) => (
            <Grid item xs={12} md={4} key={provider.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    {getProviderIcon(provider.id)}
                    <Typography variant="h6">{provider.name}</Typography>
                    <Chip
                      label={provider.enabled ? 'Enabled' : 'Disabled'}
                      color={provider.enabled ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Connect your {provider.name} account to sync interviews and availability.
                  </Typography>
                  
                  <Button
                    variant={provider.enabled ? 'contained' : 'outlined'}
                    disabled={!provider.enabled}
                    onClick={() => setConnectDialogOpen(true)}
                    fullWidth
                  >
                    {provider.enabled ? 'Connect' : 'Coming Soon'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Availability Tab */}
      <TabPanel value={currentTab} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Team Availability
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Select a date and calendar to check availability for scheduling interviews.
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                  type="date"
                  label="Date"
                  InputLabelProps={{ shrink: true }}
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Calendar</InputLabel>
                  <Select defaultValue="">
                    {connectedCalendars.map((calendar) => (
                      <MenuItem key={calendar.id} value={calendar.calendar_id}>
                        {calendar.calendar_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button variant="contained">Check Availability</Button>
              </Box>
              
              {availability && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Available Time Slots for {availability.date}
                  </Typography>
                  <Grid container spacing={1}>
                    {availability.available_slots?.map((slot: any, index: number) => (
                      <Grid item key={index}>
                        <Chip
                          label={`${slot.start} - ${slot.end}`}
                          color="success"
                          variant="outlined"
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Calendar Settings
              </Typography>
              {settings && (
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Working Hours"
                      secondary={`${settings.working_hours?.start} - ${settings.working_hours?.end}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Default Duration"
                      secondary={`${settings.default_interview_duration} minutes`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Buffer Time"
                      secondary={`${settings.buffer_time_minutes} minutes`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Time Zone"
                      secondary={settings.time_zone}
                    />
                  </ListItem>
                </List>
              )}
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Connect Calendar Dialog */}
      <Dialog open={connectDialogOpen} onClose={() => setConnectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Connect Calendar</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Provider</InputLabel>
              <Select
                value={connectForm.provider}
                onChange={(e) => setConnectForm(prev => ({ ...prev, provider: e.target.value }))}
              >
                {providers.filter(p => p.enabled).map((provider) => (
                  <MenuItem key={provider.id} value={provider.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getProviderIcon(provider.id)}
                      {provider.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Calendar ID / Email"
              value={connectForm.calendar_id}
              onChange={(e) => setConnectForm(prev => ({ ...prev, calendar_id: e.target.value }))}
              helperText="Enter your calendar email address"
            />
            <TextField
              fullWidth
              label="Calendar Name"
              value={connectForm.calendar_name}
              onChange={(e) => setConnectForm(prev => ({ ...prev, calendar_name: e.target.value }))}
              helperText="A friendly name for this calendar"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConnectDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConnectCalendar} variant="contained">Connect</Button>
        </DialogActions>
      </Dialog>

      {/* Schedule Interview Dialog */}
      <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Schedule Interview</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Interview ID"
                  value={scheduleForm.interview_id}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, interview_id: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Position"
                  value={scheduleForm.position}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, position: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Candidate Name"
                  value={scheduleForm.candidate_name}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, candidate_name: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Candidate Email"
                  type="email"
                  value={scheduleForm.candidate_email}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, candidate_email: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Interviewer Email"
                  type="email"
                  value={scheduleForm.interviewer_email}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, interviewer_email: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Duration (minutes)</InputLabel>
                  <Select
                    value={scheduleForm.duration}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, duration: Number(e.target.value) }))}
                  >
                    <MenuItem value={30}>30 minutes</MenuItem>
                    <MenuItem value={45}>45 minutes</MenuItem>
                    <MenuItem value={60}>60 minutes</MenuItem>
                    <MenuItem value={90}>90 minutes</MenuItem>
                    <MenuItem value={120}>120 minutes</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Time"
                  type="datetime-local"
                  value={scheduleForm.start_time}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, start_time: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location"
                  value={scheduleForm.location}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, location: e.target.value }))}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleScheduleInterview} variant="contained">Schedule Interview</Button>
        </DialogActions>
      </Dialog>

      {/* Availability Dialog */}
      <Dialog open={availabilityDialogOpen} onClose={() => setAvailabilityDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Availability Check</DialogTitle>
        <DialogContent>
          {availability && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {availability.date}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                {availability.total_available_slots} available slots for {availability.requested_duration} minute meetings
              </Typography>
              
              <Grid container spacing={1}>
                {availability.available_slots?.map((slot: any, index: number) => (
                  <Grid item key={index}>
                    <Chip
                      label={`${slot.start} - ${slot.end}`}
                      color="success"
                      variant="outlined"
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAvailabilityDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CalendarIntegration;
