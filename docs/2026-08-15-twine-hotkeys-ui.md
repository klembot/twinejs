# Twine hotkeys — keybinding editor UI

Date: 2026-08-15. Companion to [`2026-08-15-twine-hotkeys.md`](./2026-08-15-twine-hotkeys.md)
(the registry/dispatcher plan) and [`2026-08-15-twine-hotkey-defaults.md`](./2026-08-15-twine-hotkey-defaults.md)
(the proposed default keymap).

Goal: a VSCode-style **Keyboard Shortcuts** screen — full width, one row per command, searchable
by name *and* by pressing the keys, with duplicate detection. Reached from Preferences.

**Everything here is designed to be upstreamable to twinejs.** No new dependencies, no
Sliders-specific commands, additive props only, new strings in `en-US.json` only, and each
section maps to a PR that stands on its own. See §14.

This doc assumes phase 1 of the registry plan exists (`src/hotkeys/`, `Command`, `useCommand`,
scope chain). Everything here reads the registry; nothing here is needed to make hotkeys work.

---

## 1. Entry points

### 1.1 From the Twine toolbar tab

> **Shipped differently.** This started out as a button inside the Preferences
> dialog, next to the enhanced-editors checkbox. It ended up on the Twine toolbar
> tab instead, between Story Formats and About Twine, where it sits beside the
> other app-level destinations rather than being buried one dialog deep. The
> original sketch is kept below for the record.

```tsx
	<IconButton
		icon={<IconFileCode />}
		label={t('routeActions.app.storyFormats')}
		...
	/>
+	<IconButton
+		icon={<IconKeyboard />}
+		label={t('dialogs.keyboardShortcuts.title')}
+		onClick={handleKeyboardShortcuts}
+	/>
	<IconButton icon={<IconAward />} label={t('routeActions.app.aboutApp')} ... />
```

`AppActions` already registers the `app.keyboardShortcuts` command, so the button
and the command share one handler.

### 1.1a Original sketch: from Preferences

`src/dialogs/app-prefs.tsx:84` currently ends with the enhanced-editors checkbox. Add a button
directly beside it:

```tsx
	<CheckboxButton
		label={t('dialogs.appPrefs.useEnhancedEditors')}
		onChange={handleUseCodeMirrorChange}
		value={prefs.useCodeMirror}
	/>
+	<IconButton
+		icon={<IconKeyboard />}
+		label={t('dialogs.appPrefs.keyboardShortcuts')}
+		onClick={() =>
+			dispatch({
+				type: 'addDialog',
+				component: KeyboardShortcutsDialog,
+				maximized: true
+			})
+		}
+	/>
```

`IconKeyboard` is in `@tabler/icons`, already a dependency. `dispatch` here is
`useDialogsContext()`'s, so `AppPrefsDialog` gains one hook it doesn't currently use.

### 1.2 Other entry points (free once the screen exists)

| trigger | notes |
|---|---|
| Command palette → "Keyboard Shortcuts" | one `useCommand` registration |
| `mod+k mod+s` | VSCode parity; needs chord support (§7) — ship after single-chord works |
| Link at the bottom of the `?` help overlay | one line |

---

## 2. A maximized dialog

It lives in the existing dialog stack and **opens maximized**. No new route, no new
window-management concept — `DialogCard` already supports this
(`src/components/container/dialog-card/dialog-card.tsx:25`), and `Dialogs` already renders
maximized dialogs in a full-width `.maximized` container sized to the viewport minus the
unmaximized column (`src/dialogs/context/dialogs.tsx:26,55`).

```tsx
export const KeyboardShortcutsDialog: React.FC<DialogComponentProps> = props => (
	<DialogCard
		{...props}
		className="keyboard-shortcuts-dialog"
		headerLabel={t('dialogs.keyboardShortcuts.title')}
		maximizable
	>
		<div data-hotkey-scope="keybindings">…</div>
	</DialogCard>
);
```

One additive change to the store: `addDialog` cannot currently request a maximized dialog.
`src/dialogs/dialogs.types.ts:37` and `src/dialogs/context/reducer.ts:36` both need one field:

```ts
	| {
			type: 'addDialog';
			component: React.ComponentType<any>;
+			maximized?: boolean;
			props?: Record<string, any>;
	  }
```

```ts
	return [
		...state,
		{
			collapsed: false,
			component: action.component,
			highlighted: false,
-			maximized: false,
+			maximized: action.maximized ?? false,
			props: action.props
		}
	];
```

