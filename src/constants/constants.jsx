// Aggregator for constants split into modules. Existing imports stay intact.
export { QUOTES } from './quotes';
export { ACTION_STYLES, STATUS_COLOR } from './actionStyles';
export { BOOK_FORM_FIELDS, INITIAL_BOOK_FORM_DATA } from './bookForm';
export { ACTION_CONFIGS } from './actionConfigs';
export { DASHBOARD_SECTIONS } from './dashboard';

export const ALLOWED_EMAIL_DOMAINS = ['sprinklr.com', 'gmail.com'];
export const DOMAIN_ERRORS = {
  signup: 'Hey there! 🌿 Only work or Gmail emails are allowed to join Leaflet.',
  login: 'Oops! 🌱 Only work or Gmail emails are accepted on Leaflet.',
};
