// src/hooks/useAvatarDrop.js

import useImageDrop from './useImageDrop';

const MAX_FILE_SIZE = 300 * 1024; // 300 KB

/**
 * Avatar picker with drag-and-drop, reusing generic image logic.
 */
export default function useAvatarDrop(initialUrl = '', _username = '') {
  const { file, previewUrl, error, setFile, setPreviewUrl, setError, getRootProps, getInputProps } =
    useImageDrop({ maxSizeBytes: MAX_FILE_SIZE, initialUrl });

  return {
    avatarFile: file,
    avatarUrl: previewUrl,
    error,
    setAvatarFile: setFile,
    setAvatarUrl: setPreviewUrl,
    setError,
    getRootProps,
    getInputProps,
  };
}
