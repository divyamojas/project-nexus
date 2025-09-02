// src/pages/Dashboard.jsx

import { lazy, Suspense, useEffect, useState } from 'react';
import { Container, Typography, Paper } from '@mui/material';
import { ArchiveOutlined, CloseOutlined } from '@mui/icons-material';

import BookCarouselSection from './components/BookCarouselSection';
import MyBooksSection from '../dashboard/components/MyBooksSection';
import FeedbackSection from '../dashboard/components/FeedbackSection';

const AddBookModal = lazy(() => import('./components/AddBookModal'));
const BookModal = lazy(() => import('../browseBooks/components/BookModal'));

import { DASHBOARD_SECTIONS } from '../../constants/constants';
import { useUser } from '../../contexts/hooks/useUser';
import { useBookContext } from '../../contexts/hooks/useBookContext';
import PageLoader from '../../commonComponents/PageLoader';
import {
  getCurrentUserFirstName,
  getSavedBooks,
  getTransfers,
  getUserReviews,
  updateRequestStatus,
  toggleSaveBook,
  requestBookReturn,
} from '../../services';
import { getRequestsForUser } from '../../utilities';

export default function Dashboard() {
  const { user } = useUser();

  const [userFirstName, setUserFirstName] = useState('Friend');
  const [requests, setRequests] = useState({ incoming: [], outgoing: [] });
  const [transfers, setTransfers] = useState([]);
  const [savedBooks, setSavedBooks] = useState([]);
  const [reviews, setReviews] = useState({ given: [], received: [] });

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [modalContext, setModalContext] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const { categorizedBooks, handleDeleteBook, handleArchiveBook, refreshBooks } = useBookContext();

  const fetchData = async () => {
    const [req, trf, saved, rev, name] = await Promise.all([
      getRequestsForUser(user),
      getTransfers(),
      getSavedBooks(user),
      getUserReviews(user),
      getCurrentUserFirstName(user),
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

  const handleBookClick = (book, context = 'myBooks') => {
    setSelectedBook(book);
    setModalContext(context);
  };
  const handleCloseModal = () => setSelectedBook(null);
  const handleToggleSave = async (book) => {
    await toggleSaveBook(book.id, false, null, user);
    fetchData();
  };
  const handleRequestReturn = async (book) => {
    await requestBookReturn(book.id, user);
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
    <Suspense fallback={<PageLoader />}>
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
            onBookClick={(book) => handleBookClick(book, 'myBooks')}
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
              onBookClick={(book) => handleBookClick(book, context)}
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

        <AddBookModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          setShowAddModal={setShowAddModal}
        />

        {selectedBook && (
          <BookModal
            open={!!selectedBook}
            onClose={handleCloseModal}
            book={selectedBook}
            context={modalContext}
            status={selectedBook.status}
            onArchive={() => handleArchiveBook(selectedBook)}
            onDelete={() => handleDeleteBook(selectedBook)}
            archiveIcon={<ArchiveOutlined />}
            deleteIcon={<CloseOutlined />}
            onActionComplete={fetchData}
          />
        )}
      </Container>
    </Suspense>
  );
}
