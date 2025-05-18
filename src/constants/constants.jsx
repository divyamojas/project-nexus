// src/constants/constants.js

// src/constants/bookCardActions.js

import {
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  CheckCircleOutline as CheckIcon,
  HighlightOff as ClearIcon,
  CancelOutlined as CancelIcon,
  Replay as ReplayIcon,
} from '@mui/icons-material';

export const statusColor = {
  available: 'success',
  scheduled: 'warning',
  lent: 'default',
};

export const fallbackGradients = [
  'linear-gradient(135deg, #fdeff9 0%, #ec38bc 100%)',
  'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)',
  'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
  'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
  'linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%)',
];

export const actionConfigs = {
  myBooks: [
    {
      title: (book) => (book.archived ? 'Unarchive' : 'Archive'),
      icon: (book) =>
        book.archived ? <UnarchiveIcon fontSize="small" /> : <ArchiveIcon fontSize="small" />,
      handler: 'onArchive',
    },
    { title: 'Delete', icon: <DeleteIcon fontSize="small" />, handler: 'onDelete' },
  ],
  archived: [
    {
      title: (book) => (book.archived ? 'Unarchive' : 'Archive'),
      icon: (book) =>
        book.archived ? <UnarchiveIcon fontSize="small" /> : <ArchiveIcon fontSize="small" />,
      handler: 'onArchive',
    },
    { title: 'Delete', icon: <DeleteIcon fontSize="small" />, handler: 'onDelete' },
  ],
  saved: [
    {
      title: (book, isSaved) => (isSaved ? 'Unsave' : 'Save'),
      icon: (book, isSaved) =>
        isSaved ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />,
      handler: 'onToggleSave',
      toggleState: true,
    },
  ],
  browse: [
    {
      title: (book, isSaved) => (isSaved ? 'Unsave' : 'Save'),
      icon: (book, isSaved) =>
        isSaved ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />,
      handler: 'onToggleSave',
      toggleState: true,
    },
  ],
  incoming: [
    { title: 'Accept', icon: <CheckIcon fontSize="small" />, handler: 'onAccept' },
    { title: 'Reject', icon: <ClearIcon fontSize="small" />, handler: 'onReject' },
  ],
  outgoing: [
    { title: 'Cancel Request', icon: <CancelIcon fontSize="small" />, handler: 'onCancelRequest' },
  ],
  lent: [
    { title: 'Request Return', icon: <ReplayIcon fontSize="small" />, handler: 'onRequestReturn' },
  ],
};

// Dashboard Sections

export const DASHBOARD_SECTIONS = ({ lentBooks, savedBooks, requests, transfers }) => [
  { title: 'Lent Books', emoji: '📦', books: lentBooks, context: 'lent' },
  { title: 'Saved Books', emoji: '🔖', books: savedBooks, context: 'saved' },
  { title: 'Incoming Requests', emoji: '📥', books: requests?.incoming || [], context: 'incoming' },
  { title: 'Outgoing Requests', emoji: '📤', books: requests?.outgoing || [], context: 'outgoing' },
  { title: 'Transfers', emoji: '🚚', books: transfers, context: 'transfers' },
];

// Auth constants

export const ALLOWED_EMAIL_DOMAINS = ['sprinklr.com', 'gmail.com'];

export const DOMAIN_ERRORS = {
  signup: 'Hey there! 🌿 Only work or Gmail emails are allowed to join Leaflet.',
  login: 'Oops! 🌱 Only work or Gmail emails are accepted on Leaflet.',
};
