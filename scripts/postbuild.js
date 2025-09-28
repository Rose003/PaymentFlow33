import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, '../dist');

function copyFileIfExists(source, destination) {
  try {
    if (fs.existsSync(source)) {
      fs.copyFileSync(source, destination);
      console.log(`✅ Copied ${source} to ${destination}`);
    } else {
      console.log(`⚠️  File ${source} not found, skipping...`);
    }
  } catch (error) {
    console.log(`⚠️  Could not copy ${source}: ${error.message}`);
  }
}

function createDefaultRobots() {
  const robotsContent = `User-agent: *
Allow: /

# Sitemap
Sitemap: https://paymentflow3.onrender.com/sitemap.xml

# Crawl-delay for better server performance
Crawl-delay: 1

# Specific rules for search engines
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /`;

  try {
    fs.writeFileSync(path.join(distPath, 'robots.txt'), robotsContent);
    console.log('✅ Created default robots.txt');
  } catch (error) {
    console.log(`⚠️  Could not create robots.txt: ${error.message}`);
  }
}

function postbuild() {
  console.log('🚀 Running post-build tasks...');
  
  // Copy 404.html
  copyFileIfExists(
    path.join(distPath, 'index.html'),
    path.join(distPath, '404.html')
  );
  
  // Copy robots.txt if it exists, otherwise create a default one
  const robotsSource = path.join(__dirname, '../public/robots.txt');
  if (fs.existsSync(robotsSource)) {
    copyFileIfExists(robotsSource, path.join(distPath, 'robots.txt'));
  } else {
    createDefaultRobots();
  }
  
  // Copy sitemap.xml if it exists
  const sitemapSource = path.join(__dirname, '../public/sitemap.xml');
  copyFileIfExists(sitemapSource, path.join(distPath, 'sitemap.xml'));
  
  // Copy service worker
  copyFileIfExists(
    path.join(__dirname, '../public/sw.js'),
    path.join(distPath, 'sw.js')
  );
  
  // Copy manifest.json
  copyFileIfExists(
    path.join(__dirname, '../public/manifest.json'),
    path.join(distPath, 'manifest.json')
  );
  
  // Copy _redirects file for proper static asset serving
  copyFileIfExists(
    path.join(__dirname, '../public/_redirects'),
    path.join(distPath, '_redirects')
  );
  
  console.log('🎉 Post-build tasks completed!');
}

postbuild();
