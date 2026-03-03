import { useEffect, RefObject } from 'react';

export function useScrollReveal(refs: RefObject<HTMLElement>[], threshold = 0.1) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      {
        threshold,
        rootMargin: '0px 0px -100px 0px',
      }
    );

    refs.forEach((ref) => {
      if (ref.current) {
        ref.current.classList.add('scroll-reveal');
        observer.observe(ref.current);
      }
    });

    return () => {
      refs.forEach((ref) => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      });
    };
  }, [refs, threshold]);
}
