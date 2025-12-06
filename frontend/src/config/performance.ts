// Frontend performance optimization configuration
// This file is imported to apply performance enhancements

export const performanceConfig = {
  // Lazy load heavy components
  enableLazyLoading: true,
  
  // Cache API responses
  cacheApiResponses: true,
  cacheDuration: 5 * 60 * 1000, // 5 minutes
  
  // Optimize images
  compressImages: true,
  
  // Reduce initial bundle size
  treeshake: true,
  
  // Enable HTTP/2 Server Push
  enableHttp2Push: true,
  
  // Preload critical resources
  preloadFonts: false,
  prefetchPages: false
};

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    if (window.performance && window.performance.timing) {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      console.log('📊 Page load time:', pageLoadTime, 'ms');
    }
  });
}
