# Paste to Callout

An [Obsidian](https://obsidian.md) plugin that pastes multi-paragraph text into a note as a single callout.

## Why

A callout is only as long as its run of `>`-prefixed lines. When you paste a multi-paragraph article into a callout, only the paragraph at the cursor gets the prefix — the rest of the article falls outside the callout, and fixing it means manually adding `>` to every line.

Paste to Callout fixes the workflow: copy the article, invoke the dialog, and the whole text lands inside one callout.

## Usage

1. Copy a multi-paragraph article.
2. Place the cursor in a note and run **Insert pasted text as callout** (Command Palette), or press the default hotkey `Ctrl/Cmd+Alt+V` (customizable in Settings → Hotkeys).
3. The dialog opens with the clipboard content prefilled. Pick a callout type, optionally add a title, then select **Insert**.
4. The text is inserted at the cursor as one callout block:

   - every line is kept inside the callout,
   - blank lines between paragraphs become bare `>` lines so paragraph spacing is preserved and the callout is not cut in half,
   - lines that already start with `>` are nested one level deeper.

The callout type you last used is preselected the next time the dialog opens.

## Callout types

The dropdown lists Obsidian's built-in callout types plus a **Custom…** entry for types defined by your theme.

## Development

- `npm i` to install dependencies.
- `npm run dev` to build in watch mode.
- `npm run build` to typecheck and build for release.
- `npm test` to run the unit tests.
- `npm run lint` to run ESLint.

Manual install for testing: copy `main.js`, `manifest.json`, and `styles.css` into `<Vault>/.obsidian/plugins/paste-to-callout/`, then reload Obsidian and enable the plugin in Settings → Community plugins.

## License

0-BSD, same as the sample plugin this project started from.
