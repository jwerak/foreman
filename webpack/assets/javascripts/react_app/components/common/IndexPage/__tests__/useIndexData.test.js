import { act, renderHook, waitFor } from '@testing-library/react';
import API from '../../../../redux/API/API';
import useIndexData from '../useIndexData';

jest.mock('../../../../redux/API/API', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

const mockResponse = {
  data: {
    results: [
      { id: 1, name: 'Domain 1' },
      { id: 2, name: 'Domain 2' },
    ],
    total: 10,
    subtotal: 10,
    page: 1,
    per_page: 20,
    can_create: true,
  },
};

describe('useIndexData', () => {
  beforeEach(() => {
    API.get.mockResolvedValue(mockResponse);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('fetches data on mount', async () => {
    const { result } = renderHook(() =>
      useIndexData({ apiUrl: '/api/v2/domains' })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(API.get).toHaveBeenCalledWith(
      '/api/v2/domains',
      {},
      { page: 1, per_page: 20, include_permissions: true }
    );
    expect(result.current.results).toEqual(mockResponse.data.results);
    expect(result.current.total).toBe(10);
    expect(result.current.subtotal).toBe(10);
    expect(result.current.canCreate).toBe(true);
    expect(result.current.error).toBeNull();
  });

  test('handles pagination', async () => {
    const { result } = renderHook(() =>
      useIndexData({ apiUrl: '/api/v2/domains' })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.onPagination({ page: 2 });
    });

    await waitFor(() => {
      expect(API.get).toHaveBeenLastCalledWith(
        '/api/v2/domains',
        {},
        { page: 2, per_page: 20, include_permissions: true }
      );
    });
  });

  test('resets page to 1 when per_page changes', async () => {
    const { result } = renderHook(() =>
      useIndexData({ apiUrl: '/api/v2/domains' })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.onPagination({ per_page: 50 });
    });

    await waitFor(() => {
      expect(result.current.page).toBe(1);
      expect(result.current.perPage).toBe(50);
    });
  });

  test('handles search', async () => {
    const { result } = renderHook(() =>
      useIndexData({ apiUrl: '/api/v2/domains' })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.onSearch('name ~ test');
    });

    await waitFor(() => {
      expect(API.get).toHaveBeenLastCalledWith(
        '/api/v2/domains',
        {},
        {
          page: 1,
          per_page: 20,
          include_permissions: true,
          search: 'name ~ test',
        }
      );
    });
    expect(result.current.page).toBe(1);
  });

  test('handles sort', async () => {
    const { result } = renderHook(() =>
      useIndexData({ apiUrl: '/api/v2/domains' })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.onSort('name', 'asc');
    });

    await waitFor(() => {
      expect(API.get).toHaveBeenLastCalledWith(
        '/api/v2/domains',
        {},
        {
          page: 1,
          per_page: 20,
          include_permissions: true,
          order: 'name asc',
        }
      );
    });
  });

  test('handles API errors', async () => {
    API.get.mockRejectedValueOnce({
      response: { data: { error: { message: 'Not found' } } },
    });

    const { result } = renderHook(() =>
      useIndexData({ apiUrl: '/api/v2/domains' })
    );

    await waitFor(() => {
      expect(result.current.error).toBe('Not found');
    });
    expect(result.current.results).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  test('handles API errors with full_messages array', async () => {
    API.get.mockRejectedValueOnce({
      response: {
        data: { error: { full_messages: ['Error 1', 'Error 2'] } },
      },
    });

    const { result } = renderHook(() =>
      useIndexData({ apiUrl: '/api/v2/domains' })
    );

    await waitFor(() => {
      expect(result.current.error).toBe('Error 1, Error 2');
    });
  });

  test('uses initial search and sort params', async () => {
    renderHook(() =>
      useIndexData({
        apiUrl: '/api/v2/domains',
        initialSearch: 'name = test',
        initialSort: 'name asc',
      })
    );

    await waitFor(() => {
      expect(API.get).toHaveBeenCalledWith(
        '/api/v2/domains',
        {},
        {
          page: 1,
          per_page: 20,
          include_permissions: true,
          search: 'name = test',
          order: 'name asc',
        }
      );
    });
  });

  test('uses custom defaultPerPage', async () => {
    renderHook(() =>
      useIndexData({ apiUrl: '/api/v2/domains', defaultPerPage: 50 })
    );

    await waitFor(() => {
      expect(API.get).toHaveBeenCalledWith(
        '/api/v2/domains',
        {},
        { page: 1, per_page: 50, include_permissions: true }
      );
    });
  });
});
