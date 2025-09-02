import { useEffect, useState } from 'react';
import PageLoader from './PageLoader';

// Shows the PageLoader only if loading lasts longer than the delay.
// Prevents a quick flash on fast networks.
export default function DelayedLoader({ delay = 250 }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  if (!show) return null;
  return <PageLoader />;
}
