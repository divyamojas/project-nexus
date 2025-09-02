// /src/contexts/BookFormContext.jsx

import { useContext, useState, useCallback } from 'react';
import { bookFormContext } from './bookFormContextObject';
import { INITIAL_BOOK_FORM_DATA } from '../constants/constants';

// context object moved to ./bookFormContextObject to satisfy Fast Refresh

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
    <bookFormContext.Provider
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
    </bookFormContext.Provider>
  );
};

// Hook moved to src/contexts/hooks/useBookForm.js
