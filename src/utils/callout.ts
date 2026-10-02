const DEFAULT_CALLOUT_TYPE = 'note';

/**
 * Build a callout block from pasted text.
 *
 * Every line of the text receives a quote prefix so the whole text stays
 * inside the callout. Blank lines become bare `>` lines so the callout is
 * not cut in half while still rendering paragraph spacing. Lines that
 * already start with a quote prefix gain one more level so quoted content
 * stays nested inside the callout.
 */
export function buildCalloutBlock(
	text: string,
	calloutType: string,
	title?: string,
): string {
	const type = calloutType.trim() || DEFAULT_CALLOUT_TYPE;
	const trimmedTitle = title?.trim() ?? '';
	const header = `> [!${type}]${
		trimmedTitle.length > 0 ? ` ${trimmedTitle}` : ''
	}`;

	const body = quoteLines(text);
	if (body.length === 0) {
		return header;
	}
	return [header, ...body].join('\n');
}

function quoteLines(text: string): string[] {
	const normalized = text.replace(/\r\n?/g, '\n');
	const lines = normalized.split('\n');

	// Drop leading and trailing blank lines: they would render as stray
	// spacing outside the paragraphs the user actually pasted.
	let start = 0;
	let end = lines.length;
	while (start < end && isBlank(lines[start] ?? '')) {
		start++;
	}
	while (end > start && isBlank(lines[end - 1] ?? '')) {
		end--;
	}

	const quoted: string[] = [];
	for (let i = start; i < end; i++) {
		const line = lines[i] ?? '';
		if (isBlank(line)) {
			quoted.push('>');
		} else {
			// Lines that already start with `>` gain one more level, so
			// quoted pasted content stays nested inside the callout.
			quoted.push(`> ${line}`);
		}
	}
	return quoted;
}

function isBlank(line: string): boolean {
	return line.trim().length === 0;
}
