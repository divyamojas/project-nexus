// src/services/books.js

import { supabase } from './supabaseClient';

export async function getAvailableBooks() {
  const { data, error } = await supabase
    .from('books')
    .select(
      `
      id,
      status,
      condition,
      created_at,
      owner_id,
      books_catalog (
        title,
        author,
        genre,
        tags,
        cover_image_url
      )
    `,
    )
    .eq('archived', false);

  if (error) throw error;
  return data || [];
}

export function filterAndSortBooks(books, options = {}) {
  const {
    searchTerm = '',
    statusFilter = 'all',
    sortBy = 'date_added',
    userId = null,
    includeOwn = false,
  } = options;

  return books
    .filter((book) => {
      const search = searchTerm.toLowerCase();
      return (
        book.books_catalog?.title?.toLowerCase().includes(search) ||
        book.books_catalog?.author?.toLowerCase().includes(search)
      );
    })
    .filter((book) => {
      if (!includeOwn && userId && book.owner_id === userId) return false;
      if (statusFilter === 'all') return true;
      return book.status === statusFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.books_catalog?.title?.localeCompare(b.books_catalog?.title);
      }
      if (sortBy === 'date_added') {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      return 0;
    });
}
