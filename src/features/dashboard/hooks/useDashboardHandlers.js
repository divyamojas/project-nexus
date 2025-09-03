// src/features/dashboard/hooks/useDashboardHandlers.js
import { useCallback } from 'react';
import {
  approveReturnRequest,
  completeTransfer,
  requestBookReturn,
  toggleSaveBook,
  updateRequestStatus,
} from '../../../services';
import { useSnackbar } from '@/components/providers/SnackbarProvider';
import { logError } from '@/utilities/logger';

export default function useDashboardHandlers({ user, refetch, archiveBook, deleteBook }) {
  const { showToast } = useSnackbar();
  const onToggleSave = useCallback(
    async (book) => {
      try {
        await toggleSaveBook(book.id, false, null, user);
        showToast('Removed from Saved', { severity: 'info' });
        refetch();
      } catch (e) {
        logError('DashboardHandlers.onToggleSave failed', e, { bookId: book?.id });
        showToast('Failed to update saved status', { severity: 'error' });
      }
    },
    [user, refetch, showToast],
  );

  const onRequestReturn = useCallback(
    async (book) => {
      try {
        await requestBookReturn(book.id, user);
        showToast('Return requested', { severity: 'success' });
        refetch();
      } catch (e) {
        logError('DashboardHandlers.onRequestReturn failed', e, { bookId: book?.id });
        showToast('Failed to request return', { severity: 'error' });
      }
    },
    [user, refetch, showToast],
  );

  const onAcceptRequest = useCallback(
    async (book) => {
      try {
        await updateRequestStatus(book.request_id, 'accepted');
        showToast('Request accepted', { severity: 'success' });
        refetch();
      } catch (e) {
        logError('DashboardHandlers.onAcceptRequest failed', e, { requestId: book?.request_id });
        showToast('Failed to accept request', { severity: 'error' });
      }
    },
    [refetch, showToast],
  );

  const onRejectRequest = useCallback(
    async (book) => {
      try {
        await updateRequestStatus(book.request_id, 'rejected');
        showToast('Request rejected', { severity: 'warning' });
        refetch();
      } catch (e) {
        logError('DashboardHandlers.onRejectRequest failed', e, { requestId: book?.request_id });
        showToast('Failed to reject request', { severity: 'error' });
      }
    },
    [refetch, showToast],
  );

  const onCancelRequest = useCallback(
    async (book) => {
      try {
        await updateRequestStatus(book.request_id, 'cancelled');
        showToast('Request cancelled', { severity: 'info' });
        refetch();
      } catch (e) {
        logError('DashboardHandlers.onCancelRequest failed', e, { requestId: book?.request_id });
        showToast('Failed to cancel request', { severity: 'error' });
      }
    },
    [refetch, showToast],
  );

  const onCompleteTransfer = useCallback(
    async (book) => {
      if (!book?.transfer_id) return;
      try {
        await completeTransfer({ transfer_id: book.transfer_id });
        showToast('Transfer completed', { severity: 'success' });
        refetch();
      } catch (e) {
        logError('DashboardHandlers.onCompleteTransfer failed', e, {
          transferId: book?.transfer_id,
        });
        showToast('Failed to complete transfer', { severity: 'error' });
      }
    },
    [refetch, showToast],
  );

  const onApproveReturn = useCallback(
    async (book) => {
      if (!book?.return_request_id) return;
      try {
        await approveReturnRequest(book.return_request_id);
        showToast('Return approved', { severity: 'success' });
        refetch();
      } catch (e) {
        logError('DashboardHandlers.onApproveReturn failed', e, {
          returnRequestId: book?.return_request_id,
        });
        showToast('Failed to approve return', { severity: 'error' });
      }
    },
    [refetch, showToast],
  );

  const onArchive = useCallback(
    async (book) => {
      try {
        await archiveBook(book);
        showToast(book.archived ? 'Unarchived' : 'Archived', { severity: 'info' });
        refetch();
      } catch (e) {
        logError('DashboardHandlers.onArchive failed', e, { bookId: book?.id });
        showToast('Failed to update archive status', { severity: 'error' });
      }
    },
    [archiveBook, refetch, showToast],
  );

  const onDelete = useCallback(
    async (book) => {
      try {
        await deleteBook(book);
        showToast('Book deleted', { severity: 'info' });
        refetch();
      } catch (e) {
        logError('DashboardHandlers.onDelete failed', e, { bookId: book?.id });
        showToast('Failed to delete book', { severity: 'error' });
      }
    },
    [deleteBook, refetch, showToast],
  );

  return {
    onToggleSave,
    onRequestReturn,
    onAcceptRequest,
    onRejectRequest,
    onCancelRequest,
    onCompleteTransfer,
    onApproveReturn,
    onArchive,
    onDelete,
  };
}
