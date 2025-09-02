// src/contexts/hooks/useBookForm.js
import { useContext } from 'react';
import { bookFormContext } from '../bookFormContextObject';

export function useBookForm() {
  return useContext(bookFormContext);
}
