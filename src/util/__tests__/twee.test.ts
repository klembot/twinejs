import {Passage, Story} from '../../store/stories';
import {fakePassage, fakeStory} from '../../test-util';
import {
	passageFromTwee,
	passageToTwee,
	storyFromTwee,
	storyToTwee
} from '../twee';

function passageObject(props: Partial<Passage>) {
	return expect.objectContaining({
		height: 100,
		highlighted: false,
		id: expect.any(String),
		left: 0,
		selected: false,
		width: 100,
		top: 0,
		...props
	});
}

describe('passageFromTwee()', () => {
	it('converts a passage with no tags properly', () => {
		const passage = fakePassage();

		expect(passageFromTwee(`:: ${passage.name}\n${passage.text}`)).toEqual(
			passageObject({
				left: 0,
				name: passage.name,
				tags: [],
				text: passage.text
			})
		);
	});

	it('converts a passage with tags properly', () => {
		const passage = fakePassage();

		expect(
			passageFromTwee(
				`:: ${passage.name} [red blue-green yellow]\n${passage.text}`
			)
		).toEqual(
			passageObject({
				name: passage.name,
				tags: ['red', 'blue-green', 'yellow'],
				text: passage.text
			})
		);
	});

	it('converts a passage with metadata properly', () => {
		const passage = fakePassage();

		expect(
			passageFromTwee(
				`:: ${passage.name} {"position":"${passage.left},${passage.top}","size":"${passage.width},${passage.height}"}\n${passage.text}`
			)
		).toEqual(
			passageObject({
				height: passage.height,
				left: passage.left,
				name: passage.name,
				tags: [],
				top: passage.top,
				text: passage.text,
				width: passage.width
			})
		);
	});

	it('converts a passage with tags and metadata properly', () => {
		const passage = fakePassage();

		expect(
			passageFromTwee(
				`:: ${passage.name} [red blue-green yellow] {"position":"${passage.left},${passage.top}","size":"${passage.width},${passage.height}"}\n${passage.text}`
			)
		).toEqual(
			passageObject({
				height: passage.height,
				left: passage.left,
				name: passage.name,
				tags: ['red', 'blue-green', 'yellow'],
				top: passage.top,
				text: passage.text,
				width: passage.width
			})
		);
	});

	it('converts a passage with an escaped name properly', () => {
		const passage = fakePassage({name: '\\oops[{'});

		expect(passageFromTwee(`:: \\oops\\[\\{\n${passage.text}`)).toEqual(
			passageObject({
				name: passage.name,
				tags: [],
				text: passage.text
			})
		);
	});

	it('converts a passage with escaped leading spaces properly', () => {
		expect(passageFromTwee(':: \\ leading space')).toEqual(
			passageObject({name: ' leading space'})
		);
	});

	it('converts a passage with trailing leading spaces properly', () => {
		expect(passageFromTwee(':: trailing space\\ ')).toEqual(
			passageObject({name: 'trailing space '})
		);
	});

	it('converts a passage with escaped tags properly', () => {
		const passage = fakePassage({tags: ['\\', '[]', '{}']});

		expect(
			passageFromTwee(
				`:: ${passage.name} [\\\\ \\[\\] \\{\\}]\n${passage.text}`
			)
		).toEqual(
			passageObject({
				name: passage.name,
				tags: passage.tags,
				text: passage.text
			})
		);
	});

	it('converts a passage with escaped text properly', () => {
		const passage = fakePassage({text: ':: bad\n::worse'});

		expect(passageFromTwee(`:: ${passage.name}\n\\:: bad\n\\::worse`)).toEqual(
			passageObject({
				name: passage.name,
				tags: passage.tags,
				text: passage.text
			})
		);
	});

	it('trims whitespace from the end of text', () => {
		expect(passageFromTwee(`:: Long\ntext\n\n\n\n`)).toEqual(
			passageObject({name: 'Long', text: 'text'})
		);
	});

	it('converts a passage with no whitespace properly', () => {
		const passage = fakePassage({tags: ['red', 'blue-green', 'yellow']});

		expect(
			passageFromTwee(
				`::${passage.name}[red blue-green yellow]{"position":"${passage.left},${passage.top}","size":"${passage.width},${passage.height}"}\n${passage.text}`
			)
		).toEqual(
			passageObject({
				height: passage.height,
				left: passage.left,
				name: passage.name,
				tags: passage.tags,
				text: passage.text,
				top: passage.top,
				width: passage.width
			})
		);
	});

	it('converts a passage with extra whitespace properly', () => {
		const passage = fakePassage({tags: ['red', 'blue-green', 'yellow']});

		expect(
			passageFromTwee(
				`::    ${passage.name}   [ red  blue-green    yellow ]  { "position" : "${passage.left},${passage.top}", "size"  :  "${passage.width},${passage.height}"  }\n${passage.text}`
			)
		).toEqual(
			passageObject({
				height: passage.height,
				left: passage.left,
				name: passage.name,
				tags: passage.tags,
				text: passage.text,
				top: passage.top,
				width: passage.width
			})
		);
	});

	it('converts a passage with empty tags properly', () => {
		expect(passageFromTwee(':: No Tags []')).toEqual(
			passageObject({
				name: 'No Tags',
				tags: [],
				text: ''
			})
		);

		expect(passageFromTwee(':: No Tags [  ]')).toEqual(
			passageObject({
				name: 'No Tags',
				tags: [],
				text: ''
			})
		);
	});

	it('converts a passage with empty metadata properly', () => {
		expect(passageFromTwee(':: No Metadata {}')).toEqual(
			passageObject({
				name: 'No Metadata',
				tags: [],
				text: ''
			})
		);
		expect(passageFromTwee(':: No Metadata Or Tags [] {}')).toEqual(
			passageObject({
				name: 'No Metadata Or Tags',
				tags: [],
				text: ''
			})
		);
	});

	it('ignores malformed metadata', () => {
		const oldWarn = jest.spyOn(console, 'warn').mockReturnValue();

		expect(passageFromTwee(':: Bad Metadata {1 + 1}')).toEqual(
			passageObject({
				name: 'Bad Metadata',
				tags: [],
				text: ''
			})
		);
		expect(passageFromTwee(":: This Isn't Metadata {1 + 1")).toEqual(
			passageObject({
				name: "This Isn't Metadata {1 + 1",
				tags: [],
				text: ''
			})
		);
		expect(
			passageFromTwee(':: Bad Position {"position": 32,"size":"10,20"}')
		).toEqual(
			passageObject({
				height: 20,
				name: 'Bad Position',
				tags: [],
				text: '',
				width: 10
			})
		);
		expect(
			passageFromTwee(':: Bad Size {"position":"10,20","size": 32}')
		).toEqual(
			passageObject({
				left: 10,
				name: 'Bad Size',
				tags: [],
				text: '',
				top: 20
			})
		);
		oldWarn.mockRestore();
	});

	it('throws an error if given a passage with no name or text', () =>
		expect(() => passageFromTwee('::')).toThrow());

	it('converts a passage with no text properly', () =>
		expect(passageFromTwee(':: No Text')).toEqual(
			passageObject({
				name: 'No Text',
				tags: [],
				text: ''
			})
		));
});

