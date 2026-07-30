import { test } from 'node:test';
import assert from 'node:assert';
import { normalizeText } from './search-ranker.js';

test('normalizeText - happy path: converts to lowercase', () => {
  assert.strictEqual(normalizeText('Hello World'), 'hello world');
});

test('normalizeText - edge cases: handles null, undefined, and empty string', () => {
  assert.strictEqual(normalizeText(null), '');
  assert.strictEqual(normalizeText(undefined), '');
  assert.strictEqual(normalizeText(''), '');
});

test('normalizeText - character handling: strips punctuation', () => {
  assert.strictEqual(normalizeText('hello, world!'), 'hello world');
  assert.strictEqual(normalizeText('it\'s a test.'), 'it s a test');
});

test('normalizeText - character handling: normalizes whitespace', () => {
  assert.strictEqual(normalizeText('  hello   world  '), 'hello world');
  assert.strictEqual(normalizeText('\nhello\tworld\r'), 'hello world');
});

test('normalizeText - Unicode preservation: keeps letters and numbers from different scripts', () => {
  assert.strictEqual(normalizeText('München 123'), 'münchen 123');
  assert.strictEqual(normalizeText('你好 world'), '你好 world');
  assert.strictEqual(normalizeText('Café au lait'), 'café au lait');
});

test('normalizeText - complex case: combines multiple rules', () => {
  assert.strictEqual(
    normalizeText('  München! Is...  Beautiful 123?  '),
    'münchen is beautiful 123'
  );
});
