// src/contexts/hooks/useUser.js
import { useContext } from 'react';
import { userContext } from '../UserContext';

export function useUser() {
  return useContext(userContext);
}
