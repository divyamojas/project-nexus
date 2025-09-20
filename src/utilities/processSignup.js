// src/utilities/processSignup.js

/**
 * Validate signup form then call the provided signup method.
 */
export default async function processSignup({
  email,
  password,
  confirmPassword,
  setError,
  setLoading,
  navigate,
  signup,
}) {
  if (!email || !password || !confirmPassword) {
    setError('Please fill all fields.');
    return;
  }

  if (password !== confirmPassword) {
    setError('Passwords do not match.');
    return;
  }

  if (password.length < 6) {
    setError('Password must be at least 6 characters.');
    return;
  }

  setLoading(true);
  const { error: signupError } = await signup(email, password);
  setLoading(false);

  if (signupError) {
    setError(signupError.message);
  } else {
    navigate('/pending-approval');
  }
}
