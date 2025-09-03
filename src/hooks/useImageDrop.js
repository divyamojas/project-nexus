// src/hooks/useImageDrop.js

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

/**
 * Drag-and-drop helper for image uploads with size/type validation.
 * Use in UI forms to collect an image file and preview URL.
 */
export default function useImageDrop({
  maxSizeBytes = 300 * 1024,
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  initialUrl = '',
}) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initialUrl);
  const [error, setError] = useState('');

  const onDrop = useCallback(
    (acceptedFiles) => {
      const selected = acceptedFiles[0];
      if (!selected) return;

      if (!allowedTypes.includes(selected.type)) {
        setError('Only JPG, PNG, or WebP images allowed.');
        return;
      }
      if (selected.size > maxSizeBytes) {
        setError(`Image too large. Max size is ${Math.round(maxSizeBytes / 1024)} KB.`);
        return;
      }

      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setError('');
    },
    [allowedTypes, maxSizeBytes],
  );

  const reset = useCallback(() => {
    setFile(null);
    setPreviewUrl(initialUrl || '');
    setError('');
  }, [initialUrl]);

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: { 'image/*': [] } });

  return {
    file,
    previewUrl,
    error,
    setFile,
    setPreviewUrl,
    setError,
    getRootProps,
    getInputProps,
    reset,
  };
}
