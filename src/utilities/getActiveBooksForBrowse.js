// src/utilities/getActiveBooksForBrowse.js

import { getBooks } from '../services';

/**
 * Convenience wrapper to fetch only non-archived books.
 */
export default async function getActiveBooksForBrowse(user) {
  return getBooks({ user, includeArchived: false });
}
