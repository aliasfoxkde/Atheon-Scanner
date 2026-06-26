import { useEffect, useRef } from 'react';
export function useDocumentTitle(title) {
  const prev = useRef(document.title);
  useEffect(() => {
    document.title = title;
    return () => { document.title = prev.current; };
  }, [title]);
}
