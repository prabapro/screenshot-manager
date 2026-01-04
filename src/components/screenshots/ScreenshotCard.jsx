// src/components/screenshots/ScreenshotCard.jsx

import { useState } from 'react';
import { Card } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { Calendar, HardDrive, ImageIcon } from 'lucide-react';
import { formatDate, formatFileSize, truncateText } from '@utils/formatters';

// Function to generate consistent color for tags
const getTagColor = (tag) => {
  const colors = [
    'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
    'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
    'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
    'bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20',
    'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20',
    'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
    'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
  ];

  // Simple hash function to get consistent color for same tag
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export default function ScreenshotCard({ screenshot, viewMode, onClick }) {
  const [imageError, setImageError] = useState(false);
  const { key, url, size, uploaded, metadata = {} } = screenshot;
  const { description, tags = [] } = metadata;

  // Grid view
  if (viewMode === 'grid') {
    return (
      <Card
        onClick={onClick}
        className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg hover:border-primary/50 p-0">
        {/* Image preview - flush with top */}
        <div className="aspect-video bg-muted/30 overflow-hidden relative">
          {!imageError ? (
            <img
              src={url}
              alt={key}
              loading="lazy"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}
        </div>

        {/* Content - with padding */}
        <div className="p-4 space-y-3">
          {/* Metadata - date and size (lighter) */}
          <div className="flex items-center justify-between text-xs text-muted-foreground/60">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(uploaded, { relative: true })}</span>
            </div>
            <div className="flex items-center gap-1">
              <HardDrive className="h-3 w-3" />
              <span>{formatFileSize(size)}</span>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1">
            <h3 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
              {key}
            </h3>
          </div>

          {/* Description */}
          {description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}

          {/* Tags with colors */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className={`text-xs border ${getTagColor(tag)}`}>
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge
                  variant="outline"
                  className="text-xs border bg-muted/50 text-muted-foreground border-muted">
                  +{tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </Card>
    );
  }

  // List view
  return (
    <Card
      onClick={onClick}
      className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/50 p-0">
      <div className="flex gap-4 p-4">
        {/* Thumbnail */}
        <div className="w-32 h-24 bg-muted/30 rounded-md overflow-hidden flex-shrink-0">
          {!imageError ? (
            <img
              src={url}
              alt={key}
              loading="lazy"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Metadata - date and size (lighter) */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground/60">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(uploaded)}</span>
            </div>
            <div className="flex items-center gap-1">
              <HardDrive className="h-3 w-3" />
              <span>{formatFileSize(size)}</span>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1">
            <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
              {key}
            </h3>
          </div>

          {/* Description */}
          {description && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {truncateText(description, 100)}
            </p>
          )}

          {/* Tags with colors */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.slice(0, 4).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className={`text-xs border ${getTagColor(tag)}`}>
                  {tag}
                </Badge>
              ))}
              {tags.length > 4 && (
                <Badge
                  variant="outline"
                  className="text-xs border bg-muted/50 text-muted-foreground border-muted">
                  +{tags.length - 4}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
