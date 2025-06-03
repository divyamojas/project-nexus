// /src/services/bookRequestService.js

import { getBookById } from './bookService';
import supabase from './supabaseClient';

export async function requestBorrowBook(book, message = '', userData) {
  if (!userData?.id || !book.id) {
    return false;
  }

  const requester_id = userData.id;
  const requested_to = book.user_id;

  const { data, error } = await supabase
    .from('book_requests')
    .insert([
      { book_id: book.id, requested_by: requester_id, requested_to, status: 'pending', message },
    ]);

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
    .neq('status', 'cancelled');

  if (error) throw error;

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
    .neq('status', 'cancelled');

  if (error) throw error;

  const OutReq = (data || []).map((entry) => ({
    book_id: entry.book.id,
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

  return { OutReq, error };
}
