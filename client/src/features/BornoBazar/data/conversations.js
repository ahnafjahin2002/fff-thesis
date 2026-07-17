export const conversations = [
  // --- Fruit Shop Conversations ---
  {
    id: "buy_mango",
    shop: "fruit",
    customer: "আমার একটা আম চাই।",
    words: ["এই", "নিন", "আপনার", "আম", "কলা"],
    correctSequence: ["এই", "নিন", "আপনার", "আম"],
    hint: "আগে 'এই নিন' বলো।"
  },
  {
    id: "buy_banana",
    shop: "fruit",
    customer: "আমাকে কিছু কলা দিন।",
    words: ["কলা", "এই", "নিন", "তাজা", "আপেল"],
    correctSequence: ["এই", "নিন", "তাজা", "কলা"],
    hint: "আগে 'এই নিন' বলো।"
  },

  // --- Book Shop Conversations ---
  {
    id: "buy_book",
    shop: "book",
    customer: "আমি একটি গল্পের বই কিনতে চাই।",
    words: ["বইটি", "মজার", "খুব", "এই"],
    correctSequence: ["এই", "বইটি", "খুব", "মজার"],
    hint: "বাক্যটি 'এই' দিয়ে শুরু করো।"
  },
  {
    id: "buy_notebook",
    shop: "book",
    customer: "আমাকে একটা খাতা দিন।",
    words: ["নিন", "খাতা", "আপনার", "এই", "বই"],
    correctSequence: ["এই", "নিন", "আপনার", "খাতা"],
    hint: "আগে 'এই নিন' বলো।"
  },

  // --- Grocery Shop Conversations ---
  {
    id: "buy_rice",
    shop: "grocery",
    customer: "এক কেজি চাল দিন।",
    words: ["চাল", "নিন", "আপনার", "এই", "ডাল"],
    correctSequence: ["এই", "নিন", "আপনার", "চাল"],
    hint: "আগে 'এই নিন' বলো।"
  },
  {
    id: "buy_lentils",
    shop: "grocery",
    customer: "একটু ডাল দিন তো।",
    words: ["ডাল", "খুব", "ভালো", "এই", "চাল"],
    correctSequence: ["এই", "ডাল", "খুব", "ভালো"],
    hint: "বাক্যটি 'এই' দিয়ে শুরু করো।"
  },

  // --- Fish Shop Conversations ---
  {
    id: "buy_hilsa",
    shop: "fish",
    customer: "বড় ইলিশ মাছ আছে?",
    words: ["ইলিশ", "অনেক", "বড়", "এই", "মাছটি"],
    correctSequence: ["এই", "ইলিশ", "মাছটি", "অনেক", "বড়"],
    hint: "বাক্যটি 'এই ইলিশ' দিয়ে শুরু করো।"
  },
  {
    id: "buy_fish",
    shop: "fish",
    customer: "আমাকে একটা তাজা মাছ দিন।",
    words: ["নিন", "তাজা", "মাছ", "এই", "পচা"],
    correctSequence: ["এই", "নিন", "তাজা", "মাছ"],
    hint: "আগে 'এই নিন' বলো।"
  }
];
