// src/contexts/hooks/useUser.js
import { useContext } from 'react';
import { userContext } from '../userContextObject';

export function useUser() {
  return useContext(userContext);
}
