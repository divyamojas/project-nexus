// src/contexts/UserContext.jsx

import { createContext, useContext, useEffect, useState } from 'react';

import { useAuth } from './AuthContext';
import { getCurrentUserFirstName, getMyBooks, getTransfers, getUserReviews } from '../services';
import { getRequestsForBooksOfUsers } from '../utilities';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [userReviews, setUserReviews] = useState({ given: [], received: [] });
  const [myBooks, setMyBooks] = useState([]);
  const [requests, setRequests] = useState({ incoming: [], outgoing: [] });
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async () => {
    const name = await getCurrentUserFirstName();
    setFirstName(name || '');
  };

  const fetchUserReviews = async () => {
    const reviews = await getUserReviews();
    setUserReviews(reviews);
  };

  const fetchMyBooks = async () => {
    const books = await getMyBooks();
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
    ]);
    setLoading(false);
  };

  useEffect(() => {
    if (user) refresh();
  }, [user]);

  return (
    <UserContext.Provider
      value={{
        user,
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
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
