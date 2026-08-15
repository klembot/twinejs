import {
	eventToKeyString,
	formatKeyString,
	keyStringTokens,
	normalizeKeyString,
	usesReservedSuperKey
} from '../key-string';

describe('normalizeKeyString()', () => {
	it('lowercases and orders modifiers consistently', () => {
		expect(normalizeKeyString('Shift+Mod+P', 'mac')).toBe('mod+shift+p');
		expect(normalizeKeyString('mod+shift+p', 'mac')).toBe('mod+shift+p');
	});

	it('treats Meta as mod on macOS, where they are the same key', () => {
		expect(normalizeKeyString('meta+k', 'mac')).toBe('mod+k');
		expect(normalizeKeyString('mod+k', 'mac')).toBe('mod+k');
	});

	it('treats Control as mod on other platforms', () => {
		expect(normalizeKeyString('ctrl+y', 'windows')).toBe('mod+y');
		expect(normalizeKeyString('ctrl+y', 'linux')).toBe('mod+y');
	});

	it('keeps Control and Meta distinct where they are distinct', () => {
		expect(normalizeKeyString('ctrl+k', 'mac')).toBe('ctrl+k');
		expect(normalizeKeyString('meta+k', 'linux')).toBe('meta+k');
	});

	it('resolves key aliases', () => {
		expect(normalizeKeyString('ArrowUp', 'linux')).toBe('up');
		expect(normalizeKeyString('Esc', 'linux')).toBe('escape');
	});

	it('returns an empty string for empty input', () => {
		expect(normalizeKeyString('', 'linux')).toBe('');
	});
});

describe('eventToKeyString()', () => {
	function event(props: Partial<KeyboardEvent>) {
		return {
			altKey: false,
			ctrlKey: false,
			key: '',
			metaKey: false,
			shiftKey: false,
			...props
		} as KeyboardEvent;
	}

	it('ignores presses of modifiers by themselves', () => {
		expect(eventToKeyString(event({key: 'Shift'}), 'mac')).toBeUndefined();
		expect(eventToKeyString(event({key: 'Control'}), 'mac')).toBeUndefined();
	});

	it('records Command on macOS as mod, so keymaps travel between platforms', () => {
		expect(eventToKeyString(event({key: 'k', metaKey: true}), 'mac')).toBe(
			'mod+k'
		);
		expect(eventToKeyString(event({key: 'k', ctrlKey: true}), 'windows')).toBe(
			'mod+k'
		);
	});

	it('records the Super key separately on Linux and Windows', () => {
		expect(eventToKeyString(event({key: 'k', metaKey: true}), 'linux')).toBe(
			'meta+k'
		);
	});

	it('combines modifiers', () => {
		expect(
			eventToKeyString(event({key: 'P', metaKey: true, shiftKey: true}), 'mac')
		).toBe('mod+shift+p');
	});
});

describe('keyStringTokens()', () => {
	it('uses symbols on macOS and words elsewhere', () => {
		expect(keyStringTokens('mod+shift+p', 'mac')).toEqual(['⌘', '⇧', 'P']);
		expect(keyStringTokens('mod+shift+p', 'windows')).toEqual([
			'Ctrl',
			'Shift',
			'P'
		]);
	});

	it('names the Meta key after the platform', () => {
		expect(keyStringTokens('meta+k', 'windows')).toEqual(['Win', 'K']);
		expect(keyStringTokens('meta+k', 'linux')).toEqual(['Super', 'K']);
	});

	it('gives named keys a readable label', () => {
		expect(keyStringTokens('escape', 'linux')).toEqual(['Esc']);
		expect(keyStringTokens('up', 'linux')).toEqual(['↑']);
		expect(keyStringTokens('f2', 'linux')).toEqual(['F2']);
	});

	it('returns nothing for an empty key string', () => {
		expect(keyStringTokens('', 'linux')).toEqual([]);
	});
});

describe('formatKeyString()', () => {
	it('joins with plus signs except on macOS', () => {
		expect(formatKeyString('mod+shift+p', 'mac')).toBe('⌘⇧P');
		expect(formatKeyString('mod+shift+p', 'linux')).toBe('Ctrl+Shift+P');
	});
});

describe('usesReservedSuperKey()', () => {
	it('is true only where the window manager owns the key', () => {
		expect(usesReservedSuperKey('meta+k', 'linux')).toBe(true);
		expect(usesReservedSuperKey('meta+k', 'windows')).toBe(true);
		expect(usesReservedSuperKey('meta+k', 'mac')).toBe(false);
		expect(usesReservedSuperKey('mod+k', 'linux')).toBe(false);
	});
});
