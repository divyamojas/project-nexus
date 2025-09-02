// src/services/bookReviewService.js

import supabase from './supabaseClient';
import { getBookById } from './bookService';

/**
 * Add a review for a book by the current user.
 */
export async function addBookReview({ book_id, rating, comment, user }) {
  if (!user?.id) throw new Error('Not authenticated');
  if (!(rating >= 1 && rating <= 5)) throw new Error('Rating must be between 1 and 5');

  // Guard: prevent user from reviewing their own book
  try {
    const { bookData, bookError } = await getBookById(book_id);
    if (bookError) throw bookError;
    if (bookData?.user_id && bookData.user_id === user.id) {
      throw new Error('You cannot review your own book.');
    }
  } catch (e) {
    // Normalize to user-facing error
    throw e;
  }

  const payload = {
    book_id,
    reviewer_id: user.id,
    rating,
    comment: comment || null,
  };
  try {
    const { data, error } = await supabase
      .from('book_reviews')
      .insert([payload])
      .select('*')
      .single();
    if (error) throw error;
    return data;
  } catch (e) {
    if (e?.code === '23505') {
      // unique_violation
      throw new Error('You have already reviewed this book.');
    }
    throw e;
  }
}

/**
 * Fetch reviews for a book, includes basic reviewer info if available.
 */
export async function getBookReviews(book_id) {
  // Join reviewer via explicit FK name to profiles
  const { data, error } = await supabase
    .from('book_reviews')
    .select(
      `
      id,
      rating,
      comment,
      created_at,
      reviewer:profiles!book_reviews_reviewer_fkey (
        id,
        first_name,
        last_name,
        username,
        avatar_url
      )
    `,
    )
    .eq('book_id', book_id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

/**
 * Compute average rating for a book, returns { count, average }.
 */
export async function getBookRatingSummary(book_id) {
  const { data, error } = await supabase
    .from('book_reviews')
    .select('rating')
    .eq('book_id', book_id);
  if (error) throw error;
  const ratings = (data || []).map((r) => r.rating).filter((n) => typeof n === 'number');
  const count = ratings.length;
  const average = count ? ratings.reduce((a, b) => a + b, 0) / count : 0;
  return { count, average };
}
