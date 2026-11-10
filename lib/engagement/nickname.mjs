export const adjectives = ['다정한', '차분한', '호기심많은', '산책하는', '책읽는', '생각하는', '반가운', '느긋한'];
export const animals = ['너구리', '고양이', '여우', '수달', '토끼', '고래', '참새', '펭귄'];

export function randomNickname(previous = '') {
  const names = adjectives.flatMap(a => animals.map(b => a + b)).filter(name => name !== previous);
  const value = new Uint32Array(1);
  globalThis.crypto.getRandomValues(value);
  return names[value[0] % names.length];
}

export function isNickname(value) {
  return typeof value === 'string' && adjectives.some(a => animals.some(b => a + b === value));
}
