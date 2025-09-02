// src/constants/actionStyles.js
// Use palette reference keys understood by MUI's sx (no hex).
export const ACTION_STYLES = {
  delete: { hover: 'error.main', hoverText: 'common.white' },
  archive: { hover: 'grey.600', hoverText: 'common.white' },
  unarchive: { hover: 'success.main', hoverText: 'common.white' },
  save: { hover: 'primary.main', hoverText: 'common.white' },
  unsave: { hover: 'primary.main', hoverText: 'common.white' },
  requestReturn: { hover: 'warning.main', hoverText: 'common.white' },
  reject: { hover: 'error.dark', hoverText: 'common.white' },
  accept: { hover: 'success.main', hoverText: 'common.white' },
};

export const STATUS_COLOR = {
  available: 'success',
  scheduled: 'warning',
  lent: 'default',
};
