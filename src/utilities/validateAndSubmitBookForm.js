// src/utilities/validateAndSubmitBookForm.js

export default async function validateAndSubmitBookForm(
  formData,
  { setErrors, resetForm, onSuccess },
) {
  const newErrors = {};
  if (!formData.title.trim()) newErrors.title = 'Title is required';
  if (!formData.author.trim()) newErrors.author = 'Author is required';
  if (!formData.condition) newErrors.condition = 'Condition is required';

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return false;
  }

  const formattedTitle = formData.title
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const formattedAuthor = formData.author
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const formattedIsbn = formData.isbn
    .trim()
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();

  const success = await addBookToCatalogAndStock({
    title: formattedTitle,
    author: formattedAuthor,
    isbn: formattedIsbn,
    cover_url: formData.coverUrl,
    condition: formData.condition,
    notes: formData.notes,
  });

  if (success) {
    resetForm();
    if (onSuccess) onSuccess();
    return true;
  }

  return false;
}
