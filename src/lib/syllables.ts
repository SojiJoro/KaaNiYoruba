// Kàá — Yorùbá syllable splitter.
// Yorùbá syllables are strictly (C)V or a syllabic nasal, which makes number
// words ideal for tile-based spelling games: "Mọ́kànlélógún" →
// Mọ́ · kàn · lé · ló · gún. Long vowels written as VV (Àádọ́ta) split into two
// tiles, which is fine for building games and mirrors how the word is chanted.

const CONSONANTS = new Set([
  'b', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'r', 's', 'ṣ', 't', 'w', 'y',
]);

const VOWELS = new Set(['a', 'e', 'ẹ', 'i', 'o', 'ọ', 'u']);

// Combining marks (tones, underdots when decomposed) attach to the previous
// base character.
const isCombining = (ch: string) => /[̀-ͯ]/.test(ch);

interface Unit {
  text: string;
  base: string; // lowercase base letter without diacritics
}

/** Group a word into base-letter units with their combining marks attached. */
function toUnits(word: string): Unit[] {
  const units: Unit[] = [];
  // NFD exposes combining marks; underdot letters (ẹ ọ ṣ) decompose to
  // base + U+0323, so the base must be re-derived from the unit as a whole.
  for (const ch of word.normalize('NFD')) {
    if (isCombining(ch) && units.length > 0) {
      units[units.length - 1].text += ch;
    } else {
      units.push({ text: ch, base: ch.toLowerCase() });
    }
  }
  return units.map((u) => {
    const recomposed = u.text.normalize('NFC');
    // Strip tone marks (not the underdot) to find the base letter class.
    const baseChar = recomposed
      .normalize('NFD')
      .replace(/[̀́̄]/g, '')
      .normalize('NFC')
      .toLowerCase();
    return { text: recomposed, base: baseChar };
  });
}

/**
 * Split a Yorùbá word into syllables. Hyphens separate chunks outright
 * (Márùn-ún → Márùn · ún). Within a chunk, each syllable is an optional
 * consonant (including the digraph gb) plus one vowel, with a nasal coda 'n'
 * attached when it closes the syllable (kàn, gún) rather than opening the
 * next one (ò·nà).
 */
export function splitSyllables(word: string): string[] {
  const out: string[] = [];
  for (const chunk of word.split('-')) {
    if (!chunk) continue;
    const units = toUnits(chunk);
    let i = 0;
    while (i < units.length) {
      let syllable = '';
      // Onset: consonant, with 'gb' as one digraph.
      if (CONSONANTS.has(units[i].base) && !isVowelUnit(units[i])) {
        if (units[i].base === 'g' && units[i + 1]?.base === 'b') {
          syllable += units[i].text + units[i + 1].text;
          i += 2;
        } else {
          syllable += units[i].text;
          i += 1;
        }
      }
      // Nucleus: one vowel unit.
      if (i < units.length && isVowelUnit(units[i])) {
        syllable += units[i].text;
        i += 1;
      }
      // Coda: 'n' when not followed by a vowel (nasal vowel spelling).
      if (
        i < units.length &&
        units[i].base === 'n' &&
        !(i + 1 < units.length && isVowelUnit(units[i + 1]))
      ) {
        syllable += units[i].text;
        i += 1;
      }
      if (syllable) {
        out.push(syllable);
      } else {
        // Unrecognized character (apostrophe, digit): attach to previous
        // syllable rather than losing it.
        if (out.length > 0) out[out.length - 1] += units[i].text;
        else out.push(units[i].text);
        i += 1;
      }
    }
  }
  return out;
}

function isVowelUnit(u: Unit): boolean {
  return VOWELS.has(u.base);
}

/** Reassemble syllables for comparison with the original (hyphens dropped). */
export function joinSyllables(syllables: string[]): string {
  return syllables.join('');
}

/** The original word with hyphens removed — the spell-game target. */
export function spellTarget(word: string): string {
  return word.replace(/-/g, '');
}
