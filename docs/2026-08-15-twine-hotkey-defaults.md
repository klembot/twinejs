# Twine hotkeys — recommended default keymap

Date: 2026-08-15. Companion to [`2026-08-15-twine-hotkeys.md`](./2026-08-15-twine-hotkeys.md)
(registry/dispatcher) and [`2026-08-15-twine-hotkeys-ui.md`](./2026-08-15-twine-hotkeys-ui.md)
(the keybinding editor).

This is the table the registry plan's §5 asks for: command ids and their default bindings, fixed
before phase 3 so ids and keys land together.

---

## 1. Principles

1. **Twine's users are writers.** Most of their time is spent inside a textarea/CodeMirror. Any
   bare letter that can fire while typing is a bug, not a shortcut. Bare letters are allowed
   **only** in canvas-like scopes (`story-map`, `story-list`) where no text entry exists.
2. **The story map is a canvas.** There, single letters are the right call — Figma, Blender and
   Photoshop all work this way, and Twine already ships bare `p`, `-`, `=`. Keep that precedent.
3. **Bind what you do many times per session.** Create/edit/rename/delete/navigate/zoom/play.
   Once-a-session actions (story details, stylesheet, archive, publish) get a command id and a
   palette entry, and **no default key**. An unbound command is not a failure — it's a row in the
   shortcuts editor waiting for the user who wants it.
4. **The web build is the default target.** Never pick a key that only works in Electron. Where
   the desktop menu makes a binding impossible (§2.2), ship it on web anyway and mark it
   environment-conditional (§2.3) rather than withholding it from everyone — the web build is
   where most people use Twine.
5. **Destructive actions get a modifier or a confirm.** The exception is `Delete`/`Backspace` for
   passages, which already ships, is undoable, and is what every canvas app does.
6. **Follow VSCode where an equivalent exists** (`mod+shift+p`, `F2`, `mod+f`, `mod+p`) — the
   overlap with Twine's audience is large, and it's the keymap this project's own editor screen
   is modelled on.

Notation: `mod` = ⌘ on macOS, Ctrl elsewhere. Display formatting is the shortcuts editor's
`formatKeyString` (⌘ ⌥ ⇧ ⌃ on mac, `Ctrl Alt Shift` elsewhere).

---

## 2. Keys we must not use

### 2.1 Reserved by the browser (web build)

A web page cannot `preventDefault()` these in Chrome; treat them as unavailable:

| key | steals |
|---|---|
| `mod+n`, `mod+shift+n` | new window / incognito |
| `mod+t`, `mod+shift+t` | new tab / reopen closed tab |
| `mod+w`, `mod+shift+w` | close tab / window |
| `mod+l` | focus address bar |
| `mod+q` (mac) | quit |
| `ctrl+tab`, `mod+1…9` | tab switching |
| `mod+shift+j` / `mod+alt+i` | devtools |

Interceptable, and fine to use, though they override a browser default: `mod+f`, `mod+p`,
`mod+s`, `mod+o`, `mod+d`, `mod+enter`.

Two that need a second option rather than avoidance:

- **`mod+shift+p` opens a private window in Firefox.** VSCode's palette key is still the right
  primary, but `F1` must be an equal-status alias (VSCode ships both), and the Firefox case
  should be called out in the shortcuts editor.
- **`mod+,` opens browser settings in Chrome on macOS.** Preferences is one toolbar click away
  anyway; ship the binding, accept that it may not reach us in one browser/platform combination.

`F5` (reload) and `F11` (fullscreen) are avoided here entirely — behavior varies by browser and
the failure mode ("my story editor reloaded") is bad.

### 2.2 Swallowed by the Electron menu (desktop build)

`src/electron/main-process/menu-bar.ts` builds its menu from Electron roles, and **role
accelerators fire before the renderer sees the keydown**. Affected keys:

| accelerator | role | consequence for us |
|---|---|---|
| `mod+z` / `mod+shift+z` / `ctrl+y` | `undo` / `redo` | our `story.undo` / `story.redo` never fire on desktop |
| `mod+a` | `selectAll` | `passage.selectAll` never fires on desktop |
| `mod+x` / `mod+c` / `mod+v` | cut/copy/paste | fine — we don't want these |
| `mod+0` / `mod+=` / `mod+-` | `resetZoom` / `zoomIn` / `zoomOut` | fine — browser-chrome zoom, distinct from our bare `-`/`=` |
| `mod+m`, `mod+w`, `mod+q`, `mod+h` | window/app | fine |

