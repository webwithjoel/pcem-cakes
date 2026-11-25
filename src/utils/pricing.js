import { deliveryFees } from '../data/delivery.js';
import {
  bulkDiscountTiers,
  cakeExtraPrices,
  cakeFinishPrices,
  cakeFlavourPrices,
  cakeSizePrices,
  cakeTopperPrices,
  cupcakePrices,
  doughnutPrices,
  engagementPrices,
  pastryPrices,
  smallChopsPartyBoxPrice,
  smallChopsTrayPrices,
  weddingPrices,
} from '../data/prices.js';
import { products } from '../data/products.js';

const productIds = new Set(products.map(({ id }) => id));
const cakeProductIds = new Set([
  'drip-birthday-cake',
  'gold-streak-cake',
  'custom-celebration-cake',
]);
const smallChopsDefaultItems = ['Puff-puff', 'Samosa', 'Spring roll', 'Sausage roll', 'Puff-puff'];
const pastryKeys = {
  meatPie: 'meatPie',
  'Meat Pie': 'meatPie',
  sausageRoll: 'sausageRoll',
  'Sausage roll': 'sausageRoll',
  doughnut: 'doughnut',
  Doughnut: 'doughnut',
};

function assertProductId(productId) {
  if (!productIds.has(productId)) {
    throw new RangeError(`Unknown product "${productId}".`);
  }
}

function positiveInteger(value, label) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1) {
    throw new RangeError(`${label} must be a positive whole number.`);
  }
  return number;
}

function nonNegativeInteger(value, label) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0) {
    throw new RangeError(`${label} must be a non-negative whole number.`);
  }
  return number;
}

function normalizeSize(size) {
  return String(size).replaceAll('"', '″');
}

function selectedList(value, fallback = []) {
  if (value === undefined || value === null || value === '') return fallback;
  return Array.isArray(value) ? value : [value];
}

function sumOptionPrices(values, priceTable, label) {
  return values.reduce((total, value) => {
    if (!Object.hasOwn(priceTable, value)) {
      throw new RangeError(`Unknown ${label} "${value}".`);
    }
    return total + priceTable[value];
  }, 0);
}

function extrasTotal(extras = {}, priceTable, label) {
  if (!extras || typeof extras !== 'object' || Array.isArray(extras)) {
    throw new TypeError(`${label} must be an object of option quantities.`);
  }

  return Object.entries(extras).reduce((total, [key, rawQuantity]) => {
    const option = priceTable[key];
    if (!option) {
      throw new RangeError(`Unknown ${label} option "${key}".`);
    }
    const quantity = nonNegativeInteger(rawQuantity, `${key} quantity`);
    if (quantity > option.maxQty) {
      throw new RangeError(`${key} cannot exceed ${option.maxQty}.`);
    }
    return total + option.price * quantity;
  }, 0);
}

function cakePrice(productId, options) {
  const size = normalizeSize(options.size ?? '6″');
  const layers = positiveInteger(options.layers ?? 1, 'Cake layers');
  const sizePrices = cakeSizePrices[size];
  if (!sizePrices || !Object.hasOwn(sizePrices, layers)) {
    throw new RangeError(`${size} cakes are not available with ${layers} layer(s).`);
  }

  const flavours = selectedList(options.flavours ?? options.flavour, ['Vanilla']);
  const maxFlavours = layers > 1 ? 2 : 1;
  if (flavours.length > maxFlavours) {
    throw new RangeError(`Choose no more than ${maxFlavours} flavour(s) for this cake.`);
  }

  const finish = options.finish ?? 'Plain butter icing';
  if (!Object.hasOwn(cakeFinishPrices, finish)) {
    throw new RangeError(`Unknown cake finish "${finish}".`);
  }
  const topper = options.topper ?? 'None';
  if (!Object.hasOwn(cakeTopperPrices, topper)) {
    throw new RangeError(`Unknown cake topper "${topper}".`);
  }

  const unitPrice =
    sizePrices[layers] +
    sumOptionPrices(flavours, cakeFlavourPrices, 'cake flavour') +
    cakeFinishPrices[finish] +
    cakeTopperPrices[topper] +
    extrasTotal(options.extras, cakeExtraPrices, 'cake extra');

  return unitPrice;
}

