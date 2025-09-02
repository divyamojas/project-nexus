// src/utilities/addBookToCatalogAndStock.js

import { addBookInstance, addBookToCatalog, fetchCatalogBookEntry } from '../services';

/**
 * Ensure a catalog entry exists, then create an owned book instance.
 */
export default async function addBookToCatalogAndStock({
  title,
  author,
  isbn,
  cover_url,
  condition,
  notes,
  user,
}) {
  if (!user?.id) {
    console.warn('addBookToCatalogAndStock: User not provided or invalid');
    return false;
  }
  try {
    const trimmedTitle = title?.trim();
    const trimmedAuthor = author?.trim();

    const existing = await fetchCatalogBookEntry(trimmedTitle, trimmedAuthor);
    let catalogId = existing?.id;

    if (!catalogId) {
      const addedCatalog = await addBookToCatalog({
        title: trimmedTitle,
        author: trimmedAuthor,
        isbn: isbn?.trim() || null,
        cover_url: cover_url || null,
        created_by: user.id,
      });

      catalogId = addedCatalog?.id;
    }
    if (!catalogId) {
      console.error('addBookToCatalogAndStock: Failed to resolve catalog ID');
      return false;
    }

    return await addBookInstance({
      catalog_id: catalogId,
      condition,
      user_id: user.id,
      archived: false,
      notes: notes?.trim() || null,
    });
  } catch (err) {
    console.error('Error in addBookToCatalogAndStock:', err);
    return false;
  }
}
