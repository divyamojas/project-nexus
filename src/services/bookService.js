// src/services/bookService.js

import { supabase } from '@/services/supabaseClient';

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

export const addBookToCatalog = async (bookData) => {
  const { data, error } = await supabase.from('books_catalog').insert([bookData]).select().single();
  if (error) {
    console.error('addBookToCatalog error:', error);
    return null;
  }
  return data;
};

export const addBookInstance = async (bookInstanceData) => {
  const { error } = await supabase.from('books').insert([bookInstanceData]);
  if (error) console.error('addBookInstance error:', error);
  return !error;
};

export const addBookToCatalogAndStock = async ({
  title,
  author,
  description,
  cover_image_url,
  condition,
}) => {
  const user = await supabase.auth.getUser();
  if (!user?.data?.user?.id) {
    console.error('User not authenticated');
    return false;
  }

  const userId = user.data.user.id;

  const { data: existing } = await supabase
    .from('books_catalog')
    .select('id')
    .eq('title', title)
    .eq('author', author)
    .limit(1)
    .maybeSingle();

  let catalogId = existing?.id;

  if (!catalogId) {
    const catalogEntry = await addBookToCatalog({
      title,
      author,
      description,
      cover_image_url,
      added_by: userId, // ✅ satisfies RLS policy
    });
    if (!catalogEntry) return false;
    catalogId = catalogEntry.id;
  }

  return await addBookInstance({
    catalog_id: catalogId,
    condition,
    owner_id: userId,
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
