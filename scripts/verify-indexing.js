import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Routes to verify
const routes = [
  '/',
  '/help',
  '/temoignages',
  '/subscribe',
  '/reporting-recouvrement',
  '/crm',
  '/simulateur-dso',
  '/personnalisation',
  '/signup',
  '/login',
  '/forgot-password',
  '/pricing',
  '/privacy',
  '/mentions-legales',
  '/conditions-utilisation',
  '/blog',
  '/blog-garage',
  '/blog-manufacture',
  '/blog-communication',
  '/blog-comptable-banque',
  '/blog-optimisation-relance',
  '/reset-password'
];

const distPath = path.join(__dirname, '../dist');

// Required meta tags for proper indexing
const requiredMetaTags = [
  'title',
  'meta[name="description"]',
  'meta[name="robots"]',
  'meta[property="og:title"]',
  'meta[property="og:description"]',
  'meta[property="og:type"]',
  'meta[property="og:url"]',
  'meta[name="twitter:card"]',
  'meta[name="twitter:title"]',
  'meta[name="twitter:description"]',
  'link[rel="canonical"]',
  'script[type="application/ld+json"]'
];

function verifyHTMLFile(route, htmlContent) {
  const errors = [];
  const warnings = [];
  
  // Check for required meta tags
  requiredMetaTags.forEach(selector => {
    if (!htmlContent.includes(selector.replace(/\[.*?\]/g, '').replace(/.*=/, ''))) {
      errors.push(`Missing required meta tag: ${selector}`);
    }
  });
  
  // Check for title tag
  if (!htmlContent.includes('<title>')) {
    errors.push('Missing title tag');
  }
  
  // Check for meta description
  if (!htmlContent.includes('name="description"')) {
    errors.push('Missing meta description');
  }
  
  // Check for robots meta tag
  if (!htmlContent.includes('name="robots"')) {
    errors.push('Missing robots meta tag');
  }
  
  // Check for Open Graph tags
  if (!htmlContent.includes('property="og:title"')) {
    errors.push('Missing Open Graph title');
  }
  
  // Check for canonical URL
  if (!htmlContent.includes('rel="canonical"')) {
    errors.push('Missing canonical URL');
  }
  
  // Check for structured data
  if (!htmlContent.includes('application/ld+json')) {
    warnings.push('Missing structured data (JSON-LD)');
  }
  
  // Check for proper HTML structure
  if (!htmlContent.includes('<!DOCTYPE html>')) {
    errors.push('Missing DOCTYPE declaration');
  }
  
  if (!htmlContent.includes('<html')) {
    errors.push('Missing html tag');
  }
  
  if (!htmlContent.includes('<head>')) {
    errors.push('Missing head tag');
  }
  
  if (!htmlContent.includes('<body>')) {
    errors.push('Missing body tag');
  }
  
  return { errors, warnings };
}

function verifyIndexing() {
  console.log('🔍 Verifying indexing configuration...\n');
  
  let totalErrors = 0;
  let totalWarnings = 0;
  let verifiedRoutes = 0;
  
  routes.forEach(route => {
    const htmlPath = route === '/' 
      ? path.join(distPath, 'index.html')
      : path.join(distPath, route, 'index.html');
    
    if (!fs.existsSync(htmlPath)) {
      console.log(`❌ ${route}: HTML file not found`);
      totalErrors++;
      return;
    }
    
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    const { errors, warnings } = verifyHTMLFile(route, htmlContent);
    
    if (errors.length === 0 && warnings.length === 0) {
      console.log(`✅ ${route}: All checks passed`);
      verifiedRoutes++;
    } else {
      console.log(`⚠️  ${route}:`);
      errors.forEach(error => {
        console.log(`   ❌ ${error}`);
        totalErrors++;
      });
      warnings.forEach(warning => {
        console.log(`   ⚠️  ${warning}`);
        totalWarnings++;
      });
    }
  });
  
  console.log('\n📊 Summary:');
  console.log(`✅ Verified routes: ${verifiedRoutes}/${routes.length}`);
  console.log(`❌ Total errors: ${totalErrors}`);
  console.log(`⚠️  Total warnings: ${totalWarnings}`);
  
  // Check sitemap
  const sitemapPath = path.join(distPath, 'sitemap.xml');
  if (fs.existsSync(sitemapPath)) {
    console.log('✅ Sitemap found');
  } else {
    console.log('❌ Sitemap not found');
    totalErrors++;
  }
  
  // Check robots.txt
  const robotsPath = path.join(distPath, 'robots.txt');
  if (fs.existsSync(robotsPath)) {
    console.log('✅ Robots.txt found');
  } else {
    console.log('❌ Robots.txt not found');
    totalErrors++;
  }
  
  if (totalErrors === 0) {
    console.log('\n🎉 All pages are properly configured for indexing!');
    console.log('📈 Your site is ready for search engine crawling.');
  } else {
    console.log('\n⚠️  Please fix the errors above before deploying.');
  }
  
  return totalErrors === 0;
}

verifyIndexing();
