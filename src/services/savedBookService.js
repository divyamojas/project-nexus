// src/services/savedBookService.js

import supabase from './supabaseClient';
import { getOutgoingRequestsForUser } from './bookRequestService';

/**
 * Return books saved by the given user.
 */

export async function getSavedBooks(user) {
  if (!user?.id) return [];

  const userId = user.id;

  const { data, error } = await supabase
    .from('saved_books')
    .select(
      `
      id,
      catalog_id,
      created_at,
      book:book_id(
        id,
        user_id,
        status,
        condition,
        created_at,
        books_catalog(id, title, author, cover_url)
      )
    `,
    )
    .eq('user_id', userId);

  if (error) {
    console.error('getSavedBooks error:', error);
    return [];
  }

  const savedList = data.map((entry) => ({
    id: entry.book.id,
    user_id: entry.book.user_id,
    status: entry.book.status,
    condition: entry.book.condition,
    created_at: entry.book.created_at,
    catalog: entry.book.books_catalog,
    is_saved: true,
  }));

  try {
    const { OutReq } = await getOutgoingRequestsForUser(userId);
    const requestMap = new Map((OutReq || []).map((req) => [req.book_id || req.id, req]));
    return savedList.map((book) => {
      const request = requestMap.get(book.id);
      return request
        ? {
            ...book,
            request_status: request.request_status,
            requested_by: request.requested_by,
            requested_to: request.requested_to,
            request_id: request.request_id,
          }
        : book;
    });
  } catch (err) {
    console.error('getSavedBooks merge outgoing requests failed:', err);
    return savedList;
  }
}

/**
 * Save or unsave a book for the user.
 */
export async function toggleSaveBook(id, shouldSave, catalogId, user) {
  if (!user?.id) return false;

  const userId = user.id;

  if (shouldSave) {
    const { error } = await supabase.from('saved_books').insert({
      book_id: id,
      user_id: userId,
      catalog_id: catalogId,
    });
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('saved_books')
      .delete()
      .eq('user_id', userId)
      .eq('book_id', id);

    if (error) throw error;
  }

  return true;
}
