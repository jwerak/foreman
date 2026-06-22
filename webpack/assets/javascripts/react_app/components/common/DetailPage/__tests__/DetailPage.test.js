import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import DetailPage from '../index';

jest.mock('../../../../redux/API/API', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  },
}));

// eslint-disable-next-line import/first
import API from '../../../../redux/API/API';

const mockFields = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'fullname', label: 'Full Name', type: 'text' },
];

const mockResource = { id: 1, name: 'example.com', fullname: 'Example Domain' };

const defaultProps = {
  resourceId: 1,
  apiUrl: '/api/v2/domains',
  fieldsUrl: '/domains/form_fields',
  indexPath: '/domains',
  title: 'Domains',
  resourceName: 'domain',
  nameField: 'name',
};

const renderWithRouter = ui => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('DetailPage', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('shows loading spinner while fetching', () => {
    API.get.mockReturnValue(new Promise(() => {}));

    renderWithRouter(<DetailPage {...defaultProps} />);

    expect(screen.getByLabelText('Loading')).toBeInTheDocument();
  });

  test('shows error alert on fetch failure', async () => {
    API.get.mockRejectedValue({
      response: { data: { error: { message: 'Domain not found' } } },
    });

    renderWithRouter(<DetailPage {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Domain not found')).toBeInTheDocument();
    });

    expect(screen.getByText('Error loading resource')).toBeInTheDocument();
  });

  test('renders breadcrumb, title, and details tab', async () => {
    API.get
      .mockResolvedValueOnce({ data: mockResource })
      .mockResolvedValueOnce({ data: { fields: mockFields } });

    renderWithRouter(<DetailPage {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'example.com' })).toBeInTheDocument();
    });

    expect(screen.getByRole('link', { name: 'Domains' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Details' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Edit' })).toBeInTheDocument();

    expect(screen.getByText('Example Domain')).toBeInTheDocument();
  });

  test('switches to Edit tab and shows form', async () => {
    API.get
      .mockResolvedValueOnce({ data: mockResource })
      .mockResolvedValueOnce({ data: { fields: mockFields } });

    renderWithRouter(<DetailPage {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'example.com' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('tab', { name: 'Edit' }));

    await waitFor(() => {
      expect(screen.getByText('Update')).toBeInTheDocument();
    });
  });

  test('starts on Edit tab when initialTab is edit', async () => {
    API.get
      .mockResolvedValueOnce({ data: mockResource })
      .mockResolvedValueOnce({ data: { fields: mockFields } });

    renderWithRouter(<DetailPage {...defaultProps} initialTab="edit" />);

    await waitFor(() => {
      expect(screen.getByText('Update')).toBeInTheDocument();
    });
  });

  test('uses nameField to display resource name', async () => {
    API.get
      .mockResolvedValueOnce({ data: { id: 1, login: 'admin', firstname: 'Admin' } })
      .mockResolvedValueOnce({ data: { fields: [{ name: 'login', label: 'Login', type: 'text' }] } });

    renderWithRouter(
      <DetailPage {...defaultProps} nameField="login" resourceName="user" />
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'admin' })).toBeInTheDocument();
    });
  });

  test('renders breadcrumb link to index page', async () => {
    API.get
      .mockResolvedValueOnce({ data: mockResource })
      .mockResolvedValueOnce({ data: { fields: mockFields } });

    renderWithRouter(<DetailPage {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'example.com' })).toBeInTheDocument();
    });

    const indexLink = screen.getByRole('link', { name: 'Domains' });
    expect(indexLink).toHaveAttribute('href', '/domains');
  });

  describe('custom tabs', () => {
    const MockTabComponent = ({ message }) => <div>{message}</div>;
    MockTabComponent.propTypes = { message: require('prop-types').string };
    MockTabComponent.defaultProps = { message: '' };

    const customTabs = [
      {
        eventKey: 'custom_tab',
        title: 'Custom Tab',
        component: MockTabComponent,
        getProps: ({ resourceId }) => ({ message: `Resource ${resourceId}` }),
      },
    ];

    test('renders custom tabs when provided', async () => {
      API.get
        .mockResolvedValueOnce({ data: mockResource })
        .mockResolvedValueOnce({ data: { fields: mockFields } });

      renderWithRouter(
        <DetailPage {...defaultProps} customTabs={customTabs} />
      );

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: 'Custom Tab' })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('tab', { name: 'Custom Tab' }));

      await waitFor(() => {
        expect(screen.getByText('Resource 1')).toBeInTheDocument();
      });
    });

    test('hides custom tab when isVisible returns false', async () => {
      const hiddenTabs = [
        {
          eventKey: 'hidden_tab',
          title: 'Hidden Tab',
          component: MockTabComponent,
          getProps: () => ({ message: 'hidden' }),
          isVisible: () => false,
        },
      ];

      API.get
        .mockResolvedValueOnce({ data: mockResource })
        .mockResolvedValueOnce({ data: { fields: mockFields } });

      renderWithRouter(
        <DetailPage {...defaultProps} customTabs={hiddenTabs} />
      );

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'example.com' })).toBeInTheDocument();
      });

      expect(screen.queryByRole('tab', { name: 'Hidden Tab' })).not.toBeInTheDocument();
    });

    test('passes metadata to isVisible and getProps', async () => {
      const mockMetadata = { current_user_id: 42 };
      const isVisible = jest.fn(() => true);
      const getProps = jest.fn(() => ({ message: 'with metadata' }));

      const tabsWithMeta = [
        {
          eventKey: 'meta_tab',
          title: 'Meta Tab',
          component: MockTabComponent,
          getProps,
          isVisible,
        },
      ];

      API.get
        .mockResolvedValueOnce({ data: mockResource })
        .mockResolvedValueOnce({
          data: { fields: mockFields, metadata: mockMetadata },
        });

      renderWithRouter(
        <DetailPage {...defaultProps} customTabs={tabsWithMeta} />
      );

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: 'Meta Tab' })).toBeInTheDocument();
      });

      expect(isVisible).toHaveBeenCalledWith(
        expect.objectContaining({ metadata: mockMetadata })
      );
    });
  });
});
