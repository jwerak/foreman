import { renderHook, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('../../../../redux/API/API', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

// eslint-disable-next-line import/first
import API from '../../../../redux/API/API';
// eslint-disable-next-line import/first
import useDetailData from '../useDetailData';

const defaultArgs = {
  apiUrl: '/api/v2/domains',
  resourceId: 1,
  fieldsUrl: '/domains/form_fields',
};

describe('useDetailData', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('returns loading state initially', () => {
    API.get.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useDetailData(defaultArgs));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.resource).toBeNull();
    expect(result.current.fields).toEqual([]);
    expect(result.current.metadata).toEqual({});
    expect(result.current.error).toBeNull();
  });

  test('fetches resource and fields in parallel', async () => {
    const mockResource = { id: 1, name: 'example.com' };
    const mockFields = [
      { name: 'name', label: 'Name', type: 'text' },
      { name: 'dns_id', label: 'DNS Proxy', type: 'select' },
    ];

    API.get
      .mockResolvedValueOnce({ data: mockResource })
      .mockResolvedValueOnce({ data: { fields: mockFields } });

    const { result } = renderHook(() => useDetailData(defaultArgs));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.resource).toEqual(mockResource);
    expect(result.current.fields).toEqual(mockFields);
    expect(result.current.metadata).toEqual({});
    expect(result.current.error).toBeNull();

    expect(API.get).toHaveBeenCalledWith('/api/v2/domains/1');
    expect(API.get).toHaveBeenCalledWith('/domains/form_fields');
  });

  test('sets error on fetch failure', async () => {
    API.get.mockRejectedValue({
      response: {
        data: {
          error: { message: 'Not found' },
        },
      },
    });

    const { result } = renderHook(() => useDetailData(defaultArgs));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Not found');
    expect(result.current.resource).toBeNull();
  });

  test('handles empty fields response', async () => {
    API.get
      .mockResolvedValueOnce({ data: { id: 1, name: 'test' } })
      .mockResolvedValueOnce({ data: {} });

    const { result } = renderHook(() => useDetailData(defaultArgs));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.fields).toEqual([]);
    expect(result.current.metadata).toEqual({});
  });

  test('returns metadata from form_fields response', async () => {
    const mockResource = { id: 1, name: 'admin' };
    const mockMetadata = { current_user_id: 1 };

    API.get
      .mockResolvedValueOnce({ data: mockResource })
      .mockResolvedValueOnce({
        data: {
          fields: [{ name: 'login', label: 'Login' }],
          metadata: mockMetadata,
        },
      });

    const { result } = renderHook(() => useDetailData(defaultArgs));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.metadata).toEqual(mockMetadata);
  });
});
