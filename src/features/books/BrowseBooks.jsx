// src/features/books/BrowseBooks.jsx

import { useEffect, useState, useRef } from 'react';
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
} from '@mui/material';
import RefreshIconButton from '@/commonComponents/RefreshIconButton';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import { useDebounce } from '../../hooks';
import BookModal from './components/BookModal';
import BookCard from './components/BookCard';

import { useAuth } from '../../contexts/hooks/useAuth';
import { logError } from '@/utilities/logger';
import { useBookContext } from '../../contexts/hooks/useBookContext';

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
      alert('Failed to update saved state.');
    }
  };

  const handleRequestBook = async (book) => {
    try {
      const success = await sendBookRequest(book);
      if (success) {
        alert('Borrow request sent!');
        await doRefresh();
      }
    } catch (e) {
      logError('BrowseBooks.handleRequestBook failed', e, { bookId: book?.id });
      alert('Failed to send borrow request.');
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" spacing={1} alignItems="center" mb={3} justifyContent="space-between">
        <Stack direction="row" spacing={1} alignItems="center">
          <AutoStoriesIcon color="primary" />
          <Typography variant="h4" fontWeight={600}>
            Discover books shared by the community
          </Typography>
        </Stack>
        <RefreshIconButton onClick={doRefresh} refreshing={refreshing} tooltip="Refresh" />
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3} alignItems="flex-start">
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

      {loading ? (
        <Typography>Loading books...</Typography>
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
              <Grid container spacing={2} mb={4}>
                {myBooks.map((book) => (
                  <Grid item xs={12} sm={6} key={book.id}>
                    <Fade in timeout={400}>
                      <Box>
                        <BookCard
                          book={book}
                          editable={true}
                          isSaved={false}
                          onClick={() => handleCardClick(book)}
                          context="myBooks"
                          onArchive={onArchiveWrapper}
                          onDelete={onDeleteWrapper}
                        />
                      </Box>
                    </Fade>
                  </Grid>
                ))}
              </Grid>
              <Divider sx={{ my: 4 }} />
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
                    <BookCard
                      book={book}
                      editable={true}
                      isSaved={book.is_saved}
                      onClick={() => handleCardClick(book)}
                      context="browse"
                      onToggleSave={handleToggleSave}
                      onRequest={handleRequestBook}
                    />
                  </Box>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {selectedBook && (
        <BookModal open={isModalOpen} onClose={closeModal} book={selectedBook} context="browse" />
      )}
    </Container>
  );
}
