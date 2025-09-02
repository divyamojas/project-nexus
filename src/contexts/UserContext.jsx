// src/contexts/UserContext.jsx

import { useEffect, useState, useContext } from 'react';
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

  const fetchUserProfile = async () => {
    const name = await getCurrentUserFirstName(user);
    setFirstName(name || '');
  };

  const fetchCompleteUserProfile = async () => {
    const profile = await getUserProfile(user);

    setUserProfile(profile || []);
  };

  const fetchUserReviews = async () => {
    const reviews = await getUserReviews(user);
    setUserReviews(reviews);
  };

  const fetchMyBooks = async () => {
    const books = await getMyBooks(user);
    setMyBooks(books);
  };

  const fetchRequests = async (user) => {
    const reqs = await getRequestsForBooksOfUsers(user);
    setRequests(reqs);
  };

  const fetchTransfers = async () => {
    const txns = await getTransfers();
    setTransfers(txns);
  };

  const refresh = async () => {
    setLoading(true);
    await Promise.all([
      fetchUserProfile(),
      fetchUserReviews(),
      fetchMyBooks(),
      fetchRequests(user),
      fetchTransfers(),
      fetchCompleteUserProfile(),
    ]);
    setLoading(false);
  };

  useEffect(() => {
    if (user) refresh();
  }, [user]);

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

// Moved to separate hook file to improve Fast Refresh boundaries
// Hook moved to src/contexts/hooks/useUser.js
