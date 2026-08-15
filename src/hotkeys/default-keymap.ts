import {isElectronRenderer} from '../util/is-electron';

export interface DefaultBinding {
	/**
	 * Default key strings for a command. More than one is allowed--e.g. redo is
	 * both `mod+shift+z` and `ctrl+y`.
	 */
	bindings: string[];
	/**
	 * Which build this binding applies to. Omitted means both.
	 *
	 * Electron menu accelerators fire before the renderer sees a keydown, so
	 * some bindings can only work in the browser until the corresponding menu
	 * roles in `src/electron/main-process/menu-bar.ts` are replaced with click
	 * handlers that dispatch the same commands.
	 */
	env?: 'electron' | 'web';
}

/**
 * Default keybindings, keyed by command ID. Components register commands with
 * an ID, scope, label, and what to run; the key they're bound to is decided
 * here so that the whole keymap can be reviewed in one place.
 *
 * Users can override any of these; see `prefs.hotkeyOverrides`.
 */
export const defaultKeymap: Record<string, DefaultBinding> = {
	// Global.

	'app.keyboardShortcuts': {bindings: ['mod+shift+?']},
	'app.preferences': {bindings: ['mod+,']},

	// Dialogs. Dialogs are mostly text fields, so this has to be a chord that
	// produces no character and that CodeMirror doesn't use.

	'dialog.maximize': {bindings: ['alt+enter']},

	// Story list.

	'library.import': {bindings: ['mod+o']},
	'story.create': {bindings: ['n']},
	'story.delete': {bindings: ['backspace', 'delete']},
	'story.duplicate': {bindings: ['mod+d']},
	'story.edit': {bindings: ['enter']},
	'story.rename': {bindings: ['f2']},
	'story.tag': {bindings: ['t']},

	// Story map.

	'passage.create': {bindings: ['n']},
	'passage.delete': {bindings: ['backspace', 'delete']},
	'passage.deselectAll': {bindings: ['escape']},
	'passage.edit': {bindings: ['enter']},
	'passage.goTo': {bindings: ['p', 'mod+p']},
	'passage.rename': {bindings: ['f2']},
	'passage.selectAll': {bindings: ['mod+a'], env: 'web'},
	'passage.test': {bindings: ['t']},
	'story.findReplace': {bindings: ['mod+f']},
	'story.redo': {bindings: ['mod+shift+z', 'ctrl+y'], env: 'web'},
	'story.undo': {bindings: ['mod+z'], env: 'web'},
	'view.zoomIn': {bindings: ['=', '+']},
	'view.zoomOut': {bindings: ['-']},
	'view.zoomReset': {bindings: ['0']},
	'build.play': {bindings: ['mod+enter']},
	'build.test': {bindings: ['mod+shift+enter']},

	// Registered but unbound by default: once-a-session actions, and ones that
	// write files. They still appear in the shortcuts dialog, where a user can
	// bind them.

	'build.exportAsTwee': {bindings: []},
	'build.proof': {bindings: []},
	'build.publishToFile': {bindings: []},
	'library.archive': {bindings: []},
	'library.storyTags': {bindings: []},
	'passage.startAt': {bindings: []},
	'story.details': {bindings: []},
	'story.javascript': {bindings: []},
	'story.passageTags': {bindings: []},
	'story.stylesheet': {bindings: []},

	// Fuzzy finder. These are the keys the finder has always used; they're here
	// so that they show up in the shortcuts dialog like everything else.

	'finder.close': {bindings: ['escape']},
	'finder.next': {bindings: ['down']},
	'finder.previous': {bindings: ['up']},
	'finder.select': {bindings: ['enter']}
};

/**
 * Returns the default bindings for a command in the current environment. A
 * command whose bindings don't apply here resolves to none.
 */
export function defaultBindings(
	commandId: string,
	electron = isElectronRenderer()
): string[] {
	const entry = defaultKeymap[commandId];

	if (!entry) {
		return [];
	}

	if (entry.env && entry.env !== (electron ? 'electron' : 'web')) {
		return [];
	}

	return entry.bindings;
}

/**
 * Is this command's default binding unavailable because the Electron
 * application menu handles the key itself? The shortcuts dialog uses this to
 * explain why a row is locked.
 */
export function bindingLockedByAppMenu(
	commandId: string,
	electron = isElectronRenderer()
): boolean {
	const entry = defaultKeymap[commandId];

	return !!(electron && entry?.env === 'web' && entry.bindings.length > 0);
}
