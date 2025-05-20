// /src/contexts/BookContext.jsx

import { createContext, useState, useEffect, useMemo, useContext, useCallback } from 'react';
import {
  getBooks,
  getSavedBooks,
  deleteBook,
  archiveBook,
  subscribeToBookChanges,
  toggleSaveBook,
} from '../services/bookService';

import { useUser } from '../contexts/UserContext';

import { INITIAL_BOOK_FORM_DATA } from '../constants/constants';

const BookContext = createContext();
const BookFormContext = createContext();

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

  // Book form state
  const [formData, setFormData] = useState(INITIAL_BOOK_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [imageStatus, setImageStatus] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [formLoading, setFormLoading] = useState(false);

  const resetForm = useCallback(() => {
    setFormData(INITIAL_BOOK_FORM_DATA);
    setErrors({});
    setImageStatus('');
    setSearchResults([]);
  }, []);

  const categorizedBooks = useMemo(
    () => ({
      availableBooks: books.filter((b) => !b.archived && !b.borrowed_by),
      lentBooks: books.filter((b) => !b.archived && b.borrowed_by),
      archivedBooks: books.filter((b) => b.archived),
      myActiveBooks: books.filter((b) => !b.archived && b.user_id === userId),
    }),
    [books, userId],
  );

  const filteredBooks = useMemo(() => {
    const search = filters.searchTerm.toLowerCase();
    return books
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

  const refreshBooks = async () => {
    setLoading(true);
    try {
      const data = await getBooks({ includeArchived: true });
      setBooks(data);
      setError(null);
    } catch (err) {
      console.error('refreshBooks error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const refreshSavedBooks = async () => {
    try {
      const data = await getSavedBooks();
      setSavedBooks(data);
    } catch (err) {
      console.error('refreshSavedBooks error:', err);
    }
  };

  const updateBookSaveStatus = (bookId, isSaved) => {
    setBooks((prevBooks) =>
      prevBooks.map((book) => (book.id === bookId ? { ...book, is_saved: isSaved } : book)),
    );
  };

  const toggleBookSaveStatus = async (book) => {
    try {
      const shouldSave = !book.is_saved;
      await toggleSaveBook(book.id, shouldSave, book.catalog.id);
      updateBookSaveStatus(book.id, shouldSave);
    } catch (err) {
      console.error('Failed to toggle save:', err);
    }
  };

  const sendBookRequest = async (book, message = 'Hi! I would like to borrow this book.') => {
    try {
      await requestBook(book.id, message);
      return true;
    } catch (err) {
      console.error('Failed to request book:', err);
      return false;
    }
  };

  const handleDeleteBook = async (book) => {
    await deleteBook(book.id);
    await refreshBooks();
  };

  const handleArchiveBook = async (book) => {
    await archiveBook(book.id, !book.archived);
    await refreshBooks();
  };

  useEffect(() => {
    if (userId) {
      refreshBooks();
      refreshSavedBooks();
    }
  }, [userId]);

  useEffect(() => {
    const sub = subscribeToBookChanges(refreshBooks);
    return () => {
      sub.unsubscribe();
    };
  }, []);

  return (
    <BookContext.Provider
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
      <BookFormContext.Provider
        value={{
          formData,
          setFormData,
          errors,
          setErrors,
          imageStatus,
          setImageStatus,
          searchResults,
          setSearchResults,
          formLoading,
          setFormLoading,
          resetForm,
        }}
      >
        {children}
      </BookFormContext.Provider>
    </BookContext.Provider>
  );
};

export const useBookContext = () => useContext(BookContext);
export const useBookForm = () => useContext(BookFormContext);
