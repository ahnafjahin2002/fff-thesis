const fs = require('fs');
const path = require('path');

const wordBankPath = path.join(__dirname, '../data/quizWordBank.json');

let wordBank = [];
try {
  const data = fs.readFileSync(wordBankPath, 'utf8');
  wordBank = JSON.parse(data).word_bank;
} catch (err) {
  console.error("Error reading quizWordBank.json", err);
}

/**
 * Generate a random set of words for the quiz.
 * @param {number} difficulty - 1 (Easy), 2 (Medium), 3 (Hard)
 * @param {number} count - number of pairs to return
 * @param {string} category - "all" or specific category
 * @returns {Array} - Array of word objects
 */
function generateQuiz(difficulty = 1, count = 6, category = 'all') {
  // Temporary: Only use the 10 words we have generated images for (IDs 1-10)
  const availableWords = wordBank.filter(w => w.id >= 1 && w.id <= 10);
  
  let filtered = availableWords;
  
  if (difficulty) {
    // We allow fetching words <= requested difficulty
    filtered = filtered.filter(w => w.difficulty <= difficulty);
  }
  
  if (category && category !== 'all') {
    filtered = filtered.filter(w => w.category === category);
  }
  
  // If we don't have enough words matching the criteria, fallback to all words matching difficulty
  if (filtered.length < count) {
      filtered = availableWords.filter(w => w.difficulty <= difficulty);
  }
  
  // If still not enough, just use the entire available word bank
  if (filtered.length < count) {
      filtered = availableWords;
  }
  
  // Shuffle array
  const shuffled = [...filtered].sort(() => 0.5 - Math.random());
  
  // Pick the requested count
  return shuffled.slice(0, count);
}

module.exports = {
  generateQuiz
};
