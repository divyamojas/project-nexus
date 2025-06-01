// src/services.storageService.js

// TO BE CHANGED
export const uploadCoverImage = async (file) => {
  const fileExt = file.name.split('.').pop();
  const filePath = `covers/${Date.now()}.${fileExt}`;

  const { error } = await supabase.storage.from('book-covers').upload(filePath, file);
  if (error) {
    console.error('uploadCoverImage error:', error);
    return null;
  }

  const { data: urlData } = supabase.storage.from('book-covers').getPublicUrl(filePath);
  return urlData?.publicUrl;
};
