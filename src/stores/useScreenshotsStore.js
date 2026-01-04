// src/stores/useScreenshotsStore.js

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { api } from '@services/api';

export const useScreenshotsStore = create()(
  devtools(
    (set, get) => ({
      // State
      screenshots: [],
      filteredScreenshots: [],
      isLoading: false,
      error: null,

      // View state
      viewMode: 'grid', // 'grid' | 'list'

      // Filter/search state
      searchQuery: '',
      sortBy: 'recent', // 'recent' | 'oldest' | 'name-asc' | 'name-desc' | 'size-largest' | 'size-smallest'
      activeTagFilters: [],

      // Pagination
      currentPage: 1,
      itemsPerPage: 10,

      // Selected screenshot for modal
      selectedScreenshot: null,

      // Actions

      /**
       * Fetch all screenshots from API
       */
      fetchScreenshots: async () => {
        set({ isLoading: true, error: null });

        try {
          const data = await api.screenshots.list();
          const screenshots = data.screenshots || [];

          set({
            screenshots,
            isLoading: false,
          });

          // Apply current filters
          get().applyFilters();

          return { success: true };
        } catch (error) {
          console.error('Failed to fetch screenshots:', error);
          set({
            isLoading: false,
            error: error.message || 'Failed to load screenshots',
          });

          return { success: false, error: error.message };
        }
      },

      /**
       * Update screenshot metadata
       */
      updateMetadata: async (key, metadata) => {
        try {
          await api.screenshots.updateMetadata(key, { metadata });

          // Update local state
          const screenshots = get().screenshots.map((s) =>
            s.key === key ? { ...s, metadata } : s,
          );

          set({ screenshots });

          // Update selected screenshot if it's the one being edited
          const selected = get().selectedScreenshot;
          if (selected && selected.key === key) {
            set({ selectedScreenshot: { ...selected, metadata } });
          }

          // Re-apply filters
          get().applyFilters();

          return { success: true };
        } catch (error) {
          console.error('Failed to update metadata:', error);
          return { success: false, error: error.message };
        }
      },

      /**
       * Delete screenshot
       */
      deleteScreenshot: async (key) => {
        try {
          await api.screenshots.delete(key);

          // Remove from local state
          const screenshots = get().screenshots.filter((s) => s.key !== key);

          set({ screenshots, selectedScreenshot: null });

          // Re-apply filters
          get().applyFilters();

          return { success: true };
        } catch (error) {
          console.error('Failed to delete screenshot:', error);
          return { success: false, error: error.message };
        }
      },

      /**
       * Set search query and apply filters
       */
      setSearchQuery: (query) => {
        set({ searchQuery: query, currentPage: 1 });
        get().applyFilters();
      },

      /**
       * Set sort order and apply filters
       */
      setSortBy: (sortBy) => {
        set({ sortBy, currentPage: 1 });
        get().applyFilters();
      },

      /**
       * Toggle tag filter
       */
      toggleTagFilter: (tag) => {
        const { activeTagFilters } = get();
        const newFilters = activeTagFilters.includes(tag)
          ? activeTagFilters.filter((t) => t !== tag)
          : [...activeTagFilters, tag];

        set({ activeTagFilters: newFilters, currentPage: 1 });
        get().applyFilters();
      },

      /**
       * Clear all tag filters
       */
      clearTagFilters: () => {
        set({ activeTagFilters: [], currentPage: 1 });
        get().applyFilters();
      },

      /**
       * Apply filters and sorting to screenshots
       */
      applyFilters: () => {
        const { screenshots, searchQuery, sortBy, activeTagFilters } = get();

        let filtered = [...screenshots];

        // Apply search filter
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter((s) => {
            const nameMatch = s.key.toLowerCase().includes(query);
            const descMatch =
              s.metadata?.description?.toLowerCase().includes(query) || false;
            const tagsMatch =
              s.metadata?.tags?.some((tag) =>
                tag.toLowerCase().includes(query),
              ) || false;

            return nameMatch || descMatch || tagsMatch;
          });
        }

        // Apply tag filters
        if (activeTagFilters.length > 0) {
          filtered = filtered.filter((s) => {
            const tags = s.metadata?.tags || [];
            return activeTagFilters.every((filter) => tags.includes(filter));
          });
        }

        // Apply sorting
        filtered.sort((a, b) => {
          switch (sortBy) {
            case 'recent':
              return new Date(b.uploaded) - new Date(a.uploaded);
            case 'oldest':
              return new Date(a.uploaded) - new Date(b.uploaded);
            case 'name-asc':
              return a.key.localeCompare(b.key);
            case 'name-desc':
              return b.key.localeCompare(a.key);
            case 'size-largest':
              return b.size - a.size;
            case 'size-smallest':
              return a.size - b.size;
            default:
              return 0;
          }
        });

        set({ filteredScreenshots: filtered });
      },

      /**
       * Set view mode (grid/list)
       */
      setViewMode: (mode) => {
        set({ viewMode: mode });
      },

      /**
       * Set selected screenshot for modal
       */
      setSelectedScreenshot: (screenshot) => {
        set({ selectedScreenshot: screenshot });
      },

      /**
       * Pagination - go to page
       */
      goToPage: (page) => {
        set({ currentPage: page });
      },

      /**
       * Get paginated screenshots
       */
      getPaginatedScreenshots: () => {
        const { filteredScreenshots, currentPage, itemsPerPage } = get();
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;

        return filteredScreenshots.slice(startIndex, endIndex);
      },

      /**
       * Get total pages
       */
      getTotalPages: () => {
        const { filteredScreenshots, itemsPerPage } = get();
        return Math.ceil(filteredScreenshots.length / itemsPerPage);
      },

      /**
       * Get all unique tags from screenshots
       */
      getAllTags: () => {
        const { screenshots } = get();
        const tagsSet = new Set();

        screenshots.forEach((s) => {
          const tags = s.metadata?.tags || [];
          tags.forEach((tag) => tagsSet.add(tag));
        });

        return Array.from(tagsSet).sort();
      },

      /**
       * Clear error
       */
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'screenshots-store',
    },
  ),
);
