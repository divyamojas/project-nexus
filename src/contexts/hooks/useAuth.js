// src/contexts/hooks/useAuth.js
import { useContext } from 'react';
import { authContext } from '../authContextObject';

export function useAuth() {
  return useContext(authContext);
}
