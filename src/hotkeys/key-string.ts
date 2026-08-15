import {Platform} from '../util/platform';

/**
 * Key strings look like `mod+shift+p`, `f2`, or `backspace`. Modifiers are
 * always lowercase and always in the order below, so that two spellings of the
 * same chord compare equal.
 *
 * `mod` is the portable "main" modifier: Command on macOS, Control everywhere
 * else. `meta` is the literal Meta/Super/Windows key. Normalizing collapses
 * whichever pair is the same physical key on the current platform, so a keymap
 * authored on a Mac works on Linux.
 */
const MODIFIER_ORDER = ['mod', 'ctrl', 'alt', 'shift', 'meta'];

/**
 * Keys whose `event.key` value differs from what we want to store.
 */
const KEY_ALIASES: Record<string, string> = {
	' ': 'space',
	arrowdown: 'down',
	arrowleft: 'left',
	arrowright: 'right',
	arrowup: 'up',
	del: 'delete',
	esc: 'escape'
};

const MODIFIER_KEYS = ['alt', 'control', 'meta', 'shift'];

/**
 * How keys are displayed, per platform. Anything not listed is title-cased.
 */
const KEY_DISPLAY: Record<
	string,
	Partial<Record<Platform, string>> & {default: string}
> = {
	backspace: {default: 'Backspace', mac: '⌫'},
	delete: {default: 'Delete', mac: '⌦'},
	down: {default: '↓'},
	enter: {default: 'Enter', mac: '↵'},
	escape: {default: 'Esc'},
	left: {default: '←'},
	right: {default: '→'},
	space: {default: 'Space'},
	tab: {default: 'Tab', mac: '⇥'},
	up: {default: '↑'}
};

const MODIFIER_DISPLAY: Record<string, Record<Platform, string>> = {
	alt: {linux: 'Alt', mac: '⌥', windows: 'Alt'},
	ctrl: {linux: 'Ctrl', mac: '⌃', windows: 'Ctrl'},
	meta: {linux: 'Super', mac: '⌘', windows: 'Win'},
	mod: {linux: 'Ctrl', mac: '⌘', windows: 'Ctrl'},
	shift: {linux: 'Shift', mac: '⇧', windows: 'Shift'}
};

/**
 * Puts a key string into canonical form for a platform: lowercased, modifiers
 * in a fixed order, and platform-equivalent modifiers collapsed onto `mod`.
 * Two key strings match if and only if their normalized forms are equal.
 */
export function normalizeKeyString(
	keyString: string,
	platform: Platform
): string {
	const parts = keyString
		.toLowerCase()
		.split('+')
		.map(part => part.trim())
		.filter(part => part !== '');

	if (parts.length === 0) {
		return '';
	}

	const key = parts[parts.length - 1];
	const modifiers = new Set<string>();

	for (const modifier of parts.slice(0, -1)) {
		// On macOS, Meta is Command, which is what `mod` means. Everywhere else,
		// Control is what `mod` means and Meta is the Super/Windows key.

		if (platform === 'mac') {
			modifiers.add(modifier === 'meta' ? 'mod' : modifier);
		} else {
			modifiers.add(modifier === 'ctrl' ? 'mod' : modifier);
		}
	}

	return [
		...MODIFIER_ORDER.filter(modifier => modifiers.has(modifier)),
		KEY_ALIASES[key] ?? key
	].join('+');
}

/**
 * Converts a keydown event to a normalized key string, or undefined if the
 * event doesn't represent one--e.g. the user pressed Shift by itself.
 */
export function eventToKeyString(
	event: Pick<
		KeyboardEvent,
		'altKey' | 'ctrlKey' | 'key' | 'metaKey' | 'shiftKey'
	>,
	platform: Platform
): string | undefined {
	const key = event.key?.toLowerCase();

	if (!key || MODIFIER_KEYS.includes(key)) {
		return undefined;
	}

	const modifiers: string[] = [];

	if (event.metaKey) {
		modifiers.push('meta');
	}

	if (event.ctrlKey) {
		modifiers.push('ctrl');
	}

	if (event.altKey) {
		modifiers.push('alt');
	}

	if (event.shiftKey) {
		modifiers.push('shift');
	}

	return normalizeKeyString([...modifiers, key].join('+'), platform);
}

/**
 * Splits a key string into display tokens, e.g. `['⌘', '⇧', 'P']`. Rendering
 * each token as its own `<kbd>` is up to the caller.
 */
export function keyStringTokens(
	keyString: string,
	platform: Platform
): string[] {
	const parts = normalizeKeyString(keyString, platform).split('+');

	if (parts.length === 1 && parts[0] === '') {
		return [];
	}

	const key = parts[parts.length - 1];
	const display = KEY_DISPLAY[key];

	return [
		...parts
			.slice(0, -1)
			.map(modifier => MODIFIER_DISPLAY[modifier]?.[platform] ?? modifier),
		display?.[platform] ??
			display?.default ??
			(key.length === 1 ? key.toUpperCase() : titleCase(key))
	];
}

/**
 * Renders a key string as a single human-readable string.
 */
export function formatKeyString(keyString: string, platform: Platform): string {
	const tokens = keyStringTokens(keyString, platform);

	return platform === 'mac' ? tokens.join('') : tokens.join('+');
}

/**
 * Does this key string use the Meta/Super/Windows key on a platform where the
 * window manager normally reserves it?
 */
export function usesReservedSuperKey(
	keyString: string,
	platform: Platform
): boolean {
	return (
		platform !== 'mac' &&
		normalizeKeyString(keyString, platform).split('+').includes('meta')
	);
}

function titleCase(value: string) {
	return value.charAt(0).toUpperCase() + value.slice(1);
}
