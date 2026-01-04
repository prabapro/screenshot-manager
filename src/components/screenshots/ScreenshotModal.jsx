// src/components/screenshots/ScreenshotModal.jsx

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import {
  Copy,
  ExternalLink,
  Edit,
  Trash2,
  Calendar,
  HardDrive,
  Check,
} from 'lucide-react';
import { formatDate, formatFileSize } from '@utils/formatters';
import { copyToClipboard } from '@utils/clipboard';
import MetadataForm from './MetadataForm';
import DeleteDialog from './DeleteDialog';
import { useScreenshotsStore } from '@stores/useScreenshotsStore';

export default function ScreenshotModal({ isOpen, onOpenChange }) {
  const screenshot = useScreenshotsStore((state) => state.selectedScreenshot);
  const updateMetadata = useScreenshotsStore((state) => state.updateMetadata);
  const deleteScreenshot = useScreenshotsStore(
    (state) => state.deleteScreenshot,
  );
  const toggleTagFilter = useScreenshotsStore((state) => state.toggleTagFilter);

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!screenshot) return null;

  const { key, url, size, uploaded, metadata = {} } = screenshot;
  const { description, tags = [] } = metadata;

  const handleCopyUrl = async () => {
    const success = await copyToClipboard(url);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveMetadata = async (newMetadata) => {
    const result = await updateMetadata(key, newMetadata);
    if (result.success) {
      setIsEditing(false);
    }
    return result;
  };

  const handleDelete = async () => {
    const result = await deleteScreenshot(key);
    if (result.success) {
      onOpenChange(false);
      setIsDeleting(false);
    }
    return result;
  };

  const handleTagClick = (tag) => {
    // Close modal and filter by tag
    onOpenChange(false);
    toggleTagFilter(tag);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl pr-8">{key}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Image preview */}
            <div className="w-full rounded-lg overflow-hidden bg-muted/30">
              <img
                src={url}
                alt={key}
                className="w-full h-auto max-h-[60vh] object-contain"
              />
            </div>

            {/* URL with copy button */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Public URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={url}
                  readOnly
                  className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono select-all"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyUrl}
                  className="flex items-center gap-2">
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Open
                  </a>
                </Button>
              </div>
            </div>

            {/* File info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Uploaded:</span>
                <span className="font-medium">
                  {formatDate(uploaded, { includeTime: true })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Size:</span>
                <span className="font-medium">{formatFileSize(size)}</span>
              </div>
            </div>

            {/* Metadata section */}
            {!isEditing ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Metadata</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Description
                  </label>
                  <p className="text-sm">
                    {description || (
                      <span className="text-muted-foreground italic">
                        No description
                      </span>
                    )}
                  </p>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Tags
                  </label>
                  {tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="cursor-pointer hover:bg-secondary/80"
                          onClick={() => handleTagClick(tag)}>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No tags
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Edit Metadata</h3>
                <MetadataForm
                  initialMetadata={metadata}
                  onSave={handleSaveMetadata}
                  onCancel={() => setIsEditing(false)}
                />
              </div>
            )}

            {/* Delete button */}
            {!isEditing && (
              <div className="pt-4 border-t">
                <Button
                  variant="destructive"
                  onClick={() => setIsDeleting(true)}
                  className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete Screenshot
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <DeleteDialog
        isOpen={isDeleting}
        onOpenChange={setIsDeleting}
        screenshotName={key}
        onConfirm={handleDelete}
      />
    </>
  );
}
