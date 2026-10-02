import { App, Modal, Setting } from 'obsidian';

import PasteToCalloutPlugin from '../main';
import { BUILT_IN_CALLOUT_TYPES } from '../utils/constants';

const CUSTOM_OPTION = '__custom__';

export interface CalloutDraft {
	text: string;
	calloutType: string;
	title: string;
}

/**
 * Dialog for pasting multi-paragraph text and inserting it as one callout.
 *
 * The text area is prefilled from the clipboard when possible. Type and
 * title are optional; the last used type is remembered between opens.
 */
export class PasteToCalloutModal extends Modal {
	private readonly plugin: PasteToCalloutPlugin;
	private readonly onInsert: (draft: CalloutDraft) => void;

	private text = '';
	private calloutType: string;
	private title = '';
	private customType = '';

	constructor(
		app: App,
		plugin: PasteToCalloutPlugin,
		onInsert: (draft: CalloutDraft) => void,
	) {
		super(app);
		this.plugin = plugin;
		this.onInsert = onInsert;
		this.calloutType = this.resolveInitialType(
			this.plugin.settings.lastCalloutType,
		);
	}

	async onOpen(): Promise<void> {
		this.text = await readClipboard();

		const { contentEl } = this;
		contentEl.addClass('paste-to-callout-modal');
		contentEl.createEl('h2', { text: 'Paste to callout' });

		const textArea = contentEl.createEl('textarea', {
			text: this.text,
			attr: {
				rows: '12',
				placeholder: 'Paste your text here',
				'aria-label': 'Text to insert as a callout',
			},
		});
		textArea.addEventListener('input', () => {
			this.text = textArea.value;
		});

		let typeSelect: HTMLSelectElement | null = null;
		let customSetting: Setting | null = null;

		new Setting(contentEl)
			.setName('Callout type')
			.addDropdown((dropdown) => {
				typeSelect = dropdown.selectEl;
				for (const type of BUILT_IN_CALLOUT_TYPES) {
					dropdown.addOption(type, type);
				}
				dropdown.addOption(CUSTOM_OPTION, 'Custom…');

				const isBuiltIn = BUILT_IN_CALLOUT_TYPES.includes(
					this.calloutType,
				);
				dropdown.setValue(
					isBuiltIn ? this.calloutType : CUSTOM_OPTION,
				);
				if (!isBuiltIn) {
					this.customType = this.calloutType;
				}

				dropdown.onChange((value) => {
					if (value === CUSTOM_OPTION) {
						this.calloutType = this.customType;
						customSetting?.settingEl.show();
					} else {
						this.calloutType = value;
						customSetting?.settingEl.hide();
					}
				});
			});

		customSetting = new Setting(contentEl)
			.setName('Custom callout type')
			.setDesc('A type defined by your theme, e.g. `puzzle`')
			.addText((text) => {
				text.setValue(this.customType);
				text.onChange((value) => {
					this.customType = value;
					if (
						typeSelect !== null &&
						typeSelect.value === CUSTOM_OPTION
					) {
						this.calloutType = value;
					}
				});
			});
		if (
			BUILT_IN_CALLOUT_TYPES.includes(this.calloutType) ||
			this.calloutType.length === 0
		) {
			customSetting.settingEl.hide();
		}

		new Setting(contentEl)
			.setName('Title')
			.setDesc('Optional; omitted when left empty')
			.addText((text) => {
				text.setPlaceholder('Callout title');
				text.onChange((value) => {
					this.title = value;
				});
			});

		new Setting(contentEl)
			.addButton((button) => {
				button.setCta().setButtonText('Insert');
				button.onClick(async () => {
					await this.submit();
				});
			})
			.addButton((button) => {
				button.setButtonText('Cancel');
				button.onClick(() => {
					this.close();
				});
			});
	}

	private async submit(): Promise<void> {
		const draft: CalloutDraft = {
			text: this.text,
			calloutType: this.resolvedType(),
			title: this.title,
		};
		await this.plugin.saveLastCalloutType(draft.calloutType);
		this.onInsert(draft);
		this.close();
	}

	private resolvedType(): string {
		return this.calloutType.trim();
	}

	private resolveInitialType(lastType: string): string {
		const trimmed = lastType.trim();
		if (trimmed.length === 0 || /^\[!/.test(trimmed)) {
			return 'note';
		}
		return trimmed;
	}
}

async function readClipboard(): Promise<string> {
	try {
		return await navigator.clipboard.readText();
	} catch {
		// Clipboard access can be denied or unavailable; the user can
		// still paste manually into the text area.
		return '';
	}
}