Backward compatible, and useful beyond this screen (the passage editor is an obvious second
caller). Maximize is already exclusive — `setDialogMaximized` un-maximizes every other dialog
(`reducer.ts:70`) — so no new invariants.

Consequences worth designing around:

- **The user can un-maximize.** At `prefs.dialogWidth` (600–800px) the table must collapse to two
  columns: command (label + scope on a second line) and binding. One CSS breakpoint on the
  dialog's own width, not the viewport's — use a container query or a `maximized` class check,
  since the dialog width is independent of the window.
- **Other dialogs stay open beside it.** That's a feature: you can watch the passage editor while
  rebinding something. The maximized container already reserves room for them.
- **`Escape` closes the dialog** via `DialogCard`'s `onKeyDown` (`dialog-card.tsx:71`). Record
  mode and the capture overlay must `stopPropagation()` on Escape, or arming the recorder and
  pressing Escape to clear it would close the whole screen. This is the one real gotcha of the
  dialog approach; it's three lines.

The dialog content root carries `data-hotkey-scope="keybindings"`, and the dispatcher gets one
rule: **if `keybindings` is in the scope chain, only commands registered in that scope resolve.**
Otherwise you'd fire the very shortcut you're inspecting. The story map behind it stays mounted
and registered — it just can't win.

---

## 3. Layout

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│ Keyboard Shortcuts                                          [⤢] [⌄] [✕]            │
├────────────────────────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────────┐  ┌──────────────┐   │
│ │ 🔎  Type to search, or record keys…                    [⌨] │  │ ⚠ 2 conflicts│   │
│ └────────────────────────────────────────────────────────────┘  └──────────────┘   │
│  Showing macOS keys ▾ — ⌘ Command · ⌥ Option · ⌃ Control · ⇧ Shift                  │
│  [ All ]  [ Modified 3 ]  [ Unbound 11 ]  [ Conflicts 2 ]         [ ⟲ Reset all ]   │
├──────────────────────────┬──────────────────┬───────────────┬──────────┬───────────┤
│ Command                  │ Keybinding       │ Scope         │ Source   │           │
├──────────────────────────┼──────────────────┼───────────────┼──────────┼───────────┤
│ New passage              │ N                │ Story map     │ Default  │  ✎  ＋ 🗑 │
│  passage.create          │                  │               │          │           │
│ Rename                   │ F2               │ Story map     │ User     │  ✎  ＋ 🗑 │
│  passage.rename          │                  │               │          │           │
│ Rename                   │ F2               │ Story list    │ Default  │  ✎  ＋ 🗑 │
│  story.rename            │                  │               │          │           │
│ ⚠ Go to passage          │ P                │ Story map     │ Default  │  ✎  ＋ 🗑 │
│  passage.goTo            │                  │               │          │           │
│ ⚠ Play story             │ P                │ Story map     │ User     │  ✎  ＋ 🗑 │
│  build.play              │                  │               │          │           │
│ Delete passage           │ —                │ Story map     │ Default  │  ✎  ＋ 🗑 │
│  passage.delete          │                  │               │          │           │
└──────────────────────────┴──────────────────┴───────────────┴──────────┴───────────┘
```

Notes on the mock:

- Command cell is two lines: translated label (from `Command.label`), then the id in a muted
  monospace. The id is what users quote in bug reports and what the `@id:` filter matches.
- Keys render as `<kbd>` chips, formatted for the platform shown in the strip (§5).
- Two rows can share a label ("Rename") — that is exactly why **Scope is a column, not just a
  filter**. Scope is the disambiguator, and it's what the user needs in order to predict what F2
  will do.
- Row actions appear on hover/focus: ✎ change, ＋ add a second binding, 🗑 remove. Right-click
  gives the same, plus "Reset" and "Copy command id".
- `—` in Keybinding means unbound (registered, no key). This column is the discovery surface: a
  user scanning for "what could I bind?" reads it.

Fixed row height, plain `<table>` — the registry holds ~40 commands after phase 3, so
virtualization would be cost without benefit, and a real table stays accessible and sortable.

---

## 4. The search field

One field, two modes, toggled by the ⌨ button on its right (VSCode's "Record Keys").

### 4.1 Text mode (default)

Substring/fuzzy match against: translated label, command id, scope display name, and the
*formatted* binding text (so typing `ctrl+shift` works without entering record mode).

Filter tokens, parsed out of the query before fuzzy matching:

| token | effect |
|---|---|
| `@scope:story-map` | only that scope (raw key or display name) |
| `@source:user` / `@source:default` | overridden vs. untouched |
| `@unbound` | commands with no binding |
| `@conflicts` | only rows in a conflict group |
| `@id:passage.` | prefix match on command id |

The chips under the field insert/remove these tokens, so the two mechanisms can't disagree.

### 4.2 Record mode (search *by* keypress)

When armed, the field stops being a text input:

1. Swallow every `keydown` (`preventDefault` + `stopPropagation`), including `Tab`, `Enter`,
   `Escape`, `mod+…`. Safe because the whole dialog is scope `keybindings` (§2) — and
   `stopPropagation` is what keeps `DialogCard` from closing on Escape.
2. Normalize with the same `eventToKeyString()` the dispatcher uses — one code path, so what you
   record is exactly what will match at runtime.
3. Show the chord as chips inside the field, with an ✕ to clear.
4. Filter to **every** command whose binding contains that chord, across all scopes, ignoring the
   scope chip — the whole point is "who else has this key?".
5. Modifier-only presses (just `Shift`) don't commit; they render as a live preview, which is
   also how the user discovers what their Super/Win key reports as.

Exit: the ⌨ toggle, or `Escape` — first press clears the recorded chord, second press disarms.
Only a third would reach the dialog and close it, which is a reasonable escape hatch.

This mode is the answer to "what does F2 do here?": arm, press F2, see all three rows.

---

## 5. Modifier keys and platform

macOS, Windows and Linux are detected separately, and the strip **below the search field** says
in words which physical key `mod` means. This is the line that stops "⌘K" from being meaningless
to a Linux user and stops a Windows user from hunting for a Command key.

### 5.1 Detection

New `src/util/platform.ts`, in the style of the existing `src/util/is-electron.ts`:

```ts
export type Platform = 'linux' | 'mac' | 'windows';

