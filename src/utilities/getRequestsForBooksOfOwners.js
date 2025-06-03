// src/utilities/getRequestsForBooksOfUsers.js

import { getRequestsForBook, getMyBooks } from '../services';

export default async function getRequestsForBooksOfUsers(userData) {
  if (!userData?.id) {
    return [];
  }

  // Step 1: Get all book IDs owned by the user
  const ownedBookIds = await getMyBooks(userData, true); // onlyId = true returns [id1, id2, ...]

  if (!Array.isArray(ownedBookIds) || ownedBookIds.length === 0) {
    console.info('User has no owned books.');
    return [];
  }

  // Step 2: Get all requests for each book (in parallel)
  const allRequestsPromises = ownedBookIds.map((bookId) => getRequestsForBook(bookId));

  try {
    const allRequestsArrays = await Promise.all(allRequestsPromises);

    // Flatten the array of arrays into a single array of requests
    const allRequests = allRequestsArrays.flat();

    return allRequests;
  } catch (err) {
    console.error('Failed to fetch one or more book requests:', err);
    return [];
  }
}
