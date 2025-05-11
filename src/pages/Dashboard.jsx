// ./src/pages/Dashboard.jsx

import React, { useEffect, useState } from 'react';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Container,
  Typography,
  Grid,
  Box,
  Card,
  CardContent,
  Stack,
  Button,
  Divider,
  Collapse,
  IconButton,
  Tooltip,
} from '@mui/material';

import AddBookModal from '@/components/AddBookModal';
import {
  getMyBooks,
  getRequests,
  getTransfers,
  getSavedBooks,
  getUserReviews,
  archiveBook,
  deleteBook,
  subscribeToBooksChanges,
} from '@/services/dashboardService';

export default function Dashboard() {
  const [myBooks, setMyBooks] = useState([]);
  const [archivedBooks, setArchivedBooks] = useState([]);
  const [requests, setRequests] = useState({ incoming: [], outgoing: [] });
  const [transfers, setTransfers] = useState([]);
  const [savedBooks, setSavedBooks] = useState([]);
  const [reviews, setReviews] = useState({ given: [], received: [] });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const fetchData = async () => {
    const allBooks = await getMyBooks();
    setMyBooks(allBooks.filter((b) => b.archived === false));
    setArchivedBooks(allBooks.filter((b) => b.archived === true));
    setRequests(await getRequests());
    setTransfers(await getTransfers());
    setSavedBooks(await getSavedBooks());
    setReviews(await getUserReviews());
  };

  useEffect(() => {
    fetchData();
    const channel = subscribeToBooksChanges(() => fetchData());
    return () => channel.unsubscribe();
  }, []);

  const handleArchive = async (bookId, value = true) => {
    await archiveBook(bookId, value);
    fetchData();
  };

  const handleDelete = async (bookId) => {
    await deleteBook(bookId);
    fetchData();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Dashboard
      </Typography>

      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">My Books ({myBooks.length})</Typography>
          <Button variant="contained" onClick={() => setShowAddModal(true)}>
            Add Book
          </Button>
        </Box>
        <Grid container spacing={2} mt={1}>
          {myBooks.map((book) => (
            <Grid item xs={12} sm={6} md={4} key={book.id}>
              <Card
                sx={{
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
                }}
              >
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {book.books_catalog.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {book.condition}
                  </Typography>
                  <Stack direction="row" spacing={1} mt={2}>
                    <Tooltip title="Archive">
                      <IconButton
                        size="small"
                        onClick={() => handleArchive(book.id)}
                        sx={{
                          borderRadius: '50%',
                          transition: 'transform 0.2s',
                          '&:hover': { transform: 'scale(1.2)', boxShadow: 3 },
                        }}
                        color="primary"
                      >
                        <ArchiveIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(book.id)}
                        sx={{
                          borderRadius: '50%',
                          transition: 'transform 0.2s',
                          '&:hover': { transform: 'scale(1.2)', boxShadow: 3 },
                        }}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Button variant="text" onClick={() => setShowArchived((prev) => !prev)}>
          {showArchived ? 'Hide Archived Books' : 'Show Archived Books'}
        </Button>
        <Collapse in={showArchived} timeout={{ enter: 400, exit: 300 }} unmountOnExit>
          <Grid container spacing={2} mt={1}>
            {archivedBooks.map((book) => (
              <Grid item xs={12} sm={6} md={4} key={book.id}>
                <Card
                  variant="outlined"
                  sx={{
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {book.books_catalog.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {book.condition}
                    </Typography>
                    <Stack direction="row" spacing={1} mt={2}>
                      <Tooltip title="Unarchive">
                        <IconButton
                          size="small"
                          onClick={() => handleArchive(book.id, false)}
                          sx={{
                            borderRadius: '50%',
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'scale(1.2)', boxShadow: 3 },
                          }}
                          color="primary"
                        >
                          <UnarchiveIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(book.id)}
                          sx={{
                            borderRadius: '50%',
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'scale(1.2)', boxShadow: 3 },
                          }}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Collapse>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box mb={4}>
        <Typography variant="h6">Requests Received ({requests.incoming.length})</Typography>
        {requests.incoming.map((req) => (
          <Typography key={req.id}>
            📥 {req.book.books_catalog.title} — {req.status}
          </Typography>
        ))}
        <Typography variant="h6" mt={2}>
          Requests Made ({requests.outgoing.length})
        </Typography>
        {requests.outgoing.map((req) => (
          <Typography key={req.id}>
            📤 {req.book.books_catalog.title} — {req.status}
          </Typography>
        ))}
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box mb={4}>
        <Typography variant="h6">Upcoming Transfers ({transfers.length})</Typography>
        {transfers.map((t) => (
          <Typography key={t.id}>
            📦 {t.request.book.books_catalog.title} @ {t.scheduled_at}
          </Typography>
        ))}
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box mb={4}>
        <Typography variant="h6">Saved Books ({savedBooks.length})</Typography>
        {savedBooks.map((s) => (
          <Typography key={s.catalog_id}>📚 {s.books_catalog.title}</Typography>
        ))}
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box mb={4}>
        <Typography variant="h6">
          Reviews (Received: {reviews.received.length}, Given: {reviews.given.length})
        </Typography>
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

      {showAddModal && (
        <AddBookModal
          onClose={() => {
            setShowAddModal(false);
            fetchData();
          }}
        />
      )}
    </Container>
  );
}