function engagementPillowPrice(options) {
  const size = options.size ?? 'Standard';
  const flavour = options.flavour ?? 'Vanilla';
  if (!Object.hasOwn(engagementPrices.sizes, size)) {
    throw new RangeError(`Unknown engagement cake size "${size}".`);
  }
  if (!Object.hasOwn(engagementPrices.flavours, flavour)) {
    throw new RangeError(`Unknown engagement cake flavour "${flavour}".`);
  }

  return (
    engagementPrices.sizes[size] +
    engagementPrices.flavours[flavour] +
    extrasTotal(options.extras, engagementPrices.extras, 'engagement cake extra')
  );
}

function weddingCakePrice(options) {
  const tiers = options.tiers ?? '2 tier (8″ + 6″)';
  if (!Object.hasOwn(weddingPrices.tiers, tiers)) {
    throw new RangeError(`Unknown wedding cake tier selection "${tiers}".`);
  }

  const tierCount = tiers.startsWith('3 tier') ? 3 : 2;
  const flavours = selectedList(options.flavours ?? options.tierFlavours);
  if (flavours.length > 0 && flavours.length !== tierCount) {
    throw new RangeError(`Choose one flavour for each of the ${tierCount} wedding cake tiers.`);
  }
  const selectedFinishes = selectedList(options.finishes ?? options.finish, ['Buttercream']);

  return (
    weddingPrices.tiers[tiers] +
    sumOptionPrices(
      flavours.length > 0 ? flavours : Array(tierCount).fill('Vanilla'),
      weddingPrices.flavourPrices,
      'wedding cake flavour',
    ) +
    sumOptionPrices(selectedFinishes, weddingPrices.finishPrices, 'wedding cake finish') +
    extrasTotal(options.extras, weddingPrices.extras, 'wedding cake extra')
  );
}

function cupcakeBoxPrice(options) {
  const rawBoxSize = options.boxSize ?? options.size ?? 6;
  const boxSize = Number(String(rawBoxSize).match(/\d+/)?.[0]);
  if (!Object.hasOwn(cupcakePrices.boxSizes, boxSize)) {
    throw new RangeError(`Cupcake boxes of ${rawBoxSize} are not available.`);
  }

  const flavour = options.flavour ?? 'Vanilla';
  const toppingStyle = options.toppingStyle ?? 'Swirl';
  if (!Object.hasOwn(cupcakePrices.flavours, flavour)) {
    throw new RangeError(`Unknown cupcake flavour "${flavour}".`);
  }
  if (!Object.hasOwn(cupcakePrices.toppingStyles, toppingStyle)) {
    throw new RangeError(`Unknown cupcake topping style "${toppingStyle}".`);
  }

  return (
    cupcakePrices.boxSizes[boxSize] +
    cupcakePrices.flavours[flavour] +
    cupcakePrices.toppingStyles[toppingStyle]
  );
}

function smallChopsTrayPrice(options) {
  const size = options.size ?? 'Small';
  if (!Object.hasOwn(smallChopsTrayPrices.sizes, size)) {
    throw new RangeError(`Unknown small chops tray size "${size}".`);
  }

  const requiredCount = smallChopsTrayPrices.requiredItemCounts[size];
  const defaultItems = smallChopsDefaultItems.slice(0, requiredCount);
  const items = selectedList(options.items, defaultItems);
  if (items.length !== requiredCount) {
    throw new RangeError(`${size} trays require exactly ${requiredCount} small chops items.`);
  }
  const allowedItems = new Set(['Puff-puff', 'Samosa', 'Spring roll', 'Sausage roll']);
  for (const item of items) {
    if (!allowedItems.has(item)) {
      throw new RangeError(`Unknown small chops item "${item}".`);
    }
  }

  return (
    smallChopsTrayPrices.sizes[size] +
    extrasTotal(options.extras, smallChopsTrayPrices.extras, 'small chops extra')
  );
}

