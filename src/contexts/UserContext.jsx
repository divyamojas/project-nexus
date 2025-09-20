// src/contexts/UserContext.jsx

import { useCallback, useEffect, useState } from 'react';
import { userContext } from './userContextObject';

import { useAuth } from './hooks/useAuth';
import { getMyBooks, getTransfers, getUserProfile, getUserReviews } from '../services';
import { getRequestsForBooksOfUsers } from '../utilities';

// context object moved to ./userContextObject to satisfy Fast Refresh

export const UserProvider = ({ children }) => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [userReviews, setUserReviews] = useState({ given: [], received: [] });
  const [myBooks, setMyBooks] = useState([]);
  const [requests, setRequests] = useState({ incoming: [], outgoing: [] });
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvalStatus, setApprovalStatus] = useState('pending');

  const fetchUserProfile = useCallback(async () => {
    if (!user?.id) {
      setUserProfile(null);
      setApprovalStatus('pending');
      return null;
    }

    const profile = await getUserProfile(user);
    if (profile) {
      setUserProfile(profile);
      setApprovalStatus(profile.approval_status || 'pending');
    } else {
      setUserProfile(null);
      setApprovalStatus('pending');
    }
    return profile || null;
  }, [user]);

  const fetchUserReviews = useCallback(async () => {
    const reviews = await getUserReviews(user);
    setUserReviews(reviews);
  }, [user]);

  const fetchMyBooks = useCallback(async () => {
    const books = await getMyBooks(user);
    setMyBooks(books);
  }, [user]);

  const fetchRequests = useCallback(async () => {
    const reqs = await getRequestsForBooksOfUsers(user);
    setRequests(reqs);
  }, [user]);

  const fetchTransfers = useCallback(async () => {
    const txns = await getTransfers();
    setTransfers(txns);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchUserProfile(),
      fetchUserReviews(),
      fetchMyBooks(),
      fetchRequests(),
      fetchTransfers(),
    ]);
    setLoading(false);
  }, [fetchUserProfile, fetchUserReviews, fetchMyBooks, fetchRequests, fetchTransfers]);

  useEffect(() => {
    if (user?.id) {
      refresh();
    } else {
      setUserProfile(null);
      setApprovalStatus('pending');
      setLoading(false);
    }
  }, [user?.id, refresh]);

  const role = userProfile?.role || 'user';
  const firstName = userProfile?.first_name || '';
  const isApproved = approvalStatus === 'approved';
  const isPendingApproval = approvalStatus === 'pending';
  const isRejected = approvalStatus === 'rejected';
  const isSuperAdmin = isApproved && role === 'super_admin';
  const isAdmin = isApproved && (role === 'admin' || role === 'super_admin');

  return (
    <userContext.Provider
      value={{
        user,
        userProfile,
        firstName,
        approvalStatus,
        isApproved,
        isPendingApproval,
        isRejected,
        userReviews,
        myBooks,
        requests,
        transfers,
        refresh,
        loading,
        role,
        isAdmin,
        isSuperAdmin,
      }}
    >
      {children}
    </userContext.Provider>
  );
};
