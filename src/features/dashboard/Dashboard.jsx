// src/features/dashboard/Dashboard.jsx

import { lazy, Suspense, useEffect, useState, useCallback } from 'react';
import { Container, Typography, Paper, Box, Stack, CircularProgress } from '@mui/material';
import { alpha } from '@mui/material/styles';
import RefreshIconButton from '@/commonComponents/RefreshIconButton';

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
import { logError } from '@/utilities/logger';

export default function Dashboard() {
  const { user, firstName: firstNameFromContext } = useUser();

  const [userFirstName, setUserFirstName] = useState(
    () => firstNameFromContext || user?.first_name || 'Friend',
  );
  const [requests, setRequests] = useState({ incoming: [], outgoing: [] });
  const [transfers, setTransfers] = useState([]);
  const [savedBooks, setSavedBooks] = useState([]);
  const [savedLoading, setSavedLoading] = useState(true);
  const [reviews, setReviews] = useState({ given: [], received: [] });
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [borrowedLoading, setBorrowedLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [transfersLoading, setTransfersLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [modalContext, setModalContext] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    // Warm up modal chunks so opening later doesn't suspend the whole dashboard
    void import('@/features/books/components/BookModal');
    void import('@/features/books/components/AddBookModal');
  }, []);

  const {
    categorizedBooks,
    handleDeleteBook,
    handleArchiveBook,
    refreshBooks,
    updateBookSaveStatus,
    addBookById,
    sendBookRequest,
    loading,
  } = useBookContext();

  const [initialLoaded, setInitialLoaded] = useState(false);

  const refreshRequests = useCallback(async () => {
    setRequestsLoading(true);
    const req = await getRequestsForUser(user);
    setRequests(req);
    setRequestsLoading(false);
  }, [user?.id]);

  const refreshTransfers = useCallback(async () => {
    setTransfersLoading(true);
    const trf = await getTransfers();
    setTransfers(trf);
    setTransfersLoading(false);
  }, []);

  const refreshSaved = useCallback(async () => {
    setSavedLoading(true);
    const saved = await getSavedBooks(user);
    setSavedBooks(saved);
    setSavedLoading(false);
  }, [user?.id]);

  const refreshBorrowed = useCallback(async () => {
    setBorrowedLoading(true);
    const myLoans = await getMyLoans({ role: 'borrower' });
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
    setBorrowedLoading(false);
  }, []);

  const fetchData = useCallback(async () => {
    try {
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
      setRequestsLoading(false);
      setTransfersLoading(false);
      setSavedLoading(false);
      setBorrowedLoading(false);
    } catch (e) {
      logError('Dashboard.fetchData failed', e, { userId: user?.id });
    } finally {
      setInitialLoaded(true);
    }
  }, [user?.id, refreshBooks]);

  // Global refresh button animation state
  const [globalRefreshing, setGlobalRefreshing] = useState(false);
  const handleGlobalRefresh = async () => {
    setGlobalRefreshing(true);
    try {
      await fetchData();
    } finally {
      setGlobalRefreshing(false);
    }
  };

  // Auto-refresh relevant sections (requests, transfers, borrowed) after initial load
  const [incomingSignal, setIncomingSignal] = useState(0);
  const [outgoingSignal, setOutgoingSignal] = useState(0);
  const [transfersSignal, setTransfersSignal] = useState(0);
  const [borrowedSignal, setBorrowedSignal] = useState(0);
  useEffect(() => {
    if (!initialLoaded) return;
    const tick = () => {
      if (document.visibilityState !== 'visible') return;
      setIncomingSignal((s) => s + 1);
      setOutgoingSignal((s) => s + 1);
      setTransfersSignal((s) => s + 1);
      setBorrowedSignal((s) => s + 1);
    };
    const id = setInterval(tick, 10000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [initialLoaded]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  useEffect(() => {
    if (!initialLoaded && loading === false) {
      setInitialLoaded(true);
    }
  }, [loading, initialLoaded]);
  useEffect(() => {
    if (firstNameFromContext || user?.first_name) {
      setUserFirstName(firstNameFromContext || user.first_name);
    }
  }, [firstNameFromContext, user?.first_name]);

  const handleBookClick = (book, context = 'myBooks') => {
    setSelectedBook(book);
    setModalContext(context);
  };
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
    onRequestBook: handleRequestBook,
  } = useDashboardHandlers({
    user,
    refreshers: {
      refreshRequests,
      refreshTransfers,
      refreshSaved,
      refreshBorrowed,
      refreshBooks,
    },
    archiveBook: handleArchiveBook,
    deleteBook: handleDeleteBook,
    updateBookSaveStatus,
    setSavedBooks,
    sendBookRequest,
  });

  const handleModalClose = () => {
    setSelectedBook(null);
  };

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
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
        <Paper
          elevation={2}
          sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, bgcolor: 'background.paper' }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography variant="h4" fontWeight="medium" color="text.primary">
              Hi {userFirstName || 'Friend'}, welcome to your dashboard
            </Typography>
            <RefreshIconButton
              onClick={handleGlobalRefresh}
              refreshing={globalRefreshing}
              tooltip="Refresh all"
              size="medium"
            />
          </Box>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
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
            onRefresh={refreshBooks}
            loading={!initialLoaded ? loading : false}
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
              onRequest={handleRequestBook}
              onRequestReturn={handleRequestReturn}
              onApproveReturn={handleApproveReturn}
              onAccept={handleAcceptRequest}
              onReject={handleRejectRequest}
              onCancelRequest={handleCancelRequest}
              onCompleteTransfer={handleCompleteTransfer}
              onRefresh={
                context === 'saved'
                  ? refreshSaved
                  : context === 'incoming' || context === 'outgoing'
                    ? refreshRequests
                    : context === 'transfers'
                      ? refreshTransfers
                      : context === 'lentBorrowed'
                        ? refreshBorrowed
                        : refreshBooks
              }
              loading={
                !initialLoaded
                  ? context === 'saved'
                    ? savedLoading
                    : context === 'incoming' || context === 'outgoing'
                      ? requestsLoading
                      : context === 'transfers'
                        ? transfersLoading
                        : context === 'lentBorrowed'
                          ? borrowedLoading
                          : loading
                  : false
              }
              refreshSignal={
                context === 'incoming'
                  ? incomingSignal
                  : context === 'outgoing'
                    ? outgoingSignal
                    : context === 'transfers'
                      ? transfersSignal
                      : context === 'lentBorrowed'
                        ? borrowedSignal
                        : undefined
              }
            />
          ))}

          <FeedbackSection feedbacks={reviews.received} />
        </Paper>

        <AddBookModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          setShowAddModal={setShowAddModal}
          onAdded={addBookById}
        />

        {selectedBook && (
          <Suspense fallback={<ModalOverlay />}>
            <BookModal
              open={!!selectedBook}
              onClose={handleModalClose}
              book={selectedBook}
              context={modalContext}
              status={selectedBook.status}
              onArchive={() => handleArchiveBook(selectedBook)}
              onDelete={() => handleDeleteBook(selectedBook)}
              onActionComplete={fetchData}
            />
          </Suspense>
        )}
      </Container>
    </Suspense>
  );
}
const ModalOverlay = () => (
  <Box
    sx={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
      zIndex: (theme) => theme.zIndex.modal + 1,
      background: (theme) => `
        linear-gradient(135deg, ${alpha(theme.palette.background.default, theme.palette.mode === 'dark' ? 0.75 : 0.5)}, ${alpha(theme.palette.background.default, theme.palette.mode === 'dark' ? 0.6 : 0.35)}),
        radial-gradient(circle at 20% 20%, ${alpha(theme.palette.primary.main, 0.12)} 0%, transparent 45%),
        radial-gradient(circle at 80% 80%, ${alpha(theme.palette.secondary.main, 0.14)} 0%, transparent 50%)
      `,
      backdropFilter: 'blur(6px)',
    }}
  >
    <Stack
      spacing={1.5}
      alignItems="center"
      sx={{
        color: (theme) =>
          theme.palette.mode === 'dark' ? theme.palette.grey[100] : theme.palette.text.primary,
      }}
    >
      <Box
        sx={(theme) => ({
          width: 56,
          height: 56,
          borderRadius: '50%',
          backgroundColor: theme.palette.background.paper,
          boxShadow: '0 18px 40px rgba(15, 23, 42, 0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'modal-pulse 1.4s ease-in-out infinite',
          '@keyframes modal-pulse': {
            '0%': { transform: 'scale(0.94)', opacity: 0.65 },
            '50%': { transform: 'scale(1)', opacity: 1 },
            '100%': { transform: 'scale(0.94)', opacity: 0.65 },
          },
        })}
      >
        <CircularProgress size={24} thickness={4} color="inherit" />
      </Box>
      <Typography variant="body2" sx={{ color: 'inherit', letterSpacing: 0.3 }}>
        Loading book details…
      </Typography>
    </Stack>
  </Box>
);
