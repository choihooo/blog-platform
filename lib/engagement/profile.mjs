import { adjectives, animals, isNickname } from './nickname.mjs';

const STORAGE_KEY = 'blog_comment_nickname';

export function animalForNickname(nickname) {
  if (!isNickname(nickname)) return null;
  return animals.find(animal => nickname.endsWith(animal)) ?? null;
}

function browserStorage() {
  try { return globalThis.localStorage; } catch { return null; }
}
function save(storage, nickname) {
  try { storage?.setItem(STORAGE_KEY, nickname); } catch { /* Keep the profile usable when storage is blocked. */ }
  return nickname;
}
function generate(previous) {
  const previousAnimal = animalForNickname(previous);
  const pool = adjectives.flatMap(adjective => animals.filter(animal => animal !== previousAnimal).map(animal => adjective + animal));
  const value = new Uint32Array(1);
  globalThis.crypto.getRandomValues(value);
  return pool[value[0] % pool.length];
}

export function loadProfileNickname(storage = browserStorage()) {
  try {
    const saved = storage?.getItem(STORAGE_KEY);
    if (isNickname(saved)) return saved;
  } catch { /* Generate an in-memory profile when reading storage is blocked. */ }
  return save(storage, generate());
}

export function changeProfileNickname(storage = browserStorage(), previous = '') {
  return save(storage, generate(previous));
}
