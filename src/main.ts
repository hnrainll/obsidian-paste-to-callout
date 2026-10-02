import { Plugin } from 'obsidian';

import { registerInsertCalloutCommand } from './commands/insert-callout';
import {
	DEFAULT_SETTINGS,
	PasteToCalloutSettings,
} from './settings';

export default class PasteToCalloutPlugin extends Plugin {
	settings!: PasteToCalloutSettings;

	async onload(): Promise<void> {
		await this.loadSettings();
		registerInsertCalloutCommand(this);
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<PasteToCalloutSettings>,
		);
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}

	async saveLastCalloutType(calloutType: string): Promise<void> {
		this.settings.lastCalloutType = calloutType;
		await this.saveSettings();
	}
}
