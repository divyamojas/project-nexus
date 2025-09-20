import {
  Button,
  ButtonGroup,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Tooltip,
  IconButton,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ProfilePreview from './ProfilePreview.jsx';

export default function ApprovalQueueTable({
  users,
  loading,
  actionLoadingMap,
  onRefresh,
  onKeepPending,
  onApprove,
  onReject,
  onDelete,
}) {
  const pendingUsers = users.filter((user) => (user.approvalStatus || 'pending') === 'pending');

  return (
    <Paper sx={{ p: 3 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', md: 'center' }}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Stack spacing={0.5}>
          <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
            Approval Queue
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review and approve new members. Approved accounts instantly gain the permissions tied to
            their roles.
          </Typography>
        </Stack>
        <Tooltip title="Refresh approvals">
          <span>
            <IconButton onClick={onRefresh} disabled={loading} size="small">
              <RefreshIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Username</TableCell>
            <TableCell>Requested At</TableCell>
            <TableCell>Approval</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading && (
            <TableRow>
              <TableCell colSpan={4} align="center">
                <CircularProgress size={24} />
              </TableCell>
            </TableRow>
          )}
          {!loading && pendingUsers.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} align="center">
                <Typography variant="body2" color="text.secondary">
                  No pending approvals.
                </Typography>
              </TableCell>
            </TableRow>
          )}
          {!loading &&
            pendingUsers.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>
                  <ProfilePreview profile={user} />
                </TableCell>
                <TableCell>
                  {user.createdAt ? new Date(user.createdAt).toLocaleString() : '—'}
                </TableCell>
                <TableCell>
                  <Chip size="small" label={user.approvalStatus || 'pending'} color="warning" />
                </TableCell>
                <TableCell align="right">
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={1}
                    justifyContent="flex-end"
                  >
                    <ButtonGroup size="small" variant="outlined">
                      <Button
                        onClick={() => onKeepPending(user)}
                        disabled={actionLoadingMap[user.id]}
                      >
                        Keep Pending
                      </Button>
                      <Button
                        onClick={() => onApprove(user)}
                        color="success"
                        disabled={actionLoadingMap[user.id]}
                      >
                        Approve
                      </Button>
                      <Button
                        onClick={() => onReject(user)}
                        color="error"
                        disabled={actionLoadingMap[user.id]}
                      >
                        Reject
                      </Button>
                    </ButtonGroup>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      disabled={actionLoadingMap[user.id]}
                      onClick={() => onDelete(user)}
                    >
                      Delete
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
