import * as React from 'react';

/**
 * The scope a command belongs to. Scopes are resolved from the DOM at keydown
 * time by walking up from `document.activeElement` looking for
 * `data-hotkey-scope` attributes--see `scope.ts`.
 */
export type CommandScope = string;

export interface Command {
	/**
	 * Unique identifier, e.g. `passage.create`. This is what default and
	 * user-set keybindings are keyed on, so it must be stable across releases.
	 */
	id: string;
	/**
	 * If set, the command only resolves when focus is inside this element. Use
	 * this for commands registered by repeated components--e.g. every passage
	 * card registers `passage.rename`, but only the focused one should run.
	 */
	element?: React.RefObject<HTMLElement>;
	/**
	 * Mirrors the `disabled` state of the button this command corresponds to.
	 * Defaults to enabled.
	 */
	enabled?: boolean;
	/**
	 * May this command run while a text field has focus? Defaults to false.
	 * Only function keys and modified chords should ever set this--a bare
	 * letter would eat the user's typing.
	 */
	allowInInput?: boolean;
	/**
	 * May this command run on auto-repeat, e.g. while a key is held down?
	 * Defaults to false.
	 */
	allowRepeat?: boolean;
	/**
	 * Already-translated label, normally the same string as the button's.
	 */
	label: string;
	/**
	 * Scope this command belongs to. Defaults to `global`. Pass null when a
	 * component shows a button that another instance already owns the shortcut
	 * for--the passage editor's Test button, for example, would otherwise
	 * compete with the story map toolbar's.
	 */
	scope?: CommandScope | null;
	/**
	 * What to do. Must be safe to call synchronously from a keydown handler:
	 * commands that open a window or save a file rely on the user activation
	 * that the keypress grants.
	 */
	run: () => void;
}

/**
 * A command as registered in the context. The command itself is held in a ref
 * so that the dispatcher always sees the current `run` and `enabled` without
 * the command needing to re-register on every render.
 */
export interface CommandRegistration {
	command: React.RefObject<Command>;
	/**
	 * Distinguishes registrations that share an ID and scope--see
	 * `Command.element`.
	 */
	key: number;
}
