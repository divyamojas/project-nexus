// src/hooks/useBookCoverUpload.js

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const MAX_SIZE = 500 * 1024; // 500 KB

export default function useBookCoverUpload() {
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState('');
  const [coverError, setCoverError] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setCoverError('Only JPG, PNG, or WebP images allowed.');
      return;
    }
    if (file.size > MAX_SIZE) {
      setCoverError('Image too large. Max size is 500 KB.');
      return;
    }
    setCoverFile(file);
    setCoverPreviewUrl(URL.createObjectURL(file));
    setCoverError('');
  }, []);

  const resetCover = () => {
    setCoverFile(null);
    setCoverPreviewUrl('');
    setCoverError('');
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
  });

  return {
    coverFile,
    coverPreviewUrl,
    coverError,
    setCoverFile,
    setCoverPreviewUrl,
    setCoverError,
    getRootProps,
    getInputProps,
    resetCover,
  };
}
