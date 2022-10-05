import {Story} from '../../store/stories';
import {fakePassage, fakeStory} from '../../test-util';
import {passageToTwee, storyToTwee} from '../twee';

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
			`:: ${passage.name} {"position":"${passage.left},${passage.top}","size":"${passage.width},${passage.height}"}\n\\:\\: escape\n\\:\\:and escape\n\\:\\:one more time\n`
		);
	});
});

describe('storyToTwee()', () => {
	let story: Story;

	beforeEach(() => (story = fakeStory(0)));

	it('creates a StoryTitle passage', () =>
		expect(storyToTwee(story)).toContain(`:: StoryTitle\n${story.name}\n\n`));

	it('escapes a story name starting with ::', () => {
		story.name = ':: weird';

		expect(storyToTwee(story)).toContain(`:: StoryTitle\n\\:\\: weird\n\n`);
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

	it('outputs converted passages with two newlines between them', () => {
		story.passages = [fakePassage(), fakePassage(), fakePassage()];
		story.startPassage = story.passages[1].id;
		story.tagColors = {'tag-name': 'red'};

		const correctStoryTitle = `:: StoryTitle\n${story.name}`;
		const correctStoryData = `:: StoryData\n{\n  "ifid": "${story.ifid}",\n  "format": "${story.storyFormat}",\n  "format-version": "${story.storyFormatVersion}",\n  "start": "${story.passages[1].name}",\n  "tag-colors": {\n    "tag-name": "red"\n  },\n  "zoom": ${story.zoom}\n}`;
		const correctPassages = story.passages.map(
			passage =>
				`:: ${passage.name} {"position":"${passage.left},${passage.top}","size":"${passage.width},${passage.height}"}\n${passage.text}`
		);

		expect(storyToTwee(story)).toBe(
			`${correctStoryTitle}\n\n\n${correctStoryData}\n\n\n${correctPassages[0]}\n\n\n${correctPassages[1]}\n\n\n${correctPassages[2]}\n`
		);
	});
});
