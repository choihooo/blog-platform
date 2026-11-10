import { test } from 'node:test';
import assert from 'node:assert/strict';
import { animals, isNickname } from './nickname.mjs';
import { animalForNickname, loadProfileNickname, changeProfileNickname } from './profile.mjs';

function storage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}

test('each allowed animal nickname resolves to its own stable animal avatar', () => {
  for (const animal of animals) {
    assert.equal(animalForNickname('다정한' + animal), animal);
    assert.equal(animalForNickname('느긋한' + animal), animal);
  }
  assert.equal(animalForNickname('unknown'), null);
  assert.equal(animalForNickname(null), null);
});

test('first assignment is saved and reloads do not reroll it', () => {
  const store = storage();
  const nickname = loadProfileNickname(store);
  assert.ok(isNickname(nickname));
  assert.equal(store.getItem('blog_comment_nickname'), nickname);
  for (let i = 0; i < 10; i++) assert.equal(loadProfileNickname(store), nickname);
});

test('existing valid nickname is preserved, invalid stored nickname is replaced', () => {
  assert.equal(loadProfileNickname(storage({ blog_comment_nickname: '차분한토끼' })), '차분한토끼');
  const invalid = storage({ blog_comment_nickname: '관리자' });
  const replaced = loadProfileNickname(invalid);
  assert.ok(isNickname(replaced));
  assert.equal(invalid.getItem('blog_comment_nickname'), replaced);
});

test('random change always changes animal, persists it and leaves stored comment nickname unchanged', () => {
  const store = storage({ blog_comment_nickname: '다정한너구리' });
  const oldComment = { nickname: '다정한너구리' };
  let nickname = oldComment.nickname;
  for (let i = 0; i < 50; i++) {
    const previous = nickname;
    nickname = changeProfileNickname(store, previous);
    assert.ok(isNickname(nickname));
    assert.notEqual(animalForNickname(nickname), animalForNickname(previous));
    assert.equal(loadProfileNickname(store), nickname);
  }
  assert.equal(animalForNickname(oldComment.nickname), '너구리');
});

test('unavailable or blocked storage still returns a valid usable nickname', () => {
  const blocked = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
  assert.ok(isNickname(loadProfileNickname(blocked)));
  assert.ok(isNickname(loadProfileNickname(null)));
  assert.ok(isNickname(changeProfileNickname(blocked, '다정한너구리')));
});
