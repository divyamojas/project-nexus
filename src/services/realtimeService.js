// /src/services/realtimeService.js

import supabase from './supabaseClient';

let channel = null;

export function subscribeToBookChanges(onChange) {
  if (channel) return channel; // prevent duplicate

  channel = supabase
    .channel('books-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'books' }, (payload) => {
      console.log('[Realtime] Book change detected:', payload);
      onChange?.(payload);
    })
    .subscribe((status) => {
      console.log('[Realtime] Subscription status:', status);
    });

  return channel;
}

export function unsubscribeFromBookChanges() {
  if (channel) {
    supabase.removeChannel(channel);
    console.log('[Realtime] Book subscription removed');
    channel = null;
  }
}
