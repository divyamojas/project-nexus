// // /src/servicesreturnRequestService.js

export async function requestBookReturn(bookId, userData) {
  if (!userData?.user?.id) return false;

  const userId = userData.user.id;

  const { error } = await supabase.from('return_requests').insert([
    {
      book_id: bookId,
      requested_by: userId,
      requested_at: new Date().toISOString(),
    },
  ]);

  if (error) {
    console.error('requestBookReturn error:', error);
    throw error;
  }

  return true;
}
