import assert from 'node:assert/strict';
import test from 'node:test';
import { deliveryFor, bulkDiscount, cartTotals, priceFor } from './pricing.js';
import { formatNaira } from './format.js';

test('worked example 1: cake options, candle add-on, and Ede delivery', () => {
  const options = {
    size: '8″',
    layers: 2,
    flavours: ['Red Velvet'],
    finish: 'Chocolate drip',
    topper: 'Printed “Happy Birthday” topper',
  };

  assert.equal(priceFor('drip-birthday-cake', options), 42500);
  assert.equal(
    priceFor('drip-birthday-cake', {
      ...options,
      extras: { numberCandles: 1 },
    }),
    43500,
  );
  assert.equal(deliveryFor('Ede').fee, 2000);
  assert.equal(
    cartTotals(
      [
        {
          productId: 'drip-birthday-cake',
          options: { ...options, extras: { numberCandles: 1 } },
          quantity: 1,
        },
      ],
      { personal: { city: 'Ede', method: 'delivery' } },
    ).estimatedTotal,
    45500,
  );
});

test('worked example 2: 12 red velvet cupcakes with swirl topping', () => {
  assert.equal(
    priceFor(
      'cupcake-box',
      { boxSize: 12, flavour: 'Red Velvet', toppingStyle: 'Swirl' },
      1,
    ),
    9500,
  );
});

test('worked example 3: medium small chops tray with peppered chicken', () => {
  assert.equal(
    priceFor(
      'small-chops-tray',
      {
        size: 'Medium',
        items: ['Puff-puff', 'Samosa', 'Spring roll', 'Sausage roll'],
        extras: { pepperedChicken: 1 },
      },
      1,
    ),
    18000,
  );
});

test('worked example 4: 20 party boxes receive the 5% bulk discount', () => {
  const totals = cartTotals([
    { productId: 'small-chops-party-box', quantity: 20 },
  ]);

  assert.equal(totals.subtotal, 70000);
  assert.equal(totals.discount, 3500);
  assert.equal(totals.estimatedTotal, 66500);
});

test('worked example 5: wedding cake with Osogbo event delivery', () => {
  const options = {
    tiers: '2 tier (10″ + 8″)',
    flavours: ['Vanilla', 'Chocolate'],
    finishes: ['Fondant', 'Fresh flowers'],
  };
  const totals = cartTotals(
    [{ productId: 'two-tier-wedding-cake', options, quantity: 1, eventId: 'wedding' }],
    { wedding: { city: 'Osogbo', method: 'delivery', guests: 150 } },
  );

  assert.equal(priceFor('two-tier-wedding-cake', options), 198000);
  assert.equal(totals.delivery, 7500);
  assert.equal(totals.estimatedTotal, 205500);
  assert.equal(totals.estimated, true);
});

test('bulk discount hints show how many units remain to the next tier', () => {
  assert.deepEqual(bulkDiscount('cupcake-box', 9, 40500), {
    rate: 0,
    amount: 0,
    threshold: null,
    nextThreshold: 10,
    moreToNext: 1,
    hint: 'Add 1 more to save 5%.',
  });
  assert.equal(bulkDiscount('small-chops-party-box', 50, 175000).rate, 0.1);
});

test('50 mixed pastries receive the 5% bulk discount', () => {
  const totals = cartTotals([
    {
      productId: 'meat-pie-and-pastries',
      quantity: 1,
      options: { items: { meatPie: 20, sausageRoll: 20, doughnut: 10 } },
    },
  ]);

  assert.equal(totals.subtotal, 32000);
  assert.equal(totals.discount, 1600);
  assert.equal(totals.estimatedTotal, 30400);
});

test('delivery fees support pickup and an unquoted Other city', () => {
  assert.equal(deliveryFor('Ede', { method: 'pickup', guests: 150 }).fee, 0);
  assert.deepEqual(deliveryFor('Other'), {
    city: 'Other',
    method: 'delivery',
    baseFee: 0,
    surcharge: 0,
    fee: 0,
    estimated: true,
    label: 'Estimated, to be confirmed on WhatsApp',
  });
});

test('Naira formatting uses the expected symbol and grouping', () => {
  assert.equal(formatNaira(22000), '₦22,000');
});

test('invalid cake combinations and undersized party box orders are rejected', () => {
  assert.throws(
    () => priceFor('drip-birthday-cake', { size: '6″', layers: 3 }),
    /not available/,
  );
  assert.throws(
    () => priceFor('small-chops-party-box', {}, 9),
    /minimum order of 10/,
  );
});
