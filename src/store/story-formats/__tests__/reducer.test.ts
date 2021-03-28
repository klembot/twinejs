import {reducer} from '../reducer';
import {fakeLoadedStoryFormat} from '../../../test-util/fakes';

describe('Story format reducer', () => {
	const format = fakeLoadedStoryFormat();
	const format2 = fakeLoadedStoryFormat();

	it('replaces state with the init action', () =>
		expect(reducer([], {type: 'init', state: [format, format2]})).toEqual([
			format,
			format2
		]));

	it('adds a format with the create action', () =>
		expect(reducer([format], {type: 'create', props: format2})).toEqual([
			format,
			format2
		]));

	it('removes a format with the delete action', () =>
		expect(
			reducer([format, format2], {type: 'delete', id: format2.id})
		).toEqual([format]));

	it('takes no action if asked to delete a nonexistent format', () =>
		expect(reducer([format], {type: 'delete', id: format2.id})).toEqual([
			format
		]));

	it('changes a format with the update action', () => {
		const result = reducer([format, format2], {
			type: 'update',
			id: format2.id,
			props: {name: 'mock-name'}
		});

		expect(result.find(f => f.id === format2.id)?.name).toBe('mock-name');
	});
});
