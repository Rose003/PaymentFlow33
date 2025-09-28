# Google Analytics Setup Guide

## 1. Create Google Analytics Account

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new account and property for your website
3. Get your Measurement ID (format: G-XXXXXXXXXX)

## 2. Environment Variables Setup

Create a `.env.local` file in your project root with:

```env
# Google Analytics
VITE_GA_ID=G-XXXXXXXXXX

# Supabase Configuration (if not already set)
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Stripe Configuration (if not already set)
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
```

## 3. Google Search Console Setup

1. Go to [Google Search Console](https://search.google.com/search-console/)
2. Add your property: `https://paymentflow3.onrender.com`
3. Verify ownership using one of these methods:
   - HTML file upload
   - HTML tag (add to index.html)
   - DNS record
   - Google Analytics (if already set up)

## 4. Features Included

✅ **Enhanced Google Analytics Tracking:**
- Automatic page view tracking for SPA navigation
- Custom event tracking functions
- Button click tracking
- Form submission tracking
- User engagement tracking

✅ **SEO Optimization:**
- Comprehensive meta tags
- Enhanced structured data (JSON-LD)
- Open Graph tags
- Twitter Card tags
- Canonical URLs
- Proper robots.txt
- Complete sitemap.xml

✅ **Search Engine Indexability:**
- All pages properly configured for crawling
- Image sitemap included
- Proper priority and change frequency settings
- Mobile-friendly configuration

## 5. Testing Your Setup

1. **Google Analytics:**
   - Visit your website
   - Check Google Analytics Real-time reports
   - Verify page views are being tracked

2. **Search Console:**
   - Submit your sitemap: `https://paymentflow3.onrender.com/sitemap.xml`
   - Use URL inspection tool to test pages
   - Monitor indexing status

3. **SEO Testing:**
   - Use tools like Google's Rich Results Test
   - Check mobile-friendliness
   - Test page speed with PageSpeed Insights

## 6. Available Tracking Functions

Once Google Analytics is set up, you can use these functions anywhere in your app:

```javascript
// Track button clicks
window.trackButtonClick('Sign Up', 'Header');

// Track form submissions
window.trackFormSubmit('Contact Form');

// Track custom events
window.trackEvent('download', 'file', 'brochure.pdf');

// Track user engagement
window.trackEngagement('scroll', 'page_bottom');
```

## 7. Deployment

After setting up your environment variables:

1. Build the project: `npm run build`
2. Deploy to Render
3. Set the same environment variables in Render dashboard
4. Test tracking on the live site

Your website is now fully optimized for search engines and analytics tracking! 🚀
