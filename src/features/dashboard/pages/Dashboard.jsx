// src/pages/Dashboard.jsx

import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper } from '@mui/material';

import AddBookModal from '@features/books/components/AddBookModal';
import BookModal from '@features/books/components/BookModal';
import BookCarouselSection from '@features/books/components/BookCarouselSection';
import MyBooksSection from '@features/dashboard/components/MyBooksSection';
import FeedbackSection from '@features/dashboard/components/FeedbackSection';

import { DASHBOARD_SECTIONS } from '@/constants/constants';
import {
  getCurrentUserFirstName,
  getMyBooks,
  getRequests,
  getTransfers,
  getUserReviews,
} from '@/services/userService';
import {
  getSavedBooks,
  toggleSaveBook,
  requestBookReturn,
  updateRequestStatus,
} from '@features/books/services/bookService';
import { useBookContext } from '@/contexts/BookContext';

import ArchiveOutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { useUser } from '@/contexts/UserContext';

export default function Dashboard() {
  const { user } = useUser();

  const [userFirstName, setUserFirstName] = useState('Friend');
  const [requests, setRequests] = useState({ incoming: [], outgoing: [] });
  const [transfers, setTransfers] = useState([]);
  const [savedBooks, setSavedBooks] = useState([]);
  const [reviews, setReviews] = useState({ given: [], received: [] });

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  const { categorizedBooks, handleDeleteBook, handleArchiveBook, refreshBooks } = useBookContext();

  const fetchData = async () => {
    const [books, req, trf, saved, rev, name] = await Promise.all([
      getMyBooks(),
      getRequests(),
      getTransfers(),
      getSavedBooks(),
      getUserReviews(),
      getCurrentUserFirstName(),
    ]);
    setRequests(req);
    setTransfers(trf);
    setSavedBooks(saved);
    setReviews(rev);
    setUserFirstName(name);
    refreshBooks();
  };

  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
    setUserFirstName(user.first_name);
  }, [user]);

  const handleBookClick = (book) => setSelectedBook(book);
  const handleCloseModal = () => setSelectedBook(null);
  const handleToggleSave = async (book) => {
    await toggleSaveBook(book.id, false, null);
    fetchData();
  };
  const handleRequestReturn = async (book) => {
    await requestBookReturn(book.id);
    fetchData();
  };
  const handleAcceptRequest = async (book) => {
    await updateRequestStatus(book.request_id, 'accepted');
    fetchData();
  };
  const handleRejectRequest = async (book) => {
    await updateRequestStatus(book.request_id, 'rejected');
    fetchData();
  };
  const handleCancelRequest = async (book) => {
    await updateRequestStatus(book.request_id, 'cancelled');
    fetchData();
  };

  const { lentBooks, archivedBooks, myActiveBooks } = categorizedBooks;
  const bookSections = DASHBOARD_SECTIONS({ lentBooks, savedBooks, requests, transfers });

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Paper elevation={2} sx={{ p: 4, borderRadius: 4, bgcolor: '#fdfaf6' }}>
        <Typography variant="h4" fontWeight="medium" gutterBottom sx={{ color: '#5d4037' }}>
          Hi {userFirstName || 'Friend'}, welcome to your dashboard 📘
        </Typography>

        <Typography variant="body1" sx={{ color: '#6d4c41', mb: 3 }}>
          You can view and manage your books here, check recent activity, and share something new
          when you&apos;re ready.
        </Typography>

        <MyBooksSection
          availableBooks={myActiveBooks}
          archivedBooks={archivedBooks}
          showArchived={showArchived}
          setShowArchived={setShowArchived}
          onAdd={() => setShowAddModal(true)}
          onBookClick={handleBookClick}
          onDelete={handleDeleteBook}
          onArchive={handleArchiveBook}
        />

        {bookSections.map(({ title, emoji, books, context }) => (
          <BookCarouselSection
            key={title}
            title={title}
            emoji={emoji}
            books={books}
            context={context}
            editable={true}
            onBookClick={handleBookClick}
            onDelete={handleDeleteBook}
            onArchive={handleArchiveBook}
            onToggleSave={handleToggleSave}
            onRequestReturn={handleRequestReturn}
            onAccept={handleAcceptRequest}
            onReject={handleRejectRequest}
            onCancelRequest={handleCancelRequest}
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
          status={selectedBook.status}
          onArchive={() => handleArchiveBook(selectedBook)}
          onDelete={() => handleDeleteBook(selectedBook)}
          archiveIcon={<ArchiveOutlinedIcon />}
          deleteIcon={<CloseOutlinedIcon />}
          onActionComplete={fetchData}
        />
      )}
    </Container>
  );
}
