// src/services/adminService.js

import supabase from './supabaseClient';
import { archiveBook } from './bookService';
import { updateRequestStatus } from './bookRequestService';
import { markLoanReturned } from './bookLoanService';
import { logError } from '@/utilities/logger';

const APPROVAL_STATUSES = new Set(['pending', 'approved', 'rejected']);

export async function listUsers() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, first_name, last_name, role, approval_status, created_at')
      .order('created_at', { ascending: true });

    if (error) throw error;

    const rows = data ?? [];

    return rows.map((row) => {
      const firstName = row.first_name ?? '';
      const lastName = row.last_name ?? '';
      const fullName = `${firstName} ${lastName}`.trim();
      return {
        id: row.id,
        username: row.username,
        firstName: row.first_name,
        lastName: row.last_name,
        fullName: fullName || row.username || '',
        role: row.role,
        approvalStatus: row.approval_status ?? 'pending',
        email: '',
        createdAt: row.created_at,
        updatedAt: null,
      };
    });
  } catch (error) {
    logError('adminService.listUsers failed', error);
    throw error;
  }
}

export async function updateUserRole(userId, role) {
  try {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', userId);
    if (error) throw error;
    return true;
  } catch (error) {
    logError('adminService.updateUserRole failed', error, { userId, role });
    throw error;
  }
}

export async function updateUserApprovalStatus(userId, status) {
  try {
    if (!APPROVAL_STATUSES.has(status)) {
      throw new Error(`Invalid approval status: ${status}`);
    }
    const { error } = await supabase
      .from('profiles')
      .update({ approval_status: status })
      .eq('id', userId);
    if (error) throw error;
    return true;
  } catch (error) {
    logError('adminService.updateUserApprovalStatus failed', error, { userId, status });
    throw error;
  }
}

export async function approveUserAccount(userId) {
  try {
    await updateUserApprovalStatus(userId, 'approved');
    return true;
  } catch (error) {
    logError('adminService.approveUserAccount failed', error, { userId });
    throw error;
  }
}

export async function rejectUserAccount(userId) {
  try {
    await updateUserApprovalStatus(userId, 'rejected');
    return true;
  } catch (error) {
    logError('adminService.rejectUserAccount failed', error, { userId });
    throw error;
  }
}

export async function deleteUserAccount(userId) {
  try {
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (error) throw error;
    return true;
  } catch (error) {
    logError('adminService.deleteUserAccount failed', error, { userId });
    throw error;
  }
}

export async function getAllBooks() {
  try {
    const { data, error } = await supabase
      .from('books')
      .select(`id, status, archived, created_at, user_id, catalog:catalog_id (id, title, author)`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  } catch (error) {
    logError('adminService.getAllBooks failed', error);
    throw error;
  }
}

export async function getAllBookRequests() {
  try {
    const { data, error } = await supabase
      .from('book_requests')
      .select(
        `id, status, message, created_at, requested_by, requested_to,
         book:book_id (id, user_id, catalog:catalog_id (title, author))`,
      )
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  } catch (error) {
    logError('adminService.getAllBookRequests failed', error);
    throw error;
  }
}

export async function getAllBookLoans() {
  try {
    const { data, error } = await supabase
      .from('book_loans')
      .select(
        `id, status, loaned_at, due_date, returned_at, borrower_id, lender_id,
         book:book_id (id, catalog:catalog_id (title, author))`,
      )
      .order('loaned_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  } catch (error) {
    logError('adminService.getAllBookLoans failed', error);
    throw error;
  }
}

export async function setBookArchived(bookId, archived) {
  try {
    await archiveBook(bookId, archived);
    return true;
  } catch (error) {
    logError('adminService.setBookArchived failed', error, { bookId, archived });
    throw error;
  }
}

export async function setRequestStatus(requestId, status) {
  try {
    await updateRequestStatus(requestId, status);
    return true;
  } catch (error) {
    logError('adminService.setRequestStatus failed', error, { requestId, status });
    throw error;
  }
}

export async function completeLoan(loanId) {
  try {
    await markLoanReturned(loanId);
    return true;
  } catch (error) {
    logError('adminService.completeLoan failed', error, { loanId });
    throw error;
  }
}