describe('passageToTwee()', () => {
	it('converts a passage with no tags properly', () => {
		const passage = fakePassage({name: 'mock-passage', tags: []});

		expect(passageToTwee(passage)).toBe(
			`:: mock-passage {"position":"${passage.left},${passage.top}","size":"${passage.width},${passage.height}"}\n${passage.text}\n`
		);
	});

	it('converts a passage with tags properly', () => {
		const passage = fakePassage({
			name: 'mock-passage',
			tags: ['red', 'blue-green', 'yellow']
		});

		expect(passageToTwee(passage)).toBe(
			`:: mock-passage [red blue-green yellow] {"position":"${passage.left},${passage.top}","size":"${passage.width},${passage.height}"}\n${passage.text}\n`
		);
	});

	it('handles a passage name with special characters properly', () => {
		const passage = fakePassage({
			name: '\\[weird{but possible}]\\',
			tags: []
		});

		expect(passageToTwee(passage)).toBe(
			`:: \\\\\\[weird\\{but possible\\}\\]\\\\ {"position":"${passage.left},${passage.top}","size":"${passage.width},${passage.height}"}\n${passage.text}\n`
		);
	});

	it('handles a pssage name with leading and trailing spaces properly', () => {
		const passage = fakePassage({
			name: '  two spaces  ',
			tags: []
		});

		expect(passageToTwee(passage)).toBe(
			`:: \\ \\ two spaces\\ \\  {"position":"${passage.left},${passage.top}","size":"${passage.width},${passage.height}"}\n${passage.text}\n`
		);
	});

	it('handles a tag name with special characters properly', () => {
		const passage = fakePassage({
			name: 'mock-passage',
			tags: ['[weird]', '{but-possible}', '\\slash']
		});

		expect(passageToTwee(passage)).toBe(
			`:: mock-passage [\\[weird\\] \\{but-possible\\} \\\\slash] {"position":"${passage.left},${passage.top}","size":"${passage.width},${passage.height}"}\n${passage.text}\n`
		);
	});

	it('preserves newlines and spaces in passage text', () => {
		const passage = fakePassage({
			tags: [],
			text: 'one\n two \n\n  three  '
		});

		expect(passageToTwee(passage)).toBe(
			`:: ${passage.name} {"position":"${passage.left},${passage.top}","size":"${passage.width},${passage.height}"}\none\n two \n\n  three  \n`
		);
	});

	it('escapes any lines starting with :: in passage text', () => {
		const passage = fakePassage({
			tags: [],
			text: ':: escape\n::and escape\n::one more time'
		});

		expect(passageToTwee(passage)).toBe(
			`:: ${passage.name} {"position":"${passage.left},${passage.top}","size":"${passage.width},${passage.height}"}\n\\:: escape\n\\::and escape\n\\::one more time\n`
		);
	});
});

