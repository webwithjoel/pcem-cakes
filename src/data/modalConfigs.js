import {
  cakeExtraPrices,
  cakeFinishPrices,
  cakeFlavourPrices,
  cakeSizePrices,
  cakeTopperPrices,
  cupcakePrices,
  doughnutPrices,
  engagementPrices,
  pastryPrices,
  smallChopsTrayPrices,
  weddingPrices,
} from './prices.js';

const choices = (prices) =>
  Object.entries(prices).map(([value, price]) => ({ value, label: value, price }));

const cakeSizeChoices = Object.entries(cakeSizePrices).map(([value, layers]) => ({
  value,
  label: value,
  price: Math.min(...Object.values(layers)),
}));

const cakeLayerChoices = [
  { value: 1, label: '1 layer', price: 0 },
  { value: 2, label: '2 layers', price: 0 },
  { value: 3, label: '3 layers', price: 0 },
];

const cakeExtraChoices = Object.entries(cakeExtraPrices).map(([value, option]) => ({
  value,
  label: value === 'numberCandles' ? 'Number candles' : value === 'goldCakeBoard' ? 'Gold cake board' : 'Sparklers',
  price: option.price,
  maxQty: option.maxQty,
}));

const engagementExtraChoices = Object.entries(engagementPrices.extras).map(([value, option]) => ({
  value,
  label: value === 'goldCakeBoard' ? 'Gold cake board' : 'Personalised name board',
  price: option.price,
  maxQty: option.maxQty,
}));

const weddingExtraChoices = Object.entries(weddingPrices.extras).map(([value, option]) => ({
  value,
  label:
    value === 'cakeStandHire'
      ? 'Cake stand hire'
      : value === 'cakeTopper'
        ? 'Cake topper'
        : 'Cutting knife and server set',
  price: option.price,
  maxQty: option.maxQty,
}));

const trayExtraChoices = Object.entries(smallChopsTrayPrices.extras).map(([value, option]) => ({
  value,
  label:
    value === 'pepperedChicken'
      ? 'Peppered chicken'
      : value === 'pepperedGizzard'
        ? 'Peppered gizzard'
        : 'Extra cucumber and dip',
  price: option.price,
  maxQty: option.maxQty,
}));

const dateField = (leadTimeDays, hint) => ({
  name: 'neededDate',
  type: 'date',
  label: 'Date and time needed',
  hint,
  leadTimeDays,
  includeTime: true,
});

const notesField = {
  name: 'notes',
  type: 'textarea',
  label: 'Notes',
  hint: 'Share any other details that will help us prepare your order.',
};

const cakeFields = (leadTimeDays) => [
  {
    name: 'size',
    type: 'select',
    label: 'Cake size',
    hint: 'Choose a size to suit your celebration.',
    options: cakeSizeChoices,
  },
  {
    name: 'layers',
    type: 'select',
    label: 'Layers',
    hint: 'Available sizes and layers affect the cake base price.',
    options: cakeLayerChoices,
  },
  {
    name: 'flavours',
    type: 'multiChips',
    label: 'Flavour',
    hint: 'Choose one flavour, or up to two for a multi-layer cake.',
    options: choices(cakeFlavourPrices),
    maxSelectedBy: { field: 'layers', above: 1, value: 2, otherwise: 1 },
  },
  {
    name: 'finish',
    type: 'chips',
    label: 'Finish',
    hint: 'Choose the finish for your cake.',
    options: choices(cakeFinishPrices),
    supportingImages: {
      'Plain butter icing': '/images/cake-gold-streak.jpg',
      'Chocolate drip': '/images/cake-handbag-drip.jpg',
      'Fresh or sugar flowers': '/images/cake-pillow-bible.jpg',
      'Sugar-craft theme': '/images/cake-handbag-drip.jpg',
      'Fondant cover': '/images/cake-pillow-bible.jpg',
    },
    supportingCaption: 'A reference for the finish you select.',
  },
  {
    name: 'topper',
    type: 'chips',
    label: 'Topper',
    hint: 'Choose a topper or leave the cake without one.',
    options: choices(cakeTopperPrices),
    supportingImages: {
      'Printed “Happy Birthday” topper': '/images/cake-gold-streak.jpg',
      'Acrylic name or age topper': '/images/cake-handbag-drip.jpg',
    },
    supportingCaption: 'A reference for your cake topper.',
  },
  {
    name: 'extras',
    type: 'counter',
    label: 'Extras',
    hint: 'Optional finishing touches; quantity limits apply.',
    options: cakeExtraChoices,
  },
  {
    name: 'textOnCake',
    type: 'text',
    label: 'Text on cake',
    hint: 'Name or short message, max 30 characters.',
    maxLength: 30,
  },
  {
    name: 'colourTheme',
    type: 'text',
    label: 'Colour theme',
    hint: 'For example, pink and gold.',
  },
  {
    name: 'inspirationPhoto',
    type: 'file',
    label: 'Inspiration photo',
    hint: 'Add an image for reference. A small thumbnail is saved with the order.',
  },
  dateField(leadTimeDays, `Cakes need at least ${leadTimeDays} days’ notice.`),
  notesField,
];

