// src/hooks/useAvatarDrop.js

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const MAX_FILE_SIZE = 300 * 1024; // 300 KB

export default function useAvatarDrop(initialUrl = '', username = '') {
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(initialUrl);
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Please upload a JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('File is too large. Max size is 300 KB.');
      return;
    }
    setAvatarFile(file);
    setAvatarUrl(URL.createObjectURL(file));
    setError('');
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
  });

  return {
    avatarFile,
    avatarUrl,
    error,
    setAvatarFile,
    setAvatarUrl,
    setError,
    getRootProps,
    getInputProps,
  };
}
