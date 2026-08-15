import {Platform} from '../util/platform';
import {CatalogEntry} from './command-catalog';
import {normalizeKeyString} from './key-string';
import {ResolvedKeymap} from './resolve-keymap';
import {GLOBAL_SCOPE} from './scope';

export interface Conflict {
	binding: string;
	/**
	 * IDs of every command bound to this key in this scope. Always more than
	 * one.
	 */
	commandIds: string[];
	scope: string;
}

export interface Shadow {
	binding: string;
	/**
	 * The command that wins, because its scope is nested inside the other's.
	 */
	innerId: string;
	innerScope: string;
	/**
	 * The command that is overridden while the inner scope has focus.
	 */
	outerId: string;
}

/**
 * Two commands in the same scope bound to the same key. Which one runs depends
 * on registration order, which is effectively arbitrary--so this is a real
 * problem, and the shortcuts dialog flags it.
 */
export function findConflicts(
	catalog: CatalogEntry[],
	keymap: ResolvedKeymap,
	platform: Platform
): Conflict[] {
	const groups = new Map<string, {conflict: Conflict}>();

	for (const entry of catalog) {
		for (const binding of keymap[entry.id]?.bindings ?? []) {
			const normalized = normalizeKeyString(binding, platform);

			if (normalized === '') {
				continue;
			}

			const groupKey = `${entry.scope}\n${normalized}`;
			const existing = groups.get(groupKey);

			if (existing) {
				if (!existing.conflict.commandIds.includes(entry.id)) {
					existing.conflict.commandIds.push(entry.id);
				}
			} else {
				groups.set(groupKey, {
					conflict: {
						binding: normalized,
						commandIds: [entry.id],
						scope: entry.scope
					}
				});
			}
		}
	}

	return [...groups.values()]
		.map(group => group.conflict)
		.filter(conflict => conflict.commandIds.length > 1);
}

/**
 * The same key bound in two scopes, one nested inside the other. This isn't
 * ambiguous--the innermost scope wins--but it's worth telling the user about,
 * because the outer command won't work while the inner scope has focus.
 *
 * Scope relationships are treated as static: every non-global scope nests
 * inside `global`. Modelling actual runtime chains would make the table's
 * answer depend on where focus happens to be, which isn't useful when you're
 * reading it.
 */
export function findShadows(
	catalog: CatalogEntry[],
	keymap: ResolvedKeymap,
	platform: Platform
): Shadow[] {
	const result: Shadow[] = [];
	const globalBindings = new Map<string, string>();

	for (const entry of catalog.filter(entry => entry.scope === GLOBAL_SCOPE)) {
		for (const binding of keymap[entry.id]?.bindings ?? []) {
			globalBindings.set(normalizeKeyString(binding, platform), entry.id);
		}
	}

	for (const entry of catalog.filter(entry => entry.scope !== GLOBAL_SCOPE)) {
		for (const binding of keymap[entry.id]?.bindings ?? []) {
			const normalized = normalizeKeyString(binding, platform);
			const outerId = globalBindings.get(normalized);

			if (outerId && outerId !== entry.id) {
				result.push({
					binding: normalized,
					innerId: entry.id,
					innerScope: entry.scope,
					outerId
				});
			}
		}
	}

	return result;
}

/**
 * IDs of commands involved in a conflict, for filtering the shortcuts dialog.
 */
export function conflictingCommandIds(conflicts: Conflict[]): Set<string> {
	return new Set(conflicts.flatMap(conflict => conflict.commandIds));
}
