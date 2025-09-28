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
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false
      },
      output: {
        manualChunks: (id) => {
          // More granular chunking for better caching
          if (id.includes('node_modules')) {
            // Core React - highest priority, smallest chunk
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-core';
            }
            // Supabase - critical for auth
            if (id.includes('@supabase')) {
              return 'supabase';
            }
            // UI libraries - grouped by usage
            if (id.includes('@mantine') || id.includes('@mui') || id.includes('@headlessui')) {
              return 'ui-core';
            }
            // Charts - heavy but optional
            if (id.includes('recharts') || id.includes('apexcharts')) {
              return 'charts';
            }
            // Forms - moderate size
            if (id.includes('react-hook-form') || id.includes('react-datepicker') || id.includes('date-fns')) {
              return 'forms';
            }
            // Animation - heavy, lazy load
            if (id.includes('framer-motion') || id.includes('swiper')) {
              return 'animation';
            }
            // Stripe - payment related
            if (id.includes('@stripe')) {
              return 'stripe';
            }
            // Utilities - small but frequent
            if (id.includes('clsx') || id.includes('uuid') || id.includes('react-icons')) {
              return 'utils';
            }
            // Everything else
            return 'vendor';
          }
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
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        passes: 3, // More aggressive compression
        unsafe: true,
        unsafe_comps: true,
        unsafe_math: true,
        unsafe_proto: true
      },
      mangle: {
        safari10: true,
        properties: {
          regex: /^_/
        }
      },
      format: {
        comments: false
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