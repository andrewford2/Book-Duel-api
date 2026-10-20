// What the Library Game Hub shows about YOUR game (Hub Contract, rule 1).
// Lab Step 6: replace every CHANGE_ME value with your own.
const pkg = require('../../package.json');

module.exports = {
  slug: 'book-duel',
  name: 'Book Duel',
  team: 'Team C3 (3-1)',
  developer: 'andrewford2',
  description: 'Book Duel - a literary tournament game for the SorSU Bulan Campus library',
  min_players: 2,
  max_players: 30,
  version: pkg.version,
};