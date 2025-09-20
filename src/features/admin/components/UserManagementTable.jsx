import { useMemo, useState, useEffect } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import RefreshIcon from '@mui/icons-material/Refresh';
import ProfilePreview from './ProfilePreview.jsx';

export default function UserManagementTable({
  users,
  loading,
  approvalLoadingMap,
  roleLoadingMap,
  currentUserId,
  isSuperAdmin,
  onRefresh,
  onResetApproval,
  onApprove,
  onReject,
  onDelete,
  onRoleChange,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ field: 'createdAt', direction: 'desc' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    setPage(0);
  }, [searchTerm, statusFilter, roleFilter, rowsPerPage]);

  const filtered = useMemo(() => {
    let rows = users;
    if (roleFilter !== 'all') {
      rows = rows.filter((row) => row.role === roleFilter);
    }
    if (statusFilter !== 'all') {
      rows = rows.filter((row) => (row.approvalStatus || 'pending') === statusFilter);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      rows = rows.filter((row) => {
        const fields = [row.username, row.fullName, row.email, row.role];
        return fields.some((value) => value && value.toLowerCase().includes(term));
      });
    }
    return rows;
  }, [users, roleFilter, statusFilter, searchTerm]);

  const sorted = useMemo(() => {
    const { field, direction } = sortConfig;
    const multiplier = direction === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (field) {
        case 'username':
          comparison = (a.username || '').localeCompare(b.username || '');
          break;
        case 'approvalStatus':
          comparison = (a.approvalStatus || '').localeCompare(b.approvalStatus || '');
          break;
        case 'role':
          comparison = (a.role || '').localeCompare(b.role || '');
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
          break;
        default:
          comparison = 0;
      }
      return comparison * multiplier;
    });
  }, [filtered, sortConfig]);

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(sorted.length / rowsPerPage) - 1);
    if (page > maxPage) setPage(maxPage);
  }, [sorted.length, page, rowsPerPage]);

  const paginated = useMemo(() => {
    const start = page * rowsPerPage;
    return sorted.slice(start, start + rowsPerPage);
  }, [sorted, page, rowsPerPage]);

  const handleSort = (field) => {
    setSortConfig((prev) =>
      prev.field === field
        ? { field, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { field, direction: 'asc' },
    );
  };

  const handleChangePage = (_event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setRoleFilter('all');
    setSortConfig({ field: 'createdAt', direction: 'desc' });
    setRowsPerPage(10);
    setPage(0);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', md: 'center' }}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
            User Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage member approvals and roles. Role changes remain restricted to super
            administrators.
          </Typography>
        </Box>
        <Tooltip title="Refresh users">
          <span>
            <IconButton onClick={onRefresh} disabled={loading} size="small">
              <RefreshIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', md: 'center' }}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ flex: 1 }}>
          <TextField
            size="small"
            label="Search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            sx={{ minWidth: { xs: '100%', md: 220 } }}
          />
          <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 180 } }}>
            <InputLabel id="approval-filter">Approval</InputLabel>
            <Select
              labelId="approval-filter"
              label="Approval"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 180 } }}>
            <InputLabel id="role-filter">Role</InputLabel>
            <Select
              labelId="role-filter"
              label="Role"
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              {isSuperAdmin && <MenuItem value="super_admin">Super Admin</MenuItem>}
            </Select>
          </FormControl>
        </Stack>
        <Button
          variant="text"
          color="secondary"
          startIcon={<FilterAltOffIcon />}
          onClick={resetFilters}
          sx={{ alignSelf: { xs: 'flex-start', md: 'center' } }}
        >
          Clear filters
        </Button>
      </Stack>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell
              sortDirection={sortConfig.field === 'username' ? sortConfig.direction : false}
            >
              <TableSortLabel
                active={sortConfig.field === 'username'}
                direction={sortConfig.field === 'username' ? sortConfig.direction : 'asc'}
                onClick={() => handleSort('username')}
              >
                Username
              </TableSortLabel>
            </TableCell>
            <TableCell
              sortDirection={sortConfig.field === 'approvalStatus' ? sortConfig.direction : false}
            >
              <TableSortLabel
                active={sortConfig.field === 'approvalStatus'}
                direction={sortConfig.field === 'approvalStatus' ? sortConfig.direction : 'asc'}
                onClick={() => handleSort('approvalStatus')}
              >
                Approval
              </TableSortLabel>
            </TableCell>
            <TableCell sortDirection={sortConfig.field === 'role' ? sortConfig.direction : false}>
              <TableSortLabel
                active={sortConfig.field === 'role'}
                direction={sortConfig.field === 'role' ? sortConfig.direction : 'asc'}
                onClick={() => handleSort('role')}
              >
                Role
              </TableSortLabel>
            </TableCell>
            <TableCell
              sortDirection={sortConfig.field === 'createdAt' ? sortConfig.direction : false}
            >
              <TableSortLabel
                active={sortConfig.field === 'createdAt'}
                direction={sortConfig.field === 'createdAt' ? sortConfig.direction : 'desc'}
                onClick={() => handleSort('createdAt')}
              >
                Created
              </TableSortLabel>
            </TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading && (
            <TableRow>
              <TableCell colSpan={5} align="center">
                <CircularProgress size={24} />
              </TableCell>
            </TableRow>
          )}
          {!loading && paginated.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} align="center">
                <Typography variant="body2" color="text.secondary">
                  No users match the current filters.
                </Typography>
              </TableCell>
            </TableRow>
          )}
          {!loading &&
            paginated.map((row) => {
              const approvalStatus = row.approvalStatus || 'pending';
              const approvalColor =
                approvalStatus === 'approved'
                  ? 'success'
                  : approvalStatus === 'rejected'
                    ? 'error'
                    : 'warning';

              const roleOptions = isSuperAdmin ? ['user', 'admin', 'super_admin'] : ['admin'];

              return (
                <TableRow key={row.id} hover>
                  <TableCell>
                    <ProfilePreview profile={row} />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={approvalStatus}
                      color={approvalColor}
                      variant={approvalStatus === 'approved' ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={row.role}
                      color={
                        row.role === 'super_admin'
                          ? 'secondary'
                          : row.role === 'admin'
                            ? 'primary'
                            : 'default'
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'}
                  </TableCell>
                  <TableCell align="right">
                    <Stack
                      direction={{ xs: 'column', md: 'row' }}
                      spacing={1}
                      justifyContent="flex-end"
                    >
                      <ButtonGroup variant="outlined" size="small">
                        <Button
                          onClick={() => onResetApproval(row)}
                          disabled={approvalLoadingMap[row.id]}
                        >
                          Pending
                        </Button>
                        <Button
                          onClick={() => onApprove(row)}
                          color="success"
                          disabled={approvalLoadingMap[row.id]}
                        >
                          Approve
                        </Button>
                        <Button
                          onClick={() => onReject(row)}
                          color="error"
                          disabled={approvalLoadingMap[row.id]}
                        >
                          Reject
                        </Button>
                      </ButtonGroup>
                      <ButtonGroup
                        variant="outlined"
                        size="small"
                        disabled={
                          approvalLoadingMap[row.id] || (!isSuperAdmin && row.role !== 'user')
                        }
                      >
                        {roleOptions.map((roleOption) => (
                          <Button
                            key={roleOption}
                            color={row.role === roleOption ? 'primary' : 'inherit'}
                            onClick={() => onRoleChange(row, roleOption)}
                            disabled={roleLoadingMap[row.id] || roleOption === row.role}
                          >
                            {roleOption.replace('_', ' ')}
                          </Button>
                        ))}
                      </ButtonGroup>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        disabled={approvalLoadingMap[row.id] || row.id === currentUserId}
                        onClick={() => onDelete(row)}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={sorted.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
        sx={{ mt: 1 }}
      />
    </Paper>
  );
}
