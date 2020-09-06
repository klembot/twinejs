import {passageDefaults, storyDefaults} from '../defaults';

describe('Passage defaults', () => {
	it('has correct types of values', () => {
		const types = {
			boolean: ['highlighted', 'selected'],
			number: ['height', 'left', 'top', 'width'],
			object: ['tags'],
			string: ['name', 'story', 'text']
		};

		Object.keys(types).forEach(type =>
			types[type].forEach(key => expect(typeof passageDefaults[key]).toBe(type))
		);
	});

	it.todo('changes the default text based on device type');
});

describe('Story defaults', () => {
	it('has correct types of values', () => {
		const types = {
			boolean: ['snapToGrid'],
			number: ['zoom'],
			string: [
				'name',
				'script',
				'startPassage',
				'storyFormat',
				'storyFormatVersion',
				'stylesheet'
			]
		};

		Object.keys(types).forEach(type =>
			types[type].forEach(key => expect(typeof storyDefaults[key]).toBe(type))
		);
	});
});
