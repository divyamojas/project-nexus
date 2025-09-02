// src/services/returnRequestService.js

import supabase from './supabaseClient';

/**
 * Create a return request for a given book from the current user.
 */
export async function requestBookReturn(bookId, user) {
  if (!user?.id) return false;

  const userId = user.id;

  const { error } = await supabase.from('return_requests').insert([
    {
      book_id: bookId,
      requested_by: userId,
      requested_at: new Date().toISOString(),
    },
  ]);

  if (error) {
    console.error('requestBookReturn error:', error);
    throw error;
  }

  return true;
}
