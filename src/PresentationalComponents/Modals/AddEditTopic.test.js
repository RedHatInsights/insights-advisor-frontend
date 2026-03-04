import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';
import AddEditTopic from './AddEditTopic';

// Define mocks before jest.mock calls
const mockAxios = {
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

const mockAddNotification = jest.fn();
const mockHandleModalToggleCallback = jest.fn();

// Mock the platform axios hook
jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/interceptors',
  () => ({
    useAxiosWithPlatformInterceptors: () => mockAxios,
  }),
);

jest.mock('@redhat-cloud-services/frontend-components-notifications', () => ({
  useAddNotification: () => mockAddNotification,
}));

describe('AddEditTopic', () => {
  const defaultProps = {
    handleModalToggleCallback: mockHandleModalToggleCallback,
    isModalOpen: true,
    topic: {},
  };

  const renderComponent = (props = {}) => {
    return render(
      <IntlProvider locale="en" messages={{}}>
        <AddEditTopic {...defaultProps} {...props} />
      </IntlProvider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders modal when open', () => {
      renderComponent();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('renders all form fields', () => {
      renderComponent();
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/tag/i)).toBeInTheDocument();
    });

    it('renders action buttons', () => {
      renderComponent();
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /cancel/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /delete/i }),
      ).toBeInTheDocument();
    });

    it('disables delete button for new topic', () => {
      renderComponent({ topic: {} });
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      expect(deleteButton).toBeDisabled();
    });

    it('enables delete button for existing topic', () => {
      renderComponent({ topic: { slug: 'existing-topic' } });
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      expect(deleteButton).toBeEnabled();
    });
  });

  describe('Form Initial Values', () => {
    it('populates form with existing topic data', () => {
      const existingTopic = {
        name: 'Test Topic',
        description: 'Test Description',
        tag: 'test-tag',
        slug: 'test-topic',
        enabled: true,
        featured: true,
      };

      renderComponent({ topic: existingTopic });

      expect(screen.getByDisplayValue('Test Topic')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
      expect(screen.getByDisplayValue('test-tag')).toBeInTheDocument();
      expect(screen.getByDisplayValue('test-topic')).toBeInTheDocument();
    });

    it('shows empty form for new topic', () => {
      renderComponent({ topic: {} });

      const nameInput = screen.getAllByRole('textbox')[0];
      expect(nameInput).toHaveValue('');
    });
  });

  describe('User Interactions', () => {
    it('updates name field on input', () => {
      renderComponent({ topic: {} });
      const nameInput = screen.getAllByRole('textbox')[0];

      fireEvent.change(nameInput, { target: { value: 'New Topic' } });
      expect(nameInput).toHaveValue('New Topic');
    });

    it('updates description field on input', () => {
      renderComponent({ topic: {} });
      const descInput = screen.getByRole('textbox', { name: /description/i });

      fireEvent.change(descInput, {
        target: { value: 'New Description' },
      });
      expect(descInput).toHaveValue('New Description');
    });

    it('auto-generates slug from name for new topic', () => {
      renderComponent({ topic: {} });
      const nameInput = screen.getAllByRole('textbox')[0];

      fireEvent.change(nameInput, { target: { value: 'My New Topic' } });

      const slugInputs = screen.getAllByRole('textbox');
      const slugInput = slugInputs.find((input) =>
        input.value.includes('mynewtopic'),
      );
      expect(slugInput).toBeTruthy();
    });

    it('does not auto-generate slug for existing topic', () => {
      renderComponent({
        topic: { name: 'Test', slug: 'existing-slug' },
      });
      const nameInput = screen.getAllByRole('textbox')[0];

      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
      expect(nameInput).toHaveValue('Updated Name');

      const slugInput = screen
        .getAllByRole('textbox')
        .find((input) => input.value.includes('existing-slug'));
      expect(slugInput).toBeTruthy();
    });

    it('removes spaces and lowercases tag input', () => {
      renderComponent({ topic: {} });
      const tagInput = screen.getByRole('textbox', { name: /tag/i });

      fireEvent.change(tagInput, { target: { value: 'Test Tag' } });
      expect(tagInput).toHaveValue('testtag');
    });

    it('toggles enabled status', () => {
      renderComponent({ topic: { enabled: false } });
      const enabledRadio = screen.getByLabelText(/enabled/i);

      fireEvent.click(enabledRadio);
      expect(enabledRadio).toBeChecked();
    });

    it('toggles featured checkbox', () => {
      renderComponent({ topic: { featured: false } });
      const featuredCheckbox = screen.getByRole('checkbox');

      fireEvent.click(featuredCheckbox);
      expect(featuredCheckbox).toBeChecked();
    });
  });

  describe('API Calls - Create Topic', () => {
    it('calls POST when creating new topic', async () => {
      mockAxios.post.mockResolvedValue({});
      renderComponent({ topic: {} });

      const nameInput = screen.getAllByRole('textbox')[0];
      fireEvent.change(nameInput, { target: { value: 'New Topic' } });

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockAxios.post).toHaveBeenCalledWith(
          '/api/insights/v1/topic/',
          expect.objectContaining({
            name: 'New Topic',
            slug: 'newtopic',
          }),
        );
      });
    });

    it('includes all fields in POST request', async () => {
      mockAxios.post.mockResolvedValue({});
      renderComponent({ topic: {} });

      fireEvent.change(screen.getAllByRole('textbox')[0], {
        target: { value: 'Test Topic' },
      });
      fireEvent.change(screen.getByRole('textbox', { name: /description/i }), {
        target: { value: 'Test Description' },
      });
      fireEvent.change(screen.getByRole('textbox', { name: /tag/i }), {
        target: { value: 'test-tag' },
      });
      fireEvent.click(screen.getByLabelText(/enabled/i));
      fireEvent.click(screen.getByRole('checkbox'));

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockAxios.post).toHaveBeenCalledWith('/api/insights/v1/topic/', {
          name: 'Test Topic',
          slug: 'testtopic',
          tag: 'test-tag',
          description: 'Test Description',
          enabled: true,
          featured: true,
        });
      });
    });
  });

  describe('API Calls - Update Topic', () => {
    it('calls PUT when updating existing topic', async () => {
      mockAxios.put.mockResolvedValue({});
      const existingTopic = {
        name: 'Original Name',
        slug: 'original-slug',
        tag: 'original-tag',
        description: 'Original Description',
        enabled: false,
        featured: false,
      };

      renderComponent({ topic: existingTopic });

      const nameInput = screen.getAllByRole('textbox')[0];
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockAxios.put).toHaveBeenCalledWith(
          '/api/insights/v1/topic/original-slug/',
          expect.objectContaining({
            name: 'Updated Name',
            slug: 'original-slug',
          }),
        );
      });
    });
  });

  describe('API Calls - Delete Topic', () => {
    it('calls DELETE when deleting topic', async () => {
      mockAxios.delete.mockResolvedValue({});
      const existingTopic = {
        name: 'Topic to Delete',
        slug: 'topic-to-delete',
      };

      renderComponent({ topic: existingTopic });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(mockAxios.delete).toHaveBeenCalledWith(
          '/api/insights/v1/topic/topic-to-delete',
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('shows notification on POST error', async () => {
      const error = {
        response: {
          data: {
            name: ['This field is required'],
            slug: ['Slug already exists'],
          },
        },
      };
      mockAxios.post.mockRejectedValue(error);

      renderComponent({ topic: {} });

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockAddNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: 'danger',
            title: expect.any(String),
            description: expect.arrayContaining([
              expect.stringContaining('NAME'),
              expect.stringContaining('SLUG'),
            ]),
          }),
        );
      });
    });

    it('shows notification on PUT error', async () => {
      const error = {
        response: {
          data: {
            tag: ['Invalid tag format'],
          },
        },
      };
      mockAxios.put.mockRejectedValue(error);

      renderComponent({ topic: { slug: 'existing' } });

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockAddNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: 'danger',
          }),
        );
      });
    });

    it('shows notification on DELETE error', async () => {
      const error = {
        response: {
          data: {
            detail: 'Cannot delete topic with active recommendations',
          },
        },
      };
      mockAxios.delete.mockRejectedValue(error);

      renderComponent({ topic: { slug: 'active-topic' } });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(mockAddNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: 'danger',
          }),
        );
      });
    });
  });

  describe('Modal Closing', () => {
    it('closes modal on cancel button click', () => {
      renderComponent();
      const cancelButton = screen.getByRole('button', { name: /cancel/i });

      fireEvent.click(cancelButton);
      expect(mockHandleModalToggleCallback).toHaveBeenCalledWith(false);
    });

    it('closes modal after successful save', async () => {
      mockAxios.post.mockResolvedValue({});
      renderComponent({ topic: {} });

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockHandleModalToggleCallback).toHaveBeenCalledWith(false);
      });
    });

    it('closes modal after successful delete', async () => {
      mockAxios.delete.mockResolvedValue({});
      renderComponent({ topic: { slug: 'test' } });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(mockHandleModalToggleCallback).toHaveBeenCalledWith(false);
      });
    });

    it('closes modal even on error', async () => {
      mockAxios.post.mockRejectedValue({
        response: { data: { error: 'Test error' } },
      });
      renderComponent({ topic: {} });

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockHandleModalToggleCallback).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('Slug Field Behavior', () => {
    it('disables slug field for existing topic', () => {
      renderComponent({ topic: { slug: 'existing-slug' } });
      const slugInputs = screen.getAllByRole('textbox');
      const slugInput = slugInputs.find((input) =>
        input.value.includes('existing-slug'),
      );

      expect(slugInput).toBeDisabled();
    });

    it('enables slug field for new topic', () => {
      renderComponent({ topic: {} });
      const slugInputs = screen.getAllByRole('textbox');
      // The slug field should not be explicitly disabled
      slugInputs.forEach((input) => {
        if (input.id === 'topic-form-name-2') {
          expect(input).toBeEnabled();
        }
      });
    });
  });
});
