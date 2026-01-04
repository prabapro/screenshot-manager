// src/components/screenshots/ScreenshotCard.jsx

import { useState } from 'react';
import { Card } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { Calendar, HardDrive, ImageIcon } from 'lucide-react';
import { formatDate, formatFileSize, truncateText } from '@utils/formatters';

export default function ScreenshotCard({ screenshot, viewMode, onClick }) {
  const [imageError, setImageError] = useState(false);
  const { key, url, size, uploaded, metadata = {} } = screenshot;
  const { description, tags = [] } = metadata;

  // Grid view
  if (viewMode === 'grid') {
    return (
      <Card
        onClick={onClick}
        className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg hover:border-primary/50">
        {/* Image preview */}
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

          {/* Tags overlay - show first 2 tags */}
          {tags.length > 0 && (
            <div className="absolute top-2 right-2 flex gap-1">
              {tags.slice(0, 2).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs backdrop-blur-sm bg-background/80">
                  {tag}
                </Badge>
              ))}
              {tags.length > 2 && (
                <Badge
                  variant="secondary"
                  className="text-xs backdrop-blur-sm bg-background/80">
                  +{tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Name */}
          <div className="space-y-1">
            <h3 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
              {key}
            </h3>
            {description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {description}
              </p>
            )}
          </div>

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(uploaded, { relative: true })}</span>
            </div>
            <div className="flex items-center gap-1">
              <HardDrive className="h-3 w-3" />
              <span>{formatFileSize(size)}</span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // List view
  return (
    <Card
      onClick={onClick}
      className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/50">
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
          {/* Name and description */}
          <div className="space-y-1">
            <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
              {key}
            </h3>
            {description && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                {truncateText(description, 100)}
              </p>
            )}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(uploaded)}</span>
            </div>
            <div className="flex items-center gap-1">
              <HardDrive className="h-3 w-3" />
              <span>{formatFileSize(size)}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
