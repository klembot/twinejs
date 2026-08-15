/**
 * What operating system family the app is running on. This affects how
 * keyboard shortcuts are displayed and which physical key `mod` maps to--see
 * `src/hotkeys/key-string.ts`.
 */
export type Platform = 'linux' | 'mac' | 'windows';

/**
 * Detects the platform the app is running on. Linux is the fallback rather
 * than a separate "unknown" value because its modifier layout (Ctrl/Alt/Shift,
 * with the Super key reserved by the desktop environment) is also the correct
 * assumption for any platform we can't identify.
 */
export function detectPlatform(): Platform {
	// userAgentData is Chromium-only but exact. navigator.platform is deprecated
	// but universally implemented, and enough to tell three families apart.

	const raw: string =
		(window.navigator as any).userAgentData?.platform ||
		window.navigator.platform ||
		'';

	if (/mac|iphone|ipad|ipod/i.test(raw)) {
		return 'mac';
	}

	if (/win/i.test(raw)) {
		return 'windows';
	}

	return 'linux';
}
