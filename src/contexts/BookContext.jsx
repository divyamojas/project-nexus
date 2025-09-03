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
  }, [user?.id]);

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
      } catch (err) {
        console.error('Failed to toggle save:', err);
      }
    },
    [updateBookSaveStatus, user],
  );

  const sendBookRequest = useCallback(
    async (book, message = 'Hi! I would like to borrow this book.') => {
      try {
        await requestBorrowBook(book, message, user);
        return true;
      } catch (err) {
        console.error('Failed to request book:', err);
        return false;
      }
    },
    [user],
  );

  const handleDeleteBook = useCallback(
    async (book) => {
      await deleteBook(book.id);
      await refreshBooks();
    },
    [refreshBooks],
  );

  const handleArchiveBook = useCallback(
    async (book) => {
      await archiveBook(book.id, !book.archived);
      await refreshBooks();
    },
    [refreshBooks],
  );

  useEffect(() => {
    if (userId) {
      refreshBooks();
      refreshSavedBooks();
    }
  }, [userId]);

  useEffect(() => {
    const sub = subscribeToBookChanges(refreshBooks);
    return () => {
      try {
        sub.unsubscribe?.();
      } catch {}
      // Also clear the module-level channel to allow re-subscription when needed
      try {
        unsubscribeFromBookChanges();
      } catch {}
    };
  }, [refreshBooks]);

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
