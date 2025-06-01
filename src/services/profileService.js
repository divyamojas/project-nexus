// src/services/profileService.js

export const getCurrentUserFirstName = async (userData) => {
  if (!userData?.user?.id) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('first_name')
      .eq('id', userData.user.id)
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
