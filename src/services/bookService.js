// /src/services/bookService.js

import supabase from './supabaseClient';

export async function getBookById(book_id) {
  const { data: bookData, error: bookError } = await supabase
    .from('books')
    .select('user_id')
    .eq('id', book_id)
    .single();

  return { bookData, bookError };
}

export async function getMyBooks(userData, onlyId = false) {
  if (!userData?.id) return [];

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
    .eq('user_id', userData.id);

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

export async function addBookInstance({ catalog_id, condition, user_id, archived }) {
  const { data, error } = await supabase
    .from('books')
    .insert([{ catalog_id, condition, user_id, archived }]);

  if (error) {
    console.error('Error adding book instance:', error);
    return null;
  }

  return data?.[0] || null;
}

export async function deleteBook(bookId) {
  const { error } = await supabase.from('books').delete().eq('id', bookId);
  console.log('deleted', bookId);
  if (error) {
    console.error('deleteBook error:', error);
    return false;
  }
  return true;
}

export async function archiveBook(bookId, archive = true) {
  const { error } = await supabase.from('books').update({ archived: archive }).eq('id', bookId);
  if (error) {
    console.error('archiveBook error:', error);
    return false;
  }
  return true;
}

export async function getBooks({ includeArchived = true, userData } = {}) {
  if (!userData?.id) return [];

  const userId = userData.id;

  let query = supabase.from('books').select(`
    id,
    status,
    condition,
    created_at,
    user_id,
    archived,
    catalog:catalog_id (id, title, author, cover_url),
    saved_books (user_id)
  `);

  if (!includeArchived) {
    query = query.eq('archived', false);
  }

  const { data, error } = await query;
  if (error) throw error;

  return data.map((book) => {
    const isSaved = Array.isArray(book.saved_books)
      ? book.saved_books.some((entry) => entry.user_id === userId)
      : false;

    return {
      id: book.id,
      user_id: book.user_id,
      status: book.status,
      condition: book.condition,
      created_at: book.created_at,
      catalog: book.catalog,
      archived: book.archived,
      is_saved: isSaved,
    };
  });
}
