// /src/services/userService.js

import { supabase } from '@/services/supabaseClient';

// =========================
// Book Management
// =========================

export const getMyBooks = async () => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user?.id) return [];

  const { data, error } = await supabase
    .from('books')
    .select('id, condition, archived, user_id, books_catalog(title, author)')
    .eq('user_id', userData.user.id);

  if (error) console.error('getMyBooks error:', error);
  return data || [];
};

export const getSavedBooks = async () => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user?.id) return [];

  const { data, error } = await supabase
    .from('saved_books')
    .select('catalog_id, books_catalog!fk_saved_books_catalog(title, author)')
    .eq('user_id', userData.user.id);

  if (error) console.error('getSavedBooks error:', error);
  return data || [];
};

// =========================
// Request Management
// =========================

export const getRequests = async () => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user?.id) return { incoming: [], outgoing: [] };

  const userId = userData.user.id;

  const { data: ownedBooks, error: booksErr } = await supabase
    .from('books')
    .select('id')
    .eq('user_id', userId);

  const ownedBookIds = ownedBooks?.map((b) => b.id) || [];

  const { data: incoming, error: inErr } = await supabase
    .from('book_requests')
    .select('*, book:book_id(user_id, books_catalog(title))')
    .in('book_id', ownedBookIds);

  const { data: outgoing, error: outErr } = await supabase
    .from('book_requests')
    .select('*, book:book_id(user_id, books_catalog(title))')
    .eq('requested_by', userId);

  if (booksErr) console.error('getRequests booksErr:', booksErr);
  if (inErr) console.error('getRequests incoming error:', inErr);
  if (outErr) console.error('getRequests outgoing error:', outErr);

  return { incoming: incoming || [], outgoing: outgoing || [] };
};

// =========================
// Transfer Management
// =========================

// /src/services/userService.js

export const getTransfers = async () => {
  // let's work on this later

  const data = [];
  return data || [];
};

// =========================
// User Feedback & Profile
// =========================

export const getUserReviews = async () => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user?.id) return { given: [], received: [] };

  const userId = userData.user.id;

  const { data: given, error: gErr } = await supabase
    .from('user_reviews')
    .select('*')
    .eq('reviewer_id', userId);

  const { data: received, error: rErr } = await supabase
    .from('user_reviews')
    .select('*')
    .eq('reviewee_id', userId);

  if (gErr) console.error('getUserReviews (given) error:', gErr);
  if (rErr) console.error('getUserReviews (received) error:', rErr);

  return { given: given || [], received: received || [] };
};

export const getCurrentUserFirstName = async () => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user?.id) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('first_name')
    .eq('id', userData.user.id)
    .single();

  if (error) {
    console.error('Error fetching user first_name:', error);
    return null;
  }

  return data?.first_name || null;
};
