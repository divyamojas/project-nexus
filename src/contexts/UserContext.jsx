// src/contexts/UserContext.jsx

import { useCallback, useEffect, useState } from 'react';
import { userContext } from './userContextObject';

import { useAuth } from './hooks/useAuth';
import {
  getCurrentUserFirstName,
  getMyBooks,
  getTransfers,
  getUserProfile,
  getUserReviews,
} from '../services';
import { getRequestsForBooksOfUsers } from '../utilities';

// context object moved to ./userContextObject to satisfy Fast Refresh

export const UserProvider = ({ children }) => {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [userProfile, setUserProfile] = useState('');
  const [userReviews, setUserReviews] = useState({ given: [], received: [] });
  const [myBooks, setMyBooks] = useState([]);
  const [requests, setRequests] = useState({ incoming: [], outgoing: [] });
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async () => {
    const name = await getCurrentUserFirstName(user);
    setFirstName(name || '');
  }, [user]);

  const fetchCompleteUserProfile = useCallback(async () => {
    const profile = await getUserProfile(user);

    setUserProfile(profile || []);
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
      fetchCompleteUserProfile(),
    ]);
    setLoading(false);
  }, [
    fetchUserProfile,
    fetchUserReviews,
    fetchMyBooks,
    fetchRequests,
    fetchTransfers,
    fetchCompleteUserProfile,
  ]);

  useEffect(() => {
    if (user?.id) refresh();
  }, [user?.id, refresh]);

  return (
    <userContext.Provider
      value={{
        user,
        userProfile,
        firstName,
        userReviews,
        myBooks,
        requests,
        transfers,
        refresh,
        loading,
      }}
    >
      {children}
    </userContext.Provider>
  );
};
