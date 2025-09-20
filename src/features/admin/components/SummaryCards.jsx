import { Box, Paper, Typography } from '@mui/material';

export default function SummaryCards({ approvalCounts, loading, isSuperAdmin }) {
  if (loading) return null;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(1, minmax(0, 1fr))',
          sm: 'repeat(2, minmax(0, 1fr))',
          md: 'repeat(3, minmax(0, 1fr))',
          lg: isSuperAdmin ? 'repeat(4, minmax(0, 1fr))' : 'repeat(3, minmax(0, 1fr))',
        },
        gap: 2,
      }}
    >
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Total Members
        </Typography>
        <Typography variant="h5" fontWeight={700}>
          {approvalCounts.total}
        </Typography>
      </Paper>
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Pending Approval
        </Typography>
        <Typography variant="h5" fontWeight={700} color="warning.main">
          {approvalCounts.pending}
        </Typography>
      </Paper>
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Approved Members
        </Typography>
        <Typography variant="h5" fontWeight={700} color="success.main">
          {approvalCounts.approved}
        </Typography>
      </Paper>
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Rejected Accounts
        </Typography>
        <Typography variant="h5" fontWeight={700} color="error.main">
          {approvalCounts.rejected}
        </Typography>
      </Paper>
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Admins
        </Typography>
        <Typography variant="h5" fontWeight={700}>
          {approvalCounts.admins}
        </Typography>
      </Paper>
      {isSuperAdmin && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Super Admins
          </Typography>
          <Typography variant="h5" fontWeight={700}>
            {approvalCounts.superAdmins}
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
