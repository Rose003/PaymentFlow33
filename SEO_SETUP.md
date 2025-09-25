# SEO Setup for PaymentFlow

This document explains the SEO optimization implemented for the PaymentFlow React application.

## Overview

The project now includes HTML prerendering to make the React application SEO-friendly. Search engine crawlers can access static HTML versions of all public pages while maintaining the same user experience.

## Features

### 1. HTML Prerendering
- Generates static HTML files for all public routes
- Each page has unique meta tags (title, description)
- Includes Open Graph and Twitter Card meta tags
- Canonical URLs for proper SEO
- Preserves all existing functionality

### 2. Generated Routes
The following routes are prerendered:
- `/` - Homepage
- `/help` - Help and Support
- `/temoignages` - Testimonials
- `/subscribe` - Subscription
- `/reporting-recouvrement` - Recovery Reporting
- `/crm` - CRM
- `/simulateur-dso` - DSO Simulator
- `/personnalisation` - Customization
- `/signup` - Sign Up
- `/login` - Login
- `/forgot-password` - Password Recovery
- `/pricing` - Pricing
- `/privacy` - Privacy Policy
- `/mentions-legales` - Legal Notice
- `/conditions-utilisation` - Terms of Use
- `/blog` - Blog
- `/blog-garage` - Garage Blog
- `/blog-manufacture` - Manufacturing Blog
- `/blog-communication` - Communication Blog
- `/blog-comptable-banque` - Accounting Bank Blog
- `/blog-optimisation-relance` - Recovery Optimization Blog
- `/reset-password` - Password Reset

### 3. SEO Meta Tags
Each prerendered page includes:
- Unique page title
- Meta description
- Open Graph tags (og:title, og:description, og:type, og:url)
- Twitter Card tags
- Canonical URL

### 4. Sitemap Generation
- Automatically generates `sitemap.xml`
- Includes all public routes
- Sets appropriate priorities and change frequencies
- Updated during build process

### 5. Robots.txt
- Configured to allow search engine crawling
- Points to sitemap location
- Blocks private routes (dashboard, settings, etc.)

## Build Commands

### Standard Build
```bash
npm run build
```
Builds the application without prerendering.

### SEO-Optimized Build
```bash
npm run build:seo
```
Builds the application and generates:
1. Static HTML files for all routes
2. SEO-optimized meta tags
3. Updated sitemap.xml

### Individual Scripts
```bash
npm run prerender    # Generate static HTML files
npm run sitemap      # Generate sitemap.xml
```

## File Structure

```
PaymentFlow/
├── dist/                    # Build output
│   ├── index.html          # Homepage
│   ├── help/
│   │   └── index.html      # Help page
│   ├── pricing/
│   │   └── index.html      # Pricing page
│   ├── sitemap.xml         # Generated sitemap
│   └── robots.txt          # Robots configuration
├── scripts/
│   ├── prerender.js        # HTML generation script
│   └── generate-sitemap.js # Sitemap generation
└── public/
    ├── robots.txt          # Robots template
    └── sitemap.xml         # Sitemap template
```

## How It Works

1. **Build Process**: Vite builds the React application
2. **HTML Generation**: The prerender script reads the main `index.html` and creates copies for each route with updated meta tags
3. **SEO Enhancement**: Each HTML file gets unique title, description, and social media tags
4. **Sitemap Creation**: All routes are added to the sitemap with appropriate SEO metadata

## Deployment

When deploying:
1. Use `npm run build:seo` for production builds
2. Ensure your web server serves static HTML files for direct URL access
3. Configure your server to serve `index.html` for routes that don't have static files
4. The sitemap will be available at `/sitemap.xml`

## Benefits

- **SEO-Friendly**: Search engines can crawl and index all pages
- **Fast Loading**: Static HTML files load quickly
- **Social Sharing**: Proper Open Graph tags for social media
- **User Experience**: Maintains full React functionality
- **Maintainable**: Easy to add new routes or update meta tags

## Adding New Routes

To add a new route to prerendering:

1. Add the route to `scripts/prerender.js` in the `routes` array:
```javascript
{ path: '/new-route', title: 'New Route - PaymentFlow', description: 'Description for new route' }
```

2. Add the route to `scripts/generate-sitemap.js` in the `ROUTES` array:
```javascript
{ path: '/new-route', priority: '0.8', changefreq: 'monthly' }
```

3. Rebuild with `npm run build:seo`

## Notes

- Private routes (dashboard, settings, etc.) are not prerendered for security
- The application maintains full React functionality after prerendering
- Meta tags are automatically generated based on route configuration
- All existing features and functionality remain unchanged
