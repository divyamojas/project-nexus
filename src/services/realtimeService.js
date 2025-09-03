// src/services/realtimeService.js

import supabase from './supabaseClient';

let channel = null;

/**
 * Subscribe to realtime changes on books table and invoke callback.
 */
export function subscribeToBookChanges(onChange) {
  if (channel) return channel; // prevent duplicate

  channel = supabase
    .channel('books-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'books' }, (payload) => {
      onChange?.(payload);
    })
    .subscribe((_status) => {
      // Subscribed
    });

  return channel;
}

/**
 * Remove the active realtime subscription, if any.
 */
export function unsubscribeFromBookChanges() {
  if (channel) {
    supabase.removeChannel(channel);
    channel = null;
  }
}
