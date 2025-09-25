# Render Deployment Guide for PaymentFlow

## Issues Fixed

### 1. Environment Variables
- ✅ Fixed `%VITE_GA_ID%` undefined error by adding conditional loading
- ✅ Added fallback values for Supabase configuration
- ✅ Created proper environment variable handling

### 2. White Page Issues
- ✅ Added error handling for undefined Supabase configuration
- ✅ Added proper routing configuration for static hosting
- ✅ Added global error handlers in HTML

## Deployment Steps for Render

### Step 1: Environment Variables
In your Render dashboard, add these environment variables:

```
VITE_GA_ID=G-XXXXXXXXXX (or leave empty if no Google Analytics)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key (if using Stripe)
```

### Step 2: Build Configuration
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Node Version**: 18.x or 20.x

### Step 3: Static Site Configuration
Use the `render.yaml` file created in the project root, or configure manually:

- **Routes**: Add a catch-all route `/*` → `/index.html`
- **Headers**: Add `Cache-Control: public, max-age=31536000` for assets

### Step 4: Deployment Settings
- **Framework**: Static Site
- **Branch**: main (or your deployment branch)
- **Auto-Deploy**: Enabled

## Troubleshooting

### If you still see a white page:

1. **Check Browser Console**: Open Developer Tools → Console to see JavaScript errors
2. **Verify Environment Variables**: Ensure all required env vars are set in Render
3. **Check Network Tab**: Look for failed requests to assets or API endpoints
4. **Test Locally**: Run `npm run preview` to test the built version locally

### Common Issues:

1. **Supabase Not Configured**: App will show warning in console but won't crash
2. **Missing Environment Variables**: Check Render dashboard environment settings
3. **Routing Issues**: Ensure catch-all route is configured for client-side routing
4. **Asset Loading**: Check that CSS/JS files are loading correctly

## Files Modified

- `index.html`: Fixed Google Analytics conditional loading
- `src/lib/supabase.ts`: Added fallback values and error handling
- `render.yaml`: Created deployment configuration
- `.env.local`: Created template for environment variables

## Next Steps

1. Set up your environment variables in Render
2. Deploy using the render.yaml configuration
3. Test the deployed site
4. Configure your Supabase project with the correct URLs
5. Add your Google Analytics ID if needed

The app should now load properly even without proper Supabase configuration, showing the landing page in "demo mode".
