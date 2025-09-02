// src/pages/profile/ProfileSetup.jsx

import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Stack,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import { useAvatarDrop, useProfileSave } from '../../hooks';
import { useUser } from '../../contexts/hooks/useUser';

export default function ProfileSetup() {
  const { user, userProfile } = useUser();
  const [username, setUsername] = useState(userProfile?.username || '');
  const [firstName, setFirstName] = useState(userProfile?.first_name || '');
  const [lastName, setLastName] = useState(userProfile?.last_name || '');
  const [bio, setBio] = useState(userProfile?.bio || '');

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
    // onComplete,
    setAvatarError,
    setAvatarFile,
    setAvatarUrl,
  });

  useEffect(() => {
    if (userProfile?.avatar_url) {
      setAvatarUrl(userProfile.avatar_url);
    }
  }, [userProfile?.avatar_url]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#FFF8F1', pt: 6 }}>
      <Grid container justifyContent="center">
        <Grid item xs={12} sm={10} md={6} lg={4}>
          <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Welcome to Leaflet! 📚
              </Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>
                Let’s personalize your reading journey. You can always update these details later.
              </Typography>

              <Box
                {...getRootProps()}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  mb: 2,
                  cursor: 'pointer',
                }}
              >
                <input {...getInputProps()} />
                <Avatar
                  src={avatarUrl}
                  sx={{
                    width: 96,
                    height: 96,
                    mb: 1,
                    bgcolor: '#FFD7BA',
                    fontSize: 40,
                  }}
                >
                  {!avatarUrl && username ? username[0].toUpperCase() : ''}
                </Avatar>
                <Typography variant="caption" sx={{ color: '#888' }}>
                  Drag & drop a profile picture, or click to select <br />
                  JPG/PNG/WebP, max 300 KB.
                </Typography>
              </Box>

              <form onSubmit={handleSave}>
                <Stack spacing={2}>
                  <TextField
                    label="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    fullWidth
                  />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        label="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        fullWidth
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
                  />
                  {avatarError && <Alert severity="error">{avatarError}</Alert>}
                  {error && <Alert severity="error">{error}</Alert>}
                  {success && <Alert severity="success">{success}</Alert>}
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="warning"
                    size="large"
                    disabled={loading}
                    sx={{ bgcolor: '#8d6e63', '&:hover': { bgcolor: '#795548' } }}
                    onSubmit={handleSave}
                  >
                    {loading ? (
                      <CircularProgress size={28} color="inherit" />
                    ) : userProfile ? (
                      'Update Profile'
                    ) : (
                      'Save & Continue'
                    )}
                  </Button>
                  <Typography variant="caption" sx={{ textAlign: 'center', color: '#bbb', mt: 1 }}>
                    You can update your profile anytime from your account.
                  </Typography>
                </Stack>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
