import { renderHook, waitFor, act } from '@testing-library/react';

import useDashboardData from './useDashboardData';

const servicesMocks = vi.hoisted(() => ({
  getMyLoans: vi.fn(),
  getSavedBooks: vi.fn(),
  getTransfers: vi.fn(),
  getUserReviews: vi.fn(),
}));

const utilitiesMocks = vi.hoisted(() => ({
  getRequestsForUser: vi.fn(),
}));

vi.mock('@/services', () => servicesMocks);
vi.mock('@/utilities', () => utilitiesMocks);

const {
  getMyLoans: mockGetMyLoans,
  getSavedBooks: mockGetSavedBooks,
  getTransfers: mockGetTransfers,
  getUserReviews: mockGetUserReviews,
} = servicesMocks;

const { getRequestsForUser: mockGetRequestsForUser } = utilitiesMocks;

const fullUser = { id: 'user-123', first_name: 'Taylor' };

beforeEach(() => {
  Object.values(servicesMocks).forEach((fn) => fn.mockClear?.());
  Object.values(utilitiesMocks).forEach((fn) => fn.mockClear?.());
});

describe('useDashboardData', () => {
  it('short-circuits network requests when no user is provided', async () => {
    const refreshBooks = vi.fn();

    const { result } = renderHook(() =>
      useDashboardData({
        user: null,
        firstNameFromContext: '',
        refreshBooks,
        bookLoading: false,
      }),
    );

    await waitFor(() => expect(result.current.initialLoaded).toBe(true));

    expect(mockGetRequestsForUser).not.toHaveBeenCalled();
    expect(mockGetMyLoans).not.toHaveBeenCalled();
    expect(mockGetSavedBooks).not.toHaveBeenCalled();
    expect(mockGetTransfers).not.toHaveBeenCalled();
    expect(mockGetUserReviews).not.toHaveBeenCalled();
    expect(result.current.requests).toEqual({ incoming: [], outgoing: [] });
    expect(result.current.savedBooks).toEqual([]);
  });

  it('hydrates dashboard data for authenticated users and refreshes on demand', async () => {
    mockGetRequestsForUser.mockResolvedValue({
      incoming: [{ id: 'req-1' }],
      outgoing: [{ id: 'req-2' }],
    });
    mockGetTransfers.mockResolvedValue([{ id: 'transfer-1' }]);
    mockGetSavedBooks.mockResolvedValue([{ id: 'book-1' }]);
    mockGetUserReviews.mockResolvedValue({ given: [], received: [{ id: 'review-1' }] });
    mockGetMyLoans.mockResolvedValue([
      {
        id: 'loan-1',
        due_date: '2024-01-01',
        book: {
          id: 'book-2',
          user_id: 'owner-1',
          status: 'lent',
          condition: 'good',
          created_at: '2024-01-02',
          books_catalog: { id: 'cat-1', title: 'Test Book', author: 'Author' },
        },
      },
    ]);

    const refreshBooks = vi.fn().mockResolvedValue();

    const { result } = renderHook(() =>
      useDashboardData({
        user: fullUser,
        firstNameFromContext: '',
        refreshBooks,
        bookLoading: true,
      }),
    );

    await waitFor(() => {
      expect(result.current.requests.incoming).toHaveLength(1);
      expect(result.current.transfers).toHaveLength(1);
      expect(result.current.savedBooks).toHaveLength(1);
      expect(result.current.borrowedBooks).toHaveLength(1);
    });

    expect(result.current.userFirstName).toBe('Taylor');
    expect(mockGetRequestsForUser).toHaveBeenCalledWith(fullUser);

    await act(async () => {
      await result.current.refreshAll();
    });

    expect(refreshBooks).toHaveBeenCalledTimes(1);
    expect(mockGetRequestsForUser).toHaveBeenCalledTimes(2);

    await act(async () => {
      await result.current.handleGlobalRefresh();
    });

    expect(result.current.globalRefreshing).toBe(false);
    expect(refreshBooks).toHaveBeenCalledTimes(2);
  });

  it('exposes refresh helpers that respect user guards', async () => {
    mockGetRequestsForUser.mockResolvedValue({ incoming: [], outgoing: [] });
    mockGetTransfers.mockResolvedValue([]);
    mockGetSavedBooks.mockResolvedValue([]);
    mockGetUserReviews.mockResolvedValue({ given: [], received: [] });
    mockGetMyLoans.mockResolvedValue([]);

    const refreshBooks = vi.fn().mockResolvedValue();

    const { result, rerender } = renderHook(
      ({ currentUser }) =>
        useDashboardData({
          user: currentUser,
          firstNameFromContext: '',
          refreshBooks,
          bookLoading: false,
        }),
      { initialProps: { currentUser: fullUser } },
    );

    await waitFor(() => expect(mockGetSavedBooks).toHaveBeenCalledTimes(1));

    mockGetSavedBooks.mockClear();

    await act(async () => {
      await result.current.refreshSaved();
    });

    expect(mockGetSavedBooks).toHaveBeenCalledTimes(1);

    rerender({ currentUser: null });

    await act(async () => {
      await result.current.refreshSaved();
      await result.current.refreshRequests();
    });

    expect(mockGetSavedBooks).toHaveBeenCalledTimes(1); // no additional calls without user
    expect(mockGetRequestsForUser).toHaveBeenCalledTimes(1); // call from initial render only
    expect(result.current.requests).toEqual({ incoming: [], outgoing: [] });
  });
});
