// src/components/ui/tag-input.jsx

import { useState, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@components/ui/badge';

/**
 * TagInput component for adding and removing tags
 * @param {Array} value - Array of tag strings
 * @param {Function} onChange - Callback when tags change
 * @param {number} maxTags - Maximum number of tags allowed
 * @param {number} maxTagLength - Maximum length per tag
 * @param {string} placeholder - Input placeholder
 * @param {boolean} disabled - Disable input
 */
export function TagInput({
  value = [],
  onChange,
  maxTags = 20,
  maxTagLength = 50,
  placeholder = 'Add tags...',
  disabled = false,
  className,
}) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e) => {
    // Add tag on Enter, comma, or space
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      addTag();
    }
    
    // Remove last tag on Backspace if input is empty
    if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  const addTag = () => {
    const tag = inputValue.trim();
    
    // Validate tag
    if (!tag) return;
    if (tag.length > maxTagLength) {
      // Optionally show error
      return;
    }
    if (value.length >= maxTags) {
      // Optionally show error
      return;
    }
    if (value.includes(tag)) {
      // Tag already exists
      setInputValue('');
      return;
    }

    // Add tag
    onChange([...value, tag]);
    setInputValue('');
  };

  const removeTag = (index) => {
    const newTags = value.filter((_, i) => i !== index);
    onChange(newTags);
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* Tags container */}
      <div
        onClick={handleContainerClick}
        className={cn(
          'min-h-[2.5rem] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none',
          'flex flex-wrap items-center gap-2 cursor-text',
          'focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]',
          disabled && 'opacity-50 cursor-not-allowed'
        )}>
        {/* Render existing tags */}
        {value.map((tag, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="flex items-center gap-1 pl-2 pr-1">
            <span className="text-xs">{tag}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(index);
              }}
              disabled={disabled}
              className="ml-1 rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
              aria-label={`Remove ${tag} tag`}>
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

        {/* Input for new tags */}
        {value.length < maxTags && (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onBlur={addTag}
            disabled={disabled}
            placeholder={value.length === 0 ? placeholder : ''}
            className="flex-1 min-w-[120px] bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
          />
        )}
      </div>

      {/* Helper text */}
      <p className="text-xs text-muted-foreground">
        Press Enter, comma, or space to add tags. {value.length}/{maxTags} tags
      </p>
    </div>
  );
}
