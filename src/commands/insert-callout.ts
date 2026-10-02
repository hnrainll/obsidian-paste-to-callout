import { Editor } from 'obsidian';

import PasteToCalloutPlugin from '../main';
import {
	CalloutDraft,
	PasteToCalloutModal,
} from '../ui/paste-to-callout-modal';
import { buildCalloutBlock } from '../utils/callout';

export function registerInsertCalloutCommand(plugin: PasteToCalloutPlugin) {
	plugin.addCommand({
		id: 'insert-callout',
		name: 'Insert pasted text as callout',
		hotkeys: [{ modifiers: ['Mod', 'Alt'], key: 'v' }],
		editorCallback: (editor: Editor) => {
			new PasteToCalloutModal(
				plugin.app,
				plugin,
				(draft: CalloutDraft) => {
					insertCallout(editor, draft);
				},
			).open();
		},
	});
}

function insertCallout(editor: Editor, draft: CalloutDraft): void {
	const block = buildCalloutBlock(draft.text, draft.calloutType, draft.title);
	const cursor = editor.getCursor();

	const leadingNewline = cursor.ch === 0 ? '' : '\n';
	editor.replaceSelection(`${leadingNewline}${block}\n`);
	editor.setCursor({
		line: cursor.line + 1 + countLines(block),
		ch: 0,
	});
}

function countLines(text: string): number {
	return text.split('\n').length;
}
