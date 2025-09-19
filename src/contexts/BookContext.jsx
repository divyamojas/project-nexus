// src/contexts/BookContext.jsx

import { useState, useEffect, useMemo, useCallback } from 'react';
import { bookContext } from './bookContextObject';

import { useUser } from './hooks/useUser';

import {
  archiveBook,
  deleteBook,
  getBooks,
  getSavedBooks,
  subscribeToBookChanges,
  unsubscribeFromBookChanges,
  toggleSaveBook,
  getBookWithRelations,
} from '../services';
import { requestBorrowBook } from '../services/bookRequestService';
import { BookFormProvider } from './BookFormContext';

// context object moved to ./bookContextObject to satisfy Fast Refresh

/**
 * Provides book lists, filters, and actions (archive/delete/save/request).
 * Composes the separate BookFormProvider to keep form state isolated.
 */
export const BookProvider = ({ children }) => {
  const { user } = useUser();
  const userId = user?.id;
  const [books, setBooks] = useState([]);
  const [savedBooks, setSavedBooks] = useState([]);
  const [filters, setFilters] = useState({
    searchTerm: '',
    statusFilter: 'all',
    sortBy: 'date_added',
    includeOwn: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const categorizedBooks = useMemo(
    () => ({
      availableBooks: books.filter((b) => !b.archived && !b.borrowed_by),
      // Only books I own that are currently borrowed out
      lentBooks: books.filter((b) => !b.archived && b.borrowed_by && b.user_id === userId),
      archivedBooks: books.filter((b) => b.archived),
      myActiveBooks: books.filter((b) => !b.archived && b.user_id === userId),
    }),
    [books, userId],
  );

  const filteredBooks = useMemo(() => {
    const search = filters.searchTerm.toLowerCase();
    return books
      .filter((book) => {
        return book.archived !== true;
      })
      .filter((book) => {
        return (
          book.catalog?.title?.toLowerCase().includes(search) ||
          book.catalog?.author?.toLowerCase().includes(search)
        );
      })
      .filter((book) => {
        const isOwnBook = userId && book.user_id?.toLowerCase() === userId.toLowerCase();
        if (!filters.includeOwn && isOwnBook) return false;
        if (filters.statusFilter === 'all') return true;
        return book.status === filters.statusFilter;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'name') {
          return a.catalog?.title?.localeCompare(b.catalog?.title);
        }
        if (filters.sortBy === 'date_added') {
          return new Date(b.created_at) - new Date(a.created_at);
        }
        return 0;
      });
  }, [books, filters, userId]);

  const refreshBooks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBooks({ includeArchived: true, user });
      setBooks(data);
      setError(null);
    } catch (err) {
      console.error('refreshBooks error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refreshSavedBooks = useCallback(async () => {
    try {
      const data = await getSavedBooks(user);
      setSavedBooks(data);
    } catch (err) {
      console.error('refreshSavedBooks error:', err);
    }
  }, [user]);

  const updateBookSaveStatus = useCallback((bookId, isSaved) => {
    setBooks((prevBooks) =>
      prevBooks.map((book) => (book.id === bookId ? { ...book, is_saved: isSaved } : book)),
    );
  }, []);

  const toggleBookSaveStatus = useCallback(
    async (book) => {
      try {
        const shouldSave = !book.is_saved;
        await toggleSaveBook(book.id, shouldSave, book.catalog.id, user);
        updateBookSaveStatus(book.id, shouldSave);
        // Keep savedBooks list in sync so callers do not need an extra refetch.
        setSavedBooks((prev) => {
          if (shouldSave) {
            const exists = prev.some((item) => item.id === book.id);
            if (exists) {
              return prev.map((item) => (item.id === book.id ? { ...item, is_saved: true } : item));
            }
            return [{ ...book, is_saved: true }, ...prev];
          }
          return prev.filter((item) => item.id !== book.id);
        });
      } catch (err) {
        console.error('Failed to toggle save:', err);
      }
    },
    [updateBookSaveStatus, user, setSavedBooks],
  );

  const addBookById = useCallback(
    async (bookId) => {
      try {
        const newBook = await getBookWithRelations(bookId, user);
        if (newBook) {
          setBooks((prev) => {
            const exists = prev.some((b) => b.id === newBook.id);
            return exists ? prev : [newBook, ...prev];
          });
        } else {
          await refreshBooks();
        }
      } catch (e) {
        console.error('addBookById error:', e);
        await refreshBooks();
      }
    },
    [user, refreshBooks],
  );

  const sendBookRequest = useCallback(
    async (book, message = 'Hi! I would like to borrow this book.') => {
      if (!book?.id) return null;
      try {
        const response = await requestBorrowBook(book, message, user);
        const requestRecord = Array.isArray(response) ? response[0] : response;
        if (requestRecord) {
          setBooks((prev) =>
            prev.map((b) =>
              b.id === book.id
                ? {
                    ...b,
                    request_status: requestRecord.status,
                    requested_by: requestRecord.requested_by,
                    requested_to: requestRecord.requested_to,
                    request_id: requestRecord.id,
                  }
                : b,
            ),
          );
          setSavedBooks((prev) =>
            prev.map((b) =>
              b.id === book.id
                ? {
                    ...b,
                    request_status: requestRecord.status,
                    requested_by: requestRecord.requested_by,
                    request_id: requestRecord.id,
                  }
                : b,
            ),
          );
        }
        return requestRecord || true;
      } catch (err) {
        console.error('Failed to request book:', err);
        return null;
      }
    },
    [user, setBooks, setSavedBooks],
  );

  const handleDeleteBook = useCallback(
    async (book) => {
      const ok = await deleteBook(book.id);
      if (ok) {
        // Remove only the deleted book to avoid full refetch
        setBooks((prev) => prev.filter((b) => b.id !== book.id));
      } else {
        await refreshBooks();
      }
    },
    [refreshBooks],
  );

  const handleArchiveBook = useCallback(
    async (book) => {
      const ok = await archiveBook(book.id, !book.archived);
      if (ok) {
        // Toggle archived flag locally
        setBooks((prev) =>
          prev.map((b) => (b.id === book.id ? { ...b, archived: !b.archived } : b)),
        );
      } else {
        await refreshBooks();
      }
    },
    [refreshBooks],
  );

  useEffect(() => {
    if (userId) {
      refreshBooks();
      refreshSavedBooks();
    }
  }, [userId, refreshBooks, refreshSavedBooks]);

  useEffect(() => {
    const onRealtime = (payload) => {
      const type = payload?.eventType || payload?.event || payload?.type;
      const row = payload?.new || payload?.record;
      if (type === 'INSERT' && row?.user_id === userId) {
        addBookById(row.id);
        return;
      }
      if (type === 'UPDATE') {
        // For archive toggles etc., fetch single if it's mine, else do a light refresh
        if (row?.user_id === userId) {
          addBookById(row.id);
          return;
        }
      }
      // Fallback: refresh list
      refreshBooks();
    };
    const sub = subscribeToBookChanges(onRealtime);
    return () => {
      try {
        sub.unsubscribe?.();
      } catch {}
      // Also clear the module-level channel to allow re-subscription when needed
      try {
        unsubscribeFromBookChanges();
      } catch {}
    };
  }, [userId, addBookById, refreshBooks]);

  // Listen for local app-wide events (optimistic UI updates)
  useEffect(() => {
    const onAdded = (e) => {
      const id = e?.detail?.id;
      if (id) addBookById(id);
    };
    window.addEventListener('books:added', onAdded);
    return () => window.removeEventListener('books:added', onAdded);
  }, [addBookById]);

  return (
    <bookContext.Provider
      value={{
        books,
        savedBooks,
        categorizedBooks,
        filteredBooks,
        filters,
        setFilters,
        refreshBooks,
        refreshSavedBooks,
        updateBookSaveStatus,
        toggleBookSaveStatus,
        addBookById,
        sendBookRequest,
        handleDeleteBook,
        handleArchiveBook,
        loading,
        error,
      }}
    >
      <BookFormProvider>{children}</BookFormProvider>
    </bookContext.Provider>
  );
};
