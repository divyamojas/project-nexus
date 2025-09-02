// src/hooks/useProfileSave.js

import { useState } from 'react';
import { saveProfile } from '../services/profileService';

/**
 * Persist profile changes and surface errors/success state to the caller.
 */
export default function useProfileSave({
  user,
  username,
  firstName,
  lastName,
  bio,
  avatarFile,
  avatarUrl,
  onComplete,
  setAvatarError,
  setAvatarFile,
  setAvatarUrl,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setAvatarError && setAvatarError('');
    setLoading(true);

    const result = await saveProfile({
      user,
      username,
      firstName,
      lastName,
      bio,
      avatarFile,
      avatarUrl,
    });

    if (result.error) {
      if (result.errorType === 'avatar') {
        setAvatarError && setAvatarError(result.error);
      } else {
        setError(result.error);
      }
      setLoading(false);
      return;
    }

    // On success: reset avatar file and url if new one was uploaded
    if (result.uploadedUrl) {
      setAvatarFile && setAvatarFile(null);
      setAvatarUrl && setAvatarUrl(result.uploadedUrl);
    }

    setSuccess('Profile updated!');
    setLoading(false);
    if (onComplete) onComplete();
  };

  return {
    loading,
    error,
    success,
    handleSave,
  };
}
