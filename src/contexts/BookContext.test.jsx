import { renderHook, act, waitFor } from '@testing-library/react';

import { BookProvider } from './BookContext';
import { userContext } from './userContextObject';
import { useBookContext } from './hooks/useBookContext';

const serviceMocks = vi.hoisted(() => ({
  archiveBook: vi.fn(),
  deleteBook: vi.fn(),
  getBooks: vi.fn().mockResolvedValue([]),
  getSavedBooks: vi.fn().mockResolvedValue([]),
  subscribeToBookChanges: vi.fn(() => ({ unsubscribe: vi.fn() })),
  unsubscribeFromBookChanges: vi.fn(),
  toggleSaveBook: vi.fn(),
  getBookWithRelations: vi.fn(),
}));

const requestMocks = vi.hoisted(() => ({
  requestBorrowBook: vi.fn(),
}));

vi.mock('@/services', () => serviceMocks);
vi.mock('@/services/bookRequestService', () => requestMocks);

const {
  getBooks: mockGetBooks,
  getSavedBooks: mockGetSavedBooks,
  toggleSaveBook: mockToggleSaveBook,
} = serviceMocks;

const { requestBorrowBook: mockRequestBorrowBook } = requestMocks;

const createWrapper = (userValue) => {
  const Wrapper = ({ children }) => (
    <userContext.Provider value={{ user: userValue }}>
      <BookProvider>{children}</BookProvider>
    </userContext.Provider>
  );
  Wrapper.displayName = 'BookContextTestWrapper';
  return Wrapper;
};

beforeEach(() => {
  Object.values(serviceMocks).forEach((fn) => fn.mockClear?.());
  Object.values(requestMocks).forEach((fn) => fn.mockClear?.());
  mockGetBooks.mockResolvedValue([]);
  mockGetSavedBooks.mockResolvedValue([]);
});

describe('BookContext network guards', () => {
  it('avoids hitting Supabase when no user is present', async () => {
    const { result } = renderHook(() => useBookContext(), {
      wrapper: createWrapper(null),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockGetBooks).not.toHaveBeenCalled();
    expect(mockGetSavedBooks).not.toHaveBeenCalled();

    const book = { id: 'book-1', catalog: { id: 'catalog-1' } };
    await act(async () => {
      await result.current.toggleBookSaveStatus(book);
      await result.current.sendBookRequest(book);
    });

    expect(mockToggleSaveBook).not.toHaveBeenCalled();
    expect(mockRequestBorrowBook).not.toHaveBeenCalled();
  });

  it('performs save and request actions for the owning user', async () => {
    mockGetBooks.mockResolvedValue([
      { id: 'book-1', user_id: 'user-123', catalog: { id: 'catalog-1' } },
    ]);

    const user = { id: 'user-123' };
    const { result } = renderHook(() => useBookContext(), {
      wrapper: createWrapper(user),
    });

    await waitFor(() => expect(mockGetBooks).toHaveBeenCalled());

    const book = {
      id: 'book-1',
      user_id: 'user-123',
      catalog: { id: 'catalog-1' },
      is_saved: false,
    };

    await act(async () => {
      await result.current.toggleBookSaveStatus(book);
    });

    expect(mockToggleSaveBook).toHaveBeenCalledWith('book-1', true, 'catalog-1', user);

    await act(async () => {
      await result.current.sendBookRequest({ ...book, user_id: 'owner-456' });
    });

    expect(mockRequestBorrowBook).toHaveBeenCalled();
  });
});
