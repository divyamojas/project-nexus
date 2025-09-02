// src/constants/dashboard.js
export const DASHBOARD_SECTIONS = ({
  lentBooks,
  savedBooks,
  requests,
  transfers,
  borrowedBooks = [],
}) => [
  { title: 'Lent Books', emoji: '📦', books: lentBooks, context: 'lentOwned' },
  { title: 'Borrowed Books', emoji: '📚', books: borrowedBooks, context: 'lentBorrowed' },
  { title: 'Saved Books', emoji: '🔖', books: savedBooks, context: 'saved' },
  { title: 'Incoming Requests', emoji: '📥', books: requests?.incoming || [], context: 'incoming' },
  { title: 'Outgoing Requests', emoji: '📤', books: requests?.outgoing || [], context: 'outgoing' },
  { title: 'Transfers', emoji: '🚚', books: transfers, context: 'transfers' },
];
