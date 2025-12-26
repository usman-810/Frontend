import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerAPI } from '../../api/customers';
import {
  Container, Box, Paper, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress, Alert, Chip,
  TextField, InputAdornment, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, Grid, MenuItem, Pagination
} from '@mui/material';
import {
  ArrowBack, Search, Add, Edit, Delete, Block, CheckCircle,
  Person, Email, Phone, Home
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const ManageCustomers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  useEffect(() => {
    loadCustomers();
  }, [page, searchTerm]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError('');

      let response;
      if (searchTerm) {
        response = await customerAPI.search(searchTerm, page, 10);
      } else {
        response = await customerAPI.getAll(page, 10);
      }

      const data = response?.data?.data?.content || response?.data?.content || response?.data?.data || [];
      setCustomers(Array.isArray(data) ? data : []);
      setTotalPages(response?.data?.data?.totalPages || response?.data?.totalPages || 1);

    } catch (err) {
      console.error('Error loading customers:', err);
      setError('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setViewDialog(true);
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setEditForm({
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      city: customer.city || '',
      state: customer.state || '',
      zipCode: customer.zipCode || ''
    });
    setEditDialog(true);
  };

  const handleUpdateCustomer = async () => {
    setActionLoading(true);
    try {
      await customerAPI.update(selectedCustomer.id, editForm);
      toast.success('Customer updated successfully');
      setEditDialog(false);
      loadCustomers();
    } catch (err) {
      toast.error('Failed to update customer');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCustomer = async () => {
    setActionLoading(true);
    try {
      await customerAPI.delete(selectedCustomer.id);
      toast.success('Customer deleted successfully');
      setDeleteDialog(false);
      loadCustomers();
    } catch (err) {
      toast.error('Failed to delete customer');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (customerId, newStatus) => {
    try {
      await customerAPI.updateStatus(customerId, newStatus);
      toast.success('Customer status updated');
      loadCustomers();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      ACTIVE: 'success',
      INACTIVE: 'warning',
      BLOCKED: 'error'
    };
    return colors[status] || 'default';
  };

  if (loading && page === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: 4 }}>
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/admin/dashboard')}
          >
            Back to Dashboard
          </Button>
        </Box>

        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Customer Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage all customer accounts
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/admin/customers/create')}
            >
              Add Customer
            </Button>
          </Box>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {/* Search */}
        <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Paper>

        {/* Customers Table */}
        <Paper elevation={3}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Phone</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>City</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="text.secondary">No customers found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((customer) => (
                    <TableRow key={customer.id} hover>
                      <TableCell>{customer.id}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="600">
                          {customer.firstName} {customer.lastName}
                        </Typography>
                      </TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell>{customer.city || '-'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={customer.status} 
                          size="small"
                          color={getStatusColor(customer.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleViewCustomer(customer)}
                          >
                            <Person />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="info"
                            onClick={() => handleEditCustomer(customer)}
                          >
                            <Edit />
                          </IconButton>
                          {customer.status === 'ACTIVE' ? (
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleStatusChange(customer.id, 'BLOCKED')}
                            >
                              <Block />
                            </IconButton>
                          ) : (
                            <IconButton 
                              size="small" 
                              color="success"
                              onClick={() => handleStatusChange(customer.id, 'ACTIVE')}
                            >
                              <CheckCircle />
                            </IconButton>
                          )}
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setDeleteDialog(true);
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <Pagination
                count={totalPages}
                page={page + 1}
                onChange={(e, value) => setPage(value - 1)}
                color="primary"
              />
            </Box>
          )}
        </Paper>

        {/* View Customer Dialog */}
        <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Customer Details</DialogTitle>
          <DialogContent>
            {selectedCustomer && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person color="primary" />
                    <Typography variant="body2" color="text.secondary">Name:</Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="600">
                    {selectedCustomer.firstName} {selectedCustomer.lastName}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Email color="primary" />
                    <Typography variant="body2" color="text.secondary">Email:</Typography>
                  </Box>
                  <Typography variant="body1">{selectedCustomer.email}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Phone color="primary" />
                    <Typography variant="body2" color="text.secondary">Phone:</Typography>
                  </Box>
                  <Typography variant="body1">{selectedCustomer.phone}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Home color="primary" />
                    <Typography variant="body2" color="text.secondary">Address:</Typography>
                  </Box>
                  <Typography variant="body1">
                    {selectedCustomer.address || '-'}, {selectedCustomer.city || '-'}, 
                    {selectedCustomer.state || '-'} - {selectedCustomer.zipCode || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Status:</Typography>
                  <Chip 
                    label={selectedCustomer.status} 
                    color={getStatusColor(selectedCustomer.status)}
                    sx={{ mt: 1 }}
                  />
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Edit Customer Dialog */}
        <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Customer</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={editForm.address}
                  onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="City"
                  value={editForm.city}
                  onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="State"
                  value={editForm.state}
                  onChange={(e) => setEditForm({...editForm, state: e.target.value})}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="ZIP Code"
                  value={editForm.zipCode}
                  onChange={(e) => setEditForm({...editForm, zipCode: e.target.value})}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleUpdateCustomer} 
              variant="contained"
              disabled={actionLoading}
            >
              {actionLoading ? <CircularProgress size={20} /> : 'Update'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete customer: {selectedCustomer?.firstName} {selectedCustomer?.lastName}?
            </Typography>
            <Alert severity="warning" sx={{ mt: 2 }}>
              This action cannot be undone!
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleDeleteCustomer} 
              color="error" 
              variant="contained"
              disabled={actionLoading}
            >
              {actionLoading ? <CircularProgress size={20} /> : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default ManageCustomers;