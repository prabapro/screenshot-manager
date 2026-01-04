// src/components/screenshots/MetadataForm.jsx

import { useState } from 'react';
import { Button } from '@components/ui/button';
import { Label } from '@components/ui/label';
import { Textarea } from '@components/ui/textarea';
import { TagInput } from '@components/ui/tag-input';
import { Loader2 } from 'lucide-react';

export default function MetadataForm({
  initialMetadata = {},
  onSave,
  onCancel,
  isLoading = false,
}) {
  const [description, setDescription] = useState(
    initialMetadata.description || '',
  );
  const [tags, setTags] = useState(initialMetadata.tags || []);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate
    if (description.length > 500) {
      setError('Description must be 500 characters or less');
      return;
    }

    if (tags.length > 20) {
      setError('Maximum 20 tags allowed');
      return;
    }

    // Prepare metadata
    const metadata = {
      description: description.trim(),
      tags: tags,
    };

    // Call save callback
    const result = await onSave(metadata);

    if (!result.success) {
      setError(result.error || 'Failed to save metadata');
    }
  };

  const hasChanges =
    description !== (initialMetadata.description || '') ||
    JSON.stringify(tags) !== JSON.stringify(initialMetadata.tags || []);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Add a description for this screenshot..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
          rows={3}
          maxLength={500}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground text-right">
          {description.length}/500 characters
        </p>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label>Tags</Label>
        <TagInput
          value={tags}
          onChange={setTags}
          disabled={isLoading}
          maxTags={20}
          maxTagLength={50}
          placeholder="Add tags..."
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm rounded-md p-3 border border-destructive/20">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || !hasChanges}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </form>
  );
}
