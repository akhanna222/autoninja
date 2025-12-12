// Script to create the AutoNinja Seller Membership product in Stripe
// Run with: npx tsx scripts/seed-stripe-products.ts

import { getUncachableStripeClient } from '../server/stripeClient';

async function seedProducts() {
  console.log('Creating AutoNinja Seller Membership product...');
  
  const stripe = await getUncachableStripeClient();

  // Check if product already exists
  const existingProducts = await stripe.products.search({
    query: "name:'AutoNinja Annual Seller Membership'"
  });

  if (existingProducts.data.length > 0) {
    console.log('Product already exists:', existingProducts.data[0].id);
    const prices = await stripe.prices.list({ product: existingProducts.data[0].id, active: true });
    console.log('Prices:', prices.data.map(p => ({ id: p.id, amount: p.unit_amount })));
    return;
  }

  // Create the membership product
  const product = await stripe.products.create({
    name: 'AutoNinja Annual Seller Membership',
    description: 'Unlimited car listings for 1 year with verified seller badge, priority placement, and WhatsApp notifications.',
    metadata: {
      type: 'seller_membership',
      duration: '1_year',
    },
  });

  console.log('Created product:', product.id);

  // Create the €9.99/year price
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: 999, // €9.99 in cents
    currency: 'eur',
    recurring: { interval: 'year' },
    metadata: {
      plan: 'annual',
    },
  });

  console.log('Created price:', price.id);
  console.log('');
  console.log('✅ Product created successfully!');
  console.log('Price ID to use in checkout:', price.id);
}

seedProducts().catch(console.error);
