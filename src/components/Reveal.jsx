import { useEffect, useRef, useState } from 'react';

export default function Reveal({ children, className = '' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const element = ref.current;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.unobserve(entry.target); }
    }, { threshold: 0.15 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${visible ? 'reveal-visible' : ''} ${className}`}>{children}</div>;
}
