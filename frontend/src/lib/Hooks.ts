import { useContext, useEffect, useState } from 'react';

import { GlobalContext } from 'global/GlobalContext';

// Get the windows width
export function useWindowWidth() {
  // Setup
  const [windowW, setWindowW] = useState<number>();

  // Actions
  useEffect(resizeEffect, []);

  // Output
  return windowW;

  // Hoists
  function resizeEffect() {
    function handleResize() {
      setWindowW(window.innerWidth);
    }
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }
}

// Set the title of the web page
export function useSetTitle(title: string) {
  // Setup
  const { setTitle } = useContext(GlobalContext);

  // Actions
  useEffect(setTitleEffect, [setTitle, title]);

  // Hoists
  function setTitleEffect() {
    setTitle(title);
  }
}
