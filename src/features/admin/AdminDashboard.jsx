// src/features/admin/AdminDashboard.jsx

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Chip,
  Divider,
  CircularProgress,
  ButtonGroup,
} from '@mui/material';

import {
  listUsers,
  updateUserRole,
  getAllBooks,
  getAllBookRequests,
  getAllBookLoans,
  setBookArchived,
  setRequestStatus,
  completeLoan,
} from '@/services';
import useRole from '@/contexts/hooks/useRole';
import { useUser } from '@/contexts/hooks/useUser';
import { useSnackbar } from '@/components/providers/SnackbarProvider';

const REQUEST_STATUSES = ['pending', 'accepted', 'rejected', 'cancelled'];

function RoleChip({ role }) {
  const color = useMemo(() => {
    if (role === 'super_admin') return 'secondary';
    if (role === 'admin') return 'primary';
    return 'default';
  }, [role]);

  return <Chip size="small" label={role} color={color} />;
}

export default function AdminDashboard() {
  const { isAdmin, isSuperAdmin } = useRole();
  const { user } = useUser();
  const { showToast } = useSnackbar();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loans, setLoans] = useState([]);

  const loadData = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError('');
    try {
      const [userRows, bookRows, requestRows, loanRows] = await Promise.all([
        listUsers(),
        getAllBooks(),
        getAllBookRequests(),
        getAllBookLoans(),
      ]);
      setUsers(userRows);
      setBooks(bookRows);
      setRequests(requestRows);
      setLoans(loanRows);
    } catch (err) {
      setError(err?.message || 'Failed to load admin data');
      showToast('Failed to load admin data', { severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [isAdmin, showToast]);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin, loadData]);

  const handleRoleChange = async (userId, nextRole) => {
    try {
      await updateUserRole(userId, nextRole);
      showToast('Role updated', { severity: 'success' });
      loadData();
    } catch (err) {
      showToast(err?.message || 'Failed to update role', { severity: 'error' });
    }
  };

  const handleToggleArchive = async (book) => {
    try {
      await setBookArchived(book.id, !book.archived);
      showToast(`Book ${book.archived ? 'restored' : 'archived'}`, { severity: 'info' });
      loadData();
    } catch (err) {
      showToast(err?.message || 'Failed to update book', { severity: 'error' });
    }
  };

  const handleRequestStatus = async (requestId, status) => {
    try {
      await setRequestStatus(requestId, status);
      showToast('Request updated', { severity: 'success' });
      loadData();
    } catch (err) {
      showToast(err?.message || 'Failed to update request', { severity: 'error' });
    }
  };

  const handleCompleteLoan = async (loanId) => {
    try {
      await completeLoan(loanId);
      showToast('Loan marked as returned', { severity: 'success' });
      loadData();
    } catch (err) {
      showToast(err?.message || 'Failed to update loan', { severity: 'error' });
    }
  };

  const profileLookup = useMemo(() => {
    const map = new Map();
    users.forEach((profile) => {
      map.set(profile.id, profile);
    });
    return map;
  }, [users]);

  const formatName = useCallback((profile, fallback) => {
    if (!profile) return fallback || '—';
    if (profile.firstName || profile.lastName) {
      const parts = [profile.firstName, profile.lastName].filter(Boolean);
      if (parts.length) return parts.join(' ');
    }
    return profile.username || fallback || '—';
  }, []);

  if (!isAdmin) {
    return (
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Admin access required
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your account does not have the required permissions to view this page.
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={3} sx={{ pb: 4 }}>
      <Typography variant="h4" fontWeight={700}>
        Admin Dashboard
      </Typography>

      {loading && (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      )}

      {!loading && error && (
        <Paper sx={{ p: 3 }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      {isSuperAdmin && !loading && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            User Management
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Promote or demote members. Only super administrators can manage roles.
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((row) => {
                const fullName =
                  row.firstName || row.lastName
                    ? `${row.firstName ?? ''} ${row.lastName ?? ''}`.trim()
                    : row.username || '—';
                const isSelf = user?.id === row.id;
                return (
                  <TableRow key={row.id} hover>
                    <TableCell>{fullName}</TableCell>
                    <TableCell>{row.email || '—'}</TableCell>
                    <TableCell>
                      <RoleChip role={row.role} />
                    </TableCell>
                    <TableCell align="right">
                      <ButtonGroup variant="outlined" size="small" disabled={isSelf}>
                        {['user', 'admin', 'super_admin'].map((roleOption) => (
                          <Button
                            key={roleOption}
                            color={row.role === roleOption ? 'primary' : 'inherit'}
                            onClick={() => handleRoleChange(row.id, roleOption)}
                          >
                            {roleOption.replace('_', ' ')}
                          </Button>
                        ))}
                      </ButtonGroup>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      )}

      {!loading && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Book Catalogue Overview
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Author</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {books.map((book) => {
                const owner = profileLookup.get(book.user_id);
                return (
                  <TableRow key={book.id} hover>
                    <TableCell>{book.catalog?.title || 'Untitled'}</TableCell>
                    <TableCell>{book.catalog?.author || 'Unknown'}</TableCell>
                    <TableCell>
                      <Chip
                        label={book.archived ? 'Archived' : book.status}
                        size="small"
                        color={book.archived ? 'default' : 'success'}
                      />
                    </TableCell>
                    <TableCell>{formatName(owner, book.user_id)}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleToggleArchive(book)}
                      >
                        {book.archived ? 'Unarchive' : 'Archive'}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      )}

      {!loading && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Borrow Requests
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Book</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Requester</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell align="right">Moderation</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map((req) => {
                const requester = profileLookup.get(req.requested_by);
                const owner = profileLookup.get(req.requested_to);
                return (
                  <TableRow key={req.id} hover>
                    <TableCell>{req.book?.catalog?.title || 'Untitled'}</TableCell>
                    <TableCell>
                      <Chip
                        label={req.status}
                        size="small"
                        color={
                          req.status === 'accepted'
                            ? 'success'
                            : req.status === 'rejected'
                              ? 'error'
                              : 'default'
                        }
                      />
                    </TableCell>
                    <TableCell>{formatName(requester, req.requested_by)}</TableCell>
                    <TableCell>{formatName(owner, req.requested_to)}</TableCell>
                    <TableCell align="right">
                      <ButtonGroup size="small" variant="outlined">
                        {REQUEST_STATUSES.map((status) => (
                          <Button key={status} onClick={() => handleRequestStatus(req.id, status)}>
                            {status}
                          </Button>
                        ))}
                      </ButtonGroup>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      )}

      {!loading && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Active Loans
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Book</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Borrower</TableCell>
                <TableCell>Lender</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loans.map((loan) => {
                const borrower = profileLookup.get(loan.borrower_id);
                const lender = profileLookup.get(loan.lender_id);
                return (
                  <TableRow key={loan.id} hover>
                    <TableCell>{loan.book?.catalog?.title || 'Untitled'}</TableCell>
                    <TableCell>
                      <Chip
                        label={loan.status}
                        size="small"
                        color={loan.status === 'active' ? 'warning' : 'default'}
                      />
                    </TableCell>
                    <TableCell>{formatName(borrower, loan.borrower_id)}</TableCell>
                    <TableCell>{formatName(lender, loan.lender_id)}</TableCell>
                    <TableCell>
                      {loan.due_date ? new Date(loan.due_date).toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleCompleteLoan(loan.id)}
                        disabled={loan.status !== 'active'}
                      >
                        Mark Returned
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      )}

      {!loading && (
        <Box>
          <Divider sx={{ my: 2 }} />
          <Typography variant="caption" color="text.secondary">
            Administrative changes respect your Supabase role policies. Actions may be limited based
            on your permissions.
          </Typography>
        </Box>
      )}
    </Stack>
  );
}
