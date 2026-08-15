import {Platform} from '../../util/platform';
import {
	bindingLockedByAppMenu,
	commandCatalog,
	Conflict,
	conflictingCommandIds,
	findConflicts,
	findShadows,
	normalizeKeyString,
	ResolvedKeymap,
	Shadow,
	scopes
} from '../../hotkeys';

export interface ShortcutRow {
	bindings: string[];
	conflict: boolean;
	id: string;
	label: string;
	/**
	 * Can't be changed here because the Electron application menu handles the
	 * key before the app sees it.
	 */
	locked: boolean;
	overridden: boolean;
	/**
	 * Scopes this command is registered in. A command can appear in more than
	 * one--rename works in both the story map and the passage editor--but the
	 * binding is the same in all of them.
	 */
	scopes: string[];
	shadowedBy?: string;
}

export interface ShortcutRowsResult {
	conflicts: Conflict[];
	rows: ShortcutRow[];
	shadows: Shadow[];
}

/**
 * Builds the rows the shortcuts dialog displays. Rows come from the command
 * catalog rather than from what's currently registered, so that the story
 * map's shortcuts are visible from the story list.
 */
export function shortcutRows(
	keymap: ResolvedKeymap,
	platform: Platform,
	translate: (id: string) => string,
	electron: boolean
): ShortcutRowsResult {
	const conflicts = findConflicts(commandCatalog, keymap, platform);
	const shadows = findShadows(commandCatalog, keymap, platform);
	const conflicted = conflictingCommandIds(conflicts);
	const byId = new Map<string, ShortcutRow>();

	for (const entry of commandCatalog) {
		const existing = byId.get(entry.id);

		if (existing) {
			if (!existing.scopes.includes(entry.scope)) {
				existing.scopes.push(entry.scope);
			}

			continue;
		}

		byId.set(entry.id, {
			bindings: (keymap[entry.id]?.bindings ?? []).map(binding =>
				normalizeKeyString(binding, platform)
			),
			conflict: conflicted.has(entry.id),
			id: entry.id,
			label: translate(entry.id),
			locked: bindingLockedByAppMenu(entry.id, electron),
			overridden: !!keymap[entry.id]?.overridden,
			scopes: [entry.scope],
			shadowedBy: shadows.find(shadow => shadow.outerId === entry.id)
				?.innerScope
		});
	}

	return {conflicts, rows: sortRows([...byId.values()]), shadows};
}

/**
 * Where a scope sits in the declared order, which runs outermost to innermost.
 * Anything unknown sorts last instead of jumping to the top.
 */
function scopeOrder(scope?: string): number {
	const index = scopes.indexOf(scope as (typeof scopes)[number]);

	return index === -1 ? scopes.length : index;
}

/**
 * Orders rows the way someone reading the list expects: grouped by where the
 * command works, outermost scope first, then alphabetically by the name shown
 * on screen. Rows working in more than one scope sort by the first one they
 * list, which is the one the command was declared in. Returns a new array.
 */
export function sortRows(rows: ShortcutRow[]): ShortcutRow[] {
	return [...rows].sort((a, b) => {
		const byScope = scopeOrder(a.scopes[0]) - scopeOrder(b.scopes[0]);

		if (byScope !== 0) {
			return byScope;
		}

		return a.label.localeCompare(b.label);
	});
}

export interface RowFilter {
	/**
	 * A recorded key combination, when the search field is in record mode.
	 */
	keyString?: string;
	/**
	 * Only rows with no binding.
	 */
	onlyUnbound?: boolean;
	/**
	 * Only rows the user has changed.
	 */
	onlyModified?: boolean;
	/**
	 * Only rows involved in a conflict.
	 */
	onlyConflicts?: boolean;
	scope?: string;
	search?: string;
}

/**
 * Parses `@`-prefixed filter tokens out of a search string, VSCode style, and
 * returns them alongside whatever's left to match on as text.
 */
export function parseSearch(value: string): RowFilter {
	const filter: RowFilter = {};
	const terms: string[] = [];

	for (const word of value.split(/\s+/)) {
		if (word === '') {
			continue;
		}

		const [, token, argument] = /^@([a-z]+):?(.*)$/i.exec(word) ?? [];

		switch (token) {
			case 'scope':
				filter.scope = argument;
				break;

			case 'source':
				filter.onlyModified = argument === 'user';
				break;

			case 'unbound':
				filter.onlyUnbound = true;
				break;

			case 'conflicts':
				filter.onlyConflicts = true;
				break;

			default:
				terms.push(word);
				break;
		}
	}

	filter.search = terms.join(' ');
	return filter;
}

export function filterRows(
	rows: ShortcutRow[],
	filter: RowFilter,
	platform: Platform,
	scopeName: (scope: string) => string
): ShortcutRow[] {
	return rows.filter(row => {
		if (filter.onlyUnbound && row.bindings.length > 0) {
			return false;
		}

		if (filter.onlyModified && !row.overridden) {
			return false;
		}

		if (filter.onlyConflicts && !row.conflict) {
			return false;
		}

		if (
			filter.scope &&
			!row.scopes.some(
				scope =>
					scope === filter.scope ||
					scopeName(scope).toLowerCase() === filter.scope?.toLowerCase()
			)
		) {
			return false;
		}

		// Recorded keys match across every scope--the point of recording is to
		// find out who else uses the key.

		if (filter.keyString) {
			const wanted = normalizeKeyString(filter.keyString, platform);

			if (!row.bindings.some(binding => binding === wanted)) {
				return false;
			}
		}

		if (filter.search) {
			const haystack = [
				row.label,
				row.id,
				...row.scopes.map(scopeName),
				...row.bindings
			]
				.join(' ')
				.toLowerCase();

			if (
				!filter.search
					.toLowerCase()
					.split(/\s+/)
					.every(term => haystack.includes(term))
			) {
				return false;
			}
		}

		return true;
	});
}
