import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startLike, restoreLike, startComment, confirmComment, removePendingComment } from './optimistic.ts';

const initial = () => ({ comments: [], commentCount: 0, liked: false, likeCount: 2, nextCursor: 'cursor' });
const pending = { id: 'id1', nickname: '다정한너구리', body: '좋은 글이에요.', createdAt: 1000 };

test('like updates immediately, and cancellation never makes counts negative', () => {
  const before = initial();
  assert.deepEqual(startLike(before, true), { ...before, liked: true, likeCount: 3 });
  assert.deepEqual(startLike({ ...before, likeCount: 0 }, false), { ...before, likeCount: 0 });
  assert.deepEqual(startLike(startLike(before, true), true).likeCount, 3);
  assert.deepEqual(startLike(startLike(before, true), false), before);
  assert.equal(before.liked, false);
});

test('failed like restores only like fields, preserving comments received during the request', () => {
  const before = initial();
  const during = startComment(startLike(before, true), pending);
  const after = restoreLike(during, before);
  assert.equal(after.liked, false);
  assert.equal(after.likeCount, 2);
  assert.equal(after.comments.length, 1);
  assert.equal(after.commentCount, 1);
});

test('pending comment appears/counts immediately; server confirmation replaces it without duplicating', () => {
  const before = initial();
  const during = startComment(before, pending);
  assert.equal(during.comments[0].pending, true);
  assert.equal(during.commentCount, 1);
  assert.equal(before.comments.length, 0);
  const confirmed = confirmComment(during, { ...pending, createdAt: 2000 });
  assert.equal(confirmed.comments.length, 1);
  assert.equal(confirmed.commentCount, 1);
  assert.equal(confirmed.comments[0].createdAt, 2000);
  assert.ok(!confirmed.comments[0].pending);
  assert.equal(confirmed.nextCursor, before.nextCursor);
});

test('comment failure removes only its pending record and preserves likes/other comments', () => {
  const during = startLike(startComment(startComment(initial(), pending), { ...pending, id: 'other' }), true);
  const failed = removePendingComment(during, pending.id);
  assert.equal(failed.comments.length, 1);
  assert.equal(failed.comments[0].id, 'other');
  assert.equal(failed.commentCount, 1);
  assert.equal(failed.liked, true);
  assert.equal(failed.likeCount, 3);
});

test('retry after a lost response never duplicates or removes an already confirmed comment', () => {
  const confirmed = confirmComment(startComment(initial(), pending), pending);
  assert.deepEqual(startComment(confirmed, pending), confirmed);
  assert.deepEqual(removePendingComment(confirmed, pending.id), confirmed);
  assert.deepEqual(confirmComment(confirmed, pending), confirmed);
});
