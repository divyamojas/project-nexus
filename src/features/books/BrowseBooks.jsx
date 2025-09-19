// src/features/books/BrowseBooks.jsx

import { useEffect, useState, useRef, lazy, Suspense } from 'react';
import {
  Container,
  Typography,
  TextField,
  Grid,
  Box,
  Fade,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Stack,
  FormControlLabel,
  Switch,
  Divider,
  Skeleton,
} from '@mui/material';
import RefreshIconButton from '@/commonComponents/RefreshIconButton';
import { alpha } from '@mui/material/styles';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import { useDebounce } from '../../hooks';
const BookModal = lazy(() => import('./components/BookModal'));
const BookCard = lazy(() => import('./components/BookCard'));
import BookCardSkeleton from './components/BookCardSkeleton';

import { useAuth } from '../../contexts/hooks/useAuth';
import { useSnackbar } from '@/components/providers/SnackbarProvider';
import { logError } from '@/utilities/logger';
import { useBookContext } from '../../contexts/hooks/useBookContext';
import { updateRequestStatus } from '../../services';

export default function BrowseBooks() {
  const { toggleBookSaveStatus, sendBookRequest, handleDeleteBook, handleArchiveBook } =
    useBookContext();

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [sortBy, setSortBy] = useState('date_added');
  const [filter, setFilter] = useState('all');
  const [showOwnBooks, setShowOwnBooks] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  const { filteredBooks, setFilters, loading, refreshBooks } = useBookContext();
  const [initialLoaded, setInitialLoaded] = useState(false);
  const { showToast } = useSnackbar();

  const [refreshing, setRefreshing] = useState(false);
  const refreshingRef = useRef(false);

  const doRefresh = async () => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    setRefreshing(true);
    try {
      await refreshBooks();
    } finally {
      setRefreshing(false);
      refreshingRef.current = false;
    }
  };

  // sync filters to context
  useEffect(() => {
    setFilters({
      searchTerm: debouncedSearch,
      statusFilter: filter,
      sortBy,
      userId: user?.id,
      includeOwn: true,
    });
  }, [debouncedSearch, sortBy, filter, user?.id, setFilters]);

  // Auto-refresh every 10s when visible
  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === 'visible') doRefresh();
    };
    const id = setInterval(tick, 10000);
    document.addEventListener('visibilitychange', tick);
    // Local event after additions elsewhere
    const onAdded = () => doRefresh();
    window.addEventListener('books:added', onAdded);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
      window.removeEventListener('books:added', onAdded);
    };
  }, [refreshBooks]);

  // Mark initial load complete to prevent skeleton flashing on auto refreshes
  useEffect(() => {
    if (!initialLoaded && !loading) setInitialLoaded(true);
  }, [loading, initialLoaded]);

  const myBooks = filteredBooks.filter((book) => book.user_id === user?.id);
  const otherBooks = filteredBooks.filter((book) => book.user_id !== user?.id);

  const handleCardClick = (book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedBook(null);
    setIsModalOpen(false);
  };

  const handleToggleSave = async (book) => {
    try {
      await toggleBookSaveStatus(book);
      // ensure browse reflects new saved state
      await doRefresh();
    } catch (e) {
      logError('BrowseBooks.handleToggleSave failed', e, { bookId: book?.id });
      showToast('Failed to update saved state', { severity: 'error' });
    }
  };

  const handleRequestBook = async (book) => {
    try {
      const success = await sendBookRequest(book);
      if (success) {
        showToast('Borrow request sent!', { severity: 'success' });
        await doRefresh();
      }
    } catch (e) {
      logError('BrowseBooks.handleRequestBook failed', e, { bookId: book?.id });
      showToast('Failed to send borrow request', { severity: 'error' });
    }
  };

  const handleCancelRequest = async (book) => {
    try {
      if (!book?.request_id) return;
      await updateRequestStatus(book.request_id, 'cancelled');
      showToast('Borrow request withdrawn', { severity: 'info' });
      await doRefresh();
    } catch (e) {
      logError('BrowseBooks.handleCancelRequest failed', e, { requestId: book?.request_id });
      showToast('Failed to withdraw request', { severity: 'error' });
    }
  };

  const onArchiveWrapper = async (book) => {
    try {
      await handleArchiveBook(book);
      await doRefresh();
    } catch (e) {
      logError('BrowseBooks.onArchive failed', e, { bookId: book?.id });
    }
  };

  const onDeleteWrapper = async (book) => {
    try {
      await handleDeleteBook(book);
      await doRefresh();
    } catch (e) {
      logError('BrowseBooks.onDelete failed', e, { bookId: book?.id });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
      <Stack direction="row" spacing={1} alignItems="center" mb={2} justifyContent="space-between">
        {!initialLoaded && loading ? (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Skeleton
              variant="circular"
              width={32}
              height={32}
              animation="wave"
              sx={{
                bgcolor: (t) =>
                  alpha(t.palette.text.primary, t.palette.mode === 'dark' ? 0.18 : 0.1),
              }}
            />
            <Skeleton
              variant="rounded"
              width={260}
              height={28}
              animation="wave"
              sx={{
                borderRadius: 1.5,
                bgcolor: (t) =>
                  alpha(t.palette.text.primary, t.palette.mode === 'dark' ? 0.16 : 0.09),
              }}
            />
          </Stack>
        ) : (
          <Stack direction="row" spacing={1} alignItems="center">
            <AutoStoriesIcon color="primary" />
            <Typography variant="h4" fontWeight={600}>
              Discover books shared by the community
            </Typography>
          </Stack>
        )}
        {!initialLoaded && loading ? (
          <Skeleton
            variant="circular"
            width={36}
            height={36}
            animation="wave"
            sx={{
              bgcolor: (t) => alpha(t.palette.text.primary, t.palette.mode === 'dark' ? 0.18 : 0.1),
            }}
          />
        ) : (
          <RefreshIconButton onClick={doRefresh} refreshing={refreshing} tooltip="Refresh" />
        )}
      </Stack>

      {!initialLoaded && loading ? (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2} alignItems="flex-start">
          <Skeleton
            variant="rounded"
            height={56}
            animation="wave"
            sx={{
              flexGrow: 1,
              borderRadius: 2,
              bgcolor: (t) =>
                alpha(t.palette.text.primary, t.palette.mode === 'dark' ? 0.14 : 0.08),
            }}
          />
          <Skeleton
            variant="rounded"
            width={160}
            height={56}
            animation="wave"
            sx={{
              borderRadius: 2,
              bgcolor: (t) =>
                alpha(t.palette.text.primary, t.palette.mode === 'dark' ? 0.14 : 0.08),
            }}
          />
          <Skeleton
            variant="rounded"
            width={160}
            height={56}
            animation="wave"
            sx={{
              borderRadius: 2,
              bgcolor: (t) =>
                alpha(t.palette.text.primary, t.palette.mode === 'dark' ? 0.14 : 0.08),
            }}
          />
          <Skeleton
            variant="rounded"
            width={140}
            height={40}
            animation="wave"
            sx={{
              borderRadius: 2,
              bgcolor: (t) =>
                alpha(t.palette.text.primary, t.palette.mode === 'dark' ? 0.14 : 0.08),
            }}
          />
        </Stack>
      ) : (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2} alignItems="flex-start">
          <TextField
            fullWidth
            label="Search by title or author"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <FormControl sx={{ minWidth: 160 }}>
            <InputLabel>Sort By</InputLabel>
            <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} label="Sort By">
              <MenuItem value="date_added">Date Added</MenuItem>
              <MenuItem value="name">Title (A-Z)</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select value={filter} onChange={(e) => setFilter(e.target.value)} label="Status">
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="available">Available</MenuItem>
              <MenuItem value="lent_out">Lent Out</MenuItem>
              <MenuItem value="unavailable">Not Available</MenuItem>
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={showOwnBooks}
                onChange={(e) => setShowOwnBooks(e.target.checked)}
                color="primary"
              />
            }
            label="Show My Books"
          />
        </Stack>
      )}

      {!initialLoaded && loading ? (
        <>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Skeleton
              variant="circular"
              width={24}
              height={24}
              animation="wave"
              sx={{
                bgcolor: (t) =>
                  alpha(t.palette.text.primary, t.palette.mode === 'dark' ? 0.18 : 0.1),
              }}
            />
            <Skeleton
              variant="rounded"
              width={180}
              height={22}
              animation="wave"
              sx={{
                borderRadius: 1.5,
                bgcolor: (t) =>
                  alpha(t.palette.text.primary, t.palette.mode === 'dark' ? 0.16 : 0.09),
              }}
            />
          </Stack>
          <Grid container spacing={2} mb={2}>
            {[...Array(6)].map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Fade in timeout={300}>
                  <Box>
                    <BookCardSkeleton width={240} height={360} />
                  </Box>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </>
      ) : filteredBooks.length === 0 ? (
        <Typography>No books match your search or filter.</Typography>
      ) : (
        <>
          {showOwnBooks && myBooks.length > 0 && (
            <>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <LibraryBooksIcon color="action" />
                <Typography variant="h6" fontWeight={600}>
                  My books
                </Typography>
              </Stack>
              <Grid container spacing={2} mb={2}>
                {myBooks.map((book) => (
                  <Grid item xs={12} sm={6} key={book.id}>
                    <Fade in timeout={400}>
                      <Box>
                        <Suspense fallback={<BookCardSkeleton width={240} height={360} />}>
                          <BookCard
                            book={book}
                            editable={true}
                            isSaved={false}
                            onClick={() => handleCardClick(book)}
                            context="myBooks"
                            onArchive={onArchiveWrapper}
                            onDelete={onDeleteWrapper}
                          />
                        </Suspense>
                      </Box>
                    </Fade>
                  </Grid>
                ))}
              </Grid>
              <Divider sx={{ my: 2 }} />
            </>
          )}

          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <AutoStoriesIcon color="action" />
            <Typography variant="h6" fontWeight={600}>
              Available books
            </Typography>
          </Stack>
          <Grid container spacing={2}>
            {otherBooks.map((book) => (
              <Grid item xs={12} sm={6} key={book.id}>
                <Fade in timeout={400}>
                  <Box>
                    <Suspense fallback={<BookCardSkeleton width={240} height={360} />}>
                      <BookCard
                        book={book}
                        editable={true}
                        isSaved={book.is_saved}
                        onClick={() => handleCardClick(book)}
                        context="browse"
                        onToggleSave={handleToggleSave}
                        onRequest={handleRequestBook}
                        onCancelRequest={handleCancelRequest}
                      />
                    </Suspense>
                  </Box>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {selectedBook && (
        <Suspense fallback={null}>
          <BookModal open={isModalOpen} onClose={closeModal} book={selectedBook} context="browse" />
        </Suspense>
      )}
    </Container>
  );
}
