// src/pages/BrowseBooks.jsx

import React, { useEffect, useState } from 'react';
import { Container, Typography, TextField, Grid, Card, CardContent } from '@mui/material';
import { supabase } from '@/services/supabaseClient';

export default function BrowseBooks() {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchBooks = async () => {
    const { data, error } = await supabase
      .from('books')
      .select('*, books_catalog(title, author)')
      .eq('available', true);

    if (error) console.error('Error fetching books:', error);
    else setBooks(data || []);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const filtered = books.filter((b) => {
    const search = searchTerm.toLowerCase();
    return (
      b.books_catalog?.title?.toLowerCase().includes(search) ||
      b.books_catalog?.author?.toLowerCase().includes(search)
    );
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Browse Books
      </Typography>

      <TextField
        fullWidth
        label="Search by title or author"
        margin="normal"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <Grid container spacing={2} mt={1}>
        {filtered.map((book) => (
          <Grid item xs={12} sm={6} md={4} key={book.id}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold">
                  {book.books_catalog.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  by {book.books_catalog.author}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Condition: {book.condition}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
