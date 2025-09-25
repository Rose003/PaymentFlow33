import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Routes to prerender (public routes only)
const routes = [
  { path: '/', title: 'PaymentFlow - Gestion des factures et relances', description: 'Solution complète de gestion des factures et relances pour votre entreprise' },
  { path: '/help', title: 'Aide et Support - PaymentFlow', description: 'Obtenez de l\'aide et du support pour PaymentFlow' },
  { path: '/temoignages', title: 'Témoignages clients - PaymentFlow', description: 'Découvrez les témoignages de nos clients satisfaits' },
  { path: '/subscribe', title: 'Abonnement - PaymentFlow', description: 'Choisissez votre plan d\'abonnement PaymentFlow' },
  { path: '/reporting-recouvrement', title: 'Reporting et Recouvrement - PaymentFlow', description: 'Analysez vos performances de recouvrement avec PaymentFlow' },
  { path: '/crm', title: 'CRM intégré - PaymentFlow', description: 'Gérez vos clients avec notre CRM intégré' },
  { path: '/simulateur-dso', title: 'Simulateur DSO - PaymentFlow', description: 'Simulez votre DSO et optimisez votre trésorerie' },
  { path: '/personnalisation', title: 'Personnalisation - PaymentFlow', description: 'Personnalisez PaymentFlow selon vos besoins' },
  { path: '/signup', title: 'Inscription - PaymentFlow', description: 'Créez votre compte PaymentFlow' },
  { path: '/login', title: 'Connexion - PaymentFlow', description: 'Connectez-vous à votre compte PaymentFlow' },
  { path: '/forgot-password', title: 'Mot de passe oublié - PaymentFlow', description: 'Réinitialisez votre mot de passe PaymentFlow' },
  { path: '/pricing', title: 'Tarifs - PaymentFlow', description: 'Découvrez nos tarifs et plans PaymentFlow' },
  { path: '/privacy', title: 'Politique de confidentialité - PaymentFlow', description: 'Politique de confidentialité de PaymentFlow' },
  { path: '/mentions-legales', title: 'Mentions légales - PaymentFlow', description: 'Mentions légales de PaymentFlow' },
  { path: '/conditions-utilisation', title: 'Conditions d\'utilisation - PaymentFlow', description: 'Conditions d\'utilisation de PaymentFlow' },
  { path: '/blog', title: 'Blog - PaymentFlow', description: 'Articles et conseils sur la gestion des factures' },
  { path: '/blog-garage', title: 'Blog Garage - PaymentFlow', description: 'Conseils pour optimiser la gestion des factures en garage' },
  { path: '/blog-manufacture', title: 'Blog Manufacture - PaymentFlow', description: 'Gestion des factures dans le secteur manufacturier' },
  { path: '/blog-communication', title: 'Blog Communication - PaymentFlow', description: 'Communication efficace avec vos clients' },
  { path: '/blog-comptable-banque', title: 'Blog Comptable Banque - PaymentFlow', description: 'Conseils comptables et bancaires pour les entreprises' },
  { path: '/blog-optimisation-relance', title: 'Optimisation des relances - PaymentFlow', description: 'Optimisez vos processus de relance avec PaymentFlow' },
  { path: '/reset-password', title: 'Réinitialisation mot de passe - PaymentFlow', description: 'Réinitialisez votre mot de passe PaymentFlow' }
];

const distPath = path.join(__dirname, '../dist');

// Read the main index.html file
function readMainIndex() {
  const indexPath = path.join(distPath, 'index.html');
  if (!fs.existsSync(indexPath)) {
    throw new Error('Main index.html not found. Please run build first.');
  }
  return fs.readFileSync(indexPath, 'utf8');
}

// Generate SEO-optimized HTML for each route
function generateStaticHTML(route, mainHTML) {
  const { title, description } = route;
  
  // Replace the title and meta tags
  let html = mainHTML;
  
  // Update title
  html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
  
  // Add or update meta description
  if (html.includes('<meta name="description"')) {
    html = html.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${description}">`);
  } else {
    html = html.replace('<head>', `<head>\n  <meta name="description" content="${description}">`);
  }
  
  // Add comprehensive SEO meta tags
  const seoTags = `
  <!-- SEO Meta Tags -->
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <meta name="googlebot" content="index, follow">
  <meta name="bingbot" content="index, follow">
  <meta name="author" content="PaymentFlow">
  <meta name="keywords" content="gestion factures, relances clients, recouvrement, trésorerie, entreprise, SaaS">
  <meta name="language" content="French">
  <meta name="revisit-after" content="7 days">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://paymentflow.com${route.path}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="https://paymentflow.com/images/paymentflow-og-image.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="PaymentFlow">
  <meta property="og:locale" content="fr_FR">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="https://paymentflow.com${route.path}">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="https://paymentflow.com/images/paymentflow-og-image.jpg">
  <meta name="twitter:site" content="@paymentflow">
  <meta name="twitter:creator" content="@paymentflow">
  
  <!-- Additional SEO -->
  <link rel="canonical" href="https://paymentflow.com${route.path}">
  <meta name="theme-color" content="#2563eb">
  <meta name="msapplication-TileColor" content="#2563eb">
  
  <!-- Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "${title}",
    "description": "${description}",
    "url": "https://paymentflow.com${route.path}",
    "mainEntity": {
      "@type": "Organization",
      "name": "PaymentFlow",
      "url": "https://paymentflow.com",
      "logo": "https://paymentflow.com/images/logo.png",
      "description": "Solution complète de gestion des factures et relances pour votre entreprise"
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Accueil",
          "item": "https://paymentflow.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "${title.replace(' - PaymentFlow', '')}",
          "item": "https://paymentflow.com${route.path}"
        }
      ]
    }
  }
  </script>`;
  
  html = html.replace('</head>', `  ${seoTags}\n</head>`);
  
  return html;
}

function prerender() {
  console.log('🚀 Starting static HTML generation...');
  
  try {
    const mainHTML = readMainIndex();
    console.log('📄 Generating static HTML files...');
    
    for (const route of routes) {
      console.log(`  ⏳ Generating ${route.path}...`);
      
      const html = generateStaticHTML(route, mainHTML);
      
      // Create directory if it doesn't exist
      const routeDir = route.path === '/' ? distPath : path.join(distPath, route.path);
      if (route.path !== '/') {
        fs.mkdirSync(routeDir, { recursive: true });
      }
      
      // Write HTML file
      const htmlPath = route.path === '/' 
        ? path.join(distPath, 'index.html') 
        : path.join(distPath, route.path, 'index.html');
        
      fs.writeFileSync(htmlPath, html);
      
      console.log(`  ✅ Generated ${htmlPath}`);
    }
    
    console.log('🎉 Static HTML generation completed!');
    console.log('📁 Generated SEO-optimized HTML files in dist/ directory');
    console.log('🔍 Each page now has proper meta tags for search engines');
    
  } catch (error) {
    console.error('❌ Error during static generation:', error.message);
    process.exit(1);
  }
}

prerender();
