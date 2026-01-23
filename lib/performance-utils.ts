/**
 * Performance utilities for common optimization patterns
 */

/**
 * Preload critical images
 */
export const preloadImage = (src: string) => {
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = src;
  (link as any).imageSrcset = src;
  document.head.appendChild(link);
};

/**
 * Defer non-critical JavaScript
 */
export const deferScript = (src: string, id?: string) => {
  const script = document.createElement("script");
  script.src = src;
  script.defer = true;
  if (id) script.id = id;
  document.body.appendChild(script);
};

/**
 * Request idle callback polyfill
 */
export const scheduleIdleCallback = (callback: () => void) => {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(callback);
  } else {
    setTimeout(callback, 0);
  }
};

/**
 * Intersection Observer for lazy loading
 */
export const observeElement = (
  element: HTMLElement,
  callback: () => void,
  options: IntersectionObserverInit = { threshold: 0.1 },
) => {
  if (!("IntersectionObserver" in window)) {
    callback();
    return;
  }

  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      callback();
      observer.unobserve(element);
    }
  }, options);

  observer.observe(element);
};

/**
 * Debounce function for resize/scroll events
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function for high-frequency events
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};
