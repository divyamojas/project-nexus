// src/contexts/hooks/useBookContext.js
import { useContext } from 'react';
import { bookContext } from '../BookContext';

export function useBookContext() {
  return useContext(bookContext);
}
