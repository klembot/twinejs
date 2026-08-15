import {resolveKeymap} from '../../../hotkeys';
import {
	filterRows,
	parseSearch,
	ShortcutRow,
	shortcutRows,
	sortRows
} from '../shortcut-rows';

const scopeName = (scope: string) => `scope-${scope}`;

function rows(overrides: Record<string, string[]> = {}, electron = false) {
	return shortcutRows(
		resolveKeymap(overrides, electron),
		'linux',
		id => `label-${id}`,
		electron
	);
}

describe('shortcutRows()', () => {
	it('lists every command in the catalog, whether or not it is mounted', () => {
		const {rows: result} = rows();

		expect(result.some(row => row.id === 'passage.create')).toBe(true);
		expect(result.some(row => row.id === 'story.create')).toBe(true);
	});

	it('shows one row per command, listing each scope it works in', () => {
		const {rows: result} = rows();
		const rename = result.filter(row => row.id === 'passage.rename');

		expect(rename).toHaveLength(1);
		expect(rename[0].scopes).toEqual(['story-map', 'dialog']);
	});

	it('marks rows the user has changed', () => {
		const {rows: result} = rows({'passage.create': ['j']});
		const row = result.find(row => row.id === 'passage.create')!;

		expect(row.bindings).toEqual(['j']);
		expect(row.overridden).toBe(true);
	});

	it('marks rows in conflict', () => {
		const {rows: result} = rows({'passage.edit': ['n']});

		expect(result.find(row => row.id === 'passage.edit')!.conflict).toBe(true);
		expect(result.find(row => row.id === 'passage.create')!.conflict).toBe(
			true
		);
		expect(result.find(row => row.id === 'passage.goTo')!.conflict).toBe(false);
	});

	it('hands back rows already sorted for display', () => {
		const {rows: result} = rows();

		expect(result[0].scopes[0]).toBe('global');
		expect(result).toEqual(sortRows(result));
	});

	it('locks rows the Electron menu takes over, and leaves them alone on web', () => {
		expect(rows({}, true).rows.find(row => row.id === 'story.undo')!).toEqual(
			expect.objectContaining({bindings: [], locked: true})
		);
		expect(rows({}, false).rows.find(row => row.id === 'story.undo')!).toEqual(
			expect.objectContaining({bindings: ['mod+z'], locked: false})
		);
	});
});

describe('sortRows()', () => {
	function row(id: string, label: string, scopes: string[]): ShortcutRow {
		return {
			bindings: [],
			conflict: false,
			id,
			label,
			locked: false,
			overridden: false,
			scopes
		};
	}

	it('groups by scope in the order scopes are declared, not alphabetically', () => {
		// Alphabetically these scope keys run dialog, fuzzy-finder, global,
		// story-map--which is exactly what must not happen.

		const sorted = sortRows([
			row('d', 'A', ['dialog']),
			row('f', 'A', ['fuzzy-finder']),
			row('g', 'A', ['global']),
			row('m', 'A', ['story-map'])
		]);

		expect(sorted.map(entry => entry.id)).toEqual(['g', 'm', 'd', 'f']);
	});

	it('sorts by label A-Z within a scope', () => {
		const sorted = sortRows([
			row('c', 'Zebra', ['story-map']),
			row('a', 'Apple', ['story-map']),
			row('b', 'mango', ['story-map'])
		]);

		expect(sorted.map(entry => entry.label)).toEqual([
			'Apple',
			'mango',
			'Zebra'
		]);
	});

	it('compares labels with locale rules rather than code points', () => {
		const sorted = sortRows([
			row('z', 'Zebra', ['global']),
			row('a', 'Ärger', ['global'])
		]);

		expect(sorted.map(entry => entry.id)).toEqual(['a', 'z']);
	});

	it('sorts a row working in several scopes by the first one it lists', () => {
		const sorted = sortRows([
			row('finder', 'A', ['fuzzy-finder']),
			// Like passage.rename: story map first, dialogs second. It belongs
			// with the story map, not with the dialogs.
			row('rename', 'Z', ['story-map', 'dialog']),
			row('dialog', 'A', ['dialog'])
		]);

		expect(sorted.map(entry => entry.id)).toEqual([
			'rename',
			'dialog',
			'finder'
		]);
	});

	it('puts unknown scopes last and leaves the input alone', () => {
		const input = [
			row('mystery', 'A', ['not-a-scope']),
			row('known', 'Z', ['global'])
		];
		const sorted = sortRows(input);

		expect(sorted.map(entry => entry.id)).toEqual(['known', 'mystery']);
		expect(input.map(entry => entry.id)).toEqual(['mystery', 'known']);
	});
});

describe('parseSearch()', () => {
	it('pulls filter tokens out of the query', () => {
		expect(parseSearch('@scope:story-map rename')).toEqual({
			scope: 'story-map',
			search: 'rename'
		});
		expect(parseSearch('@source:user')).toEqual({
			onlyModified: true,
			search: ''
		});
		expect(parseSearch('@unbound')).toEqual({onlyUnbound: true, search: ''});
		expect(parseSearch('@conflicts')).toEqual({
			onlyConflicts: true,
			search: ''
		});
	});

	it('leaves ordinary text alone', () => {
		expect(parseSearch('new passage')).toEqual({search: 'new passage'});
	});
});

describe('filterRows()', () => {
	const {rows: allRows} = rows({'passage.create': ['j']});

	function ids(filter: Parameters<typeof filterRows>[1]) {
		return filterRows(allRows, filter, 'linux', scopeName).map(row => row.id);
	}

	it('matches labels, IDs, and scope names', () => {
		expect(ids({search: 'passage.create'})).toEqual(['passage.create']);
		expect(ids({search: 'label-passage.create'})).toEqual(['passage.create']);
		expect(ids({search: 'scope-fuzzy-finder'}).length).toBeGreaterThan(0);
	});

	it('matches a recorded key across every scope', () => {
		const matched = ids({keyString: 'escape'});

		expect(matched).toContain('passage.deselectAll');
		expect(matched).toContain('finder.close');
	});

	it('normalizes the recorded key before matching', () => {
		expect(ids({keyString: 'Escape'})).toContain('finder.close');
	});

	it('filters to changed commands', () => {
		expect(ids({onlyModified: true})).toEqual(['passage.create']);
	});

	it('filters to unbound commands', () => {
		const unbound = ids({onlyUnbound: true});

		expect(unbound).toContain('story.details');
		expect(unbound).not.toContain('passage.create');
	});

	it('filters by scope, by key or by display name', () => {
		expect(ids({scope: 'fuzzy-finder'})).toEqual([
			'finder.close',
			'finder.next',
			'finder.previous',
			'finder.select'
		]);
		expect(ids({scope: 'scope-fuzzy-finder'})).toHaveLength(4);
	});
});