**This is probably an existing bug, not just a keymap constraint.** `role: 'undo'` sends an edit
command to the focused element — it undoes typing in a text field, and does nothing to the
undoable-stories store. So `mod+z` on the story map in Twine desktop likely does not undo a
passage move. Worth verifying on the desktop build; if it holds, the fix belongs with this work:
replace those three roles with `click` handlers that dispatch the corresponding command over IPC,
so the menu item and the hotkey run the same code.

Until that lands, don't hold the web build hostage to it — see §2.3.

### 2.3 Environment-conditional bindings

`src/util/is-electron.ts` already exists and is used throughout the app, so the keymap can simply
declare which environment a binding applies to:

```ts
// src/hotkeys/default-keymap.ts
export interface DefaultBinding {
	bindings: string[];
	/** Omitted = both. */
	env?: 'electron' | 'web';
}

export const defaultKeymap: Record<string, DefaultBinding> = {
	'passage.create': {bindings: ['n']},
	'story.undo':     {bindings: ['mod+z'], env: 'web'},
	'story.redo':     {bindings: ['mod+shift+z', 'ctrl+y'], env: 'web'},
	// …
};
```

One filter where the keymap is resolved:

```ts
const env = isElectron() ? 'electron' : 'web';
const active = entry.env === undefined || entry.env === env;
```

This is worth having as a mechanism, not just for undo:

- **Ship `mod+z` / `mod+shift+z` on web now.** It's the single most expected shortcut in any
  editor, the web build is where most people use Twine, and nothing about the Electron menu
  problem should delay it.
- **The shortcuts editor stays truthful.** Rows that don't apply to the current environment render
  with a lock badge and a tooltip ("handled by the application menu on desktop") instead of
  claiming a binding that will never fire. Detection already exists; the editor just reads it.
- **The Electron fix becomes a one-line keymap change** — delete `env: 'web'` — once the menu
  roles are replaced. No component touched, no re-litigating the keymap.

Note this is environment detection (`isElectron()`), which is orthogonal to *platform* detection
(mac/windows/linux, UI doc §5). A Linux Electron build is `electron` + `linux`; both filters apply.

---

## 3. The keymap

Legend: **●** = ships bound, **◐** = ships bound in one environment only (§2.3), **○** = command
exists, no default binding.

### 3.1 Global

| | key | command id | action | notes |
|---|---|---|---|---|
| ● | `mod+shift+p` | `app.commandPalette` | Command palette | Firefox: use `F1` |
| ● | `F1` | `app.commandPalette` | Command palette | second binding, same command |
| ● | `?` | `app.shortcutsHelp` | Shortcut cheat sheet | not in inputs; `shift+/` |
| ● | `mod+,` | `app.preferences` | Preferences | may be swallowed by Chrome/macOS |
| ● | `Escape` | `dialog.close` | Close topmost dialog | already implemented in `dialog-card.tsx:71`; document, don't rebind |
| ○ | — | `app.keyboardShortcuts` | Keyboard shortcuts editor | `mod+k mod+s` once chords land |
| ○ | — | `app.storyFormats`, `app.about`, `app.reportBug` | | palette only |

### 3.2 Story list (`story-list`)

| | key | command id | action | notes |
|---|---|---|---|---|
| ● | `n` | `story.create` | New story | bare letter — no text entry in this route |
| ● | `Enter` | `story.edit` | Open selected story | matches double-click |
| ● | `F2` | `story.rename` | Rename selected story | instance-scoped to the focused card |
| ● | `Delete` / `Backspace` | `story.delete` | Delete selected story | already behind a confirm |
| ● | `mod+d` | `story.duplicate` | Duplicate selected story | |
| ● | `t` | `story.tag` | Tag selected story | |
| ● | `mod+o` | `library.import` | Import story | matches the browser's "open file" instinct |
| ○ | — | `library.archive` | Archive library | writes a file; deliberate action |
| ○ | — | `library.storyTags`, `view.sort`, `view.tagFilter` | | palette only |

### 3.3 Story map (`story-map`)

