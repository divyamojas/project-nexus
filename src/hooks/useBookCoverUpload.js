// src/hooks/useBookCoverUpload.js

import useImageDrop from './useImageDrop';

const MAX_SIZE = 500 * 1024; // 500 KB

/**
 * Specialized image-drop hook for book cover uploads.
 */
export default function useBookCoverUpload() {
  const {
    file,
    previewUrl,
    error,
    setFile,
    setPreviewUrl,
    setError,
    getRootProps,
    getInputProps,
    reset,
  } = useImageDrop({ maxSizeBytes: MAX_SIZE, initialUrl: '' });

  return {
    coverFile: file,
    coverPreviewUrl: previewUrl,
    coverError: error,
    setCoverFile: setFile,
    setCoverPreviewUrl: setPreviewUrl,
    setCoverError: setError,
    getRootProps,
    getInputProps,
    resetCover: reset,
  };
}
