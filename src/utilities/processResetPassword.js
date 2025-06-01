// src/utilities/processResetPassword.js

export default async function processResetPassword({
  email,
  setError,
  setMessage,
  setLoading,
  resetPassword,
}) {
  setError('');
  setMessage('');

  setLoading(true);
  const { error: resetError } = await resetPassword(email);
  setLoading(false);

  if (resetError) {
    setError('Something went wrong. Please try again.');
  } else {
    setMessage('Reset link sent! Please check your email.');
  }
}
