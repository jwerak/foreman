import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { legacy_createStore as createStore } from 'redux';
import API from '../../../redux/API/API';
import useTemplateForm from '../useTemplateForm';

jest.mock('../../../common/I18n');

jest.mock('../../../redux/API/API', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  },
}));

const mockStore = createStore(() => ({
  editor: { value: 'template content' },
}));

const wrapper = ({ children }) => (
  <Provider store={mockStore}>{children}</Provider>
);

const defaultMeta = {
  isNew: true,
  cancelUrl: '/provisioning_templates',
  templateType: 'provisioning_template',
  apiUrl: '/api/v2/provisioning_templates',
  resourceName: 'provisioning_template',
  showDefault: false,
  showLocationTab: true,
  showOrganizationTab: true,
};

const defaultOptions = {
  locations: [],
  organizations: [],
  templateKinds: [],
  inputTypes: [],
  valueTypes: [],
};

describe('useTemplateForm', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('initializes values from template prop', () => {
    const template = { name: 'Test Template', snippet: false };

    const { result } = renderHook(
      () => useTemplateForm({ template, options: defaultOptions, meta: defaultMeta }),
      { wrapper }
    );

    expect(result.current.values.name).toBe('Test Template');
    expect(result.current.values.snippet).toBe(false);
    expect(result.current.values.template_inputs_attributes).toEqual([]);
    expect(result.current.values.location_ids).toEqual([]);
    expect(result.current.values.organization_ids).toEqual([]);
  });

  test('onChange updates values', () => {
    const { result } = renderHook(
      () => useTemplateForm({ template: {}, options: defaultOptions, meta: defaultMeta }),
      { wrapper }
    );

    act(() => {
      result.current.onChange('name', 'Updated');
    });

    expect(result.current.values.name).toBe('Updated');
  });

  test('validates required name field', async () => {
    const { result } = renderHook(
      () => useTemplateForm({ template: {}, options: defaultOptions, meta: defaultMeta }),
      { wrapper }
    );

    let submitResult;
    await act(async () => {
      submitResult = await result.current.onSubmit();
    });

    expect(submitResult).toEqual({ success: false });
    expect(result.current.errors.name).toBe("can't be blank");
  });

  test('onChange clears field error', async () => {
    const { result } = renderHook(
      () => useTemplateForm({ template: {}, options: defaultOptions, meta: defaultMeta }),
      { wrapper }
    );

    await act(async () => {
      await result.current.onSubmit();
    });
    expect(result.current.errors.name).toBe("can't be blank");

    act(() => {
      result.current.onChange('name', 'valid');
    });
    expect(result.current.errors.name).toBeUndefined();
  });

  test('onSubmit sends POST for new template', async () => {
    API.post.mockResolvedValue({ data: { id: 1, name: 'New Template' } });
    delete window.location;
    window.location = { href: '' };

    const { result } = renderHook(
      () => useTemplateForm({ template: {}, options: defaultOptions, meta: defaultMeta }),
      { wrapper }
    );

    act(() => {
      result.current.onChange('name', 'New Template');
    });

    let submitResult;
    await act(async () => {
      submitResult = await result.current.onSubmit();
    });

    expect(submitResult).toEqual({ success: true });
    expect(API.post).toHaveBeenCalledWith(
      '/api/v2/provisioning_templates',
      expect.objectContaining({
        provisioning_template: expect.objectContaining({
          name: 'New Template',
          template: 'template content',
        }),
      })
    );
  });

  test('onSubmit sends PUT for edit template', async () => {
    API.put.mockResolvedValue({ data: { id: 5, name: 'Updated' } });
    delete window.location;
    window.location = { href: '' };

    const template = { id: 5, name: 'Original' };
    const editMeta = { ...defaultMeta, isNew: false };

    const { result } = renderHook(
      () => useTemplateForm({ template, options: defaultOptions, meta: editMeta }),
      { wrapper }
    );

    act(() => {
      result.current.onChange('name', 'Updated');
    });

    let submitResult;
    await act(async () => {
      submitResult = await result.current.onSubmit();
    });

    expect(submitResult).toEqual({ success: true });
    expect(API.put).toHaveBeenCalledWith(
      '/api/v2/provisioning_templates/5',
      expect.objectContaining({
        provisioning_template: expect.objectContaining({
          id: 5,
          name: 'Updated',
        }),
      })
    );
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

    const { result } = renderHook(
      () => useTemplateForm({ template: {}, options: defaultOptions, meta: defaultMeta }),
      { wrapper }
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
