// src/pages/dashboard/hooks/useDashboardHandlers.js
import { useCallback } from 'react';
import {
  approveReturnRequest,
  completeTransfer,
  requestBookReturn,
  toggleSaveBook,
  updateRequestStatus,
} from '../../../services';
import { useSnackbar } from '@/components/providers/SnackbarProvider';

export default function useDashboardHandlers({ user, refetch, archiveBook, deleteBook }) {
  const { showToast } = useSnackbar();
  const onToggleSave = useCallback(
    async (book) => {
      await toggleSaveBook(book.id, false, null, user);
      showToast('Removed from Saved', { severity: 'info' });
      refetch();
    },
    [user, refetch],
  );

  const onRequestReturn = useCallback(
    async (book) => {
      await requestBookReturn(book.id, user);
      showToast('Return requested', { severity: 'success' });
      refetch();
    },
    [user, refetch],
  );

  const onAcceptRequest = useCallback(
    async (book) => {
      await updateRequestStatus(book.request_id, 'accepted');
      showToast('Request accepted', { severity: 'success' });
      refetch();
    },
    [refetch],
  );

  const onRejectRequest = useCallback(
    async (book) => {
      await updateRequestStatus(book.request_id, 'rejected');
      showToast('Request rejected', { severity: 'warning' });
      refetch();
    },
    [refetch],
  );

  const onCancelRequest = useCallback(
    async (book) => {
      await updateRequestStatus(book.request_id, 'cancelled');
      showToast('Request cancelled', { severity: 'info' });
      refetch();
    },
    [refetch],
  );

  const onCompleteTransfer = useCallback(
    async (book) => {
      if (!book?.transfer_id) return;
      await completeTransfer({ transfer_id: book.transfer_id });
      showToast('Transfer completed', { severity: 'success' });
      refetch();
    },
    [refetch],
  );

  const onApproveReturn = useCallback(
    async (book) => {
      if (!book?.return_request_id) return;
      await approveReturnRequest(book.return_request_id);
      showToast('Return approved', { severity: 'success' });
      refetch();
    },
    [refetch],
  );

  const onArchive = useCallback(
    async (book) => {
      await archiveBook(book);
      showToast(book.archived ? 'Unarchived' : 'Archived', { severity: 'info' });
      refetch();
    },
    [archiveBook, refetch],
  );

  const onDelete = useCallback(
    async (book) => {
      await deleteBook(book);
      showToast('Book deleted', { severity: 'info' });
      refetch();
    },
    [deleteBook, refetch],
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
