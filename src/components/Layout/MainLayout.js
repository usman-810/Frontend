import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  Box, AppBar, Toolbar, Typography, IconButton, Drawer, List,
  ListItem, ListItemIcon, ListItemText, Avatar, Menu, MenuItem, Divider
} from '@mui/material';
import {
  Menu as MenuIcon, Dashboard, People, CreditCard, Receipt,
  AccountCircle, Logout, Settings
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 240;

const MainLayout = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/admin/dashboard' },
    { text: 'Customers', icon: <People />, path: '/admin/customers' },
    { text: 'Cards', icon: <CreditCard />, path: '/admin/cards' },
    { text: 'Transactions', icon: <Receipt />, path: '/admin/transactions' },
  ];

  const customerMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/customer/dashboard' },
    { text: 'My Cards', icon: <CreditCard />, path: '/customer/cards' },
    { text: 'Transactions', icon: <Receipt />, path: '/customer/transactions' },
    { text: 'Profile', icon: <AccountCircle />, path: '/customer/profile' },
  ];

  const menuItems = isAdmin() ? adminMenuItems : customerMenuItems;

  const drawer = (
    <Box>
      <Toolbar sx={{ bgcolor: 'primary.main', color: 'white' }}>
        <CreditCard sx={{ mr: 1 }} />
        <Typography variant="h6" noWrap>
          {isAdmin() ? 'Admin Panel' : 'My Account'}
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text}
            onClick={() => navigate(item.path)}
            sx={{
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Credit Card Portal
          </Typography>

          <IconButton
            size="large"
            edge="end"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              {user?.firstName?.charAt(0)}
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
      >
        <MenuItem disabled>
          <Typography variant="body2">
            {user?.firstName} {user?.lastName}
          </Typography>
        </MenuItem>
        <MenuItem disabled>
          <Typography variant="caption" color="text.secondary">
            {user?.email}
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => navigate('/profile')}>
          <ListItemIcon><Settings fontSize="small" /></ListItemIcon>
          Settings
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;