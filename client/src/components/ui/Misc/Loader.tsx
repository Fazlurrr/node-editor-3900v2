import { useEffect, useState, useRef } from 'react';
import { useLoading } from '@/hooks';

const Loader = () => {
  const { isLoading } = useLoading();
  const [showLoader, setShowLoader] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isLoading) {
      // Set timeout only if not already set
      timerRef.current = setTimeout(() => {
        setShowLoader(true);
      }, 3000);
    } else {
      setShowLoader(false);
    }

    // Cleanup timeout on unmount or dependency change
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isLoading]);

  if (!showLoader) return null;

  return (
    <div className="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-black opacity-50 ">
      <div className="flex h-screen items-center justify-center space-x-2">
        <div className="h-4 w-4 animate-bounce rounded-full bg-white [animation-delay:-0.3s]"></div>
        <div className="h-4 w-4 animate-bounce rounded-full bg-white [animation-delay:-0.15s]"></div>
        <div className="h-4 w-4 animate-bounce rounded-full bg-white"></div>
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default Loader;