import { useState, useMemo } from 'react';
import { Box, Chip, Link, Popover, Stack, Typography } from '@mui/material';

function formatFullName(profile) {
  if (!profile) return '';
  const parts = [
    profile.firstName ?? profile.first_name,
    profile.lastName ?? profile.last_name,
  ].filter(Boolean);
  return parts.join(' ');
}

export default function ProfilePreview({ profile, fallback = '—', align = 'left' }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const username = profile?.username || fallback;
  const fullName = useMemo(() => formatFullName(profile), [profile]);

  const handleOpen = (event) => {
    if (!profile) return;
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  if (!profile) {
    return (
      <Typography component="span" variant="body2" sx={{ fontWeight: 500 }}>
        {fallback}
      </Typography>
    );
  }

  return (
    <>
      <Link
        component="button"
        type="button"
        underline="hover"
        sx={{ fontWeight: 600, textAlign: align, textTransform: 'none' }}
        onClick={handleOpen}
      >
        {username}
      </Link>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, maxWidth: 240 }}>
          <Stack spacing={1.5}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {username}
              </Typography>
              {fullName ? (
                <Typography variant="body2" color="text.secondary">
                  {fullName}
                </Typography>
              ) : null}
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                size="small"
                label={profile?.role || 'unknown'}
                color={
                  profile?.role === 'super_admin'
                    ? 'secondary'
                    : profile?.role === 'admin'
                      ? 'primary'
                      : 'default'
                }
              />
              <Chip
                size="small"
                label={profile?.approvalStatus || profile?.approval_status || 'pending'}
                color={(() => {
                  const status = profile?.approvalStatus || profile?.approval_status;
                  if (status === 'approved') return 'success';
                  if (status === 'rejected') return 'error';
                  return 'warning';
                })()}
                variant="outlined"
              />
            </Stack>
          </Stack>
        </Box>
      </Popover>
    </>
  );
}
