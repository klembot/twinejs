import {defaultKeymap} from './default-keymap';

export interface CatalogEntry {
	id: string;
	scope: string;
}

/**
 * Every command the app knows about, and the scope it belongs to.
 *
 * The dispatcher doesn't need this--it works off whatever components have
 * registered. The shortcuts dialog does, because it has to list commands whose
 * components aren't mounted right now: you can't see the story map's shortcuts
 * from the story list otherwise.
 *
 * Labels are looked up as `hotkeys.commands.<id>`.
 */
export const commandCatalog: CatalogEntry[] = [
	{id: 'app.preferences', scope: 'global'},
	{id: 'app.keyboardShortcuts', scope: 'global'},

	{id: 'story.create', scope: 'story-list'},
	{id: 'story.edit', scope: 'story-list'},
	{id: 'story.rename', scope: 'story-list'},
	{id: 'story.delete', scope: 'story-list'},
	{id: 'story.duplicate', scope: 'story-list'},
	{id: 'story.tag', scope: 'story-list'},
	{id: 'library.import', scope: 'story-list'},
	{id: 'library.archive', scope: 'story-list'},
	{id: 'library.storyTags', scope: 'story-list'},

	{id: 'passage.create', scope: 'story-map'},
	{id: 'passage.edit', scope: 'story-map'},
	{id: 'passage.rename', scope: 'story-map'},
	{id: 'passage.delete', scope: 'story-map'},
	{id: 'passage.test', scope: 'story-map'},
	{id: 'passage.startAt', scope: 'story-map'},
	{id: 'passage.goTo', scope: 'story-map'},
	{id: 'passage.selectAll', scope: 'story-map'},
	{id: 'passage.deselectAll', scope: 'story-map'},
	{id: 'story.undo', scope: 'story-map'},
	{id: 'story.redo', scope: 'story-map'},
	{id: 'story.findReplace', scope: 'story-map'},
	{id: 'story.details', scope: 'story-map'},
	{id: 'story.passageTags', scope: 'story-map'},
	{id: 'story.javascript', scope: 'story-map'},
	{id: 'story.stylesheet', scope: 'story-map'},
	{id: 'view.zoomIn', scope: 'story-map'},
	{id: 'view.zoomOut', scope: 'story-map'},
	{id: 'view.zoomReset', scope: 'story-map'},

	{id: 'build.play', scope: 'story-map'},
	{id: 'build.test', scope: 'story-map'},
	{id: 'build.proof', scope: 'story-map'},
	{id: 'build.publishToFile', scope: 'story-map'},
	{id: 'build.exportAsTwee', scope: 'story-map'},

	{id: 'passage.rename', scope: 'dialog'},
	{id: 'dialog.maximize', scope: 'dialog'},

	{id: 'finder.select', scope: 'fuzzy-finder'},
	{id: 'finder.previous', scope: 'fuzzy-finder'},
	{id: 'finder.next', scope: 'fuzzy-finder'},
	{id: 'finder.close', scope: 'fuzzy-finder'}
];

/**
 * Sanity check used by tests: every catalog entry has a keymap entry and vice
 * versa, so neither can silently drift.
 */
export function catalogKeymapMismatches(): string[] {
	const catalogIds = new Set(commandCatalog.map(entry => entry.id));
	const keymapIds = new Set(Object.keys(defaultKeymap));

	return [
		...[...catalogIds]
			.filter(id => !keymapIds.has(id))
			.map(id => `${id} is in the catalog but not the keymap`),
		...[...keymapIds]
			.filter(id => !catalogIds.has(id))
			.map(id => `${id} is in the keymap but not the catalog`)
	];
}
