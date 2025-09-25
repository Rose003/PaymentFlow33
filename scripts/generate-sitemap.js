// Générateur de sitemap dynamique pour Vite/React
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://paymentflow.com';
const ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/help', priority: '0.8', changefreq: 'monthly' },
  { path: '/temoignages', priority: '0.8', changefreq: 'monthly' },
  { path: '/subscribe', priority: '0.9', changefreq: 'weekly' },
  { path: '/reporting-recouvrement', priority: '0.8', changefreq: 'monthly' },
  { path: '/crm', priority: '0.8', changefreq: 'monthly' },
  { path: '/simulateur-dso', priority: '0.8', changefreq: 'monthly' },
  { path: '/personnalisation', priority: '0.8', changefreq: 'monthly' },
  { path: '/signup', priority: '0.9', changefreq: 'weekly' },
  { path: '/login', priority: '0.7', changefreq: 'monthly' },
  { path: '/forgot-password', priority: '0.5', changefreq: 'yearly' },
  { path: '/pricing', priority: '0.9', changefreq: 'weekly' },
  { path: '/privacy', priority: '0.5', changefreq: 'yearly' },
  { path: '/mentions-legales', priority: '0.5', changefreq: 'yearly' },
  { path: '/conditions-utilisation', priority: '0.5', changefreq: 'yearly' },
  { path: '/blog', priority: '0.8', changefreq: 'weekly' },
  { path: '/blog-garage', priority: '0.7', changefreq: 'monthly' },
  { path: '/blog-manufacture', priority: '0.7', changefreq: 'monthly' },
  { path: '/blog-communication', priority: '0.7', changefreq: 'monthly' },
  { path: '/blog-comptable-banque', priority: '0.7', changefreq: 'monthly' },
  { path: '/blog-optimisation-relance', priority: '0.7', changefreq: 'monthly' },
  { path: '/reset-password', priority: '0.5', changefreq: 'yearly' }
];

const today = new Date().toISOString().slice(0, 10);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${ROUTES.map(route => {
  const changefreq = route.changefreq || 'monthly';
  const priority = route.priority || '0.8';
  
  return `  <url>
    <loc>${BASE_URL}${route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
    <image:image>
      <image:loc>${BASE_URL}/images/paymentflow-og-image.jpg</image:loc>
      <image:title>PaymentFlow - ${route.path === '/' ? 'Accueil' : route.path.replace('/', '').replace('-', ' ')}</image:title>
      <image:caption>Solution de gestion des factures et relances</image:caption>
    </image:image>
  </url>`;
}).join('\n')}
</urlset>\n`;

// Write to both public and dist directories for compatibility
const publicPath = path.join(__dirname, '../public/sitemap.xml');
const distPath = path.join(__dirname, '../dist/sitemap.xml');

// Ensure directories exist
const publicDir = path.dirname(publicPath);
const distDir = path.dirname(distPath);

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Write sitemap to both locations
try {
  fs.writeFileSync(publicPath, sitemap);
  console.log('✅ Sitemap généré dans public/sitemap.xml');
} catch (error) {
  console.log('⚠️  Could not write to public/, continuing...');
}

try {
  fs.writeFileSync(distPath, sitemap);
  console.log('✅ Sitemap généré dans dist/sitemap.xml');
} catch (error) {
  console.log('⚠️  Could not write to dist/, continuing...');
}

console.log('🎉 Sitemap généré avec succès !');
