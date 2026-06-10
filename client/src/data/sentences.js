// ─── Phase 3 Sentence Bank ───────────────────────────────────────────────────
// Each conversation scenario links a product to a customer request,
// a shopkeeper response (scrambled for the child), and pricing.

import { PHASE2_WORDS } from './words';

// Map product IDs to conversation data
export const CONVERSATIONS = [
  {
    productId: 'milk',
    customerRequest: 'আমি একটু দুধ চাই।',
    shopkeeperResponse: ['এই', 'নিন,', 'তাজা', 'দুধ।'],
    price: '২০ টাকা',
    productEmoji: '🥛',
    productName: 'দুধ',
  },
  {
    productId: 'banana',
    customerRequest: 'ভালো কলা আছে?',
    shopkeeperResponse: ['হ্যাঁ,', 'এই', 'নিন', 'কলা।'],
    price: '১৫ টাকা',
    productEmoji: '🍌',
    productName: 'কলা',
  },
  {
    productId: 'fish',
    customerRequest: 'আজ তাজা মাছ আছে?',
    shopkeeperResponse: ['জি,', 'তাজা', 'মাছ', 'আছে।'],
    price: '৫০ টাকা',
    productEmoji: '🐟',
    productName: 'মাছ',
  },
  {
    productId: 'egg',
    customerRequest: 'চারটা ডিম দিন।',
    shopkeeperResponse: ['এই', 'নিন', 'চারটা', 'ডিম।'],
    price: '৪০ টাকা',
    productEmoji: '🥚',
    productName: 'ডিম',
  },
  {
    productId: 'bread',
    customerRequest: 'গরম রুটি আছে?',
    shopkeeperResponse: ['জি,', 'গরম', 'রুটি', 'আছে।'],
    price: '১০ টাকা',
    productEmoji: '🫓',
    productName: 'রুটি',
  },
  {
    productId: 'mango',
    customerRequest: 'মিষ্টি আম দিন একটু।',
    shopkeeperResponse: ['এই', 'নিন,', 'মিষ্টি', 'আম।'],
    price: '৩০ টাকা',
    productEmoji: '🥭',
    productName: 'আম',
  },
];

// Scramble sentence words (never identical to correct order)
export function scrambleSentence(words, seed) {
  const shuffled = [...words];
  let attempts = 0;
  do {
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = ((seed * (i + 1) * 9301 + 49297) % 233280) % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    attempts++;
    seed += 1;
  } while (
    shuffled.every((w, i) => w === words[i]) &&
    attempts < 10
  );
  return shuffled;
}

// Get conversations matching available products on shelf
export function getConversationsForProducts(productIds) {
  return CONVERSATIONS.filter(c => productIds.includes(c.productId));
}
