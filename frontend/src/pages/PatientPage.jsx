import React, { useEffect, useState } from 'react'
import { 
  Paper, Typography, Table, TableBody, TableCell, TableHead, TableRow, 
  Button, Dialog, DialogTitle, DialogContent, TextField, Select, MenuItem, 
  FormControl, InputLabel, Box, Avatar, Chip, IconButton, Tooltip, 
  InputAdornment, Skeleton, Snackbar, Alert, Grid, Fade, useTheme 
} from '@mui/material'
import { 
  Add, Search, FilterList, Person, Edit, Visibility, 
  Close, LocalHospital, Phone, Event, Wc 
} from '@mui/icons-material'
import { get, post } from '../services/api'
import { alpha } from '@mui/material/styles'

export default function Patients() {
  const theme = useTheme()
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  // Form State
  const [form, setForm] = useState({ name: '', dob: '', gender: '', type: 'OPD', contactNumber: '' })
  
  // Feedback State
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' })

  const fetchPatients = async () => {
    setLoading(true)
    try {
      const resp = await get('/patients')
      setPatients(Array.isArray(resp.data) ? resp.data : [])
    } catch (err) {
      console.error(err)
      setSnack({ open: true, message: 'Failed to fetch patients', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPatients() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.contactNumber) {
      setSnack({ open: true, message: 'Please fill in required fields', severity: 'warning' })
      return
    }

    setSubmitting(true)
    try {
      await post('/patients', form)
      setSnack({ open: true, message: 'Patient registered successfully', severity: 'success' })
      setOpen(false)
      setForm({ name: '', dob: '', gender: '', type: 'OPD', contactNumber: '' }) // Reset form
      fetchPatients()
    } catch (err) {
      setSnack({ open: true, message: err.response?.data?.message || 'Error adding patient', severity: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  // Filter Logic
  const filteredPatients = patients.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.patientId?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Helper for Chip Colors
  const getTypeColor = (type) => {
    return type === 'IPD' ? 'warning' : 'info'
  }

  return (
    <Fade in={true} timeout={600}>
      <Box sx={{ width: '100%' }}>
        
        {/* --- Header Section --- */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Patient Registry
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage patient records, admissions, and history.
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<Add />} 
            onClick={() => setOpen(true)}
            sx={{ borderRadius: 2, px: 3, py: 1, fontWeight: 'bold', boxShadow: theme.shadows[4] }}
          >
            New Patient
          </Button>
        </Box>

        {/* --- Toolbar & Search --- */}
        <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: 'background.paper', borderRadius: 2, border: `1px solid ${theme.palette.divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: { xs: '100%', sm: 300 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Tooltip title="Filter list">
            <IconButton>
              <FilterList />
            </IconButton>
          </Tooltip>
        </Paper>

        {/* --- Data Table --- */}
        <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Patient Info</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Patient ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Contact</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                // Skeleton Loading State
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Box sx={{ display: 'flex', gap: 2 }}><Skeleton variant="circular" width={40} height={40} /><Box><Skeleton width={100} /><Skeleton width={60} /></Box></Box></TableCell>
                    <TableCell><Skeleton width={80} /></TableCell>
                    <TableCell><Skeleton width={60} /></TableCell>
                    <TableCell><Skeleton width={100} /></TableCell>
                    <TableCell align="right"><Skeleton width={40} /></TableCell>
                  </TableRow>
                ))
              ) : filteredPatients.length > 0 ? (
                // Real Data
                filteredPatients.map((p) => (
                  <TableRow key={p._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: theme.palette.primary.light, color: 'white' }}>
                          {p.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">{p.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{new Date(p.createdAt).toLocaleDateString()}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={p.patientId} size="small" variant="outlined" sx={{ borderRadius: 1, fontFamily: 'monospace' }} />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={p.type} 
                        size="small" 
                        color={getTypeColor(p.type)}
                        sx={{ fontWeight: 'bold', minWidth: 60 }} 
                      />
                    </TableCell>
                    <TableCell>{p.contactNumber}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton size="small" color="primary">
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" sx={{ ml: 1 }}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                // Empty State
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Person sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                    <Typography color="text.secondary">No patients found.</Typography>
                    {searchTerm && <Button size="small" onClick={() => setSearchTerm('')}>Clear Search</Button>}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>

        {/* --- Add Patient Dialog --- */}
        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Register New Patient
            <IconButton onClick={() => setOpen(false)} size="small">
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2} sx={{ mt: 0 }}>
                <Grid item xs={12}>
                  <TextField 
                    fullWidth 
                    label="Full Name" 
                    required 
                    value={form.name} 
                    onChange={e => setForm({...form, name: e.target.value})} 
                    InputProps={{ startAdornment: <InputAdornment position="start"><Person fontSize="small" /></InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth 
                    type="date" 
                    label="Date of Birth" 
                    InputLabelProps={{ shrink: true }} 
                    value={form.dob} 
                    onChange={e => setForm({...form, dob: e.target.value})} 
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Gender</InputLabel>
                    <Select 
                      value={form.gender || ''} 
                      label="Gender" 
                      onChange={e => setForm({...form, gender: e.target.value})}
                      startAdornment={<InputAdornment position="start"><Wc fontSize="small" /></InputAdornment>}
                    >
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select 
                      value={form.type} 
                      label="Type" 
                      onChange={e => setForm({...form, type: e.target.value})}
                      startAdornment={<InputAdornment position="start"><LocalHospital fontSize="small" /></InputAdornment>}
                    >
                      <MenuItem value="OPD">OPD (Outpatient)</MenuItem>
                      <MenuItem value="IPD">IPD (Inpatient)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth 
                    label="Contact Number" 
                    required 
                    value={form.contactNumber} 
                    onChange={e => setForm({...form, contactNumber: e.target.value})} 
                    InputProps={{ startAdornment: <InputAdornment position="start"><Phone fontSize="small" /></InputAdornment> }}
                  />
                </Grid>
                
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Button 
                    fullWidth 
                    type="submit" 
                    variant="contained" 
                    size="large"
                    disabled={submitting}
                  >
                    {submitting ? 'Registering...' : 'Register Patient'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </DialogContent>
        </Dialog>

        {/* --- Notifications --- */}
        <Snackbar 
          open={snack.open} 
          autoHideDuration={4000} 
          onClose={() => setSnack({ ...snack, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.severity} variant="filled">
            {snack.message}
          </Alert>
        </Snackbar>

      </Box>
    </Fade>
  )
}