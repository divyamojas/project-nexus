// src/services/bookRequestService.js

import supabase from './supabaseClient';
import { createTransferForAcceptedRequest } from './transferService';
import { logError } from '../utilities/logger';

/**
 * Create a borrow request for a book by the current user.
 */
export async function requestBorrowBook(book, message = '', user) {
  if (!user?.id || !book.id) {
    return false;
  }

  const requester_id = user.id;
  const requested_to = book.user_id;

  const { data, error } = await supabase
    .from('book_requests')
    .insert([
      { book_id: book.id, requested_by: requester_id, requested_to, status: 'pending', message },
    ])
    .select('id, book_id, status, requested_by, requested_to');

  if (error) {
    logError('requestBorrowBook failed', error, { bookId: book.id, requester_id, requested_to });
    throw error;
  }
  return data;
}

/**
 * Update the status of a request (accepted/rejected/cancelled).
 */
export async function updateRequestStatus(requestId, status) {
  // Fetch request to know the related book and users
  const { data: req, error: reqErr } = await supabase
    .from('book_requests')
    .select('id, book_id, requested_by, requested_to, status')
    .eq('id', requestId)
    .single();
  if (reqErr) {
    logError('updateRequestStatus: fetch request failed', reqErr, { requestId });
    throw reqErr;
  }

  // Update request status
  const { data, error } = await supabase
    .from('book_requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', requestId)
    .select('*');
  if (error) {
    logError('updateRequestStatus: update failed', error, { requestId, status });
    throw error;
  }

  // Side-effects on acceptance: schedule transfer and mark book as scheduled
  if (status === 'accepted') {
    try {
      await supabase.from('books').update({ status: 'scheduled' }).eq('id', req.book_id);
      await createTransferForAcceptedRequest(requestId);
    } catch (e) {
      // Log but do not throw to avoid breaking UI flow
      console.error('Failed to trigger transfer on acceptance:', e);
    }
  }

  return data;
}

/**
 * Get all requests for a given book id.
 */
export async function getRequestsForBook(book_id) {
  if (!book_id) {
    // console.warn('getRequestsForBook: book_id is undefined or null');
    return [];
  }
  const { data, error } = await supabase
    .from('book_requests')
    .select(
      `
      id,
      requested_by,
      requested_to,
      status,
      message,
      created_at,
      updated_at,
      profiles:requested_by ( first_name, last_name, username )
    `,
    )
    .eq('book_id', book_id);

  if (error) {
    logError('getRequestsForBook failed', error, { book_id });
    throw error;
  }

  return data ?? [];
}

/**
 * For a list of owned book IDs, return requests targeting those books (minus cancelled/rejected).
 */
export async function getIncomingRequestsForBooks(ownedBookIds) {
  const { data, error } = await supabase
    .from('book_requests')
    .select(
      `
      id,
      requested_by,
      requested_to,
      status,
      message,
      created_at,
      updated_at,
      book:book_id (
        id,
        user_id,
        status,
        condition,
        archived,
        created_at,
        books_catalog (
          id,
          title,
          author,
          cover_url
        )
      )
    `,
    )
    .in('book_id', ownedBookIds)
    .neq('status', 'cancelled')
    .neq('status', 'rejected')
    .neq('status', 'accepted');

  if (error) {
    logError('getIncomingRequestsForBooks failed', error, { ownedBookIds });
    throw error;
  }

  const InReq = (data || []).map((entry) => ({
    id: entry.book.id,
    user_id: entry.book.user_id,
    status: entry.book.status,
    condition: entry.book.condition,
    created_at: entry.book.created_at,
    catalog: entry.book.books_catalog,
    archived: entry.book.archived,
    request_status: entry.status,
    requested_by: entry.requested_by,
    requested_to: entry.requested_to,
    request_id: entry.id,
  }));

  return {
    InReq,
    error,
  };
}

/**
 * Get requests initiated by the given user.
 */
export async function getOutgoingRequestsForUser(userId) {
  const { data, error } = await supabase
    .from('book_requests')
    .select(
      `
      id,
      requested_by,
      requested_to,
      status,
      message,
      created_at,
      updated_at,
      book:book_id (
        id,
        user_id,
        status,
        condition,
        archived,
        created_at,
        books_catalog (
          id,
          title,
          author,
          cover_url
        )
      )
    `,
    )
    .eq('requested_by', userId)
    .neq('status', 'cancelled')
    .neq('status', 'rejected')
    .neq('status', 'accepted');

  if (error) {
    logError('getOutgoingRequestsForUser failed', error, { userId });
    throw error;
  }

  const OutReq = (data || []).map((entry) => {
    const book = entry.book || {};
    return {
      id: book.id,
      book_id: book.id,
      user_id: book.user_id,
      status: book.status,
      condition: book.condition,
      created_at: book.created_at,
      catalog: book.books_catalog,
      archived: book.archived,
      request_status: entry.status,
      requested_by: entry.requested_by,
      requested_to: entry.requested_to,
      request_id: entry.id,
    };
  });

  return { OutReq, error };
}
