// src/services/realtimeService.js

import supabase from './supabaseClient';
import { logError } from '../utilities/logger';

let channel = null;

/**
 * Subscribe to realtime changes on books table and invoke callback.
 */
export function subscribeToBookChanges(onChange) {
  if (channel) return channel; // prevent duplicate

  channel = supabase
    .channel('books-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'books' }, (payload) => {
      try {
        onChange?.(payload);
      } catch (e) {
        logError('subscribeToBookChanges onChange handler failed', e, { payload });
      }
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
