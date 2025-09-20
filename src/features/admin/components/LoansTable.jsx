import { useMemo, useState, useEffect } from 'react';
import {
  Box,
  Button,
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

const LOAN_STATUS_COLORS = {
  active: 'warning',
  returned: 'success',
};

export default function LoansTable({ loans, loading, onRefresh, onMarkReturned }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ field: 'dueDate', direction: 'asc' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    setPage(0);
  }, [searchTerm, statusFilter, rowsPerPage]);

  const filtered = useMemo(() => {
    let data = loans;
    if (statusFilter !== 'all') {
      data = data.filter((loan) => loan.status === statusFilter);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      data = data.filter((loan) => {
        const fields = [loan.bookTitle, loan.borrower?.username, loan.lender?.username];
        return fields.some((value) => value && value.toLowerCase().includes(term));
      });
    }
    return data;
  }, [loans, statusFilter, searchTerm]);

  const sorted = useMemo(() => {
    const { field, direction } = sortConfig;
    const multiplier = direction === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (field) {
        case 'bookTitle':
          comparison = (a.bookTitle || '').localeCompare(b.bookTitle || '');
          break;
        case 'status':
          comparison = (a.status || '').localeCompare(b.status || '');
          break;
        case 'dueDate':
          comparison = new Date(a.dueDate || 0) - new Date(b.dueDate || 0);
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
    setSortConfig({ field: 'dueDate', direction: 'asc' });
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
            Active Loans
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor lending activity and confirm returned items.
          </Typography>
        </Box>
        <Tooltip title="Refresh loans">
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
          <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 200 } }}>
            <InputLabel id="loan-status-filter">Status</InputLabel>
            <Select
              labelId="loan-status-filter"
              label="Status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="returned">Returned</MenuItem>
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
              sortDirection={sortConfig.field === 'bookTitle' ? sortConfig.direction : false}
            >
              <TableSortLabel
                active={sortConfig.field === 'bookTitle'}
                direction={sortConfig.field === 'bookTitle' ? sortConfig.direction : 'asc'}
                onClick={() => handleSort('bookTitle')}
              >
                Book
              </TableSortLabel>
            </TableCell>
            <TableCell sortDirection={sortConfig.field === 'status' ? sortConfig.direction : false}>
              <TableSortLabel
                active={sortConfig.field === 'status'}
                direction={sortConfig.field === 'status' ? sortConfig.direction : 'asc'}
                onClick={() => handleSort('status')}
              >
                Status
              </TableSortLabel>
            </TableCell>
            <TableCell>Borrower</TableCell>
            <TableCell>Lender</TableCell>
            <TableCell
              sortDirection={sortConfig.field === 'dueDate' ? sortConfig.direction : false}
            >
              <TableSortLabel
                active={sortConfig.field === 'dueDate'}
                direction={sortConfig.field === 'dueDate' ? sortConfig.direction : 'asc'}
                onClick={() => handleSort('dueDate')}
              >
                Due Date
              </TableSortLabel>
            </TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading && (
            <TableRow>
              <TableCell colSpan={6} align="center">
                <CircularProgress size={24} />
              </TableCell>
            </TableRow>
          )}
          {!loading && paginated.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} align="center">
                <Typography variant="body2" color="text.secondary">
                  No loans match the current filters.
                </Typography>
              </TableCell>
            </TableRow>
          )}
          {!loading &&
            paginated.map((loan) => (
              <TableRow key={loan.id} hover>
                <TableCell>{loan.bookTitle}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={loan.status}
                    color={LOAN_STATUS_COLORS[loan.status] || 'default'}
                  />
                </TableCell>
                <TableCell>
                  <ProfilePreview
                    profile={loan.borrower}
                    fallback={loan.borrower?.username || '—'}
                  />
                </TableCell>
                <TableCell>
                  <ProfilePreview profile={loan.lender} fallback={loan.lender?.username || '—'} />
                </TableCell>
                <TableCell>
                  {loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : '—'}
                </TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => onMarkReturned(loan)}
                    disabled={loan.status !== 'active'}
                  >
                    Mark Returned
                  </Button>
                </TableCell>
              </TableRow>
            ))}
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
