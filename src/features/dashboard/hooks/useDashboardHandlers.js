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

export default function useDashboardHandlers({
  user,
  refreshers,
  archiveBook,
  deleteBook,
  updateBookSaveStatus,
  setSavedBooks,
  sendBookRequest,
}) {
  const { showToast } = useSnackbar();
  const onToggleSave = useCallback(
    async (book) => {
      try {
        await toggleSaveBook(book.id, false, null, user);
        // Update only Saved section and the book's saved flag
        setSavedBooks?.((prev) => prev.filter((b) => b.id !== book.id));
        updateBookSaveStatus?.(book.id, false);
        showToast('Removed from Saved', { severity: 'info' });
        refreshers?.refreshSaved?.();
      } catch (e) {
        logError('DashboardHandlers.onToggleSave failed', e, { bookId: book?.id });
        showToast('Failed to update saved status', { severity: 'error' });
      }
    },
    [user, showToast, setSavedBooks, updateBookSaveStatus, refreshers?.refreshSaved],
  );

  const onRequestReturn = useCallback(
    async (book) => {
      try {
        await requestBookReturn(book.id, user);
        showToast('Return requested', { severity: 'success' });
        refreshers?.refreshBorrowed?.();
      } catch (e) {
        logError('DashboardHandlers.onRequestReturn failed', e, { bookId: book?.id });
        showToast('Failed to request return', { severity: 'error' });
      }
    },
    [user, showToast, refreshers?.refreshBorrowed],
  );

  const onAcceptRequest = useCallback(
    async (book) => {
      try {
        await updateRequestStatus(book.request_id, 'accepted');
        showToast('Request accepted', { severity: 'success' });
        refreshers?.refreshRequests?.();
        refreshers?.refreshBooks?.();
      } catch (e) {
        logError('DashboardHandlers.onAcceptRequest failed', e, { requestId: book?.request_id });
        showToast('Failed to accept request', { severity: 'error' });
      }
    },
    [showToast, refreshers?.refreshRequests, refreshers?.refreshBooks],
  );

  const onRejectRequest = useCallback(
    async (book) => {
      try {
        await updateRequestStatus(book.request_id, 'rejected');
        showToast('Request rejected', { severity: 'warning' });
        refreshers?.refreshRequests?.();
      } catch (e) {
        logError('DashboardHandlers.onRejectRequest failed', e, { requestId: book?.request_id });
        showToast('Failed to reject request', { severity: 'error' });
      }
    },
    [showToast, refreshers?.refreshRequests],
  );

  const onCancelRequest = useCallback(
    async (book) => {
      try {
        await updateRequestStatus(book.request_id, 'cancelled');
        showToast('Request cancelled', { severity: 'info' });
        refreshers?.refreshRequests?.();
      } catch (e) {
        logError('DashboardHandlers.onCancelRequest failed', e, { requestId: book?.request_id });
        showToast('Failed to cancel request', { severity: 'error' });
      }
    },
    [showToast, refreshers?.refreshRequests],
  );

  const onRequestBook = useCallback(
    async (book) => {
      if (!sendBookRequest) return;
      try {
        const response = await sendBookRequest(book);
        const requestRecord = Array.isArray(response) ? response[0] : response;
        if (!requestRecord) {
          showToast('Failed to send request', { severity: 'error' });
          return;
        }
        showToast('Request sent', { severity: 'success' });
        setSavedBooks?.((prev) =>
          prev.map((b) =>
            b.id === book.id
              ? {
                  ...b,
                  request_status: requestRecord.status,
                  requested_by: requestRecord.requested_by,
                  request_id: requestRecord.id,
                }
              : b,
          ),
        );
        refreshers?.refreshRequests?.();
        refreshers?.refreshSaved?.();
      } catch (e) {
        logError('DashboardHandlers.onRequestBook failed', e, {
          bookId: book?.id || book?.book_id,
        });
        showToast('Failed to send request', { severity: 'error' });
      }
    },
    [
      sendBookRequest,
      showToast,
      refreshers?.refreshRequests,
      refreshers?.refreshSaved,
      setSavedBooks,
    ],
  );

  const onCompleteTransfer = useCallback(
    async (book) => {
      if (!book?.transfer_id) return;
      try {
        await completeTransfer({ transfer_id: book.transfer_id });
        showToast('Transfer completed', { severity: 'success' });
        refreshers?.refreshTransfers?.();
        refreshers?.refreshBooks?.();
      } catch (e) {
        logError('DashboardHandlers.onCompleteTransfer failed', e, {
          transferId: book?.transfer_id,
        });
        showToast('Failed to complete transfer', { severity: 'error' });
      }
    },
    [showToast, refreshers?.refreshTransfers, refreshers?.refreshBooks],
  );

  const onApproveReturn = useCallback(
    async (book) => {
      if (!book?.return_request_id) return;
      try {
        await approveReturnRequest(book.return_request_id);
        showToast('Return approved', { severity: 'success' });
        refreshers?.refreshRequests?.();
        refreshers?.refreshBorrowed?.();
        refreshers?.refreshBooks?.();
      } catch (e) {
        logError('DashboardHandlers.onApproveReturn failed', e, {
          returnRequestId: book?.return_request_id,
        });
        showToast('Failed to approve return', { severity: 'error' });
      }
    },
    [showToast, refreshers?.refreshRequests, refreshers?.refreshBorrowed, refreshers?.refreshBooks],
  );

  const onArchive = useCallback(
    async (book) => {
      try {
        await archiveBook(book);
        showToast(book.archived ? 'Unarchived' : 'Archived', { severity: 'info' });
        // BookContext mutates local book list; sections recompute without full page refresh
      } catch (e) {
        logError('DashboardHandlers.onArchive failed', e, { bookId: book?.id });
        showToast('Failed to update archive status', { severity: 'error' });
      }
    },
    [archiveBook, showToast],
  );

  const onDelete = useCallback(
    async (book) => {
      try {
        await deleteBook(book);
        showToast('Book deleted', { severity: 'info' });
        // BookContext mutates local book list; sections recompute without full page refresh
      } catch (e) {
        logError('DashboardHandlers.onDelete failed', e, { bookId: book?.id });
        showToast('Failed to delete book', { severity: 'error' });
      }
    },
    [deleteBook, showToast],
  );

  return {
    onRequestBook,
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
