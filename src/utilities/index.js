import validateAndSubmitBookForm from './validateAndSubmitBookForm';
import { uploadBookCover } from '../services/bookService';

validateAndSubmitBookForm.uploadBookCover = uploadBookCover;

export { validateAndSubmitBookForm };

export { default as addBookToCatalogAndStock } from './addBookToCatalogAndStock';
export { default as getActiveBooksForBrowse } from './getActiveBooksForBrowse';
export { default as getRequestsForBooksOfUsers } from './getRequestsForBooksOfOwners';
export { default as getRequestsForUser } from './getRequestsForUser';
export { default as processLogin } from './processLogin';
export { default as processResetPassword } from './processResetPassword';
export { default as processSignup } from './processSignup';
// export { default as validateAndSubmitBookForm } from './validateAndSubmitBookForm';
