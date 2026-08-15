import {CatalogEntry} from '../command-catalog';
import {conflictingCommandIds, findConflicts, findShadows} from '../conflicts';
import {ResolvedKeymap} from '../resolve-keymap';

const catalog: CatalogEntry[] = [
	{id: 'a', scope: 'story-map'},
	{id: 'b', scope: 'story-map'},
	{id: 'c', scope: 'story-list'},
	{id: 'd', scope: 'global'}
];

function keymap(bindings: Record<string, string[]>): ResolvedKeymap {
	return Object.entries(bindings).reduce(
		(result, [id, value]) => ({
			...result,
			[id]: {bindings: value, overridden: false}
		}),
		{}
	);
}

describe('findConflicts()', () => {
	it('reports two commands sharing a key in one scope', () => {
		const conflicts = findConflicts(
			catalog,
			keymap({a: ['mod+p'], b: ['mod+p']}),
			'linux'
		);

		expect(conflicts).toHaveLength(1);
		expect(conflicts[0].commandIds.sort()).toEqual(['a', 'b']);
		expect(conflicts[0].scope).toBe('story-map');
	});

	it('does not report the same key in different scopes', () => {
		expect(
			findConflicts(catalog, keymap({a: ['mod+p'], c: ['mod+p']}), 'linux')
		).toEqual([]);
	});

	it('compares keys after normalizing them', () => {
		expect(
			findConflicts(catalog, keymap({a: ['ctrl+p'], b: ['mod+p']}), 'windows')
		).toHaveLength(1);

		// On macOS those are different keys, so there's no conflict.

		expect(
			findConflicts(catalog, keymap({a: ['ctrl+p'], b: ['mod+p']}), 'mac')
		).toEqual([]);
	});

	it('ignores unbound commands', () => {
		expect(findConflicts(catalog, keymap({a: [], b: []}), 'linux')).toEqual([]);
	});

	it('lists the commands involved for filtering', () => {
		const conflicts = findConflicts(
			catalog,
			keymap({a: ['mod+p'], b: ['mod+p']}),
			'linux'
		);

		expect([...conflictingCommandIds(conflicts)].sort()).toEqual(['a', 'b']);
	});
});

describe('findShadows()', () => {
	it('reports a global binding overridden in a nested scope', () => {
		const shadows = findShadows(
			catalog,
			keymap({a: ['mod+p'], d: ['mod+p']}),
			'linux'
		);

		expect(shadows).toEqual([
			{binding: 'mod+p', innerId: 'a', innerScope: 'story-map', outerId: 'd'}
		]);
	});

	it('does not report two non-global scopes, which never overlap', () => {
		expect(
			findShadows(catalog, keymap({a: ['mod+p'], c: ['mod+p']}), 'linux')
		).toEqual([]);
	});
});
