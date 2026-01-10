'use client';

import { useEffect } from 'react';

export default function ScrollRevealWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);

    const revealedElements = document.querySelectorAll('.reveal');
    revealedElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return <>{children}</>;
}