export function detectPlatform(): Platform {
	// userAgentData is Chromium-only but exact; navigator.platform is deprecated
	// but universally implemented and enough to tell three families apart.
	const raw =
		(navigator as any).userAgentData?.platform ??
		navigator.platform ??
		'';

	if (/mac/i.test(raw)) return 'mac';
	if (/win/i.test(raw)) return 'windows';
	return 'linux';
}
```

Linux is the fallback rather than a fourth "unknown" case: its modifier layout (Ctrl/Alt/Shift,
Super reserved by the desktop environment) is also the correct behavior for any platform we
can't identify, so an unknown platform degrades into something usable.

Electron could report `process.platform` through the preload bridge for certainty. Not worth a
new IPC channel — the userAgent in Electron already contains the OS.

### 5.2 What each platform gets

| | `mod` is | display | reserved by the OS/WM — never bind |
|---|---|---|---|
| macOS | `metaKey` (⌘) | `⌘ ⌥ ⌃ ⇧` | ⌘Space, ⌘Tab, ⌃↑, F11 |
| Windows | `ctrlKey` | `Ctrl Alt Shift Win` | Win, Win+anything, Alt+Tab, Alt+F4 |
| Linux | `ctrlKey` | `Ctrl Alt Shift Super` | Super, Super+anything (GNOME/KDE grab it), Ctrl+Alt+F1–F12 |

The strip renders as:

```
Showing macOS keys ▾   — ⌘ Command · ⌥ Option · ⌃ Control · ⇧ Shift
Showing Windows keys ▾ — Ctrl · Alt · Shift   (Win key is reserved by Windows)
Showing Linux keys ▾   — Ctrl · Alt · Shift   (Super key is reserved by your desktop)
```

The `▾` is a select, defaulting to the detected platform, that lets you view the keymap as
another platform sees it. That's how you sanity-check a keymap you're about to share, write docs
against, or file a bug about — and it costs one piece of state, because everything downstream
already goes through `formatKeyString(binding, platform)`.

### 5.3 `mod` vs `meta` in the grammar

`mod` is a *portable* modifier that resolves per platform. `meta` is the literal Meta/Super/Win
key. Both exist in the key-string grammar (§7), but they behave differently in the editor:

- Capturing ⌘+K on macOS records **`mod+k`**, not `meta+k` — so a keymap authored on a Mac works
  on Linux. This is the single most important normalization decision in the whole feature.
- Capturing Super+K on Linux or Win+K on Windows records `meta+k` and shows a warning: *"The
  Super key is usually reserved by your desktop environment and may never reach Twine."* Warn,
  don't block — some window managers leave it free, and it's the user's machine.
- `formatKeyString('mod+k', 'mac')` → `⌘K`; `('mod+k', 'windows')` → `Ctrl+K`.

Same function drives the table, the capture overlay, the `IconButton` tooltips, and the `?`
overlay — so a platform bug is one fix, not five.

### 5.4 Environment is a separate axis

Platform (mac/windows/linux) answers "what do I draw". **Environment** — browser vs. Electron,
via the existing `src/util/is-electron.ts` — answers "does this binding exist at all". Some
bindings ship on web only because the Electron menu swallows them (defaults doc §2.3): `mod+z`,
`mod+shift+z`, `mod+a`.

The table reads `defaultKeymap[id].env` and renders accordingly:

| showing | row |
|---|---|
| web build | normal, editable |
| desktop build | 🔒 lock badge, binding shown greyed, tooltip *"Handled by the application menu on desktop."*, editing disabled |

Unlike the platform select, this is **not** user-switchable — you are in one environment and the
screen should tell you the truth about it. The lock disappears by itself the day the menu roles
are replaced, because it's derived from the keymap rather than hard-coded here.

---

## 6. Editing a binding

Double-click a row, press `Enter` on a focused row, or click ✎:

```
┌─────────────────────────────────────────────┐
│  Press desired key combination              │
│                                             │
│            ┌───────────────┐                │
│            │   ⌘  ⇧  P     │                │
│            └───────────────┘                │
│                                             │
│  ⚠ ⌘⇧P is already bound to “Command         │
│    palette” in Global. Saving will make     │
│    both fire — Story map wins.              │
│                                             │
│  Scope: Story map                           │
│                                             │
│              [ Cancel ]  [ Save ]           │
└─────────────────────────────────────────────┘
```

- Live conflict warning updates on every keystroke, before saving. It **warns, never blocks** — a
  user may genuinely want to shadow a global binding in one scope, and the resolution rule
  (innermost wins) is stated right there.
- Scope is read-only in the first version. Letting users move a command between scopes is
  powerful and an excellent way to make the app unusable.
- `Enter` saves, `Escape` cancels (with `stopPropagation`, per §2). Consequence: **`Escape` is
  not user-bindable.** That's correct — Esc is the app-wide dismiss (`dialog-card.tsx:71`) and
  shouldn't be remappable. Show it as a disabled row rather than pretending otherwise.
- The overlay is a `Card` inside the dialog, not another `DialogCard` — it must not enter the
  dialog stack.

Unbind = 🗑, or `Delete`/`Backspace` on a focused row. "Unbound" is a distinct state from "reset
to default" (§9).

---

## 7. Key string format

Shared with the dispatcher; the editor only reads and writes it.

```
chord    := [modifier '+']* key
binding  := chord (' ' chord)*        // space-separated = sequence, VSCode style
modifier := 'mod' | 'ctrl' | 'alt' | 'shift' | 'meta'
```

Canonical order is `mod ctrl alt shift meta`, lowercased, so `Shift+Mod+P` and `mod+shift+p` are
the same string. That normalization is what makes duplicate detection reliable.

Ship **single-chord only** (the capture overlay rejects a second chord with "sequences aren't
supported yet"), but define the grammar now so `mod+k mod+s` lands later without a storage
migration.

---

## 8. Duplicate detection

Two distinct relationships; the UI must not call both "conflict".

**Conflict** — same normalized binding, same scope. Ambiguous: the dispatcher would pick by
registration order, which is effectively arbitrary. Red ⚠ on every row in the group, counted in
the header badge, `@conflicts` filter.

**Shadow** — same normalized binding, different scopes in the same chain (e.g. `global` and
`story-map`). Deterministic: innermost wins. Amber ⓘ on the *shadowed* (outer) row only —
"overridden by Story map when it has focus". Not counted as a conflict.

```ts
// src/hotkeys/conflicts.ts
export interface BindingGroup {
	binding: string;
	scope: string;
	commands: Command[];   // length > 1 → conflict
}

