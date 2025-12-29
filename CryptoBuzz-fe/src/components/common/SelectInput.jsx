import React, { useCallback } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * SelectWithClear Component
 *
 * A reusable select component with a clear button that appears when a value is selected.
 *
 * @param {Object} props
 * @param {Array} props.options - Array of options. Each option should have { _id, name } or { value, label }
 * @param {string|Object} props.value - Current selected value (can be _id string or full object)
 * @param {Function} props.onValueChange - Callback when value changes: (value, option) => void
 * @param {Function} props.onClear - Optional callback when clear button is clicked
 * @param {string} props.placeholder - Placeholder text (default: "Select...")
 * @param {string} props.className - Additional CSS classes for container
 * @param {string} props.selectClassName - Additional CSS classes for Select component
 * @param {string} props.clearButtonClassName - Additional CSS classes for clear button
 * @param {boolean} props.showClearButton - Whether to show clear button (default: true)
 * @param {string} props.valueKey - Key to use for option value (default: "_id")
 * @param {string} props.labelKey - Key to use for option label (default: "name")
 * @param {string} props.size - Size variant for SelectTrigger: "sm" | "md" | "lg" (default: "md")
 * @param {boolean} props.disabled - Whether the select is disabled
 */
export function SelectWithClear({
  options = [],
  value,
  onValueChange,
  onClear,
  placeholder = 'Select...',
  className = '',
  selectClassName = '',
  clearButtonClassName = '',
  showClearButton = true,
  valueKey = '_id',
  labelKey = 'name',
  size = 'md',
  disabled = false,
  ...selectProps
}) {
  // Determine the current value string
  const currentValue =
    typeof value === 'object' && value !== null
      ? value[valueKey] || ''
      : value || '';

  // Find the selected option
  const selectedOption = options.find(
    (option) => (option[valueKey] || option.value) === currentValue,
  );

  // Get display text
  const displayText = selectedOption
    ? selectedOption[labelKey] || selectedOption.label || selectedOption.name
    : placeholder;

  // Handle value change
  const handleValueChange = (newValue) => {
    const selected = options.find(
      (option) => (option[valueKey] || option.value) === newValue,
    );

    if (onValueChange) {
      // Pass both the value and the full option object
      onValueChange(newValue, selected);
    }
  };

  // Handle clear
  const handleClear = (e) => {
    e.stopPropagation();
    if (onClear) {
      onClear();
    } else if (onValueChange) {
      onValueChange('', null);
    }
  };

  // Check if a value is selected
  const hasValue =
    currentValue !== '' && currentValue !== null && currentValue !== undefined;

  return (
    <div className={cn('flex items-center gap-2 relative', className)}>
      <Select
        value={currentValue}
        onValueChange={handleValueChange}
        disabled={disabled}
        {...selectProps}
      >
        <SelectTrigger
          className={cn(
            'w-full',
            showClearButton && hasValue && 'pr-8',
            selectClassName,
          )}
          size={size}
        >
          <SelectValue placeholder={placeholder}>{displayText}</SelectValue>
        </SelectTrigger>

        <SelectContent>
          {options.length === 0 ? (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">
              No options available
            </div>
          ) : (
            options.map((option) => {
              const optionValue = option[valueKey] || option.value;
              const optionLabel =
                option[labelKey] || option.label || option.name;

              return (
                <SelectItem key={optionValue} value={optionValue}>
                  {optionLabel}
                </SelectItem>
              );
            })
          )}
        </SelectContent>
      </Select>

      {showClearButton && hasValue && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          className={cn(
            'absolute right-2 top-1/2 -translate-y-1/2',
            'flex items-center justify-center',
            'w-5 h-5 rounded-full',
            'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            'transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1',
            clearButtonClassName,
          )}
          aria-label="Clear selection"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

/**
 * Hook for managing select state with page reset
 *
 * @param {Function} setPage - Function to reset page (optional)
 * @param {Function} onValueChange - Additional callback when value changes
 *
 * @returns {Object} - { handleValueChange, handleClear }
 */
export function useSelectWithClear(setPage, onValueChange) {
  const handleValueChange = useCallback(
    (value, option) => {
      if (setPage) {
        setPage(1);
      }
      if (onValueChange) {
        onValueChange(value, option);
      }
    },
    [setPage, onValueChange],
  );

  const handleClear = useCallback(() => {
    if (setPage) {
      setPage(1);
    }
  }, [setPage]);

  return {
    handleValueChange,
    handleClear,
  };
}
