import { act, renderHook, waitFor } from '@testing-library/react';
import API from '../../../../redux/API/API';
import useFormData from '../useFormData';

jest.mock('../../../../redux/API/API', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  },
}));

const fields = [
  { name: 'name', label: 'Name', required: true },
  { name: 'description', label: 'Description' },
  { name: 'admin', label: 'Admin', type: 'checkbox' },
];

describe('useFormData', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('initializes with default values for create mode', () => {
    const { result } = renderHook(() =>
      useFormData({ apiUrl: '/api/v2/architectures', resourceId: null, fields })
    );

    expect(result.current.values).toEqual({
      name: '',
      description: '',
      admin: false,
    });
    expect(result.current.isEdit).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.errors).toEqual({});
    expect(result.current.submitErrors).toBeNull();
  });

  test('uses initialValue from field definitions', () => {
    const fieldsWithDefaults = [
      { name: 'name', label: 'Name', initialValue: 'default-name' },
      { name: 'active', label: 'Active', type: 'checkbox', initialValue: true },
    ];

    const { result } = renderHook(() =>
      useFormData({ apiUrl: '/api/v2/test', resourceId: null, fields: fieldsWithDefaults })
    );

    expect(result.current.values).toEqual({
      name: 'default-name',
      active: true,
    });
  });

  test('fetches record data in edit mode', async () => {
    API.get.mockResolvedValue({
      data: { id: 1, name: 'x86_64', description: 'Intel', admin: true },
    });

    const { result } = renderHook(() =>
      useFormData({ apiUrl: '/api/v2/architectures', resourceId: 1, fields })
    );

    expect(result.current.isEdit).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(API.get).toHaveBeenCalledWith('/api/v2/architectures/1');
    expect(result.current.values).toEqual({
      name: 'x86_64',
      description: 'Intel',
      admin: true,
    });
  });

  test('handles fetch error in edit mode', async () => {
    API.get.mockRejectedValue({
      response: { data: { error: { message: 'Not found' } } },
    });

    const { result } = renderHook(() =>
      useFormData({ apiUrl: '/api/v2/architectures', resourceId: 999, fields })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.submitErrors).toEqual(['Not found']);
  });

  test('onChange updates values and clears field error', async () => {
    const { result } = renderHook(() =>
      useFormData({ apiUrl: '/api/v2/architectures', resourceId: null, fields })
    );

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(result.current.errors.name).toBe("can't be blank");

    act(() => {
      result.current.onChange('name', 'new-name');
    });

    expect(result.current.values.name).toBe('new-name');
    expect(result.current.errors.name).toBeUndefined();
  });

  test('validates required fields on submit', async () => {
    const { result } = renderHook(() =>
      useFormData({ apiUrl: '/api/v2/architectures', resourceId: null, fields })
    );

    let submitResult;
    await act(async () => {
      submitResult = await result.current.onSubmit();
    });

    expect(submitResult).toEqual({ success: false });
    expect(result.current.errors.name).toBe("can't be blank");
  });

  test('submits POST for create mode', async () => {
    API.post.mockResolvedValue({ data: { id: 1, name: 'arm64' } });

    const { result } = renderHook(() =>
      useFormData({ apiUrl: '/api/v2/architectures', resourceId: null, fields })
    );

    act(() => {
      result.current.onChange('name', 'arm64');
    });

    let submitResult;
    await act(async () => {
      submitResult = await result.current.onSubmit();
    });

    expect(submitResult).toEqual({ success: true });
    expect(API.post).toHaveBeenCalledWith('/api/v2/architectures', {
      architecture: { name: 'arm64', description: '', admin: false },
    });
  });

  test('submits PUT for edit mode', async () => {
    API.get.mockResolvedValue({
      data: { id: 1, name: 'x86_64', description: '', admin: false },
    });
    API.put.mockResolvedValue({ data: { id: 1, name: 'x86_64-updated' } });

    const { result } = renderHook(() =>
      useFormData({ apiUrl: '/api/v2/architectures', resourceId: 1, fields })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.onChange('name', 'x86_64-updated');
    });

    let submitResult;
    await act(async () => {
      submitResult = await result.current.onSubmit();
    });

    expect(submitResult).toEqual({ success: true });
    expect(API.put).toHaveBeenCalledWith('/api/v2/architectures/1', {
      architecture: { name: 'x86_64-updated', description: '', admin: false },
    });
  });

  test('handles server-side validation errors', async () => {
    API.post.mockRejectedValue({
      response: {
        data: {
          error: {
            errors: { name: ['has already been taken'] },
            full_messages: ['Name has already been taken'],
          },
        },
      },
    });

    const { result } = renderHook(() =>
      useFormData({ apiUrl: '/api/v2/architectures', resourceId: null, fields })
    );

    act(() => {
      result.current.onChange('name', 'duplicate');
    });

    let submitResult;
    await act(async () => {
      submitResult = await result.current.onSubmit();
    });

    expect(submitResult).toEqual({ success: false });
    expect(result.current.errors.name).toBe('has already been taken');
    expect(result.current.submitErrors).toEqual(['Name has already been taken']);
  });
});