describe('storyFromTwee()', () => {
	let story: Story;

	beforeEach(() => (story = fakeStory(2)));

	it('imports passages', () => {
		const oldWarn = jest.spyOn(console, 'warn').mockReturnValue();
		const {passages: p} = story;
		const {passages} = storyFromTwee(
			`:: ${p[0].name}\n${p[0].text}\n::${p[1].name}\n${p[1].text}`
		);

		expect(passages.length).toBe(2);
		expect(passages[0]).toEqual(
			expect.objectContaining({name: p[0].name, text: p[0].text})
		);
		expect(passages[1]).toEqual(
			expect.objectContaining({name: p[1].name, text: p[1].text})
		);
		oldWarn.mockRestore();
	});

	it('sets the story name if a StoryTitle passage exists', () => {
		const oldWarn = jest.spyOn(console, 'warn').mockReturnValue();
		const result = storyFromTwee(
			':: StoryTitle\ntest-title\n:: Another Passage\ntest-text'
		);

		expect(result.name).toBe('test-title');
		expect(result.passages.length).toBe(1);
		expect(result.passages[0]).toEqual(
			expect.objectContaining({
				name: 'Another Passage',
				text: 'test-text'
			})
		);
		oldWarn.mockRestore();
	});

	it('applies metadata in a StoryData passage', () => {
		const story = fakeStory(0);
		const data = {
			ifid: story.ifid,
			format: story.storyFormat,
			'format-version': story.storyFormatVersion,
			'tag-colors': story.tagColors,
			zoom: story.zoom
		};

		expect(storyFromTwee(`:: StoryData\n${JSON.stringify(data)}`)).toEqual(
			expect.objectContaining({
				ifid: story.ifid,
				storyFormat: story.storyFormat,
				storyFormatVersion: story.storyFormatVersion,
				tagColors: story.tagColors,
				zoom: story.zoom
			})
		);
	});

	it("concatenates all script-tagged passages into the story's script property", () => {
		const oldWarn = jest.spyOn(console, 'warn').mockReturnValue();

		expect(
			storyFromTwee(
				':: test-script [script]\nabc\n:: test-script2 [script]\ndef'
			).script
		).toBe('abc\ndef');
		oldWarn.mockRestore();
	});

	it("concatenates all stylesheet-tagged passages into the story's style property", () => {
		const oldWarn = jest.spyOn(console, 'warn').mockReturnValue();

		expect(
			storyFromTwee(
				':: test-script [stylesheet]\nabc\n:: test-script2 [stylesheet]\ndef'
			).stylesheet
		).toBe('abc\ndef');
		oldWarn.mockRestore();
	});

	it('sets the start passage if it can be found', () => {
		const story = fakeStory(1);
		const result = storyFromTwee(
			`:: ${story.passages[0].name}\n:: StoryData\n{"start": "${story.passages[0].name}"}`
		);

		expect(result.passages.length).toBe(1);
		expect(result.startPassage).toBe(result.passages[0].id);
	});

	it('ignores extraneous metadata in a StoryData passage', () =>
		expect(storyFromTwee(`:: StoryData\n{"bad": true}`)).not.toEqual({
			bad: true
		}));

	it('ignores StoryData metadata of an incorrect type', () => {
		const badData = {
			ifid: true,
			format: 3,
			'format-version': 1,
			'tag-colors': 'bad',
			zoom: null
		};

		expect(
			storyFromTwee(`:: StoryData\n${JSON.stringify(badData)}`)
		).not.toEqual(
			expect.objectContaining({
				ifid: badData.ifid,
				storyFormat: badData.format,
				storyFormatVersion: badData['format-version'],
				tagColors: badData['tag-colors'],
				zoom: badData.zoom
			})
		);
	});

	it('arranges passages in a grid 10 passages wide if none have any position metadata set', () => {
		const oldWarn = jest.spyOn(console, 'warn').mockReturnValue();
		let source = '';

		for (let i = 0; i < 11; i++) {
			source += `:: ${i}\n`;
		}

		const {passages} = storyFromTwee(source);

		expect(passages).toEqual([
			expect.objectContaining({left: 25, name: '0', top: 25}),
			expect.objectContaining({left: 150, name: '1', top: 25}),
			expect.objectContaining({left: 275, name: '2', top: 25}),
			expect.objectContaining({left: 400, name: '3', top: 25}),
			expect.objectContaining({left: 525, name: '4', top: 25}),
			expect.objectContaining({left: 650, name: '5', top: 25}),
			expect.objectContaining({left: 775, name: '6', top: 25}),
			expect.objectContaining({left: 900, name: '7', top: 25}),
			expect.objectContaining({left: 1025, name: '8', top: 25}),
			expect.objectContaining({left: 1150, name: '9', top: 25}),
			expect.objectContaining({left: 25, name: '10', top: 150})
		]);
		oldWarn.mockRestore();
	});
});

