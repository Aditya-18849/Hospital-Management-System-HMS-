import React from 'react'
import { Container, Paper, Typography, Box, Table, TableHead, TableRow, TableCell, TableBody, Button } from '@mui/material'
import { LocalPharmacy, Add, Download } from '@mui/icons-material'

export default function Prescriptions() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">Prescriptions</Typography>
          <Typography variant="body2" color="text.secondary">Pharmacy records and medication tracking.</Typography>
        </Box>
        <Button variant="contained" color="success" startIcon={<Add />}>Issue Prescription</Button>
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Patient</strong></TableCell>
              <TableCell><strong>Doctor</strong></TableCell>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>RX-1001</TableCell>
              <TableCell>Alice Johnson</TableCell>
              <TableCell>Dr. Smith</TableCell>
              <TableCell>Oct 24, 2023</TableCell>
              <TableCell sx={{ color: 'green', fontWeight: 'bold' }}>Dispensed</TableCell>
              <TableCell align="right">
                <Button size="small" startIcon={<Download />}>PDF</Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>RX-1002</TableCell>
              <TableCell>Michael Scott</TableCell>
              <TableCell>Dr. Beesly</TableCell>
              <TableCell>Oct 25, 2023</TableCell>
              <TableCell sx={{ color: 'orange', fontWeight: 'bold' }}>Pending</TableCell>
              <TableCell align="right">
                <Button size="small" startIcon={<LocalPharmacy />}>Dispense</Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>
    </Container>
  )
}