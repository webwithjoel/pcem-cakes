export const productPrices = {
  dripBirthdayCake: { from: 32000, label: 'From ₦32,000' },
  goldStreakCake: { from: 28000, label: 'From ₦28,000' },
  customCelebrationCake: { from: 15000, label: 'From ₦15,000' },
  engagementPillowCake: { from: 65000, label: 'From ₦65,000' },
  twoTierWeddingCake: { from: 120000, label: 'From ₦120,000' },
  cupcakeBox: { from: 4500, label: 'From ₦4,500' },
  smallChopsTray: { from: 8000, label: 'From ₦8,000' },
  smallChopsPartyBox: { from: 3500, label: '₦3,500 each' },
  meatPieAndPastries: { from: 600, label: 'From ₦600 each' },
  doughnutBox: { from: 3500, label: '₦3,500' },
  trainingCourse: { amount: 150000, label: '₦150,000' },
};

export const cakeSizePrices = {
  '6″': { 1: 15000, 2: 22000 },
  '8″': { 1: 22000, 2: 32000, 3: 45000 },
  '10″': { 2: 45000, 3: 60000 },
  '12″': { 2: 62000, 3: 80000 },
};

export const cakeFlavourPrices = {
  Vanilla: 0,
  Chocolate: 0,
  Marble: 0,
  'Red Velvet': 3000,
  Oreo: 4000,
  'Chocolate Ganache': 4000,
};

export const cakeFinishPrices = {
  'Plain butter icing': 0,
  'Chocolate drip': 5000,
  'Fresh or sugar flowers': 6000,
  'Sugar-craft theme': 12000,
  'Fondant cover': 15000,
};

export const cakeTopperPrices = {
  None: 0,
  'Printed “Happy Birthday” topper': 2500,
  'Acrylic name or age topper': 4000,
};

export const cakeExtraPrices = {
  numberCandles: { price: 1000, maxQty: 4 },
  sparklers: { price: 1500, maxQty: 2 },
  goldCakeBoard: { price: 3000, maxQty: 1 },
};

export const engagementPrices = {
  sizes: { Standard: 65000, Large: 95000 },
  flavours: { Vanilla: 0, Chocolate: 0, Marble: 0, 'Red Velvet': 3000 },
  extras: {
    personalisedNameBoard: { price: 5000, maxQty: 1 },
    goldCakeBoard: { price: 3000, maxQty: 1 },
  },
};

export const weddingPrices = {
  tiers: {
    '2 tier (8″ + 6″)': 120000,
    '2 tier (10″ + 8″)': 170000,
    '3 tier (10″ + 8″ + 6″)': 240000,
  },
  flavourPrices: { Vanilla: 0, Chocolate: 0, Marble: 0, 'Red Velvet': 3000 },
  finishPrices: {
    Buttercream: 0,
    Fondant: 20000,
    'Fresh flowers': 8000,
    'Sugar-craft detail': 12000,
  },
  extras: {
    cakeStandHire: { price: 8000, maxQty: 1 },
    cuttingKnifeAndServerSet: { price: 2500, maxQty: 1 },
    cakeTopper: { price: 4000, maxQty: 1 },
  },
};

export const cupcakePrices = {
  boxSizes: { 6: 4500, 12: 9000 },
  flavours: { Vanilla: 0, Chocolate: 0, 'Red Velvet': 500, Mixed: 0 },
  toppingStyles: {
    Swirl: 0,
    'Sprinkles and pearls': 500,
    'Custom themed topper': 1500,
  },
};

export const doughnutPrices = {
  boxOfSix: 3500,
  flavours: { 'Sugar-glazed': 0, 'Chocolate-glazed': 0 },
};

export const smallChopsTrayPrices = {
  sizes: { Small: 8000, Medium: 15000, Large: 28000 },
  requiredItemCounts: { Small: 3, Medium: 4, Large: 5 },
  extras: {
    pepperedChicken: { price: 3000, maxQty: 3 },
    pepperedGizzard: { price: 3000, maxQty: 3 },
    cucumberAndDip: { price: 1000, maxQty: 2 },
  },
};

export const smallChopsPartyBoxPrice = 3500;

export const pastryPrices = {
  meatPie: 700,
  sausageRoll: 600,
  doughnut: 600,
  minimums: { meatPie: 10, sausageRoll: 10, doughnut: 6 },
};

export const bulkDiscountTiers = {
  'small-chops-party-box': [
    { minimum: 20, rate: 0.05 },
    { minimum: 50, rate: 0.1 },
  ],
  'cupcake-box': [{ minimum: 10, rate: 0.05 }],
  'meat-pie-and-pastries': [{ minimum: 50, rate: 0.05 }],
};

export function getProductPrice(product) {
  const price = productPrices[product.priceKey];
  if (!price) {
    throw new RangeError(`No display price is configured for product "${product.id}".`);
  }
  return price;
}
