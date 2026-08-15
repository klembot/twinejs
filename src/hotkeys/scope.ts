/**
 * Scopes are marked in the DOM with this attribute, e.g.
 * `<div data-hotkey-scope="story-map">`. Nothing keeps track of which one is
 * "active"--the DOM already knows, because focus is in one of them.
 */
export const HOTKEY_SCOPE_ATTRIBUTE = 'data-hotkey-scope';

export const GLOBAL_SCOPE = 'global';

/**
 * Scope of the keyboard shortcuts dialog. While focus is inside it, commands
 * from every other scope are suppressed--otherwise the user would trigger the
 * shortcut they're trying to look at.
 */
export const KEYBINDINGS_SCOPE = 'keybindings';

/**
 * All scopes the app declares, innermost-ish first. This is only used to
 * populate the shortcuts dialog; the dispatcher works off whatever it finds in
 * the DOM.
 */
export const scopes = [
	GLOBAL_SCOPE,
	'story-list',
	'story-map',
	'story-card',
	'passage-card',
	'dialog',
	'passage-editor',
	'fuzzy-finder',
	KEYBINDINGS_SCOPE
] as const;

/**
 * Is the user typing into this element? Commands that would swallow a
 * keystroke must not run when they are.
 */
export function isTextEntry(element: Element | null): boolean {
	if (!element) {
		return false;
	}

	if (['INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName)) {
		return true;
	}

	if ((element as HTMLElement).isContentEditable) {
		return true;
	}

	return !!element.closest?.('.CodeMirror');
}

/**
 * Returns the scopes containing an element, innermost first, always ending
 * with `global`. If the keybindings scope is present, it is the only one
 * returned.
 */
export function scopeChain(element?: Element | null): string[] {
	const result: string[] = [];

	for (
		let current = (element ?? null) as HTMLElement | null;
		current;
		current = current.parentElement
	) {
		const scope = current.getAttribute?.(HOTKEY_SCOPE_ATTRIBUTE);

		if (scope && !result.includes(scope)) {
			result.push(scope);
		}
	}

	if (result.includes(KEYBINDINGS_SCOPE)) {
		return [KEYBINDINGS_SCOPE];
	}

	result.push(GLOBAL_SCOPE);
	return result;
}

/**
 * Returns the scope chain for whatever currently has focus.
 */
export function activeScopeChain(): string[] {
	return scopeChain(document.activeElement);
}
