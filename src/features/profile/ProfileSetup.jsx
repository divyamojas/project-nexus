// src/features/profile/ProfileSetup.jsx

import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  TextField,
  Typography,
  Alert,
  Container,
  Grid,
  Divider,
  InputAdornment,
  Tooltip,
  Fade,
  LinearProgress,
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import NotesIcon from '@mui/icons-material/Notes';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import { alpha } from '@mui/material/styles';
import { keyframes } from '@mui/system';
import { useAvatarDrop, useProfileSave } from '../../hooks';
import { useUser } from '../../contexts/hooks/useUser';
import { useNavigate } from 'react-router-dom';

export default function ProfileSetup() {
  const { user, userProfile, refresh } = useUser();
  const navigate = useNavigate();
  const [username, setUsername] = useState(userProfile?.username || '');
  const [firstName, setFirstName] = useState(userProfile?.first_name || '');
  const [lastName, setLastName] = useState(userProfile?.last_name || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const isFirstTime = !Boolean(userProfile?.username);

  const {
    avatarFile,
    avatarUrl,
    error: avatarError,
    setAvatarFile,
    setAvatarUrl,
    setError: setAvatarError,
    getRootProps,
    getInputProps,
  } = useAvatarDrop(userProfile?.avatar_url || '', username);

  const { loading, error, success, handleSave } = useProfileSave({
    user,
    username,
    firstName,
    lastName,
    bio,
    avatarFile,
    avatarUrl,
    onComplete: isFirstTime
      ? async () => {
          try {
            await refresh?.();
          } finally {
            navigate('/dashboard', { replace: true });
          }
        }
      : undefined,
    setAvatarError,
    setAvatarFile,
    setAvatarUrl,
  });

  // When the profile loads from DB, initialize the form fields.
  useEffect(() => {
    if (!userProfile) return;
    if (userProfile.username) setUsername(userProfile.username);
    if (userProfile.first_name) setFirstName(userProfile.first_name);
    if (userProfile.last_name) setLastName(userProfile.last_name);
    if (userProfile.bio) setBio(userProfile.bio);
  }, [userProfile]);

  useEffect(() => {
    if (userProfile?.avatar_url) {
      setAvatarUrl(userProfile.avatar_url);
    }
  }, [userProfile?.avatar_url, setAvatarUrl]);

  // Animations and focus glow
  const fadeInUp = keyframes`
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  `;
  const float = keyframes`
    0% { transform: translateY(0); }
    50% { transform: translateY(-2px); }
    100% { transform: translateY(0); }
  `;
  const inputFocusSx = {
    '& .MuiOutlinedInput-root.Mui-focused': {
      boxShadow: (t) => `0 0 0 3px ${alpha(t.palette.primary.main, 0.15)}`,
      transition: 'box-shadow 160ms ease',
    },
  };

  // Profile completeness (basic)
  const total = 4;
  const filled = [username, firstName, lastName, bio].filter(
    (v) => (v || '').trim().length > 0,
  ).length;
  const completeness = Math.round((filled / total) * 100);

  return (
    // Let Layout control page height; avoid extra vh/padding that causes overflow
    <Box sx={{ bgcolor: 'background.default' }}>
      <Container maxWidth="md">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          sx={{
            minHeight: { xs: 'calc(100dvh - 160px)', sm: 'calc(100dvh - 170px)' },
          }}
        >
          <Card
            sx={{
              width: '100%',
              maxWidth: 980,
              borderRadius: 3,
              boxShadow: 3,
              overflow: 'hidden',
              border: (t) => `1px solid ${t.palette.divider}`,
              background: (t) => {
                const paperAlpha = t.palette.mode === 'dark' ? 0.9 : 0.94;
                const baseAlpha = t.palette.mode === 'dark' ? 0.86 : 0.9;
                return `linear-gradient(180deg, ${alpha(t.palette.background.paper, paperAlpha)}, ${alpha(
                  t.palette.background.default,
                  baseAlpha,
                )})`;
              },
              animation: `${fadeInUp} 420ms ease`,
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Grid container spacing={2} alignItems="flex-start" justifyContent="center">
                {/* Avatar + Tips */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box
                      {...getRootProps()}
                      sx={{
                        position: 'relative',
                        cursor: 'pointer',
                        borderRadius: '50%',
                        width: 88,
                        height: 88,
                        border: (t) => `2px solid ${t.palette.divider}`,
                        boxShadow: (t) => `0 6px 16px ${alpha(t.palette.success.main, 0.15)}`,
                        overflow: 'hidden',
                        transition: 'transform 200ms ease',
                        animation: `${float} 5s ease-in-out infinite`,
                        '&:hover': { transform: 'translateY(-3px)' },
                      }}
                    >
                      <input {...getInputProps()} />
                      <Avatar
                        src={avatarUrl}
                        sx={{ width: '100%', height: '100%', bgcolor: 'secondary.main' }}
                      >
                        {!avatarUrl && username ? username[0].toUpperCase() : ''}
                      </Avatar>
                      <Tooltip title="Update photo">
                        <Box
                          sx={{
                            position: 'absolute',
                            right: 6,
                            bottom: 6,
                            bgcolor: (t) => alpha(t.palette.background.paper, 0.8),
                            borderRadius: 2,
                            p: 0.5,
                            display: 'grid',
                            placeItems: 'center',
                            border: (t) => `1px solid ${t.palette.divider}`,
                          }}
                        >
                          <CameraAltOutlinedIcon fontSize="small" />
                        </Box>
                      </Tooltip>
                    </Box>

                    <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
                      Drag & drop or click to upload
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      JPG/PNG/WebP • up to 300 KB
                    </Typography>

                    <Divider sx={{ width: '100%', my: 1.25 }} />
                    <Typography variant="caption" color="text.disabled">
                      Tip: pick a recognizable username so friends can find you.
                    </Typography>
                  </Box>
                </Grid>

                {/* Form */}
                <Grid item xs={12} sx={{ maxWidth: 600, mx: 'auto' }}>
                  <Fade in timeout={400}>
                    <Box>
                      <Typography variant="h5" fontWeight={700} gutterBottom>
                        {isFirstTime ? 'Welcome to Leaflet' : 'Your profile'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {isFirstTime
                          ? 'Set up your profile so friends can find you.'
                          : 'Update your details anytime.'}
                      </Typography>

                      {/* Completeness */}
                      <Box sx={{ mb: 1.25 }}>
                        <Typography variant="caption" color="text.secondary">
                          Profile completeness: {completeness}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={completeness}
                          sx={{ mt: 0.5, height: 6, borderRadius: 3 }}
                          color={completeness === 100 ? 'success' : 'secondary'}
                        />
                      </Box>

                      <form onSubmit={handleSave}>
                        <Stack spacing={1.25}>
                          <TextField
                            label="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            fullWidth
                            placeholder="e.g. alex_reader"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <PersonOutlineIcon fontSize="small" />
                                </InputAdornment>
                              ),
                            }}
                            sx={inputFocusSx}
                          />

                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                label="First Name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                fullWidth
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <BadgeOutlinedIcon fontSize="small" />
                                    </InputAdornment>
                                  ),
                                }}
                                sx={inputFocusSx}
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                label="Last Name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                fullWidth
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <BadgeOutlinedIcon fontSize="small" />
                                    </InputAdornment>
                                  ),
                                }}
                                sx={inputFocusSx}
                              />
                            </Grid>
                          </Grid>

                          <TextField
                            label="Short Bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            fullWidth
                            multiline
                            minRows={2}
                            placeholder="A little about yourself..."
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <NotesIcon fontSize="small" />
                                </InputAdornment>
                              ),
                            }}
                            sx={inputFocusSx}
                          />

                          {avatarError && <Alert severity="error">{avatarError}</Alert>}
                          {error && <Alert severity="error">{error}</Alert>}
                          {success && <Alert severity="success">{success}</Alert>}

                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              mt: 0.5,
                            }}
                          >
                            <Button
                              type="submit"
                              variant="contained"
                              color="primary"
                              size="large"
                              disabled={loading}
                              sx={{
                                borderRadius: 2.5,
                                minWidth: 200,
                                px: 2,
                                py: 0.9,
                                backgroundImage: (t) =>
                                  `linear-gradient(90deg, ${
                                    t.palette.mode === 'dark'
                                      ? t.palette.success.dark
                                      : t.palette.success.main
                                  }, ${
                                    t.palette.mode === 'dark'
                                      ? t.palette.primary.dark
                                      : t.palette.primary.main
                                  })`,
                                boxShadow: 4,
                                transition:
                                  'transform 150ms ease, box-shadow 150ms ease, filter 120ms ease',
                                '&:hover': {
                                  transform: 'translateY(-1px)',
                                  boxShadow: 6,
                                  filter: 'brightness(1.04)',
                                },
                              }}
                              onSubmit={handleSave}
                            >
                              {loading ? (
                                <CircularProgress size={24} color="inherit" />
                              ) : (
                                'Save changes'
                              )}
                            </Button>
                            {!isFirstTime && (
                              <Button
                                variant="text"
                                color="inherit"
                                onClick={() => navigate('/dashboard')}
                                sx={{ textDecoration: 'underline', mt: 1 }}
                              >
                                Back to dashboard
                              </Button>
                            )}
                          </Box>
                          {isFirstTime && (
                            <Typography variant="caption" color="text.disabled">
                              A username is required to continue.
                            </Typography>
                          )}
                        </Stack>
                      </form>
                    </Box>
                  </Fade>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
}
