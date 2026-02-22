'use strict';

const assert = require('assert');
const { levenshtein, fuzzyMatches } = require('../src/search/fuzzy');

describe('Search fuzzy (unit)', () => {
	describe('levenshtein()', () => {
		it('computes correct edit distance for one-char difference', () => {
			assert.strictEqual(levenshtein('helo', 'hello'), 1);
		});

		it('returns 0 for identical strings', () => {
			assert.strictEqual(levenshtein('hello', 'hello'), 0);
		});

		it('returns length of non-empty string when other is empty', () => {
			assert.strictEqual(levenshtein('', 'hello'), 5);
			assert.strictEqual(levenshtein('hello', ''), 5);
		});

		it('returns 0 when both strings are empty', () => {
			assert.strictEqual(levenshtein('', ''), 0);
		});

		it('computes correct edit distance for unrelated words', () => {
			assert.strictEqual(levenshtein('cat', 'banana'), 5);
		});

		it('computes 1 for character replacement', () => {
			assert.strictEqual(levenshtein('type', 'typo'), 1);
		});

		it('computes 1 for character removal', () => {
			assert.strictEqual(levenshtein('type', 'typ'), 1);
		});

		it('computes 1 for character insert', () => {
			assert.strictEqual(levenshtein('type', 'types'), 1);
		});

		it('computes 1 for number replacement', () => {
			assert.strictEqual(levenshtein('type1', 'type2'), 1);
		});
		
		it('computes 1 for number insert', () => {
			assert.strictEqual(levenshtein('type', 'type1'), 1);
		});

		it('computes 1 for number removal', () => {
			assert.strictEqual(levenshtein('type1', 'type'), 1);
		});

		it('computes correct edit distance for different numbers', () => {
			assert.strictEqual(levenshtein('123', '456'), 3);
			assert.strictEqual(levenshtein('111', '123'), 2);
		});

		it('computes correct edit distance for punctuation', () => {
			assert.strictEqual(levenshtein('', '.,;!'), 4);
			assert.strictEqual(levenshtein('ab.c', 'abc'), 1);
			assert.strictEqual(levenshtein('abc.', 'abc'), 1);
		});
		
		it('computes correct edit distance for punctuation insertion', () => {
			assert.strictEqual(levenshtein('abc', 'ab.c'), 1);
			assert.strictEqual(levenshtein('abc', 'abc.'), 1);
		});

		it('computes correct edit distance for punctuation removal', () => {
			assert.strictEqual(levenshtein('ab.c', 'abc'), 1);
			assert.strictEqual(levenshtein('abc.', 'abc'), 1);
		});
	});

	describe('fuzzyMatches()', () => {
		it('matches small edit distance', () => {
			assert.strictEqual(fuzzyMatches('helo', 'hello'), true);
		});

		it('matches small edit distance in phrase', () => {
			assert.strictEqual(fuzzyMatches('helo', 'hello world'), true);
		});

		it('returns false for unrelated words', () => {
			assert.strictEqual(fuzzyMatches('cat', 'banana'), false);
		});

		it('matches substring cases (query token contained in text token)', () => {
			assert.strictEqual(fuzzyMatches('node', 'nodebb'), true);
		});

		it('matches when text token is contained in query token', () => {
			assert.strictEqual(fuzzyMatches('nodebb', 'node'), true);
		});

		it('matches one of multiple tokens', () => {
			assert.strictEqual(fuzzyMatches('helo world', 'hello there'), true);
		});

		it('returns false for empty query', () => {
			assert.strictEqual(fuzzyMatches('', 'hello world'), false);
		});

		it('returns false for empty text', () => {
			assert.strictEqual(fuzzyMatches('hello', ''), false);
		});

		it('is case insensitive', () => {
			assert.strictEqual(fuzzyMatches('HELO', 'hello'), true);
			assert.strictEqual(fuzzyMatches('helo', 'HELLO'), true);
		});
	});
});
