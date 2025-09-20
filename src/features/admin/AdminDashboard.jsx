// src/features/admin/AdminDashboard.jsx

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

import {
  listUsers,
  updateUserRole,
  updateUserApprovalStatus,
  approveUserAccount,
  rejectUserAccount,
  deleteUserAccount,
  getAllBooks,
  getAllBookRequests,
  getAllBookLoans,
  setBookArchived,
  setRequestStatus,
  completeLoan,
} from '@/services';
import useRole from '@/contexts/hooks/useRole';
import { useUser } from '@/contexts/hooks/useUser';
import { useSnackbar } from '@/components/providers/useSnackbar';
import SummaryCards from './components/SummaryCards.jsx';
import ApprovalQueueTable from './components/ApprovalQueueTable.jsx';
import UserManagementTable from './components/UserManagementTable.jsx';
import BooksTable from './components/BooksTable.jsx';
import RequestsTable from './components/RequestsTable.jsx';
import LoansTable from './components/LoansTable.jsx';

export default function AdminDashboard() {
  const { isAdmin, isSuperAdmin } = useRole();
  const { user } = useUser();
  const { showToast } = useSnackbar();

  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');

  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loans, setLoans] = useState([]);

  const [usersLoading, setUsersLoading] = useState(false);
  const [booksLoading, setBooksLoading] = useState(false);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [loansLoading, setLoansLoading] = useState(false);

  const [roleLoadingMap, setRoleLoadingMap] = useState({});
  const [approvalLoadingMap, setApprovalLoadingMap] = useState({});

  const fetchUsers = useCallback(async () => {
    if (!isAdmin) {
      setUsers([]);
      return;
    }

    setUsersLoading(true);
    try {
      const userRows = await listUsers();
      const visibleRows = isSuperAdmin
        ? userRows
        : userRows.filter((row) => row.role !== 'super_admin');
      setUsers(visibleRows.map((row) => ({ ...row, fullName: row.fullName || '' })));
    } catch (err) {
      const message = err?.message || 'Failed to load users';
      setError(message);
      showToast(message, { severity: 'error' });
    } finally {
      setUsersLoading(false);
    }
  }, [isAdmin, isSuperAdmin, showToast]);

  const fetchBooks = useCallback(async () => {
    if (!isAdmin) {
      setBooks([]);
      return;
    }
    setBooksLoading(true);
    try {
      const bookRows = await getAllBooks();
      setBooks(bookRows ?? []);
    } catch (err) {
      const message = err?.message || 'Failed to load books';
      setError(message);
      showToast(message, { severity: 'error' });
    } finally {
      setBooksLoading(false);
    }
  }, [isAdmin, showToast]);

  const fetchRequests = useCallback(async () => {
    if (!isAdmin) {
      setRequests([]);
      return;
    }
    setRequestsLoading(true);
    try {
      const requestRows = await getAllBookRequests();
      setRequests(requestRows ?? []);
    } catch (err) {
      const message = err?.message || 'Failed to load requests';
      setError(message);
      showToast(message, { severity: 'error' });
    } finally {
      setRequestsLoading(false);
    }
  }, [isAdmin, showToast]);

  const fetchLoans = useCallback(async () => {
    if (!isAdmin) {
      setLoans([]);
      return;
    }
    setLoansLoading(true);
    try {
      const loanRows = await getAllBookLoans();
      setLoans(loanRows ?? []);
    } catch (err) {
      const message = err?.message || 'Failed to load loans';
      setError(message);
      showToast(message, { severity: 'error' });
    } finally {
      setLoansLoading(false);
    }
  }, [isAdmin, showToast]);

  const loadData = useCallback(async () => {
    if (!isAdmin) return;
    setPageLoading(true);
    setError('');
    await Promise.allSettled([fetchUsers(), fetchBooks(), fetchRequests(), fetchLoans()]);
    setPageLoading(false);
  }, [isAdmin, fetchUsers, fetchBooks, fetchRequests, fetchLoans]);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    } else {
      setPageLoading(false);
    }
  }, [isAdmin, loadData]);

  const setRoleLoading = useCallback((userId, value) => {
    setRoleLoadingMap((prev) => ({ ...prev, [userId]: value }));
  }, []);

  const setApprovalLoading = useCallback((userId, value) => {
    setApprovalLoadingMap((prev) => ({ ...prev, [userId]: value }));
  }, []);

  const handleRoleChange = async (userRow, nextRole) => {
    const userId = userRow.id;
    const currentRole = userRow.role;

    if (!isSuperAdmin) {
      const canPromote = currentRole === 'user' && nextRole === 'admin';
      if (!canPromote) {
        showToast('Only super administrators can change roles beyond promoting a user to admin.', {
          severity: 'info',
        });
        return;
      }
    }

    if (currentRole === nextRole) return;

    setRoleLoading(userId, true);
    try {
      await updateUserRole(userId, nextRole);
      showToast('Role updated', { severity: 'success' });
      await fetchUsers();
    } catch (err) {
      showToast(err?.message || 'Failed to update role', { severity: 'error' });
    } finally {
      setRoleLoading(userId, false);
    }
  };

  const handleToggleArchive = async (book) => {
    try {
      await setBookArchived(book.id, !book.archived);
      showToast(`Book ${book.archived ? 'restored' : 'archived'}`, { severity: 'info' });
      await fetchBooks();
    } catch (err) {
      showToast(err?.message || 'Failed to update book', { severity: 'error' });
    }
  };

  const handleRequestStatus = async (requestRow, status) => {
    try {
      await setRequestStatus(requestRow.id, status);
      showToast('Request updated', { severity: 'success' });
      await fetchRequests();
    } catch (err) {
      showToast(err?.message || 'Failed to update request', { severity: 'error' });
    }
  };

  const handleCompleteLoan = async (loanRow) => {
    try {
      await completeLoan(loanRow.id);
      showToast('Loan marked as returned', { severity: 'success' });
      await fetchLoans();
    } catch (err) {
      showToast(err?.message || 'Failed to update loan', { severity: 'error' });
    }
  };

  const handleApprovalAction = async (userRow, action, successMessage) => {
    const userId = userRow.id;
    setApprovalLoading(userId, true);
    try {
      await action();
      showToast(successMessage, { severity: 'success' });
      await fetchUsers();
    } catch (err) {
      showToast(err?.message || 'Failed to update approval status', { severity: 'error' });
    } finally {
      setApprovalLoading(userId, false);
    }
  };

  const approveUser = (userRow) =>
    handleApprovalAction(userRow, () => approveUserAccount(userRow.id), 'User approved');
  const rejectUser = (userRow) =>
    handleApprovalAction(userRow, () => rejectUserAccount(userRow.id), 'User rejected');
  const resetApproval = (userRow) =>
    handleApprovalAction(
      userRow,
      () => updateUserApprovalStatus(userRow.id, 'pending'),
      'User moved to pending',
    );
  const deleteUser = async (userRow) => {
    const userId = userRow.id;
    setApprovalLoading(userId, true);
    try {
      await deleteUserAccount(userId);
      showToast('User deleted', { severity: 'success' });
      await fetchUsers();
    } catch (err) {
      showToast(err?.message || 'Failed to delete user', { severity: 'error' });
    } finally {
      setApprovalLoading(userId, false);
    }
  };

  const profileLookup = useMemo(() => {
    const map = new Map();
    users.forEach((profile) => {
      map.set(profile.id, profile);
    });
    return map;
  }, [users]);

  const approvalCounts = useMemo(() => {
    return users.reduce(
      (acc, userRow) => {
        const status = userRow.approvalStatus || 'pending';
        acc.total += 1;
        acc[status] = (acc[status] || 0) + 1;
        if (userRow.role === 'admin') acc.admins += 1;
        if (userRow.role === 'super_admin') acc.superAdmins += 1;
        return acc;
      },
      { total: 0, pending: 0, approved: 0, rejected: 0, admins: 0, superAdmins: 0 },
    );
  }, [users]);

  const booksForTable = useMemo(
    () =>
      books.map((book) => ({
        ...book,
        title: book.catalog?.title || 'Untitled',
        author: book.catalog?.author || 'Unknown',
        profile: profileLookup.get(book.user_id) || null,
        createdAt: book.created_at || null,
      })),
    [books, profileLookup],
  );

  const requestsForTable = useMemo(
    () =>
      requests.map((req) => ({
        ...req,
        bookTitle: req.book?.catalog?.title || 'Untitled',
        requester: profileLookup.get(req.requested_by) || null,
        owner: profileLookup.get(req.requested_to) || null,
        createdAt: req.created_at || null,
      })),
    [requests, profileLookup],
  );

  const loansForTable = useMemo(
    () =>
      loans.map((loan) => ({
        ...loan,
        bookTitle: loan.book?.catalog?.title || 'Untitled',
        borrower: profileLookup.get(loan.borrower_id) || null,
        lender: profileLookup.get(loan.lender_id) || null,
        dueDate: loan.due_date || null,
      })),
    [loans, profileLookup],
  );

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
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
        <Typography variant="h4" fontWeight={700}>
          Admin Dashboard
        </Typography>
        <Tooltip title="Refresh all">
          <span>
            <IconButton onClick={loadData} disabled={pageLoading} size="small">
              <RefreshIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      <SummaryCards
        approvalCounts={approvalCounts}
        loading={pageLoading}
        isSuperAdmin={isSuperAdmin}
      />

      {!pageLoading && error && <Typography color="error">{error}</Typography>}

      {pageLoading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <ApprovalQueueTable
            users={users}
            loading={usersLoading}
            actionLoadingMap={approvalLoadingMap}
            onRefresh={fetchUsers}
            onKeepPending={resetApproval}
            onApprove={approveUser}
            onReject={rejectUser}
            onDelete={deleteUser}
          />

          <UserManagementTable
            users={users}
            loading={usersLoading}
            approvalLoadingMap={approvalLoadingMap}
            roleLoadingMap={roleLoadingMap}
            currentUserId={user?.id}
            isSuperAdmin={isSuperAdmin}
            onRefresh={fetchUsers}
            onResetApproval={resetApproval}
            onApprove={approveUser}
            onReject={rejectUser}
            onDelete={deleteUser}
            onRoleChange={handleRoleChange}
          />

          <BooksTable
            books={booksForTable}
            loading={booksLoading}
            onToggleArchive={handleToggleArchive}
            onRefresh={fetchBooks}
          />

          <RequestsTable
            requests={requestsForTable}
            loading={requestsLoading}
            onRefresh={fetchRequests}
            onUpdateStatus={handleRequestStatus}
          />

          <LoansTable
            loans={loansForTable}
            loading={loansLoading}
            onRefresh={fetchLoans}
            onMarkReturned={handleCompleteLoan}
          />
        </>
      )}

      {!pageLoading && (
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