export function findConflicts(commands: Command[]): BindingGroup[];
export function findShadows(commands: Command[]): {outer: Command; inner: Command}[];
```

Both run over the *resolved* keymap (defaults + user overrides), memoized on the registry map.
The same `findConflicts` powers the dev-mode `console.warn` from phase 4 of the registry plan —
write it once, call it twice.

Edge case: `global` and `dialog` commands only share a chain *while a dialog is open*. Treat
scope relationships as static (every non-global scope nests under `global`) rather than modelling
runtime chains — the table has to be truthful at rest, not at one particular focus state.

Instance-scoped registrations (§10.2) are excluded from conflict detection against each other.

---

## 9. Storage

New pref, additive:

```ts
// src/store/prefs/prefs.types.ts
	/**
	 * User overrides of default keyboard shortcuts, keyed by command id. An empty
	 * array means the user explicitly unbound the command; a missing key means
	 * the default applies.
	 */
	hotkeyOverrides: Record<string, string[]>;
```

Default `{}` in `src/store/prefs/defaults.ts`. `PrefsAction['update']['value']` already permits
`Record<string, Color>` (`prefs.types.ts:16`); widen that union with `Record<string, string[]>` —
one line, and persistence plus the Electron pref bridge then work unchanged.

Storing **only diffs** is the important part: a user who never opens this screen silently picks
up improved defaults in later releases, and "Reset" is `delete overrides[id]` rather than
"remember what the default used to be".

Resolution, in `HotkeysProvider`:

```ts
const binding = prefs.hotkeyOverrides[command.id] ?? defaultKeymap[command.id] ?? [];
```

Bindings are stored platform-independently (`mod+k`, never `⌘K`), so the same prefs file works
across machines — which is what makes the import/export in the ⋯ menu worth having, since the web
and desktop builds have separate storage.

---

## 10. Scopes, and "F2 renames whatever's focused"

### 10.1 Scope is derived from the DOM

Per the registry plan: at keydown, walk up from `document.activeElement` collecting
`data-hotkey-scope`, innermost first, then `global`. No focus store to keep in sync.

| scope key | attach to | display name (`hotkeys.scopes.*`) |
|---|---|---|
| `global` | — (implicit fallback) | Global |
| `story-list` | story-list route root | Story list |
| `story-map` | `MainContent` in `story-edit-route.tsx` | Story map |
| `story-card` | `SelectableCard` in `story-card.tsx:36` | Selected story |
| `passage-card` | `SelectableCard` in `passage-card.tsx:115` | Selected passage |
| `dialog` | `DialogCard` root (`dialog-card.tsx:80`) | Dialog |
| `passage-editor` | CodeMirror wrapper in the passage-edit dialog | Passage text |
| `fuzzy-finder` | `.fuzzy-finder` container (`fuzzy-finder.tsx:95`) | Search box |
| `keybindings` | this dialog's content root | Keyboard shortcuts |

Both card components already render `tabIndex={0}` focusable divs
(`src/components/container/card/selectable-card.tsx:48`), so Tab already walks the cards today and
`document.activeElement` genuinely is the card the user is looking at. That's what makes
focus-derived scope work here rather than being a nice theory.

### 10.2 The missing piece: *which* card

Scope tells you the *kind* of region, not the *instance*. Twenty passage cards each registering
`passage.rename` in scope `passage-card` are twenty identical entries — an ambiguity the conflict
detector would (correctly) scream about.

Fix: `useCommand` takes an optional element ref, and the dispatcher requires containment.

```ts
export interface Command {
	// …
	/** If set, this command only resolves when focus is inside this element. */
	element?: React.RefObject<HTMLElement>;
}
```

```ts
// in the dispatcher, when matching a candidate:
if (command.element && !command.element.current?.contains(document.activeElement)) continue;
```

Registrations carrying an `element` are **instance-scoped**: same id + same scope + different
element is fine by construction, they're excluded from conflict detection against each other, and
the editor collapses them into one row.

### 10.3 F2, end to end

Three registrations, one key, no coordination between them:

```tsx
// passage-card.tsx — instance-scoped
useCommand({
	id: 'passage.rename', scope: 'passage-card', element: cardRef,
	label: t('common.rename'), run: () => setRenaming(true)
});

