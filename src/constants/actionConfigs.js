// src/constants/actionConfigs.js
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

export const ACTION_CONFIGS = {
  myBooks: [
    {
      title: (book) => (book.archived ? 'Unarchive' : 'Archive'),
      icon: (book) => (book.archived ? UnarchiveIcon : ArchiveIcon),
      handler: 'onArchive',
      styleKey: (book) => (book.archived ? 'unarchive' : 'archive'),
    },
    {
      title: 'Delete',
      icon: () => DeleteIcon,
      handler: 'onDelete',
      styleKey: 'delete',
    },
  ],
  archived: [
    {
      title: (book) => (book.archived ? 'Unarchive' : 'Archive'),
      icon: (book) => (book.archived ? UnarchiveIcon : ArchiveIcon),
      handler: 'onArchive',
      styleKey: (book) => (book.archived ? 'unarchive' : 'archive'),
    },
    {
      title: 'Delete',
      icon: () => DeleteIcon,
      handler: 'onDelete',
      styleKey: 'delete',
    },
  ],
  saved: [
    {
      title: (book, isSaved) => (isSaved ? 'Unsave' : 'Save'),
      icon: (book, isSaved) => (isSaved ? BookmarkIcon : BookmarkBorderIcon),
      handler: 'onToggleSave',
      toggleState: true,
      styleKey: (book, isSaved) => (isSaved ? 'unsave' : 'save'),
    },
  ],
  browse: [
    {
      title: (book, isSaved) => (isSaved ? 'Unsave' : 'Save'),
      icon: (book, isSaved) => (isSaved ? BookmarkIcon : BookmarkBorderIcon),
      handler: 'onToggleSave',
      toggleState: true,
      styleKey: (book, isSaved) => (isSaved ? 'unsave' : 'save'),
    },
  ],
  incoming: [
    {
      title: 'Accept',
      icon: () => CheckIcon,
      handler: 'onAccept',
      styleKey: 'accept',
    },
    {
      title: 'Reject',
      icon: () => ClearIcon,
      handler: 'onReject',
      styleKey: 'reject',
    },
  ],
  outgoing: [
    {
      title: 'Cancel Request',
      icon: () => CancelIcon,
      handler: 'onCancelRequest',
      styleKey: 'reject',
    },
  ],
  lentBorrowed: [
    {
      title: 'Request Return',
      icon: () => ReplayIcon,
      handler: 'onRequestReturn',
      styleKey: 'requestReturn',
    },
  ],
  lentOwned: [
    {
      title: 'Approve Return',
      icon: () => CheckIcon,
      handler: 'onApproveReturn',
      styleKey: 'accept',
    },
  ],
  transfers: [
    {
      title: 'Complete Transfer',
      icon: () => CheckIcon,
      handler: 'onCompleteTransfer',
      styleKey: 'accept',
    },
  ],
};
