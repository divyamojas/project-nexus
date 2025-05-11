// src/services/dashboardService.js

import { supabase } from '@/services/supabaseClient';

export const getMyBooks = async () => {
  const user = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('books')
    .select('*, books_catalog(title, author)')
    .eq('owner_id', user.data.user.id);
  if (error) console.error('getMyBooks error:', error);
  return data || [];
};

export const getRequests = async () => {
  const user = await supabase.auth.getUser();

  const { data: incoming, error: inErr } = await supabase
    .from('requests')
    .select('*, book:book_id(*, books_catalog(title))')
    .in('book.owner_id', [user.data.user.id]);

  const { data: outgoing, error: outErr } = await supabase
    .from('requests')
    .select('*, book:book_id(*, books_catalog(title))')
    .eq('requester_id', user.data.user.id);

  if (inErr) console.error('getRequests incoming error:', inErr);
  if (outErr) console.error('getRequests outgoing error:', outErr);

  return { incoming: incoming || [], outgoing: outgoing || [] };
};

export const getTransfers = async () => {
  const { data, error } = await supabase
    .from('transfers')
    .select('*, request:request_id(*, book:book_id(*, books_catalog(title)))')
    .order('scheduled_at');
  if (error) console.error('getTransfers error:', error);
  return data || [];
};

export const getSavedBooks = async () => {
  const user = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('saved_books')
    .select('*, books_catalog(*)')
    .eq('user_id', user.data.user.id);
  if (error) console.error('getSavedBooks error:', error);
  return data || [];
};

export const getUserReviews = async () => {
  const user = await supabase.auth.getUser();
  const { data: given, error: gErr } = await supabase
    .from('user_reviews')
    .select('*')
    .eq('reviewer_id', user.data.user.id);
  const { data: received, error: rErr } = await supabase
    .from('user_reviews')
    .select('*')
    .eq('reviewee_id', user.data.user.id);

  if (gErr) console.error('getUserReviews (given) error:', gErr);
  if (rErr) console.error('getUserReviews (received) error:', rErr);

  return { given: given || [], received: received || [] };
};
