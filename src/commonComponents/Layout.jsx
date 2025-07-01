// src/layouts/Layout.jsx

import { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../services/authService';

export default function Layout({ children }) {
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const scrollingUp = currentY - lastScrollY < -10;
      setShowNavbar(scrollingUp || currentY < 50);
      setLastScrollY(currentY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <AppBar
        position="fixed"
        color="primary"
        sx={{
          transition:
            'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out, opacity 0.3s ease-in-out',
          transform: showNavbar ? 'translateY(0)' : 'translateY(-100%)',
          opacity: showNavbar ? 1 : 0.7,
          boxShadow: showNavbar ? 3 : 0,
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography
            variant="h6"
            component={Link}
            to="/dashboard"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            Leaflet
          </Typography>

          <Box display={{ xs: 'none', sm: 'flex' }} gap={2}>
            <Button color="inherit" component={Link} to="/profile">
              Profile
            </Button>
            <Button color="inherit" component={Link} to="/dashboard">
              Dashboard
            </Button>
            <Button color="inherit" component={Link} to="/browse">
              Browse
            </Button>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Box>

          <Box display={{ xs: 'block', sm: 'none' }}>
            <IconButton color="inherit" onClick={handleMenuOpen}>
              <MenuIcon />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              <MenuItem component={Link} to="/profile" onClick={handleMenuClose}>
                Profile
              </MenuItem>
              <MenuItem component={Link} to="/dashboard" onClick={handleMenuClose}>
                Dashboard
              </MenuItem>
              <MenuItem component={Link} to="/browse" onClick={handleMenuClose}>
                Browse
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  handleLogout();
                }}
              >
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {location.pathname !== '/feedback' && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1300,
          }}
        >
          <Button variant="contained" color="secondary" onClick={() => navigate('/feedback')}>
            Give Feedback
          </Button>
        </Box>
      )}

      <Container sx={{ flexGrow: 1, py: 4, mt: 8 }}>{children}</Container>

      <Box component="footer" py={2} textAlign="center" bgcolor="grey.100" mt="auto">
        {location.pathname !== '/feedback' && (
          <Typography variant="body2" color="text.secondary">
            <Link to="/feedback" style={{ color: 'inherit', textDecoration: 'underline' }}>
              Feedback
            </Link>{' '}
            | © {new Date().getFullYear()} Leaflet. All rights reserved.
          </Typography>
        )}
      </Box>
    </Box>
  );
}
