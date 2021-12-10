import { useEffect, useState } from 'react';

export function useWindowWidth() {
  const [windowW, setWindowW] = useState<number>();

  useEffect(() => {
    function handleResize() {
      setWindowW(window.innerWidth);
    }
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowW;
}
