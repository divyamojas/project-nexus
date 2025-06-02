// /src/services/bookRequestService.js

import { getBookById } from './bookService';
import supabase from './supabaseClient';

export async function requestBorrowBook(book_id, message = '', userData) {
  if (!userData?.id) {
    return false;
  }

  const { data: bookData, error: bookError } = await getBookById(book_id);
  if (bookError) throw bookError;

  const requester_id = userData.id;
  const requested_to = bookData.user_id;

  const { data, error } = await supabase
    .from('book_requests')
    .insert([{ book_id, requested_by: requester_id, requested_to, status: 'pending', message }]);

  if (error) throw error;
  return data;
}

export async function updateRequestStatus(requestId, status) {
  const { data, error } = await supabase
    .from('book_requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', requestId);

  if (error) throw error;
  return data;
}

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
    console.error('Error at getRequestsForBook:', error);
    throw error;
  }

  return data ?? [];
}

export async function getIncomingRequestsForBooks(ownedBookIds) {
  const { data, error } = await supabase
    .from('book_requests')
    .select('*, book:book_id(user_id, books_catalog(title))')
    .in('book_id', ownedBookIds);

  return { data, error };
}

export async function getOutgoingRequestsForUser(userId) {
  const { data, error } = await supabase
    .from('book_requests')
    .select('*, book:book_id(user_id, books_catalog(title))')
    .eq('requested_by', userId);

  return { data, error };
}