export const modalConfigs = {
  'drip-birthday-cake': {
    leadTimeDays: 3,
    defaultQuantity: 1,
    defaultOptions: {
      size: '8″',
      layers: 2,
      flavours: ['Vanilla'],
      finish: 'Chocolate drip',
      topper: 'None',
      extras: { numberCandles: 0, sparklers: 0, goldCakeBoard: 0 },
      textOnCake: '',
      colourTheme: '',
      neededDate: '',
      notes: '',
    },
    fields: cakeFields(3),
  },
  'gold-streak-cake': {
    leadTimeDays: 3,
    defaultQuantity: 1,
    defaultOptions: {
      size: '8″',
      layers: 2,
      flavours: ['Vanilla'],
      finish: 'Plain butter icing',
      topper: 'Printed “Happy Birthday” topper',
      extras: { numberCandles: 0, sparklers: 0, goldCakeBoard: 0 },
      textOnCake: '',
      colourTheme: '',
      neededDate: '',
      notes: '',
    },
    fields: cakeFields(3),
  },
  'custom-celebration-cake': {
    leadTimeDays: 3,
    defaultQuantity: 1,
    defaultOptions: {
      size: '6″',
      layers: 1,
      flavours: ['Vanilla'],
      finish: 'Plain butter icing',
      topper: 'None',
      extras: { numberCandles: 0, sparklers: 0, goldCakeBoard: 0 },
      textOnCake: '',
      colourTheme: '',
      neededDate: '',
      notes: '',
    },
    fields: cakeFields(3),
  },
  'engagement-pillow-cake': {
    leadTimeDays: 7,
    defaultQuantity: 1,
    defaultOptions: {
      size: 'Standard',
      flavour: 'Vanilla',
      trimColour: 'Red and gold',
      extras: { personalisedNameBoard: 0, goldCakeBoard: 0 },
      neededDate: '',
      notes: '',
    },
    fields: [
      {
        name: 'size',
        type: 'chips',
        label: 'Size',
        hint: 'Choose standard or large.',
        options: choices(engagementPrices.sizes),
      },
      {
        name: 'flavour',
        type: 'chips',
        label: 'Flavour',
        hint: 'Red velvet is an additional ₦3,000.',
        options: choices(engagementPrices.flavours),
      },
      {
        name: 'trimColour',
        type: 'select',
        label: 'Colour of beads and trim',
        hint: 'Choose a traditional colour pairing or tell us your preference.',
        options: [
          'Red and gold',
          'Coral and gold',
          'Royal blue and gold',
          'Custom',
        ].map((value) => ({ value, label: value, price: 0 })),
      },
      {
        name: 'extras',
        type: 'counter',
        label: 'Add-ons',
        hint: 'Optional boards; quantity limits apply.',
        options: engagementExtraChoices,
      },
      dateField(7, 'Wedding and engagement cakes need at least 7 days’ notice.'),
      notesField,
    ],
  },
  'two-tier-wedding-cake': {
    leadTimeDays: 7,
    requiresEvent: true,
    defaultQuantity: 1,
    defaultOptions: {
      tiers: '2 tier (8″ + 6″)',
      tierFlavours: ['Vanilla', 'Vanilla'],
      finishes: ['Buttercream'],
      extras: { cakeStandHire: 0, cuttingKnifeAndServerSet: 0, cakeTopper: 0 },
      neededDate: '',
      notes: '',
    },
    fields: [
      {
        name: 'tiers',
        type: 'select',
        label: 'Tiers',
        hint: 'Choose a tier size and configuration.',
        options: choices(weddingPrices.tiers),
      },
      {
        name: 'tierFlavours',
        type: 'select',
        label: 'Flavour per tier',
        hint: 'Choose one flavour for each tier. Red velvet adds ₦3,000 per tier.',
        options: choices(weddingPrices.flavourPrices),
        perTier: true,
      },
      {
        name: 'finishes',
        type: 'multiChips',
        label: 'Finish',
        hint: 'Choose buttercream, fondant, flowers or sugar-craft details.',
        options: choices(weddingPrices.finishPrices),
        supportingImage: '/images/cake-handbag-drip.jpg',
        supportingCaption: 'A cake design reference for your wedding finish.',
      },
      {
        name: 'extras',
        type: 'counter',
        label: 'Extras',
        hint: 'Optional accessories for your celebration.',
        options: weddingExtraChoices,
      },
      dateField(7, 'Wedding cakes need at least 7 days’ notice.'),
      notesField,
    ],
  },
  'cupcake-box': {
    leadTimeDays: 2,
    defaultQuantity: 1,
    defaultOptions: {
      boxSize: 6,
      flavour: 'Vanilla',
      colourTheme: '',
      toppingStyle: 'Swirl',
      neededDate: '',
      notes: '',
    },
    fields: [
      {
        name: 'boxSize',
        type: 'chips',
        label: 'Box size',
        hint: 'Choose a box of 6 or 12 cupcakes.',
        options: choices(cupcakePrices.boxSizes).map((option) => ({
          ...option,
          label: `Box of ${option.value}`,
        })),
      },
      {
        name: 'flavour',
        type: 'chips',
        label: 'Flavour',
        hint: 'Red velvet adds ₦500 per box.',
        options: choices(cupcakePrices.flavours),
      },
      {
        name: 'colourTheme',
        type: 'text',
        label: 'Colour theme',
        hint: 'For example, pink and gold.',
      },
      {
        name: 'toppingStyle',
        type: 'chips',
        label: 'Topping style',
        hint: 'Sprinkles and pearls add ₦500; a themed topper adds ₦1,500 per box.',
        options: choices(cupcakePrices.toppingStyles),
      },
      dateField(2, 'Cupcakes need at least 48 hours’ notice.'),
      notesField,
    ],
  },
  'small-chops-tray': {
    leadTimeDays: 1,
    defaultQuantity: 1,
    defaultOptions: {
      size: 'Small',
      items: ['Puff-puff', 'Samosa', 'Spring roll'],
      extras: { pepperedChicken: 0, pepperedGizzard: 0, cucumberAndDip: 0 },
      neededDate: '',
      notes: '',
    },
    fields: [
      {
        name: 'size',
        type: 'chips',
        label: 'Tray size',
        hint: 'Small serves about 3 to 4, medium 5 to 8, large 12 to 15.',
        options: choices(smallChopsTrayPrices.sizes),
      },
      {
        name: 'items',
        type: 'multiChips',
        label: 'Choose the small chops',
        hint: 'Select the number of items required for your tray size.',
        options: ['Puff-puff', 'Samosa', 'Spring roll', 'Sausage roll'].map((value) => ({
          value,
          label: value,
          price: 0,
        })),
        maxSelectedBy: { field: 'size', values: { Small: 3, Medium: 4, Large: 5 } },
      },
      {
        name: 'extras',
        type: 'counter',
        label: 'Add-ons',
        hint: 'Peppered chicken or gizzard adds ₦3,000 per tray; cucumber and dip adds ₦1,000.',
        options: trayExtraChoices,
      },
      dateField(1, 'Small chops need at least 24 hours’ notice.'),
      notesField,
    ],
  },
  'small-chops-party-box': {
    leadTimeDays: 1,
    defaultQuantity: 10,
    minimumQuantity: 10,
    defaultOptions: {
      mix: 'Classic',
      notes: '',
    },
    fields: [
      {
        name: 'mix',
        type: 'segmented',
        label: 'Mix',
        hint: 'Choose a classic mix or include sausage roll.',
        options: [
          { value: 'Classic', label: 'Classic', price: 0 },
          { value: 'With sausage roll', label: 'With sausage roll', price: 0 },
        ],
      },
      dateField(1, 'Small chops need at least 24 hours’ notice.'),
      notesField,
    ],
  },
  'meat-pie-and-pastries': {
    leadTimeDays: 1,
    defaultQuantity: 10,
    minimumQuantity: 10,
    minimumQuantityByItem: { 'Meat Pie': 10, 'Sausage roll': 10, Doughnut: 6 },
    defaultOptions: { itemType: 'Meat Pie', notes: '' },
    fields: [
      {
        name: 'itemType',
        type: 'select',
        label: 'Pastry type',
        hint: 'Choose one pastry type for this order.',
        options: [
          { value: 'Meat Pie', label: 'Meat pie', price: pastryPrices.meatPie },
          { value: 'Sausage roll', label: 'Sausage roll', price: pastryPrices.sausageRoll },
          { value: 'Doughnut', label: 'Doughnut', price: pastryPrices.doughnut },
        ],
      },
      dateField(1, 'Pastries need at least 24 hours’ notice.'),
      notesField,
    ],
  },
  'doughnut-box': {
    leadTimeDays: 1,
    defaultQuantity: 1,
    defaultOptions: { flavour: 'Sugar-glazed', notes: '' },
    fields: [
      {
        name: 'flavour',
        type: 'chips',
        label: 'Glaze',
        hint: 'Choose one flavour for each box.',
        options: choices(doughnutPrices.flavours),
      },
      dateField(1, 'Pastries need at least 24 hours’ notice.'),
      notesField,
    ],
  },
};