function pastryLinePrice(options, quantity) {
  const items = options.items ?? {
    [pastryKeys[options.itemType ?? 'Meat Pie'] ?? 'meatPie']: quantity,
  };
  if (!items || typeof items !== 'object' || Array.isArray(items)) {
    throw new TypeError('Pastry item quantities must be provided as an object.');
  }

  return Object.entries(items).reduce((total, [rawType, rawQuantity]) => {
    const type = pastryKeys[rawType];
    if (!type) {
      throw new RangeError(`Unknown pastry type "${rawType}".`);
    }
    const itemQuantity = nonNegativeInteger(rawQuantity, `${rawType} quantity`);
    if (itemQuantity > 0 && itemQuantity < pastryPrices.minimums[type]) {
      throw new RangeError(`${rawType} orders require at least ${pastryPrices.minimums[type]} pieces.`);
    }
    return total + itemQuantity * pastryPrices[type] * quantity;
  }, 0);
}

export function priceFor(productId, options = {}, quantity = 1) {
  assertProductId(productId);
  const count = positiveInteger(quantity, 'Quantity');
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    throw new TypeError('Product options must be an object.');
  }

  if (cakeProductIds.has(productId)) return cakePrice(productId, options) * count;
  if (productId === 'engagement-pillow-cake') return engagementPillowPrice(options) * count;
  if (productId === 'two-tier-wedding-cake') return weddingCakePrice(options) * count;
  if (productId === 'cupcake-box') return cupcakeBoxPrice(options) * count;
  if (productId === 'small-chops-tray') return smallChopsTrayPrice(options) * count;
  if (productId === 'small-chops-party-box') {
    if (count < 10) throw new RangeError('Small Chops Party Boxes require a minimum order of 10.');
    return smallChopsPartyBoxPrice * count;
  }
  if (productId === 'meat-pie-and-pastries') return pastryLinePrice(options, count);
  if (productId === 'doughnut-box') {
    const flavour = options.flavour ?? 'Sugar-glazed';
    if (!Object.hasOwn(doughnutPrices.flavours, flavour)) {
      throw new RangeError(`Unknown doughnut flavour "${flavour}".`);
    }
    return doughnutPrices.boxOfSix * count;
  }

  throw new RangeError(`No pricing rule is configured for product "${productId}".`);
}

export function bulkQuantityFor(productId, options, quantity) {
  assertProductId(productId);
  const count = positiveInteger(quantity, 'Quantity');
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    throw new TypeError('Product options must be an object.');
  }
  if (productId !== 'meat-pie-and-pastries' || !options.items) return count;
  return Object.values(options.items).reduce(
    (total, itemQuantity) => total + nonNegativeInteger(itemQuantity, 'Pastry quantity'),
    0,
  ) * count;
}

export function bulkDiscount(productId, quantity, subtotal) {
  assertProductId(productId);
  const count = positiveInteger(quantity, 'Bulk discount quantity');
  if (!Number.isFinite(subtotal) || subtotal < 0) {
    throw new RangeError('Bulk discount subtotal must be a non-negative amount.');
  }

  const tiers = bulkDiscountTiers[productId] ?? [];
  const activeTier = [...tiers].reverse().find((tier) => count >= tier.minimum);
  const nextTier = tiers.find((tier) => count < tier.minimum);
  const rate = activeTier?.rate ?? 0;
  const amount = Math.round(subtotal * rate);

  return {
    rate,
    amount,
    threshold: activeTier?.minimum ?? null,
    nextThreshold: nextTier?.minimum ?? null,
    moreToNext: nextTier ? nextTier.minimum - count : 0,
    hint: nextTier
      ? `Add ${nextTier.minimum - count} more to save ${Math.round(nextTier.rate * 100)}%.`
      : null,
  };
}

