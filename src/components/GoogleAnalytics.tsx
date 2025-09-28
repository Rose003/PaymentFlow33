import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Google Analytics tracking component for SPA
const GoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page view when route changes
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.VITE_GA_ID || '', {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  // Track custom events
  const trackEvent = (action: string, category: string, label?: string, value?: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }
  };

  // Track button clicks
  const trackButtonClick = (buttonName: string, location?: string) => {
    trackEvent('click', 'button', `${buttonName}${location ? ` - ${location}` : ''}`);
  };

  // Track form submissions
  const trackFormSubmit = (formName: string) => {
    trackEvent('submit', 'form', formName);
  };

  // Track user engagement
  const trackEngagement = (action: string, details?: string) => {
    trackEvent(action, 'engagement', details);
  };

  // Make tracking functions available globally
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).trackEvent = trackEvent;
      (window as any).trackButtonClick = trackButtonClick;
      (window as any).trackFormSubmit = trackFormSubmit;
      (window as any).trackEngagement = trackEngagement;
    }
  }, []);

  return null; // This component doesn't render anything
};

export default GoogleAnalytics;
