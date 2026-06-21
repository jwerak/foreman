import { act, renderHook, waitFor } from '@testing-library/react';
import API from '../../../redux/API/API';
import useHostForm from '../useHostForm';

jest.mock('../../../common/I18n');

jest.mock('../../../redux/API/API', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  },
}));

const defaultMeta = {
  isNew: true,
  isManaged: true,
  cancelUrl: '/hosts',
  showOrganizationTab: false,
  showLocationTab: false,
};

const defaultOptions = {
  organizations: [],
  locations: [],
  hostgroups: [],
  computeResources: [],
  computeProfiles: [],
  realms: [],
};

describe('useHostForm', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('initializes values from host prop', () => {
    const host = { name: 'test-host', comment: 'a comment' };

    const { result } = renderHook(() =>
      useHostForm({ host, options: defaultOptions, meta: defaultMeta })
    );

    expect(result.current.values.name).toBe('test-host');
    expect(result.current.values.comment).toBe('a comment');
    expect(result.current.values.host_parameters_attributes).toEqual([]);
  });

  test('initializes default interface for new host', () => {
    const { result } = renderHook(() =>
      useHostForm({
        host: {},
        options: defaultOptions,
        meta: { ...defaultMeta, isNew: true },
      })
    );

    const interfaces = result.current.values.interfaces_attributes;
    expect(interfaces).toHaveLength(1);
    expect(interfaces[0].primary).toBe(true);
    expect(interfaces[0].provision).toBe(true);
    expect(interfaces[0].type).toBe('Nic::Managed');
  });

  test('onChange updates values', () => {
    const { result } = renderHook(() =>
      useHostForm({ host: {}, options: defaultOptions, meta: defaultMeta })
    );

    act(() => {
      result.current.onChange('name', 'new-host');
    });

    expect(result.current.values.name).toBe('new-host');
  });

  test('validates required name field', async () => {
    const { result } = renderHook(() =>
      useHostForm({ host: {}, options: defaultOptions, meta: defaultMeta })
    );

    let submitResult;
    await act(async () => {
      submitResult = await result.current.onSubmit();
    });

    expect(submitResult).toEqual({ success: false });
    expect(result.current.errors.name).toBe("can't be blank");
  });

  test('onChange clears field error', async () => {
    const { result } = renderHook(() =>
      useHostForm({ host: {}, options: defaultOptions, meta: defaultMeta })
    );

    // Trigger validation error
    await act(async () => {
      await result.current.onSubmit();
    });

    expect(result.current.errors.name).toBe("can't be blank");

    // Fix the error
    act(() => {
      result.current.onChange('name', 'valid-name');
    });

    expect(result.current.errors.name).toBeUndefined();
  });

  test('onSubmit sends POST for new host', async () => {
    API.post.mockResolvedValue({
      data: { id: 1, name: 'new-host' },
    });

    // Prevent location assignment from throwing
    delete window.location;
    window.location = { href: '' };

    const { result } = renderHook(() =>
      useHostForm({ host: {}, options: defaultOptions, meta: defaultMeta })
    );

    act(() => {
      result.current.onChange('name', 'new-host');
    });

    let submitResult;
    await act(async () => {
      submitResult = await result.current.onSubmit();
    });

    expect(submitResult).toEqual({ success: true });
    expect(API.post).toHaveBeenCalledWith('/api/v2/hosts', {
      host: expect.objectContaining({ name: 'new-host' }),
    });
  });

  test('onSubmit sends PUT for edit host', async () => {
    API.put.mockResolvedValue({
      data: { id: 42, name: 'updated-host' },
    });

    delete window.location;
    window.location = { href: '' };

    const host = { id: 42, name: 'existing-host' };
    const editMeta = { ...defaultMeta, isNew: false };

    const { result } = renderHook(() =>
      useHostForm({ host, options: defaultOptions, meta: editMeta })
    );

    act(() => {
      result.current.onChange('name', 'updated-host');
    });

    let submitResult;
    await act(async () => {
      submitResult = await result.current.onSubmit();
    });

    expect(submitResult).toEqual({ success: true });
    expect(API.put).toHaveBeenCalledWith('/api/v2/hosts/42', {
      host: expect.objectContaining({ id: 42, name: 'updated-host' }),
    });
  });

  test('handles server-side validation errors on submit', async () => {
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
      useHostForm({ host: {}, options: defaultOptions, meta: defaultMeta })
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
    expect(result.current.submitErrors).toEqual([
      'Name has already been taken',
    ]);
  });
});
