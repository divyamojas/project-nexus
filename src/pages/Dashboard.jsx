import React, { useEffect, useState } from 'react';
import { supabase } from '@/services/supabaseClient';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  Box,
} from '@mui/material';
import AddBookModal from '@/components/AddBookModal';

export default function Dashboard() {
  const [myBooks, setMyBooks] = useState([]);
  const [requests, setRequests] = useState({ incoming: [], outgoing: [] });
  const [transfers, setTransfers] = useState([]);
  const [savedBooks, setSavedBooks] = useState([]);
  const [reviews, setReviews] = useState({ given: [], received: [] });
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchData = async () => {
    const user = supabase.auth.getUser();
    const { data: books } = await supabase
      .from('books')
      .select('*, books_catalog(title, author)')
      .eq('owner_id', (await user).data.user.id);
    setMyBooks(books || []);

    const { data: incoming } = await supabase
      .from('requests')
      .select('*, book:book_id(*, books_catalog(title))')
      .in('book.owner_id', [(await user).data.user.id]);

    const { data: outgoing } = await supabase
      .from('requests')
      .select('*, book:book_id(*, books_catalog(title))')
      .eq('requester_id', (await user).data.user.id);

    setRequests({ incoming: incoming || [], outgoing: outgoing || [] });

    const { data: myTransfers } = await supabase
      .from('transfers')
      .select('*, request:request_id(*, book:book_id(*, books_catalog(title)))')
      .order('scheduled_at');
    setTransfers(myTransfers || []);

    const { data: saved } = await supabase
      .from('saved_books')
      .select('*, books_catalog(*)')
      .eq('user_id', (await user).data.user.id);
    setSavedBooks(saved || []);

    const { data: givenReviews } = await supabase
      .from('user_reviews')
      .select('*')
      .eq('reviewer_id', (await user).data.user.id);

    const { data: receivedReviews } = await supabase
      .from('user_reviews')
      .select('*')
      .eq('reviewee_id', (await user).data.user.id);

    setReviews({ given: givenReviews || [], received: receivedReviews || [] });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Dashboard
      </Typography>

      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">My Books</Typography>
          <Button variant="contained" onClick={() => setShowAddModal(true)}>
            Add Book
          </Button>
        </Box>
        <Grid container spacing={2} mt={1}>
          {myBooks.map((book) => (
            <Grid item xs={12} sm={6} md={4} key={book.id}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {book.books_catalog.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {book.condition}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box mb={4}>
        <Typography variant="h6">Requests Received</Typography>
        {requests.incoming.map((req) => (
          <Typography key={req.id}>
            📥 {req.book.books_catalog.title} — {req.status}
          </Typography>
        ))}
        <Typography variant="h6" mt={2}>
          Requests Made
        </Typography>
        {requests.outgoing.map((req) => (
          <Typography key={req.id}>
            📤 {req.book.books_catalog.title} — {req.status}
          </Typography>
        ))}
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box mb={4}>
        <Typography variant="h6">Upcoming Transfers</Typography>
        {transfers.map((t) => (
          <Typography key={t.id}>
            📦 {t.request.book.books_catalog.title} @ {t.scheduled_at}
          </Typography>
        ))}
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box mb={4}>
        <Typography variant="h6">Saved Books</Typography>
        {savedBooks.map((s) => (
          <Typography key={s.catalog_id}>📚 {s.books_catalog.title}</Typography>
        ))}
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box mb={4}>
        <Typography variant="h6">Reviews</Typography>
        <Box mt={1}>
          <Typography fontWeight="medium">Received</Typography>
          {reviews.received.map((r) => (
            <Typography key={r.id}>
              ⭐ {r.stars} - {r.title}
            </Typography>
          ))}
        </Box>
        <Box mt={2}>
          <Typography fontWeight="medium">Given</Typography>
          {reviews.given.map((r) => (
            <Typography key={r.id}>
              ⭐ {r.stars} - {r.title}
            </Typography>
          ))}
        </Box>
      </Box>

      {showAddModal && <AddBookModal onClose={() => setShowAddModal(false)} />}
    </Container>
  );
}
