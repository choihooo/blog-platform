import assert from 'node:assert/strict';
import test from 'node:test';
import { highlightSearchMatches } from './search-highlight.ts';

const hits = (text, query) => highlightSearchMatches(text, query).filter(part => part.matched).map(part => part.text);

test('highlights every term and repeated match without changing the original text', () => {
  const text = 'Mac에서 CI, macOS에서도 CI';
  const parts = highlightSearchMatches(text, '  MAC ci  ');
  assert.equal(parts.map(part => part.text).join(''), text);
  assert.deepEqual(hits(text, 'MAC ci'), ['Mac', 'CI', 'mac', 'CI']);
});

test('normalization matches full-width letters, decomposed Hangul and expanded ligatures', () => {
  assert.deepEqual(hits('ＡＩ에 대한 기록', 'ai'), ['ＡＩ']);
  assert.deepEqual(hits('거부기린', '거부'), ['거부']);
  assert.deepEqual(hits('ﬃ 기록', 'fi'), ['ﬃ']);
});

test('overlapping terms form one highlight and punctuation is matched literally', () => {
  assert.deepEqual(hits('Keychain', 'key chain keychain'), ['Keychain']);
  assert.deepEqual(hits('C++와 [CI]', 'C++ [CI]'), ['C++', '[CI]']);
});

test('empty and unmatched queries preserve text, including emoji and HTML-like content', () => {
  for (const query of ['', '  ', '없음']) {
    assert.deepEqual(highlightSearchMatches('🐢 <script>', query), [{ text: '🐢 <script>', matched: false }]);
  }
  assert.deepEqual(hits('🐢 키체인', '키'), ['키']);
});
