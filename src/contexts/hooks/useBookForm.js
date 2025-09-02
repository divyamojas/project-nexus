// src/contexts/hooks/useBookForm.js
import { useContext } from 'react';
import { bookFormContext } from '../BookFormContext';

export function useBookForm() {
  return useContext(bookFormContext);
}
