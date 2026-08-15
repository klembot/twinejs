# Twine hotkeys — command registry plan

Date: 2026-08-15. Written on branch `sliders`, but work goes on **separate branch / separate folder**.
Goal: general hotkeys everywhere, focus-aware, separate module, minimal diff to existing code, upstreamable to twinejs.

---

## 1. Survey — current state (as of commit 76abba4f)

### No action table exists

Actions are inline closures in leaf button components. Typical shape
(`src/routes/story-edit/toolbar/passage/create-passage-button.tsx`):

```tsx
export const CreatePassageButton: React.FC<CreatePassageButtonProps> = props => {
	const {getCenter, story} = props;
	const {dispatch} = useUndoableStoriesContext();
	const handleClick = React.useCallback(() => {
		const {left, top} = getCenter();
		dispatch(createUntitledPassage(story, left, top), 'undoChange.newPassage');
	}, [dispatch, getCenter, story]);
	const {t} = useTranslation();

	return <IconButton icon={<IconPlus />} label={t('common.new')} onClick={handleClick} />;
};
```

Same shape repeats ~20x:

- `src/routes/story-edit/toolbar/passage/` — create, edit, delete, test, start-at, go-to, select-all, deselect-all
- `src/routes/story-edit/toolbar/story/` — details, find-replace, javascript, passage-tags, sliders-assets, sliders-characters
- `src/routes/story-list/toolbar/{library,story,view}/` — archive, import, story-tags, etc.
- `src/route-actions/app-actions.tsx`, `build-actions.tsx`

Nothing central. Nothing exposed. No registry, no command ids, no shortcut metadata.

### Existing hotkeys — ad hoc, 9 total in 4 files

| file | keys | notes |
|---|---|---|
| `src/routes/story-edit/use-zoom-shortcuts.ts` | `-`, `=` | own hook, `{keydown:false, keyup:true}` |
| `src/routes/story-edit/toolbar/passage/delete-passages-button.tsx:40` | `Backspace,Delete` | inline in the button |
| `src/routes/story-edit/passage-fuzzy-finder.tsx:51` | `p` | bare letter, global |
| `src/components/fuzzy-finder/fuzzy-finder.tsx` | `escape`, `return`, `up`, `down` | 4x hand-rolled `filter: () => elementIsFocused(inputRef.current)` + `enableOnTags: ['INPUT']` |

### Library

`react-hotkeys-hook@3.4.7`.

- v3 has **no scopes** (v4 added them).
- Each `useHotkeys` attaches its own document listener. No priority, no ordering, no conflict detection.
- Focus handling is copy-pasted `filter:` callbacks (see fuzzy-finder, 4 identical blocks).

### Relevant surfaces to hook into

- `src/dialogs/context/dialogs-context.tsx` — `useDialogsContext()` → `dispatch({type:'addDialog', component})`. Most story/app actions are just this.
- `src/store/undoable-stories` — `useUndoableStoriesContext()` → dispatch with undo label.
- `src/store/stories` — `useStoriesContext()`.
- `src/components/control/icon-button.tsx` — `IconButton` already renders a `Tooltip` when `iconOnly`. Natural place to surface a shortcut hint.
- `src/components/fuzzy-finder/` — **generic** fuzzy finder component, already used by `passage-fuzzy-finder.tsx`. Reusable as a command palette with almost no work.
- `src/components/route-toolbar/` — tab container. `story-edit-toolbar.tsx` composes tabs: Passage / Story / Build / App. Tab names are natural command groups.
- `public/locales/*.json` — i18n, 24 locales. New strings go in `en-US.json` only; rest fall back.

---

## 2. Design

Separate module `src/hotkeys/`. Purely additive. One dispatcher instead of N listeners.

### 2.1 Command registry (context + hook)

```ts
// src/hotkeys/use-command.ts
export interface Command {
	id: string;              // 'passage.create'
	scope?: string;          // default 'global'
	hotkey?: string;         // 'mod+enter'  (mod = cmd on mac, ctrl elsewhere)
	label: string;           // already-translated, reuse the button's t(...) string
	group?: string;          // for help overlay / palette grouping
	enabled?: boolean;       // mirrors the button's `disabled`
	allowInInput?: boolean;  // default false
	run: () => void;
}

export function useCommand(command: Command): void;
```

Registers into a context map on mount, unregisters on unmount, updates on dep change.
Component keeps its existing `handleClick` — the hook only publishes it.

Diff per existing button is 3 lines:

```tsx
	const {t} = useTranslation();
+	useCommand({
+		id: 'passage.create', scope: 'story-map', hotkey: 'mod+enter',
+		label: t('common.new'), run: handleClick
+	});
```

No restructuring, no prop changes, no behavior change if the key is unset.

### 2.2 Scope from DOM, not from state

**Do not build a focus store.** The DOM already knows what is focused. At keydown, walk up
from `document.activeElement`:

```ts
function scopeChain(): string[] {
	const chain: string[] = [];
	for (let el = document.activeElement as HTMLElement | null; el; el = el.parentElement) {
		if (el.dataset?.hotkeyScope) chain.push(el.dataset.hotkeyScope);
	}
	chain.push('global');
	return chain;
}
```

Innermost scope wins. Mark regions with one attribute:

- `data-hotkey-scope="story-map"` on `MainContent` in `story-edit-route.tsx`
- `data-hotkey-scope="dialog"` on `DialogCard` (`src/components/container/dialog-card/`)
- `data-hotkey-scope="passage-editor"` inside the passage-edit dialog
- `data-hotkey-scope="fuzzy-finder"` on the fuzzy finder container
- `data-hotkey-scope="story-list"` on the story list route

