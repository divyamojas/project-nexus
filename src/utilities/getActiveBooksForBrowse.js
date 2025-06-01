// src/utilities/getActiveBooksForBrowse.js

import { getBooks } from '../services';

//
export default async function getActiveBooksForBrowse(userData) {
  return getBooks({ userData, includeArchived: false });
}
