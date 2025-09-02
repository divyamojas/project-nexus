// src/services/bookLoanService.js

import supabase from './supabaseClient';

/**
 * Create a loan for a given book between lender and borrower.
 * Returns the created loan row.
 */
export async function createLoan({
  book_id,
  lender_id,
  borrower_id,
  due_date = null,
  notes = null,
}) {
  const payload = {
    book_id,
    lender_id,
    borrower_id,
    due_date,
    notes,
    status: 'active',
  };

  const { data, error } = await supabase.from('book_loans').insert([payload]).select('*').single();
  if (error) throw error;
  return data;
}

/**
 * Mark a loan as returned and set returned_at.
 */
export async function markLoanReturned(loan_id) {
  const { data, error } = await supabase
    .from('book_loans')
    .update({ status: 'returned', returned_at: new Date().toISOString() })
    .eq('id', loan_id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

/**
 * Get the active loan for a specific book (if any).
 */
export async function getActiveLoanForBook(book_id) {
  const { data, error } = await supabase
    .from('book_loans')
    .select('*')
    .eq('book_id', book_id)
    .eq('status', 'active')
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

/**
 * Get loans related to the current user (as lender or borrower).
 * If role is provided, filter to that role only.
 */
export async function getMyLoans({ role } = {}) {
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  if (!user) return [];

  let filter = `lender_id.eq.${user.id},borrower_id.eq.${user.id}`;
  if (role === 'lender') filter = `lender_id.eq.${user.id}`;
  if (role === 'borrower') filter = `borrower_id.eq.${user.id}`;

  const { data, error } = await supabase
    .from('book_loans')
    .select(
      `
      id,
      status,
      loaned_at,
      due_date,
      returned_at,
      book:book_id (
        id,
        user_id,
        status,
        condition,
        created_at,
        books_catalog (id, title, author, cover_url)
      )
    `,
    )
    .or(filter)
    .order('loaned_at', { ascending: false });

  if (error) throw error;
  return data || [];
}
