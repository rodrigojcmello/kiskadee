export function generateUniqueKey(key?: string) {
  if (!key) return 'a';

  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  const base = alphabet.length;
  const { length } = key;
  let carry = 1;
  let newKey = '';

  for (let i = length - 1; i >= 0; i--) {
    const char = key[i].toLowerCase();
    const index = alphabet.indexOf(char);
    const newIndex = (index + carry) % base;
    carry = Math.floor((index + carry) / base);
    newKey = alphabet[newIndex] + newKey;
  }

  if (carry > 0) {
    newKey = alphabet[carry - 1] + newKey;
  }

  return newKey;
}
