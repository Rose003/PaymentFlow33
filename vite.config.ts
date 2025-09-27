import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  define: {
    // Define process.env for compatibility with some libraries
    'process.env': '{}',
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // UI Libraries
          'ui-vendor': [
            '@mantine/core', 
            '@mantine/hooks', 
            '@mui/material',
            '@headlessui/react',
            '@heroicons/react',
            '@radix-ui/react-popover',
            '@radix-ui/react-select'
          ],
          
          // Charts and Data Visualization
          'charts-vendor': [
            'recharts',
            'react-apexcharts',
            'apexcharts'
          ],
          
          // Forms and Date Libraries
          'forms-vendor': [
            'react-hook-form',
            'react-datepicker',
            'react-datetime',
            'react-datetime-picker',
            'react-calendar',
            'react-clock',
            'date-fns',
            'dayjs'
          ],
          
          // Supabase and Auth
          'supabase-vendor': [
            '@supabase/supabase-js',
            '@supabase/auth-ui-react',
            '@supabase/postgrest-js',
            '@supabase/realtime-js',
            '@supabase/storage-js'
          ],
          
          // Stripe and Payments
          'stripe-vendor': [
            '@stripe/react-stripe-js',
            '@stripe/stripe-js',
            'stripe'
          ],
          
          // Animation and UI Utilities
          'animation-vendor': [
            'framer-motion',
            'swiper',
            'react-easy-crop',
            'react-color'
          ],
          
          // Utilities
          'utils-vendor': [
            'papaparse',
            'uuid',
            'clsx',
            'tailwind-variants',
            'react-icons',
            'lucide-react'
          ]
        },
        // Optimize chunk file names
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2 // Multiple passes for better compression
      },
      mangle: {
        safari10: true
      }
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    commonjsOptions: {
      include: [/node_modules/, /@supabase/],
      transformMixedEsModules: true,
      requireReturnsDefault: 'auto'
    },
    // CSS optimization
    cssCodeSplit: true,
    cssMinify: true
  },
  server: {
    port: 5173,
    strictPort: true,
    host: true
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      '@mantine/core',
      '@supabase/supabase-js'
    ],
    exclude: [
      // Exclude heavy libraries that should be loaded on demand
      'recharts',
      'react-apexcharts',
      'framer-motion',
      'swiper',
      'react-easy-crop'
    ]
  },
});