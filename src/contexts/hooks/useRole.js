// src/contexts/hooks/useRole.js

import { useUser } from './useUser';

export default function useRole() {
  const { role = 'user', isAdmin = false, isSuperAdmin = false } = useUser() || {};
  return { role, isAdmin, isSuperAdmin };
}
