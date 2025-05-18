// /src/services/bookService.js

import { supabase } from './supabaseClient';

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
  console.log(bookId);
  const { error } = await supabase.from('books').delete().eq('id', bookId);
  console.log('deleted', bookId);
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

// =========================
// Book Browsing
// =========================

export async function getBooks({ includeArchived = true } = {}) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user?.id) return [];

  const userId = userData.user.id;

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

  if (!includeArchived) query = query.eq('archived', false);

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

export async function getAvailableBooks() {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user?.id) return [];

  const userId = userData.user.id;

  const { data, error } = await supabase
    .from('books')
    .select(
      `
      id,
      status,
      condition,
      created_at,
      user_id,
      catalog:catalog_id (id, title, author, cover_url),
      saved_books (user_id)
    `,
    )
    .eq('archived', false);

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
      is_saved: isSaved,
    };
  });
}

export const getSavedBooks = async () => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user?.id) return [];

  const userId = userData.user.id;

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

  return data.map((entry) => ({
    id: entry.book.id,
    user_id: entry.book.user_id,
    status: entry.book.status,
    condition: entry.book.condition,
    created_at: entry.book.created_at,
    catalog: entry.book.books_catalog,
    is_saved: true,
  }));
};

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

export async function requestBookReturn(bookId) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user?.id) throw userError;

  const userId = userData.user.id;

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

export async function toggleSaveBook(id, should_save, catalog_id) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user?.id) throw userError;

  const userId = userData.user.id;

  if (should_save) {
    const { error } = await supabase.from('saved_books').insert({
      book_id: id,
      user_id: userId,
      catalog_id: catalog_id,
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

export async function requestBook(bookId, message = '') {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user?.id) throw userError;

  const userId = userData.user.id;
  return await requestBorrowBook(bookId, userId, message);
}

export const subscribeToBookChanges = (onChange) => {
  return supabase
    .channel('books-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'books' }, () => {
      console.log('[Realtime] Book change detected');
      onChange();
    })
    .subscribe();
};

// /src/features/books/services/bookService.js

export const validateAndSubmitBookForm = async (formData, { setErrors, resetForm, onSuccess }) => {
  const newErrors = {};
  if (!formData.title.trim()) newErrors.title = 'Title is required';
  if (!formData.author.trim()) newErrors.author = 'Author is required';
  if (!formData.condition) newErrors.condition = 'Condition is required';

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return false;
  }

  const formattedTitle = formData.title
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const formattedAuthor = formData.author
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const formattedIsbn = formData.isbn
    .trim()
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();

  const success = await addBookToCatalogAndStock({
    title: formattedTitle,
    author: formattedAuthor,
    isbn: formattedIsbn,
    cover_url: formData.coverUrl,
    condition: formData.condition,
    notes: formData.notes,
  });

  if (success) {
    resetForm();
    if (onSuccess) onSuccess();
    return true;
  }

  return false;
};
