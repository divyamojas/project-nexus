import { useCallback, useEffect, useState } from 'react';

import { getMyLoans, getSavedBooks, getTransfers, getUserReviews } from '@/services';
import { getRequestsForUser } from '@/utilities';
import { logError } from '@/utilities/logger';

/**
 * Centralises dashboard data fetching, refresh helpers, and lightweight polling.
 * Keeps the main Dashboard component focused on rendering concerns.
 */
export default function useDashboardData({
  user,
  firstNameFromContext,
  refreshBooks,
  bookLoading,
}) {
  const [userFirstName, setUserFirstName] = useState(
    () => firstNameFromContext || user?.first_name || 'Friend',
  );
  const [requests, setRequests] = useState({ incoming: [], outgoing: [] });
  const [transfers, setTransfers] = useState([]);
  const [savedBooks, setSavedBooks] = useState([]);
  const [savedLoading, setSavedLoading] = useState(true);
  const [reviews, setReviews] = useState({ given: [], received: [] });
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [borrowedLoading, setBorrowedLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [transfersLoading, setTransfersLoading] = useState(true);
  const [initialLoaded, setInitialLoaded] = useState(false);

  const refreshRequests = useCallback(async () => {
    if (!user?.id) {
      setRequests({ incoming: [], outgoing: [] });
      setRequestsLoading(false);
      return;
    }
    setRequestsLoading(true);
    try {
      const req = await getRequestsForUser(user);
      setRequests(req);
    } finally {
      setRequestsLoading(false);
    }
  }, [user]);

  const refreshTransfers = useCallback(async () => {
    setTransfersLoading(true);
    try {
      const trf = await getTransfers();
      setTransfers(trf);
    } finally {
      setTransfersLoading(false);
    }
  }, []);

  const refreshSaved = useCallback(async () => {
    if (!user?.id) {
      setSavedBooks([]);
      setSavedLoading(false);
      return;
    }
    setSavedLoading(true);
    try {
      const saved = await getSavedBooks(user);
      setSavedBooks(saved);
    } finally {
      setSavedLoading(false);
    }
  }, [user]);

  const refreshBorrowed = useCallback(async () => {
    setBorrowedLoading(true);
    try {
      const myLoans = await getMyLoans({ role: 'borrower' });
      const borrowed = (myLoans || []).map((loan) => ({
        id: loan.book?.id,
        user_id: loan.book?.user_id,
        status: 'lent',
        condition: loan.book?.condition,
        created_at: loan.book?.created_at,
        catalog: loan.book?.books_catalog,
        archived: false,
        loan_id: loan.id,
        loan_due_date: loan.due_date,
      }));
      setBorrowedBooks(borrowed);
    } finally {
      setBorrowedLoading(false);
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!user?.id) {
      setInitialLoaded(true);
      return;
    }
    try {
      const [req, trf, saved, rev, myLoans] = await Promise.all([
        getRequestsForUser(user),
        getTransfers(),
        getSavedBooks(user),
        getUserReviews(user),
        getMyLoans({ role: 'borrower' }),
      ]);

      setRequests(req);
      setTransfers(trf);
      setSavedBooks(saved);
      setReviews(rev);
      setUserFirstName(firstNameFromContext || user?.first_name || 'Friend');

      const borrowed = (myLoans || []).map((loan) => ({
        id: loan.book?.id,
        user_id: loan.book?.user_id,
        status: 'lent',
        condition: loan.book?.condition,
        created_at: loan.book?.created_at,
        catalog: loan.book?.books_catalog,
        archived: false,
        loan_id: loan.id,
        loan_due_date: loan.due_date,
      }));
      setBorrowedBooks(borrowed);

      setRequestsLoading(false);
      setTransfersLoading(false);
      setSavedLoading(false);
      setBorrowedLoading(false);
    } catch (error) {
      logError('Dashboard.fetchData failed', error, { userId: user?.id });
    } finally {
      setInitialLoaded(true);
    }
  }, [user, firstNameFromContext]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!initialLoaded && bookLoading === false) {
      setInitialLoaded(true);
    }
  }, [bookLoading, initialLoaded]);

  useEffect(() => {
    if (firstNameFromContext || user?.first_name) {
      setUserFirstName(firstNameFromContext || user?.first_name);
    }
  }, [firstNameFromContext, user?.first_name]);

  // Used by the dashboard refresh button and modal actions to resync everything in one go.
  const refreshAll = useCallback(async () => {
    await Promise.all([fetchData(), refreshBooks()]);
  }, [fetchData, refreshBooks]);

  const [globalRefreshing, setGlobalRefreshing] = useState(false);
  const handleGlobalRefresh = useCallback(async () => {
    setGlobalRefreshing(true);
    try {
      await refreshAll();
    } finally {
      setGlobalRefreshing(false);
    }
  }, [refreshAll]);

  const [incomingSignal, setIncomingSignal] = useState(0);
  const [outgoingSignal, setOutgoingSignal] = useState(0);
  const [transfersSignal, setTransfersSignal] = useState(0);
  const [borrowedSignal, setBorrowedSignal] = useState(0);

  // Lightweight polling that self-disables until the initial fetch completes.
  useEffect(() => {
    if (!initialLoaded) return;
    const tick = () => {
      if (document.visibilityState !== 'visible') return;
      setIncomingSignal((prev) => prev + 1);
      setOutgoingSignal((prev) => prev + 1);
      setTransfersSignal((prev) => prev + 1);
      setBorrowedSignal((prev) => prev + 1);
    };
    const id = setInterval(tick, 10000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [initialLoaded]);

  return {
    userFirstName,
    requests,
    transfers,
    savedBooks,
    savedLoading,
    reviews,
    borrowedBooks,
    borrowedLoading,
    requestsLoading,
    transfersLoading,
    refreshRequests,
    refreshTransfers,
    refreshSaved,
    refreshBorrowed,
    initialLoaded,
    globalRefreshing,
    handleGlobalRefresh,
    incomingSignal,
    outgoingSignal,
    transfersSignal,
    borrowedSignal,
    setSavedBooks,
    refreshAll,
  };
}
