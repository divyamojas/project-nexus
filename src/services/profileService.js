// src/services/profileService.js

import supabase from './supabaseClient';

export const getCurrentUserFirstName = async (userData) => {
  if (!userData?.id) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('first_name')
      .eq('id', userData.id)
      .single();

    if (error) {
      console.error('Error fetching user first_name:', error);
      return null;
    }

    return data?.first_name || null;
  } catch (err) {
    console.error('Unexpected error in getCurrentUserFirstName:', err);
    return null;
  }
};
