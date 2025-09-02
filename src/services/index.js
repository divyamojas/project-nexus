// File: ./services/index.js
// Public export surface for all data-layer operations. UI and contexts should import from here.

export { default as supabase } from './supabaseClient';

export { signup, login, logout, resetPassword, getSession, onAuthStateChange } from './authService';

export {
  fetchCatalogBookEntry,
  searchBooksCatalogByTitle,
  addBookToCatalog,
} from './bookCatalogService';

export {
  requestBorrowBook,
  updateRequestStatus,
  getRequestsForBook,
  getIncomingRequestsForBooks,
  getOutgoingRequestsForUser,
} from './bookRequestService';

export {
  getBookById,
  getMyBooks,
  addBookInstance,
  deleteBook,
  archiveBook,
  getBooks,
  uploadBookCover,
} from './bookService';

export { insertFeedback } from './feedbackService';

export { getCurrentUserFirstName, getUserProfile } from './profileService';

export { subscribeToBookChanges, unsubscribeFromBookChanges } from './realtimeService';

export { requestBookReturn } from './returnRequestService';

export { getSavedBooks, toggleSaveBook } from './savedBookService';

export { getUserReviews } from './userReviewService';

export { getTransfers } from './transferService';
