// src/contexts/hooks/useBookContext.js
import { useContext } from 'react';
import { BookContext } from '../BookContext';

export function useBookContext() {
  return useContext(BookContext);
}
