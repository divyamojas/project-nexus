// src/features/dashboard/Dashboard.jsx

import { lazy, Suspense, useEffect, useState, useCallback } from 'react';
import { Container, Typography, Paper } from '@mui/material';

import BookCarouselSection from '@/features/dashboard/components/BookCarouselSection';
import MyBooksSection from '@/features/dashboard/components/MyBooksSection';
import FeedbackSection from '@/features/dashboard/components/FeedbackSection';

const AddBookModal = lazy(() => import('@/features/books/components/AddBookModal'));
const BookModal = lazy(() => import('@/features/books/components/BookModal'));

import { DASHBOARD_SECTIONS } from '../../constants/constants';
import { useUser } from '../../contexts/hooks/useUser';
import { useBookContext } from '../../contexts/hooks/useBookContext';
import PageLoader from '../../commonComponents/PageLoader';
import {
  getCurrentUserFirstName,
  getSavedBooks,
  getTransfers,
  getUserReviews,
  getMyLoans,
} from '../../services';
import { getRequestsForUser } from '../../utilities';
import useDashboardHandlers from './hooks/useDashboardHandlers';

export default function Dashboard() {
  const { user, firstName: firstNameFromContext } = useUser();

  const [userFirstName, setUserFirstName] = useState(
    () => firstNameFromContext || user?.first_name || 'Friend',
  );
  const [requests, setRequests] = useState({ incoming: [], outgoing: [] });
  const [transfers, setTransfers] = useState([]);
  const [savedBooks, setSavedBooks] = useState([]);
  const [reviews, setReviews] = useState({ given: [], received: [] });
  const [borrowedBooks, setBorrowedBooks] = useState([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [modalContext, setModalContext] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const { categorizedBooks, handleDeleteBook, handleArchiveBook, refreshBooks } = useBookContext();

  const fetchData = useCallback(async () => {
    const [req, trf, saved, rev, name, myLoans] = await Promise.all([
      getRequestsForUser(user),
      getTransfers(),
      getSavedBooks(user),
      getUserReviews(user),
      getCurrentUserFirstName(user),
      getMyLoans({ role: 'borrower' }),
    ]);
    setRequests(req);
    setTransfers(trf);
    setSavedBooks(saved);
    setReviews(rev);
    setUserFirstName(name);
    // Normalize loans -> book-like
    const borrowed = (myLoans || []).map((l) => ({
      id: l.book?.id,
      user_id: l.book?.user_id,
      status: 'lent',
      condition: l.book?.condition,
      created_at: l.book?.created_at,
      catalog: l.book?.books_catalog,
      archived: false,
      loan_id: l.id,
      loan_due_date: l.due_date,
    }));
    setBorrowedBooks(borrowed);
    refreshBooks();
  }, [user?.id, refreshBooks]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  useEffect(() => {
    if (firstNameFromContext || user?.first_name) {
      setUserFirstName(firstNameFromContext || user.first_name);
    }
  }, [firstNameFromContext, user?.first_name]);

  const handleBookClick = (book, context = 'myBooks') => {
    setSelectedBook(book);
    setModalContext(context);
  };
  const handleCloseModal = () => setSelectedBook(null);
  const {
    onToggleSave: handleToggleSave,
    onRequestReturn: handleRequestReturn,
    onAcceptRequest: handleAcceptRequest,
    onRejectRequest: handleRejectRequest,
    onCancelRequest: handleCancelRequest,
    onCompleteTransfer: handleCompleteTransfer,
    onApproveReturn: handleApproveReturn,
    onArchive: handleArchive,
    onDelete: handleDelete,
  } = useDashboardHandlers({
    user,
    refetch: fetchData,
    archiveBook: handleArchiveBook,
    deleteBook: handleDeleteBook,
  });

  const { lentBooks, archivedBooks, myActiveBooks } = categorizedBooks;
  const bookSections = DASHBOARD_SECTIONS({
    lentBooks,
    savedBooks,
    requests,
    transfers,
    borrowedBooks,
  });

  return (
    <Suspense fallback={<PageLoader />}>
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Paper elevation={2} sx={{ p: 4, borderRadius: 4, bgcolor: 'background.paper' }}>
          <Typography variant="h4" fontWeight="medium" gutterBottom color="text.primary">
            Hi {userFirstName || 'Friend'}, welcome to your dashboard 📘
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
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
              onDelete={handleDelete}
              onArchive={handleArchive}
              onToggleSave={handleToggleSave}
              onRequestReturn={handleRequestReturn}
              onApproveReturn={handleApproveReturn}
              onAccept={handleAcceptRequest}
              onReject={handleRejectRequest}
              onCancelRequest={handleCancelRequest}
              onCompleteTransfer={handleCompleteTransfer}
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
            onActionComplete={fetchData}
          />
        )}
      </Container>
    </Suspense>
  );
}
