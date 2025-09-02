// src/services/returnRequestService.js

import supabase from './supabaseClient';
import { getActiveLoanForBook, markLoanReturned } from './bookLoanService';

/**
 * Create a return request for a given book from the current user.
 */
export async function requestBookReturn(bookId, user) {
  if (!user?.id) return false;
  const userId = user.id;

  // Find active loan for this book to attach to the request
  const loan = await getActiveLoanForBook(bookId);
  if (!loan?.id) {
    console.warn('No active loan found for book; cannot request return');
    return false;
  }

  const { error } = await supabase.from('return_requests').insert([
    {
      book_id: bookId,
      loan_id: loan.id,
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

/**
 * Approve a pending return request: marks return_request approved, closes loan, and frees book.
 */
export async function approveReturnRequest(returnRequestId) {
  // Fetch request with loan and book
  const { data: rr, error: rrErr } = await supabase
    .from('return_requests')
    .select('id, status, book_id, loan_id')
    .eq('id', returnRequestId)
    .single();
  if (rrErr) throw rrErr;
  if (!rr || rr.status !== 'pending') return false;

  // Approve request
  const { error: upErr } = await supabase
    .from('return_requests')
    .update({ status: 'approved', resolved_at: new Date().toISOString() })
    .eq('id', returnRequestId);
  if (upErr) throw upErr;

  // Close the loan
  await markLoanReturned(rr.loan_id);

  // Set book available again
  const { error: bookErr } = await supabase
    .from('books')
    .update({ status: 'available' })
    .eq('id', rr.book_id);
  if (bookErr) throw bookErr;

  return true;
}
