import {isElectronRenderer} from '../util/is-electron';
import {defaultBindings, defaultKeymap} from './default-keymap';

export interface ResolvedBinding {
	bindings: string[];
	/**
	 * Has the user changed this from the default?
	 */
	overridden: boolean;
}

export type ResolvedKeymap = Record<string, ResolvedBinding>;

/**
 * Combines the default keymap with the user's overrides. Overrides are stored
 * as a sparse map so that a user who never changes a shortcut picks up
 * improved defaults in later releases--and so that resetting a shortcut is
 * just deleting the override.
 *
 * An override of `[]` means the user deliberately unbound the command, which
 * is different from having no override at all.
 */
export function resolveKeymap(
	overrides: Record<string, string[]>,
	electron = isElectronRenderer()
): ResolvedKeymap {
	const ids = new Set([
		...Object.keys(defaultKeymap),
		...Object.keys(overrides)
	]);
	const result: ResolvedKeymap = {};

	for (const id of ids) {
		const override = overrides[id];

		result[id] = override
			? {bindings: override, overridden: true}
			: {bindings: defaultBindings(id, electron), overridden: false};
	}

	return result;
}

/**
 * Bindings for a single command, without building the whole map.
 */
export function resolveBindings(
	commandId: string,
	overrides: Record<string, string[]>,
	electron = isElectronRenderer()
): string[] {
	return overrides[commandId] ?? defaultBindings(commandId, electron);
}
