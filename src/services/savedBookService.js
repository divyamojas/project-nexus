// src/servies/savedBookService.js

export async function getSavedBooks(userData) {
  if (!userData?.user?.id) return [];

  const userId = userData.user.id;

  const { data, error } = await supabase
    .from('saved_books')
    .select(
      `
      id,
      catalog_id,
      created_at,
      book:book_id(
        id,
        user_id,
        status,
        condition,
        created_at,
        books_catalog(id, title, author, cover_url)
      )
    `,
    )
    .eq('user_id', userId);

  if (error) {
    console.error('getSavedBooks error:', error);
    return [];
  }

  return data.map((entry) => ({
    id: entry.book.id,
    user_id: entry.book.user_id,
    status: entry.book.status,
    condition: entry.book.condition,
    created_at: entry.book.created_at,
    catalog: entry.book.books_catalog,
    is_saved: true,
  }));
}

export async function toggleSaveBook(id, should_save, catalog_id, userData) {
  if (!userData?.user?.id) return false;

  const userId = userData.user.id;

  if (should_save) {
    const { error } = await supabase.from('saved_books').insert({
      book_id: id,
      user_id: userId,
      catalog_id: catalog_id,
    });
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('saved_books')
      .delete()
      .eq('user_id', userId)
      .eq('book_id', id);

    if (error) throw error;
  }

  return true;
}
