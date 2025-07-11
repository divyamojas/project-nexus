// src/utilities/getRequestsForUser.js

import { getIncomingRequestsForBooks, getOutgoingRequestsForUser } from '../services';
import { getMyBooks } from '../services/bookService';

export default async function getRequestsForUser(userData) {
  if (!userData?.id) return { incoming: [], outgoing: [] };

  const userId = userData.id;

  // 1. Get IDs of books owned by this user
  const ownedBooks = await getMyBooks(userData, true);

  // 2. Get incoming requests (for books the user owns)
  const { InReq: incoming, error: inErr } = await getIncomingRequestsForBooks(ownedBooks);

  // 3. Get outgoing requests (user is the requester)
  const { OutReq: outgoing, error: outErr } = await getOutgoingRequestsForUser(userId);

  if (inErr) console.error('getRequests incoming error:', inErr);
  if (outErr) console.error('getRequests outgoing error:', outErr);

  return {
    incoming: incoming ?? [],
    outgoing: outgoing ?? [],
  };
}
