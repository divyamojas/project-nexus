// src/contexts/hooks/useBookForm.js
import { useContext } from 'react';
import { BookFormContext } from '../BookFormContext';

export function useBookForm() {
  return useContext(BookFormContext);
}
