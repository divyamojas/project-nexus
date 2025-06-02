// src/pages/BrowseBooks.jsx

import { useEffect, useState } from 'react';
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
import { useDebounce } from '../../hooks';
import BookModal from './components/BookModal';
import BookCard from './components/BookCard';

import { useAuth } from '../../contexts/AuthContext';
import { useBookContext } from '../../contexts/BookContext';

export default function BrowseBooks() {
  const { toggleBookSaveStatus, sendBookRequest } = useBookContext();

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [sortBy, setSortBy] = useState('date_added');
  const [filter, setFilter] = useState('all');
  const [showOwnBooks, setShowOwnBooks] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  const { filteredBooks, setFilters, loading } = useBookContext();

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

  const handleToggleSave = (book) => toggleBookSaveStatus(book);

  const handleRequestBook = async (book) => {
    const success = await sendBookRequest(book);
    if (success) alert('Borrow request sent!');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={600} mb={3}>
        📚 Discover Books Shared by the Community
      </Typography>

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
              <Typography variant="h6" fontWeight={600} gutterBottom>
                🧾 My Books
              </Typography>
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
                        />
                      </Box>
                    </Fade>
                  </Grid>
                ))}
              </Grid>
              <Divider sx={{ my: 4 }} />
            </>
          )}

          <Typography variant="h6" fontWeight={600} gutterBottom>
            📖 Available Books
          </Typography>
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