// story-card.tsx — instance-scoped
useCommand({id: 'story.rename', scope: 'story-card', element: cardRef, …});

// passage-edit dialog toolbar — scope-scoped, allowed inside CodeMirror
useCommand({
	id: 'passage.rename', scope: 'dialog', allowInInput: true,
	label: t('common.rename'), run: () => setRenaming(true)
});
```

Focused passage card → chain `['passage-card', 'story-map', 'global']` → the card's own
registration wins. Focus inside the passage editor → chain
`['passage-editor', 'dialog', 'global']` → the dialog's registration. Focus nowhere (`body`) →
chain `['global']` → nothing bound → F2 does nothing, which is right for "no selection".

`allowInInput: true` is required on the editor one and is safe: F2 produces no character, so
letting it through a textarea can't eat typing. General rule: function keys and `mod+`/`alt+`
chords may set `allowInInput`; bare letters never may.

### 10.4 The blocker: rename has no programmatic opener

Rename is a `PromptButton` popover whose open state is internal — it explicitly omits
`open`/`onChangeOpen` from the props it accepts (`src/components/control/prompt-button.tsx:20`),
so a hotkey has nothing to call. `ConfirmButton` omits the same two
(`confirm-button.tsx:11`), and `MenuButton` keeps `open` in local state with no prop at all
(`menu-button.tsx:41`).

The underlying `CardButton` is already fully controlled — it takes `open` and `onChangeOpen`
(`card-button.tsx:13-22`) and `build-actions.tsx:108` drives one from parent state today. So the
fix is to stop hiding that capability:

```ts
export interface PromptButtonProps
-	extends Omit<CardButtonProps, 'ariaLabel' | 'onChangeOpen' | 'open'> {
+	extends Omit<CardButtonProps, 'ariaLabel'> {
+	open?: boolean;
+	onChangeOpen?: (value: boolean) => void;
```

with local state used when the props are absent — the standard uncontrolled/controlled pattern.
Identical change for `ConfirmButton`; `MenuButton` needs the props introduced. Every existing call
site keeps working untouched.

`RenamePassageButton` / `RenameStoryButton` then forward the pair, and the F2 command sets it.

---

## 11. What else can't be triggered this way?

Rename is not a one-off — it's a category. Here's the audit of every toolbar action against
"could a hotkey run this today?"

### 11.1 Works as-is — plain handler, nothing to change (the majority)

`passage.create`, `passage.edit`, `passage.delete`, `passage.test`, `passage.startAt`,
`passage.goTo`, `passage.selectAll`, `passage.deselectAll`, `story.details`, `story.findReplace`,
`story.javascript`, `story.stylesheet`, `story.passageTags`, `story.create`†, `story.edit`,
`story.duplicate`, `library.import`, `app.preferences`, `app.storyFormats`, `app.about`,
`app.reportBug`, `build.exportAsTwee`, `story.undo`, `story.redo`.

These are either `onClick={() => dispatch({type: 'addDialog', …})}` or a direct store dispatch.
`useCommand({run: handleClick})` is genuinely all they need.

† `story.create` is a `PromptButton` (`create-story-button.tsx:56`) — it needs §10.4 like rename.

### 11.2 Blocked on the controlled-open fix (§10.4)

| command | component | why |
|---|---|---|
| `passage.rename`, `story.rename` | `PromptButton` | internal open state |
| `story.create` | `PromptButton` | internal open state |
| `story.delete` | `ConfirmButton` (`delete-story-button.tsx:28`) | internal open state |
| `passage.addTag`, `story.tag` | `TagCardButton` (`tag-card-button.tsx:29`) | own `useState` around a `CardButton` |
| `passage.setSize`, `view.sort`, `view.tagFilter` | `MenuButton` | no `open` prop exists |

One shared fix in three small components unblocks all of them. This is the single highest-value
change in the whole plan and is worth its own PR — it improves testability regardless of hotkeys.

### 11.3 Works, but the *timing* matters

- **`build.play` / `build.test` / `build.proof`** call `window.open(…, '_blank')` in the web build
  (`src/store/use-story-launch.ts:54,57,60`). Popup blockers require transient user activation —
  a `keydown` grants it exactly as a click does, and the `window.open` is reached synchronously in
  the handler, so hotkeys are no worse than the button. The rule to preserve: **never `await`
  before opening a window or picking a file.** The dispatcher must call `run()` synchronously from
  the keydown handler, not from a `setTimeout` or a microtask.
- **`build.publishToFile`, `library.archive`, `build.exportAsTwee`** use `file-saver`
  (`src/util/save-file.ts:10`), which is an anchor click. Same activation rule; `publishToFile`
  does `await publishStory(...)` first (`build-actions.tsx:82`), which is a pre-existing risk
  shared with the button, not something hotkeys introduce.
- **`library.import`** opens a dialog containing a `FileInput`
  (`src/components/control/file-input.tsx:47`); the user clicks the real `<input type="file">`
  themselves. Nothing to solve.

### 11.4 Needs a handle the registry doesn't have yet

- **Anything inside CodeMirror** — `passage.insertLink`, editor-local undo/redo, formatting
  toolbar actions. These need the CodeMirror instance, which lives in the editor component. The
  fix isn't in the hotkey layer: the passage-edit dialog registers those commands itself, closing
  over its own CM ref, exactly like §10.3's third registration. Out of scope for the first PRs.
- **Commands that need an argument** — "start at *which* passage", "rename *which* story". Solved
  by instance scoping (§10.2) plus reading the selection from the store, not by the palette
  prompting for input. The palette should show such commands as disabled with a reason
  ("select a passage first") rather than hiding them.

### 11.5 Can't be fixed here at all

- **Electron menu accelerators** (`mod+z`, `mod+shift+z`, `mod+a`) never reach the renderer in the
  desktop build — see the defaults doc §2.2. Not a UI problem; the menu roles need replacing with
  click handlers that dispatch the same commands. Until then those bindings ship as `env: 'web'`
  (defaults doc §2.3), and this screen renders them as locked rows on desktop (§5.4) rather than
  pretending they work.
- **OS/browser-reserved keys** — defaults doc §2.1. The capture overlay should warn when a user
  picks one, using the platform from §5.

**Conclusion:** apart from the Electron menu, nothing is genuinely un-triggerable. There are two
mechanical gaps — controlled open state on four popover components, and a CodeMirror handle — and
one discipline rule: run commands synchronously from keydown.

---

## 12. Files

```
src/dialogs/keyboard-shortcuts/
	index.ts
	keyboard-shortcuts-dialog.tsx     — DialogCard shell, keybindings scope, Escape handling
	keyboard-shortcuts-dialog.css     — table layout, narrow (unmaximized) variant
	shortcut-search.tsx               — text + record-keys field
	platform-strip.tsx                — detected platform, modifier legend, platform select
	shortcut-table.tsx                — table, sorting, row selection
	shortcut-row.tsx                  — label/id, kbd chips, scope, source, row actions
	capture-overlay.tsx               — press-a-combination modal + live conflict warning
	__tests__/

src/hotkeys/
	conflicts.ts                      — findConflicts / findShadows (shared with dev warnings)
	default-keymap.ts                 — command id → default binding(s)
	use-resolved-keymap.ts            — defaults + prefs.hotkeyOverrides
	key-chip.tsx                      — <kbd> rendering, shared with tooltips + help overlay

src/util/platform.ts                  — detectPlatform()
```

New i18n strings, `public/locales/en-US.json` only (the other 23 locales fall back — see the
registry plan's i18n note):

```
dialogs.appPrefs.keyboardShortcuts
dialogs.keyboardShortcuts.title
dialogs.keyboardShortcuts.searchPlaceholder
dialogs.keyboardShortcuts.recordKeys
dialogs.keyboardShortcuts.columns.{command,binding,scope,source}
dialogs.keyboardShortcuts.source.{default,user}
dialogs.keyboardShortcuts.unbound
dialogs.keyboardShortcuts.filters.{all,modified,unbound,conflicts}
dialogs.keyboardShortcuts.capture.{prompt,save,cancel}
dialogs.keyboardShortcuts.conflict        — "{{binding}} is already bound to “{{label}}” in {{scope}}."
dialogs.keyboardShortcuts.shadowed        — "Overridden by {{scope}} when it has focus."
dialogs.keyboardShortcuts.resetAll
dialogs.keyboardShortcuts.platform.{mac,windows,linux}
dialogs.keyboardShortcuts.platform.superReserved
dialogs.keyboardShortcuts.lockedByAppMenu    — "Handled by the application menu on desktop."
hotkeys.scopes.*                          — one per scope key in §10.1
```

Command **labels** need no new strings — they reuse each button's existing `t(...)`.

---

## 13. Tests

- `platform`: each `navigator.platform` / `userAgentData` shape maps to the right platform;
  unknown falls back to Linux.
- `key-string`: normalization round-trips; ⌘ captured on mac stores `mod+`, Super on Linux stores
  `meta+`; `formatKeyString` renders per platform; modifier ordering canonicalizes.
- `conflicts`: same key/same scope → conflict; same key/different scope → shadow, not conflict;
  instance-scoped duplicates → neither.
- `use-resolved-keymap`: override wins; `[]` means unbound, not default; missing key means
  default; `env: 'web'` entries resolve to no binding when `isElectron()` is true, and their rows
  render locked.
- Dialog: one row per registered command; text filter; `@scope:` token; record mode matches by
  key; Escape while recording clears rather than closing; capture writes the pref and shows the
  warning.
- Reducer: `addDialog` with `maximized: true` opens maximized and un-maximizes others.
- A11y: fully operable by keyboard alone — arrows move rows, Enter opens capture, Delete unbinds.
  This screen of all screens must not require a mouse.

---

## 14. Build order, and upstreaming

Each step is a self-contained PR against twinejs:

1. **`addDialog` gains `maximized`** — 3 lines + a reducer test. Useful on its own.
2. **Controlled open for `PromptButton` / `ConfirmButton` / `MenuButton` / `TagCardButton`**
   (§10.4). Pure refactor, no behavior change, better testability. Sell it as that; hotkeys are a
   consequence.
3. **`src/util/platform.ts` + `formatKeyString`** — pure functions, fully unit-testable.
4. **Read-only dialog**: resolved keymap + table + text search + platform strip. Ships value
   immediately ("what are the shortcuts?") and replaces the `?` overlay's content.
5. **Conflicts** — `conflicts.ts`, badges, `@conflicts` filter, dev-mode warning from the same
   function.
6. **Record-keys search** — needs only `eventToKeyString`, already written for the dispatcher.
7. **Editing** — `hotkeyOverrides` pref, capture overlay, reset, unbind.
8. **Instance scoping + F2** — `Command.element`, the three rename registrations.
9. **Import/export**, chord sequences, `mod+k mod+s`.

Upstreaming constraints held throughout: no new npm dependencies (`react-popper`,
`focus-trap-react`, `react-transition-group`, `@tabler/icons` are all already present); no
Sliders-specific commands, scopes or strings; new strings in `en-US.json` only; additive props
with existing call sites untouched; tests colocated in `__tests__` matching the repo's layout;
tabs for indentation and the existing Prettier config.

---

## 15. Open questions

- **Scope select in the capture overlay** — read-only first, or let users move a command between
  scopes? Moving is powerful and an excellent way to break your app. Leaning read-only permanently.
- **Should locked rows be hidden instead of shown?** §5.4 shows them greyed with a lock. Hiding
  them entirely on desktop is tidier but makes "why doesn't ⌘Z work here?" unanswerable from
  inside the app. Leaning toward showing them.
- **Unmaximized layout.** Two columns is the plan, but a 600px-wide shortcuts editor may simply
  be a bad idea. Alternative: refuse to un-maximize (drop `maximizable`) and keep the screen
  honest. Decide after step 4 with something real to look at.
- **`?` help overlay vs. this dialog.** Once the table exists the overlay is arguably redundant.
  Keep it as a fast, non-navigating cheat sheet; make it link here.

---

## 16. Implementation status (2026-08-15)

Built on branch `feat/hotkeys`. Steps 1–8 of §14 are done; the whole test suite (258 suites,
1799 tests) plus a new Playwright spec (`e2e/hotkeys.spec.ts`, 7 tests) pass, and the existing
smoke tests still pass.

### Deviations from this plan, and why

- **Command labels get their own strings** (`hotkeys.commands.<id>`) rather than reusing each
  button's `t(...)`. "New" and "Rename" are ambiguous in a flat list even with a scope column,
  and the registry needed labels for commands whose components aren't mounted.
- **i18next splits keys on `.`**, so those labels are nested by ID segment
  (`hotkeys.commands.passage.create`), not stored under a literal `"passage.create"` key. The
  flat version silently rendered raw key strings; only the browser test caught it, because the
  jest i18n mock returns the key it's given.
- **`src/hotkeys/command-catalog.ts` was added.** The dialog can't be driven by the live registry
  alone: from the story list, none of the story map's commands are mounted. The catalog is the
  list of what exists; the registry is what can run right now. A test asserts the two agree.
- **`Command.scope` accepts `null`**, meaning "don't register". The passage editor shows a Test
  button that the story map toolbar already owns the shortcut for; without this they'd both
  register `passage.test` in the same scope.
- **Rename registers in the toolbar, not per card.** `Command.element` (§10.2) is implemented and
  tested, but the rename UI is a single toolbar popover acting on the selection, and a focused
  card is the selected one--so instance scoping isn't needed to make F2 do the right thing.
  The mechanism is there for commands that do need it.
- **`MainContent` now sets `tabIndex={-1}`.** It already called `focus()` on itself on mount,
  which silently did nothing; without it, `document.activeElement` is `<body>` and the story map
  scope never resolves.
- **`RouteToolbar` renders every tab panel** (`forceRenderTabPanel` plus CSS to hide unselected
  ones). Commands only exist while their component is mounted, and react-tabs unmounts hidden
  panels--so before this, `mod+enter` only played the story while the Build tab happened to be
  showing. This was found by the browser test, not by unit tests.

### Not built yet

Command palette, the `?` help overlay, shortcut hints in `IconButton` tooltips, chord sequences
(`mod+k mod+s`), import/export of a keymap, and `passage.insertLink`. Everything they depend on
--the registry, key strings, conflicts, the resolved keymap--is in place.
