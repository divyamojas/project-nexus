// /src/contexts/BookFormContext.jsx

import { createContext, useContext, useState, useCallback } from 'react';
import { INITIAL_BOOK_FORM_DATA } from '../constants/constants';

export const BookFormContext = createContext();

export const BookFormProvider = ({ children }) => {
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

  return (
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
  );
};

// Hook moved to src/contexts/hooks/useBookForm.js
