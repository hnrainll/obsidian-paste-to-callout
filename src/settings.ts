export interface PasteToCalloutSettings {
	/** Callout type preselected the next time the dialog opens. */
	lastCalloutType: string;
}

export const DEFAULT_SETTINGS: PasteToCalloutSettings = {
	lastCalloutType: 'note',
};