| | key | command id | action | notes |
|---|---|---|---|---|
| ● | `n` | `passage.create` | New passage | same letter as the list — one thing to remember |
| ● | `Enter` | `passage.edit` | Edit selected passage(s) | matches double-click |
| ● | `F2` | `passage.rename` | Rename | needs `PromptButton` controlled open, UI doc §10.4 |
| ● | `Delete` / `Backspace` | `passage.delete` | Delete selected | **ships today**, unchanged |
| ◐ | `mod+z` | `story.undo` | Undo | **web only** (`env: 'web'`); the desktop menu owns it — §2.3 |
| ◐ | `mod+shift+z` / `ctrl+y` | `story.redo` | Redo | **web only**; `ctrl+y` is the Windows/Linux idiom |
| ◐ | `mod+a` | `passage.selectAll` | Select all | **web only**; `role: 'selectAll'` eats it on desktop |
| ● | `Escape` | `passage.deselectAll` | Deselect all | after any open dialog/finder has had it |
| ● | `p` | `passage.goTo` | Go to passage | **ships today, but globally** — narrow to this scope |
| ● | `mod+p` | `passage.goTo` | Go to passage | VSCode "go to file" parity, second binding |
| ● | `mod+f` | `story.findReplace` | Find and replace | overrides browser find, as expected |
| ● | `t` | `passage.test` | Test from selected passage | |
| ● | `-` | `view.zoomOut` | Zoom out | **ships today**; 3 levels: 1 → 0.6 → 0.3 |
| ● | `=` | `view.zoomIn` | Zoom in | **ships today**; also accept `+` |
| ● | `0` | `view.zoomReset` | Zoom to 100% | new; completes the set |
| ● | `mod+enter` | `build.play` | Play story | |
| ● | `mod+shift+enter` | `build.test` | Test story from start | |
| ○ | — | `passage.startAt` | Set as start passage | rare, and structural |
| ○ | — | `story.details`, `story.passageTags`, `story.javascript`, `story.stylesheet`, `story.rename` | | once-a-session; palette |
| ○ | — | `build.proof`, `build.publishToFile`, `build.exportAsTwee` | | writes files |

Undo/redo bind to the `useUndoableStoriesContext()` `undo`/`redo` the toolbar buttons already use
(`src/routes/story-edit/toolbar/undo-redo-buttons.tsx`), and inherit `disabled` from the same
`!undo` / `!redo` condition — so the command is registered but not enabled when there's nothing to
undo, and the shortcut is silently inert rather than throwing. Inside the passage editor,
CodeMirror's own `mod+z` must still win: `story.undo` does **not** set `allowInInput`, so it never
fires while a text field has focus (§3.4).

Deliberately **not** bound, though tempting:

- Arrow keys to nudge selected passages. Genuinely useful on a canvas, but there's no
  "move passage by delta" action yet and it needs grid/undo-coalescing decisions. Separate PR.
- `s` for start-at. Too close to a save reflex that does nothing here.

### 3.4 Passage editor (`passage-editor`, inside CodeMirror)

Every binding here needs `allowInInput: true`, and therefore must be a function key or a
modified chord — never a bare letter.

| | key | command id | action | notes |
|---|---|---|---|---|
| ● | `F2` | `passage.rename` | Rename this passage | safe in a textarea: produces no character |
| ● | `Escape` | `dialog.close` | Close the editor | already works via `DialogCard` |
| ● | `mod+shift+l` | `passage.insertLink` | Insert `[[]]` and place the cursor | `mod+l` is reserved |
| ○ | — | `passage.addTag`, `passage.setSize`, `passage.test` | | `mod+shift+t` is unusable in Chrome; leave to the palette |

CodeMirror's own bindings (`mod+z`, `mod+a`, word motion, etc.) must keep working. That falls out
of the dispatcher rule from the registry plan §2.3 step 2: inside an input, only `allowInInput`
commands are eligible, and everything else falls through to the editor untouched.

### 3.5 Fuzzy finder / command palette (`fuzzy-finder`)

Ships today, hand-rolled in `fuzzy-finder.tsx:38-77` with four copy-pasted `filter:` callbacks.
Same keys, moved into the registry — this is the phase-2 refactor that deletes code:

| | key | command id | action |
|---|---|---|---|
| ● | `Escape` | `finder.close` | Close |
| ● | `Enter` | `finder.select` | Choose highlighted result |
| ● | `↑` / `↓` | `finder.prev` / `finder.next` | Move highlight |

### 3.6 Keyboard shortcuts dialog (`keybindings`)

| | key | command id | action |
|---|---|---|---|
| ● | `Escape` | `dialog.close` | Close (clears recorded keys first — UI doc §4.2) |
| ● | `Enter` | `keybindings.edit` | Edit the focused row |
| ● | `Delete` / `Backspace` | `keybindings.unbind` | Unbind the focused row |
| ● | `↑` / `↓` | `keybindings.prev` / `keybindings.next` | Move row selection |

While this scope is active, no command from an outer scope resolves (UI doc §2).

---

## 4. Behavior changes to existing shortcuts

