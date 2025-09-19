import { vi, describe, expect, it } from 'vitest';

import validateAndSubmitBookForm from './validateAndSubmitBookForm';

const mockAddBookToCatalogAndStock = vi.hoisted(() => vi.fn());

vi.mock('./addBookToCatalogAndStock', () => ({
  default: mockAddBookToCatalogAndStock,
}));

const formDefaults = {
  title: 'The Pragmatic Programmer',
  author: 'Andrew Hunt',
  isbn: '978-0201616224',
  coverUrl: 'https://example.com/pragmatic.jpg',
  condition: 'good',
  notes: '',
};

describe('validateAndSubmitBookForm', () => {
  beforeEach(() => {
    mockAddBookToCatalogAndStock.mockReset();
  });

  it('returns false immediately when user is missing', async () => {
    const setErrors = vi.fn();

    const result = await validateAndSubmitBookForm(formDefaults, {
      setErrors,
      resetForm: vi.fn(),
      onSuccess: vi.fn(),
      user: null,
    });

    expect(result).toBe(false);
    expect(mockAddBookToCatalogAndStock).not.toHaveBeenCalled();
    expect(setErrors).not.toHaveBeenCalled();
  });

  it('surfaces validation errors when required fields are empty', async () => {
    const setErrors = vi.fn();

    const result = await validateAndSubmitBookForm(
      { ...formDefaults, title: ' ', author: '', condition: '' },
      {
        setErrors,
        resetForm: vi.fn(),
        onSuccess: vi.fn(),
        user: { id: 'user-1' },
      },
    );

    expect(result).toBe(false);
    expect(setErrors).toHaveBeenCalledWith({
      title: 'Title is required',
      author: 'Author is required',
      condition: 'Condition is required',
    });
    expect(mockAddBookToCatalogAndStock).not.toHaveBeenCalled();
  });

  it('formats data and resets form on success', async () => {
    const setErrors = vi.fn();
    const resetForm = vi.fn();
    const onSuccess = vi.fn();
    mockAddBookToCatalogAndStock.mockResolvedValue({ id: 'book-123' });

    const result = await validateAndSubmitBookForm(formDefaults, {
      setErrors,
      resetForm,
      onSuccess,
      user: { id: 'user-1' },
    });

    expect(result).toEqual({ id: 'book-123' });
    expect(mockAddBookToCatalogAndStock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'The Pragmatic Programmer',
        author: 'Andrew Hunt',
        isbn: '9780201616224',
      }),
    );
    expect(resetForm).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalled();
    expect(setErrors).not.toHaveBeenCalled();
  });

  it('returns false when catalog insertion fails', async () => {
    const setErrors = vi.fn();
    const resetForm = vi.fn();
    const onSuccess = vi.fn();
    mockAddBookToCatalogAndStock.mockResolvedValue(null);

    const result = await validateAndSubmitBookForm(formDefaults, {
      setErrors,
      resetForm,
      onSuccess,
      user: { id: 'user-1' },
    });

    expect(result).toBe(false);
    expect(resetForm).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
