export interface DefaultOfferItem {
  name: string;
  description: string;
  offerType: string;
  offerValue: string;
  weight: number;
  sequencePosition: number;
}

export const DEFAULT_OFFERS_LIST: DefaultOfferItem[] = [
  {
    name: 'Free pre wedding shoot.',
    description: 'Complimentary pre-wedding photography shoot session',
    offerType: 'FREE_SERVICE',
    offerValue: 'Pre-wedding Shoot',
    weight: 10,
    sequencePosition: 1,
  },
  {
    name: '25% Discount on all Packages.',
    description: 'Flat 25% discount applicable across all photography packages',
    offerType: 'DISCOUNT_PERCENT',
    offerValue: '25',
    weight: 20,
    sequencePosition: 2,
  },
  {
    name: 'Free mini book album.',
    description: 'Complimentary custom mini book photo album',
    offerType: 'FREE_SERVICE',
    offerValue: 'Mini Book Album',
    weight: 20,
    sequencePosition: 3,
  },
  {
    name: 'Couples Darjeeling tour (on both side Package)',
    description: 'Exclusive couples Darjeeling tour included on both side package',
    offerType: 'FREE_SERVICE',
    offerValue: 'Darjeeling Tour',
    weight: 0,
    sequencePosition: 4,
  },
  {
    name: 'Free wedding content creation.',
    description: 'Complimentary wedding day content creation & reels',
    offerType: 'FREE_SERVICE',
    offerValue: 'Content Creation',
    weight: 20,
    sequencePosition: 5,
  },
  {
    name: '10pcs photo frame.',
    description: 'Complimentary set of 10 premium photo frames',
    offerType: 'FREE_SERVICE',
    offerValue: '10pcs Photo Frame',
    weight: 20,
    sequencePosition: 6,
  },
];
