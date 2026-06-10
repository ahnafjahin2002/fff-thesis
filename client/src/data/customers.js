// ─── Customer Characters for Phase 3 ─────────────────────────────────────────
// Each customer has a name, emoji representation, expressions, and preferred products.

import imgDadu from '../assets/customer-dadu.png';
import imgGirl from '../assets/customer-girl.png';
import imgMa from '../assets/customer-ma.png';
import imgRiksha from '../assets/customer-riksha.png';
export const CUSTOMERS = [
  {
    id: 'dadu',
    name: 'দাদু',
    emoji: '👴',
    image: imgDadu,
    color: '#8B6914',
    expressions: {
      happy: '😊',
      curious: '🤔',
      grateful: '🙏',
    },
    greeting: 'আস্‌সালামু আলাইকুম! আমি একটু কিছু কিনতে চাই।',
    farewell: 'অনেক ধন্যবাদ বাবা, আবার আসব!',
    preferredProducts: ['milk', 'tea', 'bread'],
  },
  {
    id: 'girl',
    name: 'মিতু',
    emoji: '👧',
    image: imgGirl,
    color: '#E91E63',
    expressions: {
      happy: '😄',
      curious: '😯',
      grateful: '🥰',
    },
    greeting: 'দোকানদার ভাইয়া! আমি একটা জিনিস চাই!',
    farewell: 'ধন্যবাদ ভাইয়া! আবার আসব!',
    preferredProducts: ['banana', 'egg', 'mango'],
  },
  {
    id: 'ma',
    name: 'খালা',
    emoji: '👩',
    image: imgMa,
    color: '#9C27B0',
    expressions: {
      happy: '😊',
      curious: '🧐',
      grateful: '☺️',
    },
    greeting: 'বাবা, আমার কিছু দরকার।',
    farewell: 'জাজাকাল্লাহ! ভালো থেকো বাবা!',
    preferredProducts: ['fish', 'egg', 'milk'],
  },
  {
    id: 'riksha',
    name: 'করিম ভাই',
    emoji: '🧑',
    image: imgRiksha,
    color: '#FF5722',
    expressions: {
      happy: '😁',
      curious: '🤨',
      grateful: '👍',
    },
    greeting: 'ভাই, তাড়াতাড়ি দাও একটু!',
    farewell: 'ধন্যবাদ ভাই! ভালো থাকো!',
    preferredProducts: ['bread', 'banana', 'mango'],
  },
];

// Pick a random customer for a session
export function getRandomCustomer(sessionSeed) {
  const idx = sessionSeed % CUSTOMERS.length;
  return CUSTOMERS[idx];
}
