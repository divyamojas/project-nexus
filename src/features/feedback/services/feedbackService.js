// src/services/feedbackService.js

import { supabase } from '@/services/supabaseClient';

export const fetchUserEmail = async () => {
  const { data } = await supabase.auth.getUser();
  return data?.user?.email || null;
};

export const insertFeedback = async ({ message, email }) => {
  const { error } = await supabase.from('feedback').insert([{ message, email }]);
  if (error) {
    console.error('Feedback insert error:', error);
    return false;
  }
  return true;
};
