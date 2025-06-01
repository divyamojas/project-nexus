// src/services/feedbackService.js

import supabase from './supabaseClient';

export const insertFeedback = async ({ message, user }) => {
  if (!userData?.user?.id) return false;

  const email = userData.user.email;

  const { error } = await supabase.from('feedback').insert([{ message, email }]);
  if (error) {
    console.error('Feedback insert error:', error);
    return false;
  }
  return true;
};
