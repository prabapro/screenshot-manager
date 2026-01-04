// src/components/screenshots/DeleteDialog.jsx

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@components/ui/alert-dialog';
import { Loader2, AlertTriangle } from 'lucide-react';

export default function DeleteDialog({
  isOpen,
  onOpenChange,
  screenshotName,
  onConfirm,
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const handleConfirm = async () => {
    setIsDeleting(true);
    setError(null);

    const result = await onConfirm();

    if (result.success) {
      // Close dialog on success
      onOpenChange(false);
    } else {
      // Show error
      setError(result.error || 'Failed to delete screenshot');
    }

    setIsDeleting(false);
  };

  const handleCancel = () => {
    if (!isDeleting) {
      setError(null);
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <AlertDialogTitle>Delete Screenshot</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-foreground">
              {screenshotName}
            </span>
            ? This action cannot be undone and will permanently remove the
            screenshot and all its metadata.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Error message */}
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm rounded-md p-3 border border-destructive/20">
            {error}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-destructive text-white hover:bg-destructive/90">
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
