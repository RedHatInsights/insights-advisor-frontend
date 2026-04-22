import { renderHook, act, waitFor } from '@testing-library/react';
import useBulkSelect from './useBulkSelect';

describe('useBulkSelect', () => {
  const defaultOptions = {
    total: 0,
    onSelect: jest.fn(),
    itemIdsInTable: jest.fn(() => []),
    itemIdsOnPage: jest.fn(() => []),
    isLoading: false,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('starts with no selections when total is 0', () => {
      const { result } = renderHook(() => useBulkSelect(defaultOptions));

      expect(result.current.selectedIds).toBeUndefined();
      expect(result.current.toolbarProps.bulkSelect.count).toBe(0);
      expect(result.current.toolbarProps.bulkSelect.checked).toBe(false);
    });

    it('starts with preselected items', () => {
      const { result } = renderHook(() =>
        useBulkSelect({
          ...defaultOptions,
          total: 3,
          preselected: ['id1', 'id2'],
          itemIdsOnPage: () => ['id1', 'id2', 'id3'],
        }),
      );

      expect(result.current.selectedIds).toEqual(['id1', 'id2']);
      expect(result.current.toolbarProps.bulkSelect.count).toBe(2);
    });

    it('is disabled when total is 0', () => {
      const { result } = renderHook(() =>
        useBulkSelect({ ...defaultOptions, total: 0 }),
      );

      expect(result.current.toolbarProps.bulkSelect.isDisabled).toBe(true);
      expect(result.current.tableProps.onSelect).toBeUndefined();
    });

    it('is disabled when loading', () => {
      const { result } = renderHook(() =>
        useBulkSelect({ ...defaultOptions, total: 5, isLoading: true }),
      );

      expect(result.current.toolbarProps.bulkSelect.isDisabled).toBe(true);
    });

    it('is enabled when total > 0 and not loading', () => {
      const { result } = renderHook(() =>
        useBulkSelect({
          ...defaultOptions,
          total: 5,
          itemIdsOnPage: () => ['id1', 'id2'],
        }),
      );

      expect(result.current.toolbarProps.bulkSelect.isDisabled).toBe(false);
      expect(result.current.tableProps.onSelect).toBeDefined();
    });
  });

  describe('checkbox state', () => {
    it('is unchecked when nothing is selected', () => {
      const { result } = renderHook(() =>
        useBulkSelect({
          ...defaultOptions,
          total: 3,
          itemIdsOnPage: () => ['id1', 'id2', 'id3'],
        }),
      );

      expect(result.current.toolbarProps.bulkSelect.checked).toBe(false);
    });

    it('is indeterminate (null) when some items are selected', () => {
      const { result } = renderHook(() =>
        useBulkSelect({
          ...defaultOptions,
          total: 3,
          preselected: ['id1'],
          itemIdsOnPage: () => ['id1', 'id2', 'id3'],
        }),
      );

      expect(result.current.toolbarProps.bulkSelect.checked).toBe(null);
    });

    it('is checked when all items are selected', () => {
      const { result } = renderHook(() =>
        useBulkSelect({
          ...defaultOptions,
          total: 2,
          preselected: ['id1', 'id2'],
          itemIdsOnPage: () => ['id1', 'id2'],
        }),
      );

      expect(result.current.toolbarProps.bulkSelect.checked).toBe(true);
    });
  });

  describe('bulk actions', () => {
    it('selects all items when "Select all" is clicked', async () => {
      const itemIdsInTable = jest.fn(() =>
        Promise.resolve(['id1', 'id2', 'id3']),
      );
      const { result } = renderHook(() =>
        useBulkSelect({
          ...defaultOptions,
          total: 3,
          itemIdsInTable,
          itemIdsOnPage: () => ['id1', 'id2'],
        }),
      );

      const selectAllAction = result.current.toolbarProps.bulkSelect.items.find(
        (item) => item.title.includes('Select all'),
      );

      await act(async () => {
        await selectAllAction.onClick();
      });

      await waitFor(() => {
        expect(result.current.selectedIds).toEqual(['id1', 'id2', 'id3']);
        expect(result.current.toolbarProps.bulkSelect.count).toBe(3);
      });
    });

    it('unselects all items when "Unselect all" is clicked and all are selected', async () => {
      const itemIdsInTable = jest.fn(() =>
        Promise.resolve(['id1', 'id2', 'id3']),
      );
      const { result } = renderHook(() =>
        useBulkSelect({
          ...defaultOptions,
          total: 3,
          preselected: ['id1', 'id2', 'id3'],
          itemIdsInTable,
          itemIdsOnPage: () => ['id1', 'id2', 'id3'],
        }),
      );

      const unselectAllAction =
        result.current.toolbarProps.bulkSelect.items.find((item) =>
          item.title.includes('Unselect all'),
        );

      await act(async () => {
        await unselectAllAction.onClick();
      });

      await waitFor(() => {
        expect(result.current.selectedIds).toEqual([]);
        expect(result.current.toolbarProps.bulkSelect.count).toBe(0);
      });
    });

    it('selects current page when "Select page" is clicked', () => {
      const { result } = renderHook(() =>
        useBulkSelect({
          ...defaultOptions,
          total: 5,
          itemIdsInTable: () =>
            Promise.resolve(['id1', 'id2', 'id3', 'id4', 'id5']),
          itemIdsOnPage: () => ['id1', 'id2'],
        }),
      );

      const selectPageAction =
        result.current.toolbarProps.bulkSelect.items.find((item) =>
          item.title.includes('Select page'),
        );

      act(() => {
        selectPageAction.onClick();
      });

      expect(result.current.selectedIds).toEqual(['id1', 'id2']);
      expect(result.current.toolbarProps.bulkSelect.count).toBe(2);
    });

    it('merges page selection with existing selections', () => {
      const { result } = renderHook(() =>
        useBulkSelect({
          ...defaultOptions,
          total: 5,
          preselected: ['id3'],
          itemIdsInTable: () =>
            Promise.resolve(['id1', 'id2', 'id3', 'id4', 'id5']),
          itemIdsOnPage: () => ['id1', 'id2'],
        }),
      );

      const selectPageAction =
        result.current.toolbarProps.bulkSelect.items.find((item) =>
          item.title.includes('Select page'),
        );

      act(() => {
        selectPageAction.onClick();
      });

      expect(result.current.selectedIds).toContain('id1');
      expect(result.current.selectedIds).toContain('id2');
      expect(result.current.selectedIds).toContain('id3');
      expect(result.current.toolbarProps.bulkSelect.count).toBe(3);
    });

    it('clears selection when "Select none" is clicked', () => {
      const { result } = renderHook(() =>
        useBulkSelect({
          ...defaultOptions,
          total: 3,
          preselected: ['id1', 'id2'],
          itemIdsOnPage: () => ['id1', 'id2', 'id3'],
        }),
      );

      const selectNoneAction =
        result.current.toolbarProps.bulkSelect.items.find(
          (item) => item.title === 'Select none',
        );

      act(() => {
        selectNoneAction.onClick();
      });

      expect(result.current.selectedIds).toEqual([]);
      expect(result.current.toolbarProps.bulkSelect.count).toBe(0);
    });

    it('disables "Select none" when nothing is selected', () => {
      const { result } = renderHook(() =>
        useBulkSelect({
          ...defaultOptions,
          total: 3,
          itemIdsOnPage: () => ['id1', 'id2', 'id3'],
        }),
      );

      const selectNoneAction =
        result.current.toolbarProps.bulkSelect.items.find(
          (item) => item.title === 'Select none',
        );

      expect(selectNoneAction.props.isDisabled).toBe(true);
    });

    it('enables "Select none" when items are selected', () => {
      const { result } = renderHook(() =>
        useBulkSelect({
          ...defaultOptions,
          total: 3,
          preselected: ['id1'],
          itemIdsOnPage: () => ['id1', 'id2', 'id3'],
        }),
      );

      const selectNoneAction =
        result.current.toolbarProps.bulkSelect.items.find(
          (item) => item.title === 'Select none',
        );

      expect(selectNoneAction.props.isDisabled).toBe(false);
    });
  });

  describe('individual selection', () => {
    it('selects an item when row is clicked', () => {
      const { result } = renderHook(() =>
        useBulkSelect({
          ...defaultOptions,
          total: 3,
          itemIdsOnPage: () => ['id1', 'id2', 'id3'],
        }),
      );

      act(() => {
        result.current.tableProps.onSelect(null, true, null, { id: 'id1' });
      });

      expect(result.current.selectedIds).toContain('id1');
      expect(result.current.toolbarProps.bulkSelect.count).toBe(1);
    });

    it('deselects an item when selected row is clicked again', () => {
      const { result } = renderHook(() =>
        useBulkSelect({
          ...defaultOptions,
          total: 3,
          preselected: ['id1', 'id2'],
          itemIdsOnPage: () => ['id1', 'id2', 'id3'],
        }),
      );

      act(() => {
        result.current.tableProps.onSelect(null, false, null, { id: 'id1' });
      });

      expect(result.current.selectedIds).not.toContain('id1');
      expect(result.current.selectedIds).toContain('id2');
      expect(result.current.toolbarProps.bulkSelect.count).toBe(1);
    });

    it('uses custom identifier for row selection', () => {
      const { result } = renderHook(() =>
        useBulkSelect({
          ...defaultOptions,
          total: 3,
          identifier: 'customId',
          itemIdsOnPage: () => ['item1', 'item2', 'item3'],
        }),
      );

      act(() => {
        result.current.tableProps.onSelect(null, true, null, {
          customId: 'item1',
        });
      });

      expect(result.current.selectedIds).toContain('item1');
    });
  });

  describe('toolbar bulk select configuration', () => {
    it('shows correct page count in "Select page" title', () => {
      const { result } = renderHook(() =>
        useBulkSelect({
          ...defaultOptions,
          total: 10,
          itemIdsOnPage: () => ['id1', 'id2', 'id3'],
        }),
      );

      const selectPageAction =
        result.current.toolbarProps.bulkSelect.items.find((item) =>
          item.title.includes('Select page'),
        );

      expect(selectPageAction.title).toBe('Select page (3 items)');
    });

    it('shows correct total in "Select all" title', () => {
      const { result } = renderHook(() =>
        useBulkSelect({
          ...defaultOptions,
          total: 42,
          itemIdsInTable: () => Promise.resolve([]),
          itemIdsOnPage: () => ['id1', 'id2'],
        }),
      );

      const selectAllAction = result.current.toolbarProps.bulkSelect.items.find(
        (item) => item.title.includes('all'),
      );

      expect(selectAllAction.title).toBe('Select all (42 items)');
    });

    it('shows "Select all" when nothing is selected', () => {
      const { result } = renderHook(() =>
        useBulkSelect({
          ...defaultOptions,
          total: 5,
          itemIdsInTable: () => Promise.resolve([]),
          itemIdsOnPage: () => ['id1', 'id2'],
        }),
      );

      const action = result.current.toolbarProps.bulkSelect.items.find((item) =>
        item.title.includes('all'),
      );

      expect(action.title).toContain('Select all');
    });

    it('shows "Unselect all" when all items are selected', () => {
      const { result } = renderHook(() =>
        useBulkSelect({
          ...defaultOptions,
          total: 2,
          preselected: ['id1', 'id2'],
          itemIdsInTable: () => Promise.resolve(['id1', 'id2']),
          itemIdsOnPage: () => ['id1', 'id2'],
        }),
      );

      const action = result.current.toolbarProps.bulkSelect.items.find((item) =>
        item.title.includes('all'),
      );

      expect(action.title).toContain('Unselect all');
    });
  });

  describe('loading state', () => {
    it('shows spinner in toggle title when loading', () => {
      const { result } = renderHook(() =>
        useBulkSelect({
          ...defaultOptions,
          total: 5,
          isLoading: true,
          itemIdsOnPage: () => ['id1'],
        }),
      );

      expect(result.current.toolbarProps.bulkSelect.toggleProps).toBeTruthy();
      expect(
        result.current.toolbarProps.bulkSelect.toggleProps.children,
      ).toBeTruthy();
    });

    it('does not show toggle title when not loading', () => {
      const { result } = renderHook(() =>
        useBulkSelect({
          ...defaultOptions,
          total: 5,
          isLoading: false,
          itemIdsOnPage: () => ['id1'],
        }),
      );

      expect(result.current.toolbarProps.bulkSelect.toggleProps).toBeNull();
    });
  });

  describe('selectNone function', () => {
    it('clears all selections', () => {
      const { result } = renderHook(() =>
        useBulkSelect({
          ...defaultOptions,
          total: 3,
          preselected: ['id1', 'id2'],
          itemIdsOnPage: () => ['id1', 'id2', 'id3'],
        }),
      );

      act(() => {
        result.current.selectNone();
      });

      expect(result.current.selectedIds).toEqual([]);
      expect(result.current.toolbarProps.bulkSelect.count).toBe(0);
    });
  });

  describe('when onSelect is not provided', () => {
    it('returns empty object', () => {
      const { result } = renderHook(() =>
        useBulkSelect({
          ...defaultOptions,
          onSelect: undefined,
        }),
      );

      expect(result.current).toEqual({});
    });
  });

  describe('preselected changes', () => {
    it('updates selection when preselected prop changes', () => {
      const { result, rerender } = renderHook(
        ({ preselected }) =>
          useBulkSelect({
            ...defaultOptions,
            total: 5,
            preselected,
            itemIdsOnPage: () => ['id1', 'id2', 'id3'],
          }),
        { initialProps: { preselected: ['id1'] } },
      );

      expect(result.current.selectedIds).toEqual(['id1']);

      rerender({ preselected: ['id2', 'id3'] });

      expect(result.current.selectedIds).toEqual(['id2', 'id3']);
      expect(result.current.toolbarProps.bulkSelect.count).toBe(2);
    });
  });
});
