// /src/services/userReviewService.js

import supabase from './supabaseClient';

export async function getUserReviews(userData, type = 'given') {
  if (!userData?.id) return { reviews: [] };

  const userId = userData.id;
  const column = type === 'received' ? 'reviewee_id' : 'reviewer_id';

  const { data, error } = await supabase.from('user_reviews').select('*').eq(column, userId);

  if (error) console.error(`getUserReviews (${type}) error:`, error);

  return { reviews: data ?? [] };
}
