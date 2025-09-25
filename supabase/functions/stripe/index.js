// index.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_your_test_key_here'); // Use environment variable

const productId = 'prod_SLwxDxY64f3V8I';

async function listPricesForProduct(productId) {
  try {
    const prices = await stripe.prices.list({
      product: productId,
      limit: 100,
    });

    if (prices.data.length === 0) {
      console.log('Aucun price_id trouvé pour ce produit.');
      return;
    }

    prices.data.forEach(price => {
      console.log(`Price ID : ${price.id}`);
      console.log(`  Montant : ${price.unit_amount} ${price.currency.toUpperCase()}`);
      console.log(`  Récurrent : ${price.recurring ? 'Oui' : 'Non'}`);
      console.log('---');
    });
  } catch (error) {
    console.error('Erreur :', error.message);
  }
}

listPricesForProduct(productId);
