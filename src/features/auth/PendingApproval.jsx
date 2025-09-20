// src/features/auth/PendingApproval.jsx

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Chip, Container, Stack, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';

import { useUser } from '@/contexts/hooks/useUser';

const STATUS_LABELS = {
  pending: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected',
};

export default function PendingApproval() {
  const navigate = useNavigate();
  const {
    firstName,
    approvalStatus = 'pending',
    isRejected = false,
    isPendingApproval = false,
    refresh,
  } = useUser() || {};
  const [refreshing, setRefreshing] = useState(false);

  // If the account is already approved, push the user back to the dashboard.
  useEffect(() => {
    if (approvalStatus === 'approved') {
      navigate('/dashboard', { replace: true });
    }
  }, [approvalStatus, navigate]);

  const greetingName = useMemo(() => {
    if (!firstName) return 'there';
    return firstName.trim().split(' ')[0];
  }, [firstName]);

  const headline = isRejected ? 'Account review update' : 'Thanks for joining Leaflet!';
  const description = isRejected
    ? `Hi ${greetingName}, your signup request has been rejected. Please reach out to an administrator if you believe this was in error.`
    : `Hi ${greetingName}, your account is under review. You will receive an email once an administrator approves it. You can update your profile at any time to help the review process.`;

  const alertSeverity = isRejected ? 'error' : 'info';

  const handleEditProfile = () => {
    navigate('/profile');
  };

  const handleRefreshStatus = async () => {
    if (!refresh || refreshing) return;
    try {
      setRefreshing(true);
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };

  const showPendingMessage = isPendingApproval || approvalStatus === 'pending';

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Stack spacing={4} alignItems="stretch">
        <Box textAlign="center">
          <Chip
            label={STATUS_LABELS[approvalStatus] || approvalStatus}
            color={isRejected ? 'error' : showPendingMessage ? 'warning' : 'success'}
            variant="outlined"
            sx={{ textTransform: 'uppercase', fontWeight: 600, mb: 2 }}
          />
          <Typography variant="h4" component="h1" gutterBottom>
            {headline}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {description}
          </Typography>
        </Box>

        <Alert severity={alertSeverity} variant="outlined">
          {isRejected
            ? 'Please contact an administrator if you would like the team to reconsider your signup.'
            : 'Approvals are usually processed quickly. You can refresh the status below or try again later.'}
        </Alert>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
          <Button
            onClick={handleEditProfile}
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
          >
            Edit profile
          </Button>
          <Button
            onClick={handleRefreshStatus}
            variant="outlined"
            startIcon={<RefreshIcon />}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing…' : 'Refresh status'}
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}
