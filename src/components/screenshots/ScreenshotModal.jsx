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
  CheckCircle2,
} from 'lucide-react';
import { formatDate, formatFileSize } from '@utils/formatters';
import { copyToClipboard } from '@utils/clipboard';
import MetadataForm from './MetadataForm';
import DeleteDialog from './DeleteDialog';
import { useScreenshotsStore } from '@stores/useScreenshotsStore';

// Function to generate consistent color for tags (same as ScreenshotCard)
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

  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

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
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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
    setIsSaving(true);
    const result = await updateMetadata(key, newMetadata);
    setIsSaving(false);

    if (result.success) {
      setIsEditing(false);
      // Show success feedback
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
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
            <div className="w-full rounded-lg overflow-hidden bg-muted/30 border border-border/50">
              <img
                src={url}
                alt={key}
                className="w-full h-auto max-h-[60vh] object-contain"
              />
            </div>

            {/* File info - styled like card metadata */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg border border-border/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-md">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground/60">
                    Uploaded
                  </span>
                  <span className="text-sm font-medium">
                    {formatDate(uploaded, { includeTime: true })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-md">
                  <HardDrive className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground/60">Size</span>
                  <span className="text-sm font-medium">
                    {formatFileSize(size)}
                  </span>
                </div>
              </div>
            </div>

            {/* URL with copy button */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground/80">
                Public URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={url}
                  readOnly
                  className="flex-1 px-3 py-2 bg-muted/50 border border-border/50 rounded-md text-sm font-mono select-all focus:outline-none focus:ring-2 focus:ring-primary/50"
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

            {/* Success feedback */}
            {showSuccess && !isEditing && (
              <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-md text-green-700 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Changes saved successfully!
                </span>
              </div>
            )}

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
                <div className="space-y-2 p-4 bg-muted/20 rounded-lg border border-border/30">
                  <label className="text-sm font-medium text-muted-foreground/70">
                    Description
                  </label>
                  <p className="text-sm leading-relaxed">
                    {description || (
                      <span className="text-muted-foreground/50 italic">
                        No description added yet
                      </span>
                    )}
                  </p>
                </div>

                {/* Tags */}
                <div className="space-y-2 p-4 bg-muted/20 rounded-lg border border-border/30">
                  <label className="text-sm font-medium text-muted-foreground/70">
                    Tags
                  </label>
                  {tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className={`cursor-pointer hover:opacity-80 transition-opacity border ${getTagColor(tag)}`}
                          onClick={() => handleTagClick(tag)}>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground/50 italic">
                      No tags added yet
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
                  isLoading={isSaving}
                />
              </div>
            )}

            {/* Delete button */}
            {!isEditing && (
              <div className="pt-4 border-t border-border/30">
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
