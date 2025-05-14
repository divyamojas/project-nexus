// src/services/bookRequests.js

import { supabase } from './supabaseClient';

export async function requestBorrowBook(book_id, requester_id = null, is_anonymous = false) {
  const { data, error } = await supabase.from('book_requests').insert([
    {
      book_id,
      requester_id,
      is_anonymous,
      status: 'pending',
      requested_at: new Date().toISOString(),
    },
  ]);

  if (error) throw error;
  return data;
}

export async function updateRequestStatus(requestId, status) {
  const { data, error } = await supabase
    .from('book_requests')
    .update({ status })
    .eq('id', requestId);

  if (error) throw error;
  return data;
}

export async function getRequestsForBook(book_id) {
  const { data, error } = await supabase
    .from('book_requests')
    .select(
      `
      id,
      requester_id,
      is_anonymous,
      status,
      requested_at,
      profiles:requester_id ( first_name, last_name, username )
    `,
    )
    .eq('book_id', book_id);

  if (error) throw error;
  return data;
}