One attribute per region. Dialogs, CodeMirror, and nested dialogs work for free — no bookkeeping,
no "which dialog is active" state to keep in sync.

Fallback when `document.activeElement` is `<body>` (nothing focused): treat the route root as the
scope — attach `data-hotkey-scope` to the route div too, and if the chain is empty, resolve via
`document.querySelector('[data-hotkey-scope-default]')`.

### 2.3 One listener at app root

`<HotkeysProvider>` mounted in `src/app.tsx` (or just inside each route provider stack).
Single `keydown` on `document`:

1. Normalize event → canonical string (`mod+shift+p`, `backspace`, `=`). `mod` maps to
   `metaKey` on mac, `ctrlKey` elsewhere.
2. If target is `INPUT` / `TEXTAREA` / `[contenteditable]` / `.CodeMirror`, only bare-modifier
   commands with `allowInInput: true` may fire. This replaces the copy-pasted `filter:` hacks.
3. Resolve `scopeChain()`; for each scope innermost→outermost, find first registered command with
   matching hotkey and `enabled !== false`.
4. Run it, `preventDefault()`, stop.

~150 lines total including the key normalizer.

### 2.4 Free wins from having a registry

This is what makes it worth upstreaming — the hotkeys are almost a side effect.

- **Shortcut in tooltip.** `IconButton` looks up its command id and appends the shortcut to the
  existing `Tooltip`. Opt-in via one new optional prop (`commandId`), no change for other callers.
- **Help overlay.** `?` opens a generated list, grouped by scope/group. Never goes stale.
- **Command palette.** `mod+shift+p`. Feed the registry into the existing
  `src/components/fuzzy-finder/` component — ~30 lines, since that component is already generic
  (`results`, `onSelectResult`, `onChangeSearch`, `prompt`).
- **Conflict detection.** In dev, warn when two commands register the same key in the same scope.
- **Discoverability for the Sliders extensions** (scene editor, character editor) — they get
  hotkeys and palette entries by registering, without touching the core.

### 2.5 Why not react-hotkeys-hook v4

v4 scopes are **name-based and manually activated** — you still hand-maintain "which scope is
active", which is the actual hard part. Upgrading also forces touching every existing call site.
Own dispatcher is ~150 lines, derives scope from focus for free, and gives the registry
(palette + help + tooltips) which the library cannot.

Keep the dep for now (other code may use it); drop it once all 9 call sites migrate.

---

## 3. Proposed file layout

```
src/hotkeys/
	index.ts                  — public exports: useCommand, HotkeysProvider, useCommands
	commands.types.ts         — Command interface
	hotkeys-context.tsx       — registry context + provider + the single keydown listener
	key-string.ts             — event → canonical key string, mod normalization, formatting for display
	scope.ts                  — scopeChain(), data-hotkey-scope constants
	use-command.ts            — the registration hook
	command-palette.tsx       — wraps components/fuzzy-finder
	hotkeys-help-dialog.tsx   — '?' overlay
	__tests__/
```

---

## 4. Phased migration

### Phase 1 — module, no behavior change
- Add `src/hotkeys/` (registry, provider, listener, key-string, scope).
- Mount `HotkeysProvider` in `src/app.tsx`.
- Add `data-hotkey-scope` to: `MainContent` in `story-edit-route.tsx`, `DialogCard`,
  fuzzy-finder container, story-list route root.
- Tests for key normalization + scope resolution.
- **Zero behavior change.** Safe standalone PR.

### Phase 2 — migrate the 9 existing hotkeys
- `use-zoom-shortcuts.ts` → two `useCommand` calls (`view.zoomOut` / `view.zoomIn`). Hook may
  stay as a thin wrapper so `story-edit-route.tsx` is untouched.
- `delete-passages-button.tsx` — drop `useHotkeys('Backspace,Delete', ...)`, register command instead.
- `passage-fuzzy-finder.tsx` — `p` becomes `passage.goTo` in scope `story-map` (also fixes: bare
  `p` currently fires from anywhere).
- `fuzzy-finder.tsx` — 4 `filter:`/`elementIsFocused` blocks become `scope: 'fuzzy-finder'` commands.
  Deletes the `elementIsFocused` helper.
- Net: **removes** code.

### Phase 3 — register remaining actions
3 lines per button, additive. Batch by area so review is easy:
- 3a: `story-edit/toolbar/passage/*` (8 buttons)
- 3b: `story-edit/toolbar/story/*` (6 buttons, incl. sliders-assets / sliders-characters)
- 3c: `route-actions/*` (app + build)
- 3d: `story-list/toolbar/*`

Wire `enabled` from the same condition that drives each button's `disabled`.

### Phase 4 — the payoff
- Help overlay on `?`.
- Command palette on `mod+shift+p`, via existing fuzzy-finder.
- Shortcut hints in `IconButton` tooltips.
- Dev-mode conflict warnings.

---

## 5. Open questions / decisions to make later

- **Keymap defaults.** Pick a table before phase 3 so ids and keys land together. Avoid bare
  letters for destructive actions. Current bare `p` and bare `-`/`=` set a precedent for
  unmodified keys in `story-map` scope — probably keep, but new destructive commands get `mod+`.
- **User remapping.** Registry makes it possible (store overrides in `src/store/prefs`). Out of
  scope for the first PRs; design `Command.hotkey` as "default hotkey" so an override layer can slot in.
- **i18n.** New strings (`hotkeys.help.title`, palette prompt) into `public/locales/en-US.json`
  only. Command labels reuse each button's existing `t(...)` — no new strings for those.
- **Upstream split.** Phases 1+2 are the contributable core (registry + focus scopes + removes
  duplicated code). Phase 4 is the sellable feature. Sliders-specific commands stay local.
