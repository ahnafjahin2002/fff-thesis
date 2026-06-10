// client/src/data/words.js

import imgMilk from '../assets/product-milk.png';
import imgBanana from '../assets/product-banana.png';
import imgFish from '../assets/product-fish.png';
import imgEgg from '../assets/product-egg.png';
import imgBread from '../assets/product-bread.png';
import imgMango from '../assets/product-mango.png';
export const PHASE2_WORDS = [
  {
    id: "milk",
    emoji: "🥛",
    image: imgMilk,
    product: "দুধ",
    letters: ["দ", "ু", "ধ"],
    audioClue: "সাদা, ঠান্ডা, গরুর থেকে আসে",
    decoys: ["ড", "ধ", "দ", "ু", "ূ", "ব"],
  },
  {
    id: "banana",
    emoji: "🍌",
    image: imgBanana,
    product: "কলা",
    letters: ["ক", "ল", "া"],
    audioClue: "হলুদ, মিষ্টি, বানর পছন্দ করে",
    decoys: ["ক", "খ", "ল", "ল্ল", "া", "ো"],
  },
  {
    id: "fish",
    emoji: "🐟",
    image: imgFish,
    product: "মাছ",
    letters: ["ম", "া", "ছ"],
    audioClue: "পানিতে থাকে, আঁশ আছে",
    decoys: ["ম", "ন", "া", "ো", "ছ", "চ"],
  },
  {
    id: "egg",
    emoji: "🥚",
    image: imgEgg,
    product: "ডিম",
    letters: ["ড", "ি", "ম"],
    audioClue: "গোল, মুরগি দেয়",
    decoys: ["ড", "ঢ", "ি", "ী", "ম", "ন"],
  },
  {
    id: "bread",
    emoji: "🫓",
    image: imgBread,
    product: "রুটি",
    letters: ["র", "ু", "ট", "ি"],
    audioClue: "গোল, সকালে খাই",
    decoys: ["র", "ল", "ু", "ূ", "ট", "ত", "ি", "ী"],
  },
  {
    id: "mango",
    emoji: "🥭",
    image: imgMango,
    product: "আম",
    letters: ["আ", "ম"],
    audioClue: "হলুদ-সবুজ, ফলের রাজা",
    decoys: ["আ", "অ", "ম", "ন", "ব"],
  },
];

// Build the tile pool: correct letters + decoys, deduplicated, shuffled
export function buildTilePool(word, sessionTime) {
  const all = [...new Set([...word.letters, ...word.decoys])];
  // seeded shuffle using session timestamp
  const seed = sessionTime % 1000;
  return all
    .map((tile, i) => ({ tile, sort: (seed * (i + 1) * 9301 + 49297) % 233280 }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ tile }) => tile);
}