import { useState, useCallback, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { debounce } from '@/lib/helpers';
import { cn } from '@/lib/utils';

/**
 * SearchInput Component
 * 
 * A reusable search input component with debounce functionality.
 * Matches the design style from EducatorsPage.
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onSearch - Callback function called when search value changes (debounced)
 * @param {Function} props.onClear - Optional callback function called when search is cleared
 * @param {string} props.placeholder - Placeholder text for the input field (default: 'Search')
 * @param {string} props.value - Controlled value for the input (optional)
 * @param {Function} props.onValueChange - Optional callback when value changes (for controlled mode)
 * @param {number} props.debounceDelay - Debounce delay in milliseconds (default: 300)
 * @param {string} props.className - Additional CSS classes for wrapper
 * @param {string} props.inputClassName - Additional CSS classes for input
 * @param {string} props.width - Width class (default: 'w-80')
 * @param {boolean} props.showClearButton - Whether to show clear button when input has value (default: true)
 * @param {boolean} props.disabled - Whether the input is disabled
 * @param {Object} props.inputProps - Additional props to pass to input element
 */
export default function SearchInput({
  onSearch,
  onClear,
  placeholder = 'Search',
  value: controlledValue,
  onValueChange,
  debounceDelay = 300,
  className,
  inputClassName,
  width = 'w-80',
  showClearButton = true,
  disabled = false,
  inputProps = {},
}) {
  // Internal state for uncontrolled mode
  const [internalValue, setInternalValue] = useState('');

  // Determine if component is controlled or uncontrolled
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  // Memoize the debounced search function
  const debouncedSearch = useMemo(
    () =>
      onSearch
        ? debounce((searchValue) => {
            onSearch(searchValue);
          }, debounceDelay)
        : null,
    [onSearch, debounceDelay],
  );

  // Handle input change
  const handleInputChange = useCallback(
    (e) => {
      const newValue = e.target.value;

      if (isControlled) {
        if (onValueChange) {
          onValueChange(newValue);
        }
      } else {
        setInternalValue(newValue);
      }

      // Trigger debounced search
      if (debouncedSearch) {
        debouncedSearch(newValue);
      }
    },
    [isControlled, onValueChange, debouncedSearch],
  );

  // Handle clear button click
  const handleClear = useCallback(() => {
    const emptyValue = '';

    if (isControlled) {
      if (onValueChange) {
        onValueChange(emptyValue);
      }
    } else {
      setInternalValue(emptyValue);
    }

    // Trigger search with empty value immediately (no debounce on clear)
    if (debouncedSearch) {
      debouncedSearch(emptyValue);
    }

    // Call onClear callback if provided
    if (onClear) {
      onClear();
    }
  }, [isControlled, onValueChange, debouncedSearch, onClear]);

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        disabled={disabled}
        autoComplete="off"
        className={cn(
          'pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-800 rounded-lg focus:outline-none',
          'bg-white dark:bg-[#fff9e224] text-gray-900 dark:text-gray-100',
          'placeholder:text-gray-400 dark:placeholder:text-gray-500',
          'focus:border-gray-400 dark:focus:border-gray-600 transition-colors',
          'disabled:cursor-not-allowed disabled:opacity-50',
          showClearButton && value && 'pr-10',
          width,
          inputClassName,
        )}
        {...inputProps}
      />
      {showClearButton && value && (
        <button
          type="button"
          onClick={handleClear}
          disabled={disabled}
          className={cn(
            'absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500',
            'hover:text-gray-600 dark:hover:text-gray-300 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 rounded-sm',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'w-5 h-5 flex items-center justify-center cursor-pointer',
          )}
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}



