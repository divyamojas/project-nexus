// src/services/userReviewService.js

import supabase from './supabaseClient';

/**
 * Fetch user-to-user reviews either 'given' or 'received' by the user.
 */
export async function getUserReviews(user, type = 'given') {
  if (!user?.id) return { reviews: [] };

  const userId = user.id;
  const column = type === 'received' ? 'reviewee_id' : 'reviewer_id';

  const { data, error } = await supabase.from('user_reviews').select('*').eq(column, userId);

  if (error) console.error(`getUserReviews (${type}) error:`, error);

  return { reviews: data ?? [] };
}
