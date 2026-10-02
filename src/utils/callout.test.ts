import { describe, expect, it } from 'vitest';

import { buildCalloutBlock } from './callout';

describe('buildCalloutBlock', () => {
	it('builds a callout from a single paragraph', () => {
		const result = buildCalloutBlock('Hello world', 'note', 'Greeting');

		expect(result).toBe('> [!note] Greeting\n> Hello world');
	});

	it('prefixes every paragraph and turns blank lines into bare quote lines', () => {
		const article = 'First paragraph.\n\nSecond paragraph.\n\nThird paragraph.';

		const result = buildCalloutBlock(article, 'tip');

		expect(result).toBe(
			[
				'> [!tip]',
				'> First paragraph.',
				'>',
				'> Second paragraph.',
				'>',
				'> Third paragraph.',
			].join('\n'),
		);
	});

	it('omits the title when it is empty or whitespace', () => {
		expect(buildCalloutBlock('Body', 'note', '')).toBe(
			'> [!note]\n> Body',
		);
		expect(buildCalloutBlock('Body', 'note', '   ')).toBe(
			'> [!note]\n> Body',
		);
		expect(buildCalloutBlock('Body', 'note')).toBe('> [!note]\n> Body');
	});

	it('nests lines that already start with a quote prefix', () => {
		const result = buildCalloutBlock('> quoted line', 'quote');

		expect(result).toBe('> [!quote]\n> > quoted line');
	});

	it('normalizes CRLF line endings', () => {
		const result = buildCalloutBlock('one\r\n\r\ntwo', 'note');

		expect(result).toBe('> [!note]\n> one\n>\n> two');
	});

	it('treats whitespace-only lines as blank lines', () => {
		const result = buildCalloutBlock('one\n   \ntwo', 'note');

		expect(result).toBe('> [!note]\n> one\n>\n> two');
	});

	it('trims leading and trailing blank lines from the pasted text', () => {
		const result = buildCalloutBlock('\n\nBody\n\n', 'note');

		expect(result).toBe('> [!note]\n> Body');
	});

	it('falls back to the note type when the type is empty', () => {
		const result = buildCalloutBlock('Body', '  ');

		expect(result).toBe('> [!note]\n> Body');
	});

	it('returns only the header when the text is empty', () => {
		const result = buildCalloutBlock('', 'info', 'Title');

		expect(result).toBe('> [!info] Title');
	});

	it('keeps code fences inside the callout', () => {
		const text = 'Example:\n```js\nconst x = 1;\n```\nDone.';

		const result = buildCalloutBlock(text, 'example');

		expect(result).toBe(
			[
				'> [!example]',
				'> Example:',
				'> ```js',
				'> const x = 1;',
				'> ```',
				'> Done.',
			].join('\n'),
		);
	});
});
