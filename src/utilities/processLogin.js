// src/utilities/processLogin.js

export default async function processLogin({ email, password, setError, setLoading, login }) {
  if (!email || !password) {
    setError('Please fill in both email and password.');
    return;
  }

  setLoading(true);
  const result = await login(email, password);
  setLoading(false);

  if (result?.error) {
    const msg = result.error.message;
    if (msg.includes('Invalid login credentials')) {
      setError('Incorrect email or password.');
    } else if (msg.includes('User not found')) {
      setError('Account does not exist.');
    } else {
      setError(msg || 'Something went wrong. Please try again.');
    }
  }
}
