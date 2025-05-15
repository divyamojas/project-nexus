// src/pages/Dashboard.jsx

import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper } from '@mui/material';

import AddBookModal from '@/components/AddBookModal';
import BookModal from '@/components/books/BookModal';
import BookCarouselSection from '@/components/books/BookCarouselSection';
import MyBooksSection from '@/components/dashboard/MyBooksSection';
import FeedbackSection from '@/components/dashboard/FeedbackSection';

import { getDashboardSections } from '@/constants/dashboardBookSections';
import {
  getCurrentUserFirstName,
  getMyBooks,
  getRequests,
  getSavedBooks,
  getTransfers,
  getUserReviews,
} from '@/services/userService';
import {
  subscribeToBooksChanges,
  handleArchiveBookWithRefresh,
  handleDeleteBookWithRefresh,
  categorizeBooks,
} from '@/services/bookService';

export default function Dashboard() {
  const [myBooks, setMyBooks] = useState([]);
  const [requests, setRequests] = useState({ incoming: [], outgoing: [] });
  const [transfers, setTransfers] = useState([]);
  const [savedBooks, setSavedBooks] = useState([]);
  const [reviews, setReviews] = useState({ given: [], received: [] });
  const [userFirstName, setUserFirstName] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  const fetchData = async () => {
    const [books, req, trf, saved, rev, name] = await Promise.all([
      getMyBooks(),
      getRequests(),
      getTransfers(),
      getSavedBooks(),
      getUserReviews(),
      getCurrentUserFirstName(),
    ]);

    setMyBooks(books);
    setRequests(req);
    setTransfers(trf);
    setSavedBooks(saved);
    setReviews(rev);
    setUserFirstName(name || 'friend');
  };

  useEffect(() => {
    fetchData();
    const channel = subscribeToBooksChanges(() => fetchData());
    return () => channel.unsubscribe();
  }, []);

  const handleBookClick = (book) => setSelectedBook(book);
  const handleCloseModal = () => setSelectedBook(null);
  const handleDeleteBook = (book) => handleDeleteBookWithRefresh(book, fetchData);
  const handleArchiveBook = (book) => handleArchiveBookWithRefresh(book, fetchData);

  const { availableBooks, lentBooks, archivedBooks } = categorizeBooks(myBooks);
  const bookSections = getDashboardSections({ lentBooks, savedBooks, requests, transfers });

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Paper elevation={2} sx={{ p: 4, borderRadius: 4, bgcolor: '#fdfaf6' }}>
        <Typography variant="h4" fontWeight="medium" gutterBottom sx={{ color: '#5d4037' }}>
          Hi {userFirstName}, welcome to your dashboard 📘
        </Typography>

        <Typography variant="body1" sx={{ color: '#6d4c41', mb: 3 }}>
          You can view and manage your books here, check recent activity, and share something new
          when you&apos;re ready.
        </Typography>

        <MyBooksSection
          availableBooks={availableBooks}
          archivedBooks={archivedBooks}
          showArchived={showArchived}
          setShowArchived={setShowArchived}
          onAdd={() => setShowAddModal(true)}
          onBookClick={handleBookClick}
          onDelete={handleDeleteBook}
          onArchive={handleArchiveBook}
        />

        {bookSections.map(({ title, emoji, books }) => (
          <BookCarouselSection
            key={title}
            title={title}
            emoji={emoji}
            books={books}
            onBookClick={handleBookClick}
            onDelete={handleDeleteBook}
            onArchive={handleArchiveBook}
          />
        ))}

        <FeedbackSection feedbacks={reviews.received} />
      </Paper>

      <AddBookModal open={showAddModal} onClose={() => setShowAddModal(false)} />

      {selectedBook && (
        <BookModal
          open={!!selectedBook}
          onClose={handleCloseModal}
          book={selectedBook}
          onActionComplete={fetchData}
        />
      )}
    </Container>
  );
}
