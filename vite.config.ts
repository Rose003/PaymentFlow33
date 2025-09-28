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
            '@heroicons/react'
          ],
          
          // Supabase and Auth
          'supabase-vendor': ['@supabase/supabase-js'],
          
          // Charts and Data Visualization
          'charts-vendor': ['recharts', 'apexcharts'],
          
          // Forms and Date Libraries
          'forms-vendor': [
            'react-hook-form',
            'react-datepicker',
            'date-fns'
          ],
          
          // Animation and UI Utilities
          'animation-vendor': [
            'framer-motion',
            'swiper'
          ],
          
          // Stripe and Payments
          'stripe-vendor': ['@stripe/react-stripe-js', '@stripe/stripe-js'],
          
          // Utilities
          'utils-vendor': [
            'papaparse',
            'uuid',
            'clsx',
            'react-icons'
          ]
        },
        // Optimize file naming for better caching
        chunkFileNames: 'assets/js/[name]-[hash:8].js',
        entryFileNames: 'assets/js/[name]-[hash:8].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(png|jpe?g|gif|svg|webp|avif)$/i.test(assetInfo.name)) {
            return `assets/images/[name]-[hash:8].[ext]`;
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return `assets/fonts/[name]-[hash:8].[ext]`;
          }
          return `assets/[name]-[hash:8].[ext]`;
        }
      }
    },
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      },
      mangle: {
        safari10: true
      }
    },
    // Optimize chunk sizes
    chunkSizeWarningLimit: 800,
    commonjsOptions: {
      include: [/node_modules/, /@supabase/],
      transformMixedEsModules: true,
      requireReturnsDefault: 'auto'
    },
    // Advanced CSS optimization
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