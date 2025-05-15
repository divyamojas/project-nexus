// /src/services/bookService.js

import { supabase } from '@/services/supabaseClient';

// =========================
// Catalog Operations
// =========================

export const fetchCatalogBooks = async () => {
  const { data, error } = await supabase.from('books_catalog').select('*').order('title');
  if (error) console.error('fetchCatalogBooks error:', error);
  return data || [];
};

export const searchBooksCatalogByTitle = async (title) => {
  const { data, error } = await supabase
    .from('books_catalog')
    .select('*')
    .ilike('title', `%${title}%`)
    .limit(5);
  if (error) console.error('searchBooksCatalogByTitle error:', error);
  return data || [];
};

export async function addBookToCatalog({ title, author, isbn, cover_url }) {
  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError || !userData?.user) throw authError;

  const { data, error } = await supabase
    .from('books_catalog')
    .insert([{ title, author, isbn, cover_url, created_by: userData.user.id }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export const uploadCoverImage = async (file) => {
  const fileExt = file.name.split('.').pop();
  const filePath = `covers/${Date.now()}.${fileExt}`;

  const { error } = await supabase.storage.from('book-covers').upload(filePath, file);
  if (error) {
    console.error('uploadCoverImage error:', error);
    return null;
  }

  const { data: urlData } = supabase.storage.from('book-covers').getPublicUrl(filePath);
  return urlData?.publicUrl;
};

// =========================
// Book Instance Operations
// =========================

export const addBookInstance = async (bookInstanceData) => {
  const { error } = await supabase.from('books').insert([bookInstanceData]);
  if (error) console.error('addBookInstance error:', error);
  return !error;
};

export const addBookToCatalogAndStock = async ({ title, author, condition }) => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user?.id) {
    console.error('User not authenticated');
    return false;
  }

  const userId = userData.user.id;

  const { data: existing } = await supabase
    .from('books_catalog')
    .select('id')
    .eq('title', title)
    .eq('author', author)
    .limit(1)
    .maybeSingle();

  const catalogId = existing?.id || (await addBookToCatalog({ title, author }))?.id;

  return await addBookInstance({
    catalog_id: catalogId,
    condition,
    user_id: userId,
    archived: false,
  });
};

export const deleteBook = async (bookId) => {
  const { error } = await supabase.from('books').delete().eq('id', bookId);
  if (error) {
    console.error('deleteBook error:', error);
    return false;
  }
  return true;
};

export const archiveBook = async (bookId, archive = true) => {
  const { error } = await supabase.from('books').update({ archived: archive }).eq('id', bookId);
  if (error) {
    console.error('archiveBook error:', error);
    return false;
  }
  return true;
};

export const handleDeleteBookWithRefresh = async (book, refreshFn) => {
  await deleteBook(book.id);
  refreshFn();
};

export const handleArchiveBookWithRefresh = async (book, refreshFn) => {
  await archiveBook(book.id, !book.archived);
  refreshFn();
};

export const categorizeBooks = (books) => ({
  availableBooks: books.filter((b) => !b.archived && !b.borrowed_by),
  lentBooks: books.filter((b) => !b.archived && b.borrowed_by),
  archivedBooks: books.filter((b) => b.archived),
});

// =========================
// Book Browsing
// =========================

export async function getAvailableBooks() {
  const { data, error } = await supabase
    .from('books')
    .select(`id, status, condition, created_at, user_id, catalog:catalog_id (title, author)`) // join
    .eq('archived', false)
    .eq('available', true);

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
        book.catalog?.title?.toLowerCase().includes(search) ||
        book.catalog?.author?.toLowerCase().includes(search)
      );
    })
    .filter((book) => {
      const isOwnBook = userId && book.user_id?.toLowerCase() === userId.toLowerCase();
      if (!includeOwn && isOwnBook) return false;
      if (statusFilter === 'all') return true;
      return book.status === statusFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.catalog?.title?.localeCompare(b.catalog?.title);
      }
      if (sortBy === 'date_added') {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      return 0;
    });
}

// =========================
// Book Requesting
// =========================

export async function requestBorrowBook(book_id, requester_id, message = '') {
  const { data: bookData, error: bookError } = await supabase
    .from('books')
    .select('owner_id')
    .eq('id', book_id)
    .single();

  if (bookError) throw bookError;

  const requested_to = bookData.owner_id;
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
  const { data, error } = await supabase
    .from('book_requests')
    .select(
      `
      id, requested_by, requested_to, status, message, created_at, updated_at,
      profiles:requested_by ( first_name, last_name, username )
    `,
    )
    .eq('book_id', book_id);

  if (error) throw error;
  return data;
}

// =========================
// Realtime Updates
// =========================

export const subscribeToBooksChanges = (onChange) => {
  return supabase
    .channel('books-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'books' }, () => {
      console.log('[Realtime] Book change detected');
      onChange();
    })
    .subscribe();
};
