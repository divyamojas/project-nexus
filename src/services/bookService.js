// src/services/bookService.js

import { supabase } from '@/services/supabaseClient';

export const fetchCatalogBooks = async () => {
  const { data, error } = await supabase.from('books_catalog').select('*').order('title');
  if (error) console.error('fetchCatalogBooks error:', error);
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
