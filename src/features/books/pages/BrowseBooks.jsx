// src/pages/BrowseBooks.jsx

import React, { useEffect, useState } from 'react';
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
} from '@mui/material';
import BookCard from '@features/books/components/BookCard';
import { useDebounce } from '@/hooks/useDebounce';
import { getAvailableBooks, filterAndSortBooks } from '@features/books/services/bookService';
import BookModal from '@features/books/components/BookModal';
import { useAuth } from '@/contexts/AuthContext';

export default function BrowseBooks() {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('date_added');
  const [filter, setFilter] = useState('all');
  const [showOwnBooks, setShowOwnBooks] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getAvailableBooks();
        setBooks(data);
        console.log('books data', data);
      } catch (e) {
        console.error('Error fetching books:', e);
      }
      setLoading(false);
    })();
  }, []);

  const filteredBooks = filterAndSortBooks(books, {
    searchTerm: debouncedSearch,
    statusFilter: filter,
    sortBy,
    userId: user?.id,
    includeOwn: showOwnBooks,
  });

  console.log(filteredBooks);

  const handleCardClick = (book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedBook(null);
    setIsModalOpen(false);
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
          label="Show my books"
        />
      </Stack>

      <Box>
        {loading ? (
          <Typography>Loading books...</Typography>
        ) : filteredBooks.length === 0 ? (
          <Typography>No books match your search or filter.</Typography>
        ) : (
          <Grid container spacing={2}>
            {filteredBooks.map((book) => (
              <Grid item xs={12} sm={6} md={4} key={book.id}>
                <Fade in timeout={400}>
                  <Box>
                    <BookCard book={book} editable={false} onClick={() => handleCardClick(book)} />
                  </Box>
                </Fade>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {selectedBook && (
        <BookModal open={isModalOpen} onClose={closeModal} book={selectedBook} context="browse" />
      )}
    </Container>
  );
}
