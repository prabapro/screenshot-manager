// src/components/screenshots/ScreenshotGrid.jsx

import { useEffect, useState } from 'react';
import { RefreshCw, ImageOff } from 'lucide-react';
import { Button } from '@components/ui/button';
import LoadingSpinner from '@components/common/LoadingSpinner';
import { useScreenshotsStore } from '@stores/useScreenshotsStore';
import SearchAndFilters from './SearchAndFilters';
import ViewToggle from './ViewToggle';
import ScreenshotCard from './ScreenshotCard';
import ScreenshotModal from './ScreenshotModal';
import Pagination from './Pagination';
import { cn } from '@/lib/utils';

export default function ScreenshotGrid() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Store state
  const {
    isLoading,
    error,
    searchQuery,
    sortBy,
    viewMode,
    activeTagFilters,
    currentPage,
    filteredScreenshots,
    fetchScreenshots,
    setSearchQuery,
    setSortBy,
    setViewMode,
    toggleTagFilter,
    clearTagFilters,
    goToPage,
    getPaginatedScreenshots,
    getTotalPages,
    setSelectedScreenshot,
    clearError,
  } = useScreenshotsStore();

  // Fetch screenshots on mount
  useEffect(() => {
    fetchScreenshots();
  }, [fetchScreenshots]);

  // Get paginated data
  const screenshots = getPaginatedScreenshots();
  const totalPages = getTotalPages();
  const totalItems = filteredScreenshots.length;

  const handleScreenshotClick = (screenshot) => {
    setSelectedScreenshot(screenshot);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    // Clear selection after modal animation
    setTimeout(() => setSelectedScreenshot(null), 300);
  };

  const handleClearAllFilters = () => {
    setSearchQuery('');
    clearTagFilters();
  };

  const handleRemoveTagFilter = (tag) => {
    toggleTagFilter(tag);
  };

  // Loading state
  if (isLoading && screenshots.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading screenshots..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="text-destructive text-center">
          <p className="text-lg font-semibold">Failed to load screenshots</p>
          <p className="text-sm text-muted-foreground mt-2">{error}</p>
        </div>
        <Button
          onClick={() => {
            clearError();
            fetchScreenshots();
          }}
          className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Screenshots</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totalItems} screenshot{totalItems !== 1 ? 's' : ''} total
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchScreenshots}
            disabled={isLoading}
            className="flex items-center gap-2">
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            Refresh
          </Button>
          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        </div>
      </div>

      {/* Search and filters */}
      <SearchAndFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        activeTagFilters={activeTagFilters}
        onRemoveTagFilter={handleRemoveTagFilter}
        onClearAllFilters={handleClearAllFilters}
      />

      {/* Screenshots grid/list */}
      {screenshots.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <ImageOff className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              No screenshots found
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery || activeTagFilters.length > 0
                ? 'Try adjusting your search or filters'
                : 'Upload some screenshots to get started'}
            </p>
          </div>
          {(searchQuery || activeTagFilters.length > 0) && (
            <Button variant="outline" onClick={handleClearAllFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <div
            className={cn(
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'space-y-3',
            )}>
            {screenshots.map((screenshot) => (
              <ScreenshotCard
                key={screenshot.key}
                screenshot={screenshot}
                viewMode={viewMode}
                onClick={() => handleScreenshotClick(screenshot)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
              totalItems={totalItems}
              itemsPerPage={10}
            />
          )}
        </>
      )}

      {/* Screenshot detail modal */}
      <ScreenshotModal isOpen={isModalOpen} onOpenChange={handleModalClose} />
    </div>
  );
}
