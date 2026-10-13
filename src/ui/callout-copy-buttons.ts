import { Notice, Plugin, setIcon } from 'obsidian';

const BUTTON_CLASS = 'paste-to-callout-copy-button';
const COPY_BUTTON_STYLES = `
.callout:has(> .${BUTTON_CLASS}) {
	position: relative;
}
.callout:has(> .${BUTTON_CLASS}) > .callout-title {
	padding-right: 2.5em;
}
.callout > .${BUTTON_CLASS} {
	all: unset;
	position: absolute;
	top: 0.5em;
	right: 0.5em;
	z-index: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 1.75em;
	height: 1.75em;
	padding: 0;
	background: transparent !important;
	box-shadow: none !important;
	color: var(--text-normal);
	cursor: pointer;
	opacity: 0;
	pointer-events: none;
}
.callout:hover > .${BUTTON_CLASS},
.callout:focus-within > .${BUTTON_CLASS} {
	opacity: 1;
	pointer-events: auto;
}
.callout > .${BUTTON_CLASS}:hover,
.callout > .${BUTTON_CLASS}:focus-visible {
	color: var(--text-accent);
}
.callout > .${BUTTON_CLASS}:focus-visible {
	outline: 2px solid var(--interactive-accent);
	outline-offset: 2px;
}
.callout > .${BUTTON_CLASS} svg {
	width: 1em;
	height: 1em;
}
.embed-actions > .${BUTTON_CLASS}:focus-visible {
	outline: 2px solid var(--interactive-accent);
	outline-offset: 2px;
}
@media (hover: none) {
	.callout > .${BUTTON_CLASS} {
		opacity: 1;
		pointer-events: auto;
	}
}`;

/** Add a copy action to rendered callouts in reading and live preview. */
export function registerCalloutCopyButtons(plugin: Plugin): void {
	const workspaceEl = plugin.app.workspace.containerEl;
	const styleEl = workspaceEl.ownerDocument.createElement('style');
	styleEl.textContent = COPY_BUTTON_STYLES;
	workspaceEl.ownerDocument.head.appendChild(styleEl);

	const addButton = (callout: HTMLElement): void => {
		const title = Array.from(callout.children).find((child) =>
			child.classList.contains('callout-title'),
		);
		if (!title) return;

		const fallbackButton = Array.from(callout.children).find((child) =>
			child.classList.contains(BUTTON_CLASS),
		);
		const embedBlock = callout.closest<HTMLElement>('.cm-embed-block');
		const actions = embedBlock?.querySelector<HTMLElement>('.embed-actions');
		const editButton = actions?.querySelector<HTMLElement>(':scope > .edit-block-button');
		if (actions && editButton) {
			fallbackButton?.remove();
			if (actions.querySelector(`:scope > .${BUTTON_CLASS}`)) return;

			const button = actions.createDiv({
				cls: `embed-action ${BUTTON_CLASS}`,
				attr: {
					role: 'button',
					tabindex: '0',
					'aria-label': 'Copy callout text',
					title: 'Copy callout text',
				},
			});
			setIcon(button, 'copy');
			editButton.before(button);
			return;
		}
		if (fallbackButton) return;

		const button = callout.createEl('button', {
			cls: BUTTON_CLASS,
			attr: {
				type: 'button',
				'aria-label': 'Copy callout text',
				title: 'Copy callout text',
			},
		});
		setIcon(button, 'copy');
		title.after(button);
	};

	const scan = (root: HTMLElement): void => {
		if (root.matches('.callout')) addButton(root);
		root.querySelectorAll<HTMLElement>('.callout').forEach(addButton);
	};

	scan(workspaceEl);
	const observer = new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			for (const node of Array.from(mutation.addedNodes)) {
				if (!node.instanceOf(HTMLElement)) continue;
				const callout = node.closest<HTMLElement>('.callout');
				if (callout) addButton(callout);
				const embedBlock = node.closest<HTMLElement>('.cm-embed-block');
				embedBlock?.querySelectorAll<HTMLElement>('.callout').forEach(addButton);
				scan(node);
			}
		}
	});
	observer.observe(workspaceEl, { childList: true, subtree: true });
	plugin.register(() => {
		observer.disconnect();
		styleEl.remove();
		workspaceEl.querySelectorAll(`.${BUTTON_CLASS}`).forEach((button) => button.remove());
	});
	plugin.registerDomEvent(workspaceEl, 'mousedown', (event) => {
		if (event.target instanceof Element && event.target.closest(`.${BUTTON_CLASS}`)) {
			event.preventDefault();
			event.stopPropagation();
		}
	}, true);

	plugin.registerDomEvent(workspaceEl, 'click', (event) => {
		const target = event.target;
		if (!(target instanceof Element)) return;
		const button = target.closest<HTMLElement>(`.${BUTTON_CLASS}`);
		if (!button || !workspaceEl.contains(button)) return;

		event.preventDefault();
		event.stopPropagation();
		copyFromButton(button);
	}, true);
	plugin.registerDomEvent(workspaceEl, 'keydown', (event) => {
		if (event.key !== 'Enter' && event.key !== ' ') return;
		const target = event.target;
		if (!(target instanceof Element)) return;
		const button = target.closest<HTMLElement>(`.${BUTTON_CLASS}`);
		if (!button || button.tagName === 'BUTTON' || !workspaceEl.contains(button)) return;

		event.preventDefault();
		event.stopPropagation();
		copyFromButton(button);
	}, true);
}

function copyFromButton(button: HTMLElement): void {
	const callout = button.closest<HTMLElement>('.callout')
		?? button.closest<HTMLElement>('.cm-embed-block')?.querySelector<HTMLElement>('.callout');
	const content = callout && Array.from(callout.children).find((child) =>
		child.classList.contains('callout-content'),
	);
	if (!(content instanceof HTMLElement)) return;

	void copyText(content.innerText.trim());
}

async function copyText(text: string): Promise<void> {
	try {
		await navigator.clipboard.writeText(text);
		new Notice('Callout text copied');
	} catch {
		new Notice('Could not copy callout text');
	}
}
