// src/services/feedbackService.js

import supabase from './supabaseClient';

/**
 * Insert a free-form feedback message linked to the user's email.
 */
export const insertFeedback = async ({ message, user }) => {
  if (!user?.id) return false;

  const email = user.email;

  const { error } = await supabase.from('feedback').insert([{ message, email }]);
  if (error) {
    console.error('Feedback insert error:', error);
    return false;
  }
  return true;
};
