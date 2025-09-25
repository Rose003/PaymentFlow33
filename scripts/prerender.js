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
  
  // Remove JavaScript bundles and scripts for better pre-rendering detection
  html = html.replace(/<script type="module" crossorigin src="[^"]*"><\/script>/g, '');
  html = html.replace(/<script>[\s\S]*?window\.addEventListener\([\s\S]*?<\/script>/g, '');
  html = html.replace(/<script>[\s\S]*?window\.chtlConfig[\s\S]*?<\/script>/g, '');
  
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

function generateStaticContent(route) {
  // Generate basic static content for each route
  const contentMap = {
    '/': `
      <div class="min-h-screen bg-gray-50">
        <div class="container mx-auto px-4 py-8">
          <h1 class="text-4xl font-bold text-gray-900 mb-6">PaymentFlow</h1>
          <h2 class="text-2xl font-semibold text-gray-700 mb-4">Gestion des factures et relances</h2>
          <p class="text-lg text-gray-600 mb-6">Solution complète de gestion des factures et relances pour votre entreprise. Automatisez et optimisez vos encaissements, simplifiez le suivi et améliorez votre trésorerie.</p>
          <div class="grid md:grid-cols-3 gap-6">
            <div class="bg-white p-6 rounded-lg shadow">
              <h3 class="text-xl font-semibold mb-3">Gestion des factures</h3>
              <p class="text-gray-600">Créez, suivez et gérez vos factures facilement.</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
              <h3 class="text-xl font-semibold mb-3">Relances automatiques</h3>
              <p class="text-gray-600">Automatisez vos relances clients pour optimiser vos encaissements.</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
              <h3 class="text-xl font-semibold mb-3">Tableaux de bord</h3>
              <p class="text-gray-600">Suivez vos performances avec des tableaux de bord détaillés.</p>
            </div>
          </div>
        </div>
      </div>
    `,
    '/pricing': `
      <div class="min-h-screen bg-gray-50">
        <div class="container mx-auto px-4 py-8">
          <h1 class="text-4xl font-bold text-gray-900 mb-6">Tarifs PaymentFlow</h1>
          <p class="text-lg text-gray-600 mb-8">Choisissez le plan qui correspond à vos besoins</p>
          <div class="grid md:grid-cols-3 gap-6">
            <div class="bg-white p-6 rounded-lg shadow">
              <h3 class="text-xl font-semibold mb-3">Starter</h3>
              <p class="text-3xl font-bold text-blue-600 mb-4">29€/mois</p>
              <ul class="space-y-2 text-gray-600">
                <li>Jusqu'à 100 factures</li>
                <li>Relances automatiques</li>
                <li>Support email</li>
              </ul>
            </div>
            <div class="bg-white p-6 rounded-lg shadow border-2 border-blue-500">
              <h3 class="text-xl font-semibold mb-3">Professional</h3>
              <p class="text-3xl font-bold text-blue-600 mb-4">79€/mois</p>
              <ul class="space-y-2 text-gray-600">
                <li>Factures illimitées</li>
                <li>Relances personnalisées</li>
                <li>Support prioritaire</li>
              </ul>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
              <h3 class="text-xl font-semibold mb-3">Enterprise</h3>
              <p class="text-3xl font-bold text-blue-600 mb-4">Contactez-nous</p>
              <ul class="space-y-2 text-gray-600">
                <li>Fonctionnalités avancées</li>
                <li>Support dédié</li>
                <li>Intégrations personnalisées</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `,
    '/blog': `
      <div class="min-h-screen bg-gray-50">
        <div class="container mx-auto px-4 py-8">
          <h1 class="text-4xl font-bold text-gray-900 mb-6">Blog PaymentFlow</h1>
          <p class="text-lg text-gray-600 mb-8">Conseils et astuces pour optimiser votre gestion des factures</p>
          <div class="grid md:grid-cols-2 gap-6">
            <article class="bg-white p-6 rounded-lg shadow">
              <h2 class="text-xl font-semibold mb-3">Comment optimiser vos relances clients</h2>
              <p class="text-gray-600 mb-4">Découvrez les meilleures pratiques pour améliorer vos taux de recouvrement.</p>
              <a href="/blog-optimisation-relance" class="text-blue-600 hover:underline">Lire la suite</a>
            </article>
            <article class="bg-white p-6 rounded-lg shadow">
              <h2 class="text-xl font-semibold mb-3">Gestion des factures en garage</h2>
              <p class="text-gray-600 mb-4">Conseils spécifiques pour les professionnels de l'automobile.</p>
              <a href="/blog-garage" class="text-blue-600 hover:underline">Lire la suite</a>
            </article>
          </div>
        </div>
      </div>
    `
  };

  return contentMap[route.path] || `
    <div class="min-h-screen bg-gray-50">
      <div class="container mx-auto px-4 py-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-6">${route.title}</h1>
        <p class="text-lg text-gray-600 mb-6">${route.description}</p>
        <div class="bg-white p-6 rounded-lg shadow">
          <p class="text-gray-600">Contenu de la page ${route.path}</p>
        </div>
      </div>
    </div>
  `;
}

function prerender() {
  console.log('🚀 Starting static HTML generation...');
  
  try {
    const mainHTML = readMainIndex();
    console.log('📄 Generating static HTML files...');
    
    for (const route of routes) {
      console.log(`  ⏳ Generating ${route.path}...`);
      
      // Generate HTML with static content
      let html = mainHTML;
      
      // Replace the title and meta tags
      html = html.replace(/<title>.*?<\/title>/, `<title>${route.title}</title>`);
      
      // Add or update meta description
      if (html.includes('<meta name="description"')) {
        html = html.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${route.description}">`);
      } else {
        html = html.replace('<head>', `<head>\n  <meta name="description" content="${route.description}">`);
      }
      
      // Generate static content for the route
      const staticContent = generateStaticContent(route);
      
      // Replace the root div content with static content
      html = html.replace(
        '<div id="root"></div>',
        `<div id="root">${staticContent}</div>`
      );
      
      // Apply SEO optimizations
      html = generateStaticHTML(route, html);
      
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
    console.log('🔍 Each page now has proper meta tags and static content for search engines');
    
  } catch (error) {
    console.error('❌ Error during static generation:', error.message);
    process.exit(1);
  }
}

prerender();
