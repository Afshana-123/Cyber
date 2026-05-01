'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * AnimatedCounter — Animates a number from 0 to the target value
 * when it scrolls into view. Supports prefix/suffix strings.
 */
export default function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  duration = 2000,
  decimals = 0,
  className = '',
}) {
  const ref = useRef(null);
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) {
      setCount(value);
      return;
    }

    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * numericValue;

      setCount(decimals > 0 ? current.toFixed(decimals) : Math.floor(current));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(decimals > 0 ? numericValue.toFixed(decimals) : numericValue);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [hasStarted, value, duration, decimals]);

  return (
    <span ref={ref} className={className}>
      {prefix}{typeof count === 'number' ? count.toLocaleString('en-IN') : count}{suffix}
    </span>
  );
}
