'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * ScrollReveal — wraps children with an Intersection Observer that triggers
 * CSS-class-based reveal animations when the element scrolls into view.
 *
 * @param {string} animation  - CSS module class to apply on reveal
 * @param {number} delay      - ms delay before applying the class (stagger)
 * @param {number} threshold  - 0-1 visibility ratio to trigger
 * @param {string} className  - extra classes for the wrapper
 */
export default function ScrollReveal({
  children,
  animation = '',
  delay = 0,
  threshold = 0.15,
  className = '',
  as: Tag = 'div',
  style = {},
  ...rest
}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Once revealed, never un-reveal
          setTimeout(() => setIsVisible(true), delay);
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, threshold]);

  return (
    <Tag
      ref={ref}
      className={`${className} ${isVisible ? animation : ''}`}
      style={{
        ...style,
        opacity: isVisible ? undefined : 0,
        transform: isVisible ? undefined : 'translateY(30px)',
        transition: `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
