// src/commonComponents/Layout.jsx

import { useEffect, useMemo, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  useTheme,
  Avatar,
  Fab,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '@/services/authService';
import { useColorMode } from '@/theme/useColorMode';
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import RateReviewIcon from '@mui/icons-material/RateReview';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { alpha } from '@mui/material/styles';
import SpaIcon from '@mui/icons-material/Spa';
import { keyframes } from '@mui/system';
import { useUser } from '@/contexts/hooks/useUser';
import useRole from '@/contexts/hooks/useRole';

export default function Layout({ children }) {
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const muiTheme = useTheme();
  const { toggleColorMode } = useColorMode();
  const { userProfile } = useUser();
  const { isAdmin } = useRole();
  const canNavigate = !!(userProfile && userProfile.username);
  const isProfile = location.pathname === '/profile';

  const isActive = useMemo(() => {
    return (path) => (location.pathname === path ? 'active' : '');
  }, [location.pathname]);

  // Subtle text gradient sheen and leaf wiggle animations
  const sheen = keyframes`
    0% { background-position: 0% 50%; }
    100% { background-position: 100% 50%; }
  `;
  const leafWiggle = keyframes`
    0% { transform: rotate(0deg); }
    25% { transform: rotate(-10deg); }
    50% { transform: rotate(8deg); }
    75% { transform: rotate(-6deg); }
    100% { transform: rotate(0deg); }
  `;

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
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileMenuOpen = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <AppBar
        position="fixed"
        color="transparent"
        sx={{
          backdropFilter: 'blur(10px)',
          backgroundColor: (t) => alpha(t.palette.background.paper, 0.7),
          transition:
            'transform 0.28s ease, box-shadow 0.28s ease, opacity 0.28s ease, background 0.3s ease',
          transform: showNavbar ? 'translateY(0)' : 'translateY(-100%)',
          opacity: showNavbar ? 1 : 0.9,
          boxShadow: showNavbar ? 3 : 0,
          zIndex: (theme) => theme.zIndex.drawer + 1,
          borderBottom: `1px solid ${alpha(muiTheme.palette.divider, 0.4)}`,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box
            component={Link}
            to={canNavigate ? '/dashboard' : '/profile'}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              textDecoration: 'none',
              color: 'inherit',
              '&:hover .brand-leaf': { animation: `${leafWiggle} 600ms ease` },
            }}
          >
            <Box
              className="brand-leaf"
              sx={{
                width: 30,
                height: 30,
                borderRadius: '999px',
                display: 'grid',
                placeItems: 'center',
                border: `2px solid ${alpha(muiTheme.palette.success.main, 0.7)}`,
                boxShadow: `0 2px 8px ${alpha(muiTheme.palette.success.main, 0.25)}`,
                backgroundColor: alpha(
                  muiTheme.palette.mode === 'dark'
                    ? muiTheme.palette.success.dark
                    : muiTheme.palette.success.light,
                  0.12,
                ),
                transition: 'transform 200ms ease',
              }}
            >
              <SpaIcon fontSize="small" sx={{ color: 'success.main' }} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                letterSpacing: 0.3,
                background: `linear-gradient(90deg, ${muiTheme.palette.primary.main}, ${muiTheme.palette.success.main})`,
                backgroundSize: '200% 100%',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                animation: `${sheen} 6s ease-in-out infinite`,
                textShadow: `0 1px 1px ${alpha(muiTheme.palette.background.default, 0.3)}`,
              }}
            >
              Leaflet
            </Typography>
          </Box>

          <Box display={{ xs: 'none', sm: 'flex' }} gap={1} alignItems="center">
            <Tooltip title="Dashboard">
              <span>
                <IconButton
                  color={isActive('/dashboard') ? 'primary' : 'inherit'}
                  component={Link}
                  to="/dashboard"
                  disabled={!canNavigate}
                  sx={{
                    transition: 'transform 150ms ease',
                    '&:hover': { transform: 'translateY(-2px)' },
                  }}
                >
                  <SpaceDashboardIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Browse">
              <span>
                <IconButton
                  color={isActive('/browse') ? 'primary' : 'inherit'}
                  component={Link}
                  to="/browse"
                  disabled={!canNavigate}
                  sx={{
                    transition: 'transform 150ms ease',
                    '&:hover': { transform: 'translateY(-2px)' },
                  }}
                >
                  <AutoStoriesIcon />
                </IconButton>
              </span>
            </Tooltip>
            {isAdmin && (
              <Tooltip title="Admin">
                <span>
                  <IconButton
                    color={isActive('/admin') ? 'primary' : 'inherit'}
                    component={Link}
                    to="/admin"
                    sx={{
                      transition: 'transform 150ms ease',
                      '&:hover': { transform: 'translateY(-2px)' },
                    }}
                  >
                    <AdminPanelSettingsIcon />
                  </IconButton>
                </span>
              </Tooltip>
            )}
            <Tooltip title={muiTheme.palette.mode === 'dark' ? 'Light mode' : 'Dark mode'}>
              <IconButton
                color="inherit"
                onClick={toggleColorMode}
                aria-label="Toggle color mode"
                sx={{
                  transition: 'transform 150ms ease',
                  '&:hover': { transform: 'translateY(-2px)' },
                }}
              >
                {muiTheme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>
            <Box
              sx={{
                ml: 1.5,
                pl: 1.5,
                borderLeft: `1px solid ${alpha(muiTheme.palette.divider, 0.6)}`,
              }}
            >
              <Tooltip title="Account">
                <IconButton
                  color="inherit"
                  onClick={handleProfileMenuOpen}
                  aria-haspopup="true"
                  aria-controls={profileAnchorEl ? 'account-menu' : undefined}
                  aria-expanded={Boolean(profileAnchorEl) || undefined}
                  sx={{
                    transition: 'transform 150ms ease',
                    '&:hover': { transform: 'translateY(-2px)' },
                  }}
                >
                  {userProfile?.avatar_url ? (
                    <Avatar
                      src={userProfile.avatar_url}
                      alt="Profile"
                      sx={{
                        width: 28,
                        height: 28,
                        border: '2px solid',
                        borderColor: alpha(muiTheme.palette.primary.main, 0.6),
                        boxShadow: 2,
                      }}
                    />
                  ) : (
                    <AccountCircleIcon />
                  )}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Box display={{ xs: 'block', sm: 'none' }}>
            <IconButton color="inherit" onClick={handleMenuOpen}>
              <MenuIcon />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              <MenuItem component={Link} to="/profile" onClick={handleMenuClose}>
                Profile
              </MenuItem>
              <MenuItem
                component={Link}
                to="/dashboard"
                onClick={handleMenuClose}
                disabled={!canNavigate}
              >
                Dashboard
              </MenuItem>
              <MenuItem
                component={Link}
                to="/browse"
                onClick={handleMenuClose}
                disabled={!canNavigate}
              >
                Browse
              </MenuItem>
              {isAdmin && (
                <MenuItem component={Link} to="/admin" onClick={handleMenuClose}>
                  Admin
                </MenuItem>
              )}
              <MenuItem
                onClick={() => {
                  toggleColorMode();
                  handleMenuClose();
                }}
              >
                {muiTheme.palette.mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
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

      {/* Profile dropdown menu (desktop) */}
      <Menu
        id="account-menu"
        anchorEl={profileAnchorEl}
        open={Boolean(profileAnchorEl)}
        onClose={handleProfileMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => {
            handleProfileMenuClose();
            navigate('/profile');
          }}
        >
          Profile
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleProfileMenuClose();
            handleLogout();
          }}
        >
          Logout
        </MenuItem>
      </Menu>

      {location.pathname !== '/feedback' && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1300,
          }}
        >
          <Tooltip title="Give Feedback">
            <Fab
              color="secondary"
              aria-label="Feedback"
              onClick={() => navigate('/feedback')}
              sx={{
                boxShadow: 6,
                transform: 'translateZ(0)',
                transition: 'transform 180ms ease',
                '&:hover': { transform: 'translateY(-2px)' },
              }}
            >
              <RateReviewIcon />
            </Fab>
          </Tooltip>
        </Box>
      )}

      <Container sx={{ flexGrow: 1, py: isProfile ? { xs: 1, sm: 2 } : 4, mt: isProfile ? 7 : 8 }}>
        {children}
      </Container>

      <Box
        component="footer"
        mt="auto"
        sx={{
          py: isProfile ? 1.25 : 2,
          textAlign: 'center',
          bgcolor: (t) => t.palette.background.paper,
          borderTop: (t) => `1px solid ${alpha(t.palette.divider, 0.6)}`,
        }}
      >
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