function hasWeddingOrTieredCake(items) {
  return items.some((item) => {
    const productId = typeof item === 'string' ? item : item.productId ?? item.id;
    const product = products.find((entry) => entry.id === productId);
    return (
      product?.category === 'wedding' ||
      productId === 'two-tier-wedding-cake' ||
      item?.isTieredCake === true ||
      Boolean(item?.options?.tiers)
    );
  });
}

export function deliveryFor(city, options = {}) {
  if (!Object.hasOwn(deliveryFees, city)) {
    throw new RangeError(`Delivery is not configured for "${city}".`);
  }

  const method = options.method ?? options.deliveryType ?? 'delivery';
  const isPickup = method === 'pickup' || method === 'Pickup at Owode, Ede';
  if (!isPickup && method !== 'delivery' && method !== 'Delivery to my door') {
    throw new RangeError(`Unknown delivery method "${method}".`);
  }
  if (isPickup) {
    return {
      city,
      method: 'pickup',
      baseFee: 0,
      surcharge: 0,
      fee: 0,
      estimated: false,
      label: 'Pickup at Owode, Ede',
    };
  }

  const items = options.items ?? [];
  const hasWeddingCake =
    options.hasWeddingOrTieredCake === true || hasWeddingOrTieredCake(items);
  const guests = Number(options.guests ?? 0);
  if (!Number.isFinite(guests) || guests < 0) {
    throw new RangeError('Guest count must be a non-negative number.');
  }
  const surcharge = guests >= 100 || hasWeddingCake ? 3000 : 0;
  const baseFee = deliveryFees[city];
  const fee = baseFee + surcharge;

  return {
    city,
    method: 'delivery',
    baseFee,
    surcharge,
    fee,
    estimated: true,
    label:
      city === 'Other'
        ? 'Estimated, to be confirmed on WhatsApp'
        : `Estimated delivery to ${city}`,
  };
}

export function cartTotals(lines, deliveries = {}) {
  if (!Array.isArray(lines)) {
    throw new TypeError('Cart lines must be an array.');
  }

  const lineTotals = lines.map((line) => {
    const productId = line.productId ?? line.id;
    const quantity = positiveInteger(line.quantity ?? 1, 'Quantity');
    const options = line.options ?? {};
    const subtotal = priceFor(productId, options, quantity);
    const discountQuantity = bulkQuantityFor(productId, options, quantity);
    const discount = bulkDiscount(productId, discountQuantity, subtotal);
    return {
      productId,
      quantity,
      groupId: line.groupId ?? line.eventId ?? 'personal',
      subtotal,
      discount: discount.amount,
      total: subtotal - discount.amount,
      bulk: discount,
    };
  });

  const groupIds = [...new Set(lineTotals.map((line) => line.groupId))];
  const deliveryGroups = groupIds.flatMap((groupId) => {
    const selection = deliveries[groupId];
    if (!selection) return [];

    const groupLines = lineTotals.filter((line) => line.groupId === groupId);
    const sourceLines = lines.filter(
      (line) => (line.groupId ?? line.eventId ?? 'personal') === groupId,
    );
    const result = deliveryFor(selection.city, {
      ...selection,
      items: sourceLines.map((line) => ({
        productId: line.productId ?? line.id,
        options: line.options,
      })),
    });
    return [{ groupId, ...result, guests: selection.guests ?? 0, itemCount: groupLines.length }];
  });

  const subtotal = lineTotals.reduce((total, line) => total + line.subtotal, 0);
  const discount = lineTotals.reduce((total, line) => total + line.discount, 0);
  const delivery = deliveryGroups.reduce((total, group) => total + group.fee, 0);
  const total = subtotal - discount + delivery;
  const estimated =
    deliveryGroups.some((group) => group.estimated) ||
    lineTotals.some((line) => line.groupId !== 'personal');

  return {
    subtotal,
    discount,
    delivery,
    total,
    estimatedTotal: total,
    estimated,
    lines: lineTotals,
    deliveryGroups,
  };
}
