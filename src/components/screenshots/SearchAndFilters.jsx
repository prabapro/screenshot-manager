// src/components/screenshots/SearchAndFilters.jsx

import { useState } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Input } from '@components/ui/input';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'size-largest', label: 'Largest Size' },
  { value: 'size-smallest', label: 'Smallest Size' },
];

export default function SearchAndFilters({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  activeTagFilters,
  onRemoveTagFilter,
  onClearAllFilters,
}) {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearch(value);
    onSearchChange(value);
  };

  const clearSearch = () => {
    setLocalSearch('');
    onSearchChange('');
  };

  const hasActiveFilters = activeTagFilters.length > 0 || searchQuery.trim();

  return (
    <div className="space-y-4">
      {/* Search and Sort Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search screenshots by name, description, or tags..."
            value={localSearch}
            onChange={handleSearchChange}
            className="pl-9 pr-9"
          />
          {localSearch && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Sort dropdown */}
        <div className="sm:w-48">
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            <span>Active filters:</span>
          </div>

          {/* Tag filters */}
          {activeTagFilters.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="flex items-center gap-1 pl-2 pr-1 cursor-pointer hover:bg-secondary/80"
              onClick={() => onRemoveTagFilter(tag)}>
              <span className="text-xs">{tag}</span>
              <X className="h-3 w-3" />
            </Badge>
          ))}

          {/* Clear all button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAllFilters}
            className="h-6 px-2 text-xs">
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
