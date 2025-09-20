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

export default function BooksTable({ books, loading, onToggleArchive, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ field: 'createdAt', direction: 'desc' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    setPage(0);
  }, [searchTerm, statusFilter, rowsPerPage]);

  const enriched = useMemo(
    () =>
      books.map((book) => ({
        ...book,
        title: book.catalog?.title || 'Untitled',
        author: book.catalog?.author || 'Unknown',
        statusLabel: book.archived ? 'archived' : book.status || 'unknown',
        createdAt: book.created_at || null,
        profile: book.profile,
      })),
    [books],
  );

  const filtered = useMemo(() => {
    let data = enriched;
    if (statusFilter !== 'all') {
      if (statusFilter === 'archived') {
        data = data.filter((book) => book.archived);
      } else {
        data = data.filter((book) => !book.archived && book.status === statusFilter);
      }
    }
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      data = data.filter((book) => {
        const fields = [book.title, book.author, book.profile?.username];
        return fields.some((value) => value && value.toLowerCase().includes(term));
      });
    }
    return data;
  }, [enriched, statusFilter, searchTerm]);

  const sorted = useMemo(() => {
    const { field, direction } = sortConfig;
    const multiplier = direction === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (field) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'status':
          comparison = a.statusLabel.localeCompare(b.statusLabel);
          break;
        case 'owner':
          comparison = (a.profile?.username || '').localeCompare(b.profile?.username || '');
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
            Book Catalogue Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review and moderate the books currently listed by members.
          </Typography>
        </Box>
        <Tooltip title="Refresh books">
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
            <InputLabel id="book-status-filter">Status</InputLabel>
            <Select
              labelId="book-status-filter"
              label="Status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="available">Available</MenuItem>
              <MenuItem value="lent">Lent</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
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
            <TableCell sortDirection={sortConfig.field === 'title' ? sortConfig.direction : false}>
              <TableSortLabel
                active={sortConfig.field === 'title'}
                direction={sortConfig.field === 'title' ? sortConfig.direction : 'asc'}
                onClick={() => handleSort('title')}
              >
                Title
              </TableSortLabel>
            </TableCell>
            <TableCell>Author</TableCell>
            <TableCell sortDirection={sortConfig.field === 'status' ? sortConfig.direction : false}>
              <TableSortLabel
                active={sortConfig.field === 'status'}
                direction={sortConfig.field === 'status' ? sortConfig.direction : 'asc'}
                onClick={() => handleSort('status')}
              >
                Status
              </TableSortLabel>
            </TableCell>
            <TableCell sortDirection={sortConfig.field === 'owner' ? sortConfig.direction : false}>
              <TableSortLabel
                active={sortConfig.field === 'owner'}
                direction={sortConfig.field === 'owner' ? sortConfig.direction : 'asc'}
                onClick={() => handleSort('owner')}
              >
                Owner
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
                Added
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
                  No books match the current filters.
                </Typography>
              </TableCell>
            </TableRow>
          )}
          {!loading &&
            paginated.map((book) => (
              <TableRow key={book.id} hover>
                <TableCell>{book.title}</TableCell>
                <TableCell>{book.author}</TableCell>
                <TableCell>
                  <Chip
                    label={book.archived ? 'Archived' : book.status || 'unknown'}
                    size="small"
                    color={book.archived ? 'default' : 'success'}
                  />
                </TableCell>
                <TableCell>
                  <ProfilePreview profile={book.profile} fallback={book.profile?.username || '—'} />
                </TableCell>
                <TableCell>
                  {book.createdAt ? new Date(book.createdAt).toLocaleDateString() : '—'}
                </TableCell>
                <TableCell align="right">
                  <Button size="small" variant="outlined" onClick={() => onToggleArchive(book)}>
                    {book.archived ? 'Unarchive' : 'Archive'}
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
