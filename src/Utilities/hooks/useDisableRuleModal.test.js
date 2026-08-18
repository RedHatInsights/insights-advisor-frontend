import { renderHook, act } from '@testing-library/react';
import useDisableRuleModal from './useDisableRuleModal';

describe('useDisableRuleModal', () => {
  let mockReload;
  let mockOnRuleChange;

  beforeEach(() => {
    mockReload = jest.fn();
    mockOnRuleChange = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with closed modal state', () => {
    const { result } = renderHook(() =>
      useDisableRuleModal(mockReload, mockOnRuleChange),
    );

    expect(result.current.disableRuleModal).toEqual({
      isOpen: false,
      rule: null,
    });
  });

  it('provides all expected handlers', () => {
    const { result } = renderHook(() =>
      useDisableRuleModal(mockReload, mockOnRuleChange),
    );

    expect(typeof result.current.handleDisableClick).toBe('function');
    expect(typeof result.current.handleModalToggle).toBe('function');
    expect(typeof result.current.handleAfterDisable).toBe('function');
  });

  describe('handleDisableClick', () => {
    it('opens modal with rule data', () => {
      const { result } = renderHook(() =>
        useDisableRuleModal(mockReload, mockOnRuleChange),
      );

      const testRule = {
        rule_id: 'test-rule-123',
        rule_status: 'enabled',
      };

      act(() => {
        result.current.handleDisableClick(testRule);
      });

      expect(result.current.disableRuleModal).toEqual({
        isOpen: true,
        rule: {
          rule_id: 'test-rule-123',
          rule_status: 'enabled',
        },
      });
    });

    it('preserves only rule_id and rule_status from input', () => {
      const { result } = renderHook(() =>
        useDisableRuleModal(mockReload, mockOnRuleChange),
      );

      const testRule = {
        rule_id: 'test-rule-456',
        rule_status: 'disabled',
        extra_field: 'should_not_be_stored',
      };

      act(() => {
        result.current.handleDisableClick(testRule);
      });

      expect(result.current.disableRuleModal.rule).toEqual({
        rule_id: 'test-rule-456',
        rule_status: 'disabled',
      });
      expect(result.current.disableRuleModal.rule).not.toHaveProperty(
        'extra_field',
      );
    });

    it('does not call reload or onRuleChange when opening modal', () => {
      const { result } = renderHook(() =>
        useDisableRuleModal(mockReload, mockOnRuleChange),
      );

      act(() => {
        result.current.handleDisableClick({
          rule_id: 'test-rule',
          rule_status: 'enabled',
        });
      });

      expect(mockReload).not.toHaveBeenCalled();
      expect(mockOnRuleChange).not.toHaveBeenCalled();
    });
  });

  describe('handleModalToggle', () => {
    it('updates modal open state to true', () => {
      const { result } = renderHook(() =>
        useDisableRuleModal(mockReload, mockOnRuleChange),
      );

      act(() => {
        result.current.handleModalToggle(true);
      });

      expect(result.current.disableRuleModal.isOpen).toBe(true);
    });

    it('updates modal open state to false', () => {
      const { result } = renderHook(() =>
        useDisableRuleModal(mockReload, mockOnRuleChange),
      );

      // First open the modal
      act(() => {
        result.current.handleDisableClick({
          rule_id: 'test-rule',
          rule_status: 'enabled',
        });
      });

      // Then close it
      act(() => {
        result.current.handleModalToggle(false);
      });

      expect(result.current.disableRuleModal.isOpen).toBe(false);
    });

    it('preserves rule data when toggling', () => {
      const { result } = renderHook(() =>
        useDisableRuleModal(mockReload, mockOnRuleChange),
      );

      const testRule = {
        rule_id: 'test-rule-789',
        rule_status: 'enabled',
      };

      act(() => {
        result.current.handleDisableClick(testRule);
      });

      act(() => {
        result.current.handleModalToggle(false);
      });

      expect(result.current.disableRuleModal.rule).toEqual({
        rule_id: 'test-rule-789',
        rule_status: 'enabled',
      });
    });

    it('does not call reload or onRuleChange when toggling', () => {
      const { result } = renderHook(() =>
        useDisableRuleModal(mockReload, mockOnRuleChange),
      );

      act(() => {
        result.current.handleModalToggle(false);
      });

      expect(mockReload).not.toHaveBeenCalled();
      expect(mockOnRuleChange).not.toHaveBeenCalled();
    });
  });

  describe('handleAfterDisable', () => {
    it('calls reload function', () => {
      const { result } = renderHook(() =>
        useDisableRuleModal(mockReload, mockOnRuleChange),
      );

      act(() => {
        result.current.handleAfterDisable();
      });

      expect(mockReload).toHaveBeenCalledTimes(1);
    });

    it('calls onRuleChange callback when provided', () => {
      const { result } = renderHook(() =>
        useDisableRuleModal(mockReload, mockOnRuleChange),
      );

      act(() => {
        result.current.handleAfterDisable();
      });

      expect(mockOnRuleChange).toHaveBeenCalledTimes(1);
    });

    it('does not throw when onRuleChange is undefined', () => {
      const { result } = renderHook(() =>
        useDisableRuleModal(mockReload, undefined),
      );

      expect(() => {
        act(() => {
          result.current.handleAfterDisable();
        });
      }).not.toThrow();

      expect(mockReload).toHaveBeenCalledTimes(1);
    });

    it('does not throw when onRuleChange is null', () => {
      const { result } = renderHook(() =>
        useDisableRuleModal(mockReload, null),
      );

      expect(() => {
        act(() => {
          result.current.handleAfterDisable();
        });
      }).not.toThrow();

      expect(mockReload).toHaveBeenCalledTimes(1);
    });

    it('closes modal and clears rule data', () => {
      const { result } = renderHook(() =>
        useDisableRuleModal(mockReload, mockOnRuleChange),
      );

      // First open the modal with rule data
      act(() => {
        result.current.handleDisableClick({
          rule_id: 'test-rule',
          rule_status: 'enabled',
        });
      });

      // Verify modal is open with rule data
      expect(result.current.disableRuleModal.isOpen).toBe(true);
      expect(result.current.disableRuleModal.rule).not.toBeNull();

      // Execute after disable
      act(() => {
        result.current.handleAfterDisable();
      });

      // Verify modal is closed and rule data is cleared
      expect(result.current.disableRuleModal).toEqual({
        isOpen: false,
        rule: null,
      });
    });

    it('calls functions in correct order: reload, onRuleChange, then state update', () => {
      const callOrder = [];
      const trackingReload = jest.fn(() => callOrder.push('reload'));
      const trackingOnRuleChange = jest.fn(() =>
        callOrder.push('onRuleChange'),
      );

      const { result } = renderHook(() =>
        useDisableRuleModal(trackingReload, trackingOnRuleChange),
      );

      act(() => {
        result.current.handleAfterDisable();
      });

      expect(callOrder).toEqual(['reload', 'onRuleChange']);
      expect(result.current.disableRuleModal.isOpen).toBe(false);
    });
  });

  describe('handler stability', () => {
    it('handleDisableClick reference stays stable across renders', () => {
      const { result, rerender } = renderHook(() =>
        useDisableRuleModal(mockReload, mockOnRuleChange),
      );

      const firstRender = result.current.handleDisableClick;
      rerender();
      const secondRender = result.current.handleDisableClick;

      expect(firstRender).toBe(secondRender);
    });

    it('handleModalToggle reference stays stable across renders', () => {
      const { result, rerender } = renderHook(() =>
        useDisableRuleModal(mockReload, mockOnRuleChange),
      );

      const firstRender = result.current.handleModalToggle;
      rerender();
      const secondRender = result.current.handleModalToggle;

      expect(firstRender).toBe(secondRender);
    });

    it('handleAfterDisable updates when dependencies change', () => {
      const { result, rerender } = renderHook(
        ({ reload, onChange }) => useDisableRuleModal(reload, onChange),
        {
          initialProps: {
            reload: mockReload,
            onChange: mockOnRuleChange,
          },
        },
      );

      const firstRender = result.current.handleAfterDisable;

      const newReload = jest.fn();
      rerender({ reload: newReload, onChange: mockOnRuleChange });

      const secondRender = result.current.handleAfterDisable;

      expect(firstRender).not.toBe(secondRender);
    });
  });

  describe('integration scenario', () => {
    it('handles complete disable flow', () => {
      const { result } = renderHook(() =>
        useDisableRuleModal(mockReload, mockOnRuleChange),
      );

      // Step 1: User clicks disable on a rule
      act(() => {
        result.current.handleDisableClick({
          rule_id: 'security-rule-123',
          rule_status: 'enabled',
        });
      });

      expect(result.current.disableRuleModal).toEqual({
        isOpen: true,
        rule: {
          rule_id: 'security-rule-123',
          rule_status: 'enabled',
        },
      });

      // Step 2: User confirms disable in modal
      act(() => {
        result.current.handleAfterDisable();
      });

      // Verify all actions occurred
      expect(mockReload).toHaveBeenCalledTimes(1);
      expect(mockOnRuleChange).toHaveBeenCalledTimes(1);
      expect(result.current.disableRuleModal).toEqual({
        isOpen: false,
        rule: null,
      });
    });

    it('handles user canceling the modal', () => {
      const { result } = renderHook(() =>
        useDisableRuleModal(mockReload, mockOnRuleChange),
      );

      // User opens modal
      act(() => {
        result.current.handleDisableClick({
          rule_id: 'test-rule',
          rule_status: 'enabled',
        });
      });

      // User cancels (closes modal without disabling)
      act(() => {
        result.current.handleModalToggle(false);
      });

      // Verify reload/onChange were NOT called
      expect(mockReload).not.toHaveBeenCalled();
      expect(mockOnRuleChange).not.toHaveBeenCalled();
      expect(result.current.disableRuleModal.isOpen).toBe(false);
    });
  });
});
