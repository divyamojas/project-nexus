// src/services/bookService.js

import supabase from './supabaseClient';
import { logError } from '../utilities/logger';

/**
 * Fetch the owner id of a book by its id.
 * Use case: Determine book ownership for permission checks.
 */
export async function getBookById(book_id) {
  const { data: bookData, error: bookError } = await supabase
    .from('books')
    .select('user_id')
    .eq('id', book_id)
    .single();

  return { bookData, bookError };
}

/**
 * Get all books owned by the provided user.
 * Pass onlyId=true to return an array of book IDs only.
 */
export async function getMyBooks(user, onlyId = false) {
  if (!user?.id) return [];

  const { data, error } = await supabase
    .from('books')
    .select(
      `
      id,
      status,
      condition,
      created_at,
      archived,
      user_id,
      books_catalog (
        id,
        title,
        author,
        cover_url
      )
    `,
    )
    .eq('user_id', user.id);

  if (error) {
    console.error('getMyBooks error:', error);
    return [];
  }

  if (onlyId) return data.map((book) => book.id);

  return data.map((book) => ({
    id: book.id,
    user_id: book.user_id,
    status: book.status,
    condition: book.condition,
    created_at: book.created_at,
    catalog: book.books_catalog,
    is_saved: false,
  }));
}

/**
 * Insert a new book instance referencing an existing catalog entry.
 */
export async function addBookInstance({ catalog_id, condition, user_id, archived }) {
  const { data, error } = await supabase
    .from('books')
    .insert([{ catalog_id, condition, user_id, archived }])
    .select('id')
    .single();

  if (error) {
    console.error('Error adding book instance:', error);
    return null;
  }

  return data || null;
}

/**
 * Permanently delete a book instance by id.
 */
export async function deleteBook(bookId) {
  const { error } = await supabase.from('books').delete().eq('id', bookId);
  if (error) {
    console.error('deleteBook error:', error);
    return false;
  }
  return true;
}

/**
 * Toggle archive flag for a book instance.
 */
export async function archiveBook(bookId, archive = true) {
  const { error } = await supabase.from('books').update({ archived: archive }).eq('id', bookId);
  if (error) {
    console.error('archiveBook error:', error);
    return false;
  }
  return true;
}

/**
 * Get books visible to the current user; includes saved status.
 */
export async function getBooks({ includeArchived = true, user } = {}) {
  if (!user?.id) return [];

  const userId = user.id;

  let query = supabase.from('books').select(`
    id,
    status,
    condition,
    created_at,
    user_id,
    archived,
    catalog:catalog_id (id, title, author, cover_url),
    saved_books (user_id),
    book_requests!left (id, status, requested_by, requested_to),
    book_loans!left (id, status, borrower_id, lender_id, loaned_at, due_date, returned_at),
    return_requests!left (id, status, loan_id, requested_by, requested_at, resolved_at)
  `);

  if (!includeArchived) {
    query = query.eq('archived', false);
  }

  const { data, error } = await query;
  if (error) {
    logError('getBooks failed', error, { includeArchived, userId });
    throw error;
  }

  return data.map((book) => {
    const isSaved = Array.isArray(book.saved_books)
      ? book.saved_books.some((entry) => entry.user_id === userId)
      : false;

    // Determine active loan (if any) and derive borrowed_by
    const activeLoan = Array.isArray(book.book_loans)
      ? book.book_loans.find((l) => l.status === 'active')
      : null;
    const borrowedBy = activeLoan?.borrower_id || null;
    const pendingReturn = Array.isArray(book.return_requests)
      ? book.return_requests.find((r) => r.status === 'pending')
      : null;

    // Determine if current user has a pending borrow request for this book
    const outgoingReq = Array.isArray(book.book_requests)
      ? book.book_requests.find((r) => r.status === 'pending' && r.requested_by === userId)
      : null;

    return {
      id: book.id,
      user_id: book.user_id,
      status: book.status,
      condition: book.condition,
      created_at: book.created_at,
      catalog: book.catalog,
      archived: book.archived,
      is_saved: isSaved,
      borrowed_by: borrowedBy,
      return_request_id: pendingReturn?.id || null,
      request_status: outgoingReq?.status || null,
      requested_by: outgoingReq?.requested_by || null,
      request_id: outgoingReq?.id || null,
    };
  });
}

/**
 * Fetch a single book with the same shape as getBooks mapping.
 */
export async function getBookWithRelations(id, user) {
  if (!id) return null;

  const userId = user?.id;
  const { data, error } = await supabase
    .from('books')
    .select(
      `
      id,
      status,
      condition,
      created_at,
      user_id,
      archived,
      catalog:catalog_id (id, title, author, cover_url),
      saved_books (user_id),
      book_loans!left (id, status, borrower_id, lender_id, loaned_at, due_date, returned_at),
      return_requests!left (id, status, loan_id, requested_by, requested_at, resolved_at)
    `,
    )
    .eq('id', id)
    .single();

  if (error) return null;

  const isSaved = Array.isArray(data.saved_books)
    ? data.saved_books.some((entry) => entry.user_id === userId)
    : false;
  const activeLoan = Array.isArray(data.book_loans)
    ? data.book_loans.find((l) => l.status === 'active')
    : null;
  const borrowedBy = activeLoan?.borrower_id || null;
  const pendingReturn = Array.isArray(data.return_requests)
    ? data.return_requests.find((r) => r.status === 'pending')
    : null;

  return {
    id: data.id,
    user_id: data.user_id,
    status: data.status,
    condition: data.condition,
    created_at: data.created_at,
    catalog: data.catalog,
    archived: data.archived,
    is_saved: isSaved,
    borrowed_by: borrowedBy,
    return_request_id: pendingReturn?.id || null,
  };
}

/**
 * Upload a book cover image for the user into storage and return public URL.
 */
export async function uploadBookCover({ user, file }) {
  try {
    const ext = file.name.split('.').pop();
    const filePath = `covers/${user.id}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('book-bucket')
      .upload(filePath, file, { upsert: true });
    if (uploadError) {
      return { error: 'Failed to upload cover image.' };
    }
    const { data } = supabase.storage.from('book-bucket').getPublicUrl(filePath);
    return { url: data?.publicUrl || '' };
  } catch {
    return { error: 'Unexpected error during cover upload.' };
  }
}
