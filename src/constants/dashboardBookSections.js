// src/constants/dashboardBookSections.js

export const getDashboardSections = ({ lentBooks, savedBooks, requests, transfers }) => [
  { title: 'Lent Books', emoji: '📦', books: lentBooks },
  { title: 'Saved Books', emoji: '🔖', books: savedBooks },
  { title: 'Incoming Requests', emoji: '📥', books: requests?.incoming || [] },
  { title: 'Outgoing Requests', emoji: '📤', books: requests?.outgoing || [] },
  { title: 'Transfers', emoji: '🚚', books: transfers },
];
