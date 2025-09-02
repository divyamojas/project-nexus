// src/utilities/formatDisplayName.js
export default function formatDisplayName(profile) {
  if (!profile) return 'Anonymous';
  const first = profile.first_name?.trim();
  const last = profile.last_name?.trim();
  const username = profile.username?.trim();
  const full = [first, last].filter(Boolean).join(' ').trim();
  return full || username || 'Anonymous';
}