Three of the nine shipped hotkeys change behavior. All three are fixes, but they're
user-visible — worth a line in the release notes.

| what | today | proposed | why |
|---|---|---|---|
| `p` | fires anywhere in the app (`passage-fuzzy-finder.tsx:51`, no scope, no input filter) | only with the story map focused | typing `p` in a story-list rename field currently opens the passage finder |
| `-` / `=` | `{keydown: false, keyup: true}` (`use-zoom-shortcuts.ts:20`) | keydown, with `event.repeat` ignored | keyup was presumably a repeat guard; `repeat` is the direct fix and makes zoom feel immediate |
| `Backspace` / `Delete` | registered by the delete button component regardless of focus (`delete-passages-button.tsx:40`) | scope `story-map`, blocked in inputs | same class of bug as `p` |

`Escape` gains an ordering guarantee it doesn't have today: fuzzy finder → dialog →
deselect-all, innermost scope first, first match wins and stops.

---

## 5. Cheat sheet

What a new user should be able to learn in one sitting — this is the `?` overlay's content, and
a decent test of whether the keymap is memorable:

```
Everywhere        ⌘⇧P / F1   Command palette          ?    Shortcuts
                  ⌘,         Preferences              Esc  Close

Story map         N          New passage              ↵    Edit
                  F2         Rename                   ⌫    Delete
                  P / ⌘P     Go to passage            ⌘F   Find & replace
                  T          Test from here           ⌘↵   Play
                  - = 0      Zoom out / in / reset    ⌘A   Select all *
                  ⌘Z         Undo *                   ⌘⇧Z  Redo *

Story list        N          New story                ↵    Open
                  F2         Rename                   ⌫    Delete
                  ⌘D         Duplicate                T    Tag

* browser version only — on desktop these are on the application menu
```

Eleven keys carry the story map, and `N` / `↵` / `F2` / `⌫` mean the same thing in both routes.
That consistency is worth more than covering every button.

The footnote is generated, not written: the overlay renders it only when `isElectron()` is false
and at least one `env: 'web'` binding is shown, so the desktop cheat sheet simply omits those rows.

---

## 6. Rollout

- Land the table as `src/hotkeys/default-keymap.ts` — a plain map of command id → default
  binding(s) plus optional `env` (§2.3) — rather than sprinkling `hotkey:` literals across 40
  components. Components declare `id`, `scope`, `label`, `run`; the default binding is looked up
  centrally. That keeps this document and the code in one place, and makes "what's bound?"
  answerable without a grep.
- Phase 2 (migrating the nine existing hotkeys) can ship with only §4's three fixes.
- **Undo/redo can ship with phase 2**, ahead of the rest of the keymap. It needs nothing from the
  registry beyond registration, no controlled-open fix, no new UI — two `useCommand` calls in
  `undo-redo-buttons.tsx` plus `env: 'web'`. It is the highest-value single binding in this
  document and the one users will notice missing first.
- Phase 3 registers commands with **no** bindings first; add the ● rows once the shortcuts editor
  can show conflicts, so a mistake in this table is visible rather than mysterious.
- Every ● and ◐ row here should exist as an assertion in a keymap test: no two commands share a
  binding within a scope *and* environment, no bare-letter binding lacks a canvas scope, no
  binding is on the §2.1 reserved list, and every `env: 'web'` entry has a matching note in §2.2
  explaining why.

---

## 7. Implementation status (2026-08-15)

The table in §3 is implemented in `src/hotkeys/default-keymap.ts`, with these exceptions:

- `app.commandPalette`, `app.shortcutsHelp` and `passage.insertLink` don't exist yet, so they have
  no entry. `app.keyboardShortcuts` exists but is unbound, pending chord support.
- `story.rename` and `passage.rename` register in `story-list` / `story-map` (and `dialog` for the
  passage editor's rename) rather than in per-card scopes--see the UI doc §16.
- `passage.test` deliberately does **not** register in the passage editor: bare `t` has no
  business firing there, and the story map toolbar already owns it.

Two rules in §1 are now enforced by tests rather than convention
(`src/hotkeys/__tests__/resolve-keymap.test.ts`): no bare letter outside a canvas scope, and
nothing bound to a key from the §2.1 reserved list. A third checks no two commands share a
binding within a scope, on each of the three platforms.

The migration in §4 also fixed a bug it didn't predict: `Backspace`/`Delete` ignored the delete
button's disabled state, so the keyboard could delete the start passage that the button refuses
to delete. The command now takes `enabled` from the same condition as the button.
