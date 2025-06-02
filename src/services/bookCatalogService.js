// /src/services/bookCatalogService.js

import supabase from './supabaseClient';

export const fetchCatalogBookEntry = async (title, author) => {
  try {
    const { data, error } = await supabase
      .from('books_catalog')
      .select('id')
      .eq('title', title)
      .eq('author', author)
      .maybeSingle();

    if (error) throw error;

    return data ?? null;
  } catch (err) {
    console.error('fetchCatalogBookEntry error:', err);
    return null;
  }
};

export const searchBooksCatalogByTitle = async (title) => {
  if (!title?.trim()) return [];

  try {
    const { data, error } = await supabase
      .from('books_catalog')
      .select('*')
      .ilike('title', `%${title.trim()}%`)
      .limit(5);

    if (error) throw error;
    return data ?? [];
  } catch (err) {
    console.error('searchBooksCatalogByTitle error:', err);
    return [];
  }
};

export const addBookToCatalog = async ({ title, author, isbn, cover_url, created_by }) => {
  const payload = {
    title: title?.trim(),
    author: author?.trim(),
    isbn: isbn?.trim(),
    cover_url,
    created_by: created_by,
  };

  try {
    const { data, error: insertError } = await supabase
      .from('books_catalog')
      .insert([payload])
      .select()
      .single();

    if (insertError) throw insertError;
    return data;
  } catch (err) {
    console.error('addBookToCatalog insert error:', err);
    throw err;
  }
};