describe('storyToTwee()', () => {
	let story: Story;

	beforeEach(() => (story = fakeStory(0)));

	it('creates a StoryTitle passage', () =>
		expect(storyToTwee(story)).toContain(`:: StoryTitle\n${story.name}\n\n`));

	it('escapes a story name starting with ::', () => {
		story.name = ':: weird';

		expect(storyToTwee(story)).toContain(`:: StoryTitle\n\\:: weird\n\n`);
	});

	it('creates a StoryData passage with formatted JSON', () => {
		story.passages = [fakePassage()];
		story.startPassage = story.passages[0].id;
		story.tagColors = {'tag-name': 'red'};

		expect(storyToTwee(story)).toContain(
			`:: StoryData\n{\n  "ifid": "${story.ifid}",\n  "format": "${story.storyFormat}",\n  "format-version": "${story.storyFormatVersion}",\n  "start": "${story.passages[0].name}",\n  "tag-colors": {\n    "tag-name": "red"\n  },\n  "zoom": ${story.zoom}\n}\n`
		);
	});

	it("omits the start property in StoryData if the start passage couldn't be found", () => {
		story.startPassage = 'nonexistent';
		story.tagColors = {'tag-name': 'red'};
		expect(storyToTwee(story)).toContain(
			`:: StoryData\n{\n  "ifid": "${story.ifid}",\n  "format": "${story.storyFormat}",\n  "format-version": "${story.storyFormatVersion}",\n  "tag-colors": {\n    "tag-name": "red"\n  },\n  "zoom": ${story.zoom}\n}\n`
		);
	});

	it('omits the tag-colors property in StoryData if none are set', () => {
		story.tagColors = {};
		expect(storyToTwee(story)).toContain(
			`:: StoryData\n{\n  "ifid": "${story.ifid}",\n  "format": "${story.storyFormat}",\n  "format-version": "${story.storyFormatVersion}",\n  "zoom": ${story.zoom}\n}\n`
		);
	});

	it('returns converted passages, sorted alphabetically, with two newlines between them', () => {
		story.passages = [
			fakePassage({name: 'a'}),
			fakePassage({name: 'c'}),
			fakePassage({name: 'b'})
		];
		story.script = '';
		story.startPassage = story.passages[1].id;
		story.stylesheet = '';
		story.tagColors = {'tag-name': 'red'};

		const correctStoryTitle = `:: StoryTitle\n${story.name}`;
		const correctStoryData = `:: StoryData\n{\n  "ifid": "${story.ifid}",\n  "format": "${story.storyFormat}",\n  "format-version": "${story.storyFormatVersion}",\n  "start": "${story.passages[1].name}",\n  "tag-colors": {\n    "tag-name": "red"\n  },\n  "zoom": ${story.zoom}\n}`;
		const correctPassages = [
			story.passages[0],
			story.passages[2],
			story.passages[1]
		].map(
			passage =>
				`:: ${passage.name} {"position":"${passage.left},${passage.top}","size":"${passage.width},${passage.height}"}\n${passage.text}`
		);

		expect(storyToTwee(story)).toBe(
			`${correctStoryTitle}\n\n\n${correctStoryData}\n\n\n${correctPassages[0]}\n\n\n${correctPassages[1]}\n\n\n${correctPassages[2]}\n`
		);
	});

	it('creates a passage tagged "script" if the story has a script property', () => {
		story.passages = [];
		story.script = 'test-script';
		story.stylesheet = '';

		expect(storyToTwee(story)).toMatch(
			`:: StoryScript [script]\n${story.script}`
		);
	});

	it('renames the script passage if a passage in the story conflicts with it', () => {
		story.passages = [fakePassage({name: 'StoryScript'})];
		story.script = 'test-script';
		story.stylesheet = '';
		expect(storyToTwee(story)).toMatch(
			`:: StoryScript 1 [script]\n${story.script}`
		);
	});

	it('creates a passage tagged "style" if the story has a stylesheet property', () => {
		story.passages = [];
		story.script = '';
		story.stylesheet = 'test-stylesheet';

		expect(storyToTwee(story)).toMatch(
			`:: StoryStylesheet [stylesheet]\n${story.stylesheet}`
		);
	});

	it('renames the style passage if a passage in the story conflicts with it', () => {
		story.passages = [fakePassage({name: 'StoryStylesheet'})];
		story.script = '';
		story.stylesheet = 'test-stylesheet';
		expect(storyToTwee(story)).toMatch(
			`:: StoryStylesheet 1 [stylesheet]\n${story.stylesheet}`
		);
	});
});
