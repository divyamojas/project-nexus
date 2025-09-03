// src/services/transferService.js

import supabase from './supabaseClient';
import { createLoan } from './bookLoanService';
import { logError } from '../utilities/logger';

/**
 * Fetch transfers where the current user is either the sender or receiver.
 * Returns items shaped for existing book card displays.
 */
export const getTransfers = async () => {
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  if (!user) return [];

  const userId = user.id;

  const { data, error } = await supabase
    .from('transfers')
    .select(
      `
      id,
      status,
      scheduled_at,
      completed_at,
      created_at,
      book:book_id (
        id,
        user_id,
        status,
        condition,
        created_at,
        books_catalog (id, title, author, cover_url)
      ),
      request:request_id (id)
    `,
    )
    .or(`from_user.eq.${userId},to_user.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) {
    logError('getTransfers failed', error, { userId });
    throw error;
  }

  // Normalize to book-like objects to reuse existing card UI
  return (data || []).map((t) => ({
    id: t.book?.id,
    user_id: t.book?.user_id,
    status: ['pending', 'confirmed'].includes(t.status)
      ? 'scheduled'
      : t.book?.status || 'available',
    condition: t.book?.condition,
    created_at: t.book?.created_at,
    catalog: t.book?.books_catalog,
    archived: false,
    transfer_id: t.id,
    transfer_status: t.status,
    scheduled_at: t.scheduled_at,
    completed_at: t.completed_at,
    request_id: t.request?.id,
  }));
};

/**
 * Create a transfer row linked to a request (call when request accepted).
 */
export async function createTransferForAcceptedRequest(requestId) {
  const { data: req, error: reqErr } = await supabase
    .from('book_requests')
    .select('id, book_id, requested_by, requested_to, status')
    .eq('id', requestId)
    .single();
  if (reqErr) {
    logError('createTransferForAcceptedRequest: fetch request failed', reqErr, { requestId });
    throw reqErr;
  }
  if (!req || req.status !== 'accepted')
    throw new Error('Request must be accepted to create transfer');

  const payload = {
    request_id: req.id,
    book_id: req.book_id,
    from_user: req.requested_to,
    to_user: req.requested_by,
    status: 'pending',
    scheduled_at: null,
  };

  const { data, error } = await supabase.from('transfers').insert([payload]).select('*').single();
  if (error) {
    logError('createTransferForAcceptedRequest: insert transfer failed', error, {
      requestId,
      payload,
    });
    throw error;
  }
  return data;
}

/**
 * Update a transfer status or schedule.
 */
export async function updateTransfer({ transfer_id, status, scheduled_at = null }) {
  const patch = { status };
  if (scheduled_at !== null) patch.scheduled_at = scheduled_at;
  const { data, error } = await supabase
    .from('transfers')
    .update(patch)
    .eq('id', transfer_id)
    .select('*')
    .single();
  if (error) {
    logError('updateTransfer failed', error, { transfer_id, patch });
    throw error;
  }
  return data;
}

/**
 * Mark transfer complete, create a loan, and set the book to 'lent'.
 */
export async function completeTransfer({ transfer_id }) {
  const { data: transfer, error: trErr } = await supabase
    .from('transfers')
    .select('id, book_id, from_user, to_user, status')
    .eq('id', transfer_id)
    .single();
  if (trErr) {
    logError('completeTransfer: fetch transfer failed', trErr, { transfer_id });
    throw trErr;
  }
  if (!transfer) throw new Error('Transfer not found');

  // Mark transfer as transferred
  const { error: updErr } = await supabase
    .from('transfers')
    .update({ status: 'transferred', completed_at: new Date().toISOString() })
    .eq('id', transfer_id);
  if (updErr) {
    logError('completeTransfer: update transfer failed', updErr, { transfer_id });
    throw updErr;
  }

  // Create the loan
  await createLoan({
    book_id: transfer.book_id,
    lender_id: transfer.from_user,
    borrower_id: transfer.to_user,
  });

  // Update book status to 'lent'
  await supabase.from('books').update({ status: 'lent' }).eq('id', transfer.book_id);

  return true;
}
