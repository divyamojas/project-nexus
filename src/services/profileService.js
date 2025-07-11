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

export const getUserProfile = async (userData) => {
  if (!userData?.id) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userData.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data || null;
  } catch (err) {
    console.error('Unexpected error in getUserProfile:', err);
    return null;
  }
};

export async function saveProfile({
  user,
  username,
  firstName,
  lastName,
  bio,
  avatarFile,
  avatarUrl,
}) {
  let uploadedUrl = avatarUrl;

  // Upload new avatar if selected
  if (avatarFile) {
    const fileExt = avatarFile.name.split('.').pop();
    const filePath = `profile/${user.id}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('profile-bucket')
      .upload(filePath, avatarFile, { upsert: true, cacheControl: '3600' });
    if (uploadError) {
      return { error: 'Failed to upload image.', errorType: 'avatar' };
    }
    const { data } = supabase.storage.from('profile-bucket').getPublicUrl(filePath);
    uploadedUrl = data?.publicUrl || '';
  }

  // Save profile
  const { error: dbError } = await supabase.from('profiles').upsert({
    id: user.id,
    username,
    avatar_url: uploadedUrl,
    first_name: firstName,
    last_name: lastName,
    bio,
  });

  if (dbError) {
    return {
      error: dbError.message.includes('username')
        ? 'Username is already taken.'
        : 'Failed to save profile.',
      errorType: 'db',
    };
  }

  return { success: true, uploadedUrl };
}
