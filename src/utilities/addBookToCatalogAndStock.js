// src/utilities/addBookToCatalogAndStock.js

import { addBookInstance, addBookToCatalog, fetchCatalogBookEntry } from '../services';

export default async function addBookToCatalogAndStock({ title, author, condition, user }) {
  if (!user?.id) {
    return false;
  }

  try {
    const trimmedTitle = title?.trim();
    const trimmedAuthor = author?.trim();

    const existing = await fetchCatalogBookEntry(trimmedTitle, trimmedAuthor);
    const catalogId =
      existing?.id ?? (await addBookToCatalog({ title: trimmedTitle, author: trimmedAuthor }))?.id;

    if (!catalogId) {
      console.error('Catalog entry missing in addBookToCatalogAndStock');
      return false;
    }

    return await addBookInstance({
      catalog_id: catalogId,
      condition,
      user_id: user.id,
      archived: false,
    });
  } catch (err) {
    console.error('Error in addBookToCatalogAndStock:', err);
    return false;
  }
}
