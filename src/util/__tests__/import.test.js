import {importStories} from '../import';

const testHtml = `
<tw-storydata name="Test" startnode="1" zoom="1.5" creator="Twine" creator-version="2.0.11" ifid="3AE380EE-4B34-4D0D-A8E2-BE624EB271C9" format="SugarCube" options="" hidden><tw-tag name="my-tag" color="purple" /><style role="stylesheet" id="twine-user-stylesheet" type="text/twine-css">* { color: red }
* { color: blue }</style><script role="script" id="twine-user-script" type="text/twine-javascript">alert('hi');</script><tw-passagedata pid="1" name="Untitled Passage" tags="foo bar" position="450,250">This is some text.

[[1]]</tw-passagedata>
<tw-passagedata pid="2" name="1" tags="" position="600,200" size="200,200">This is another &lt;&lt;passage&gt;&gt;.</tw-passagedata>
<tw-passagedata pid="3" name="&lt;hi&gt;" tags="" position="700,300">Another passage.</tw-passagedata>
</tw-storydata>
`;

const bareTestHtml = '<tw-storydata name="Test" hidden></tw-storydata>';

describe('importStories()', () => {
	it('creates a JavaScript object representation of HTML data', () => {
		const result = importStories(testHtml);

		expect(result.length).toBe(1);
		expect(typeof result[0].id).toBe('string');
		expect(result[0]).toEqual(
			expect.objectContaining({
				ifid: '3AE380EE-4B34-4D0D-A8E2-BE624EB271C9',
				name: 'Test',
				script: "alert('hi');",
				startPassage: result[0].passages[0].id,
				storyFormat: 'SugarCube',
				stylesheet: '* { color: red }\n* { color: blue }',
				tagColors: {
					'my-tag': 'purple'
				},
				zoom: 1.5
			})
		);
		expect(result[0].passages.length).toBe(3);
		result[0].passages.forEach(p => expect(typeof p.id).toBe('string'));
		expect(result[0].passages[0]).toEqual(
			expect.objectContaining({
				left: 450,
				name: 'Untitled Passage',
				tags: ['foo', 'bar'],
				text: 'This is some text.\n\n[[1]]',
				top: 250
			})
		);
		expect(result[0].passages[1]).toEqual(
			expect.objectContaining({
				height: 200,
				left: 600,
				name: '1',
				tags: [],
				text: 'This is another <<passage>>.',
				top: 200,
				width: 200
			})
		);
		expect(result[0].passages[2]).toEqual(
			expect.objectContaining({
				left: 700,
				name: '<hi>',
				tags: [],
				text: 'Another passage.',
				top: 300
			})
		);
	});

	it('handles malformed HTML data', () => {
		let result = importStories('');

		expect(result).toEqual([]);
		result = importStories('<tw-storydata></tw-storydata>');
		expect(typeof result[0].id).toBe('string');
		expect(result[0]).toEqual(
			expect.objectContaining({
				passages: [],
				tagColors: {}
			})
		);
	});

	it.todo('handles malformed passage size attributes');
	it.todo('handles malformed passage position attributes');

	it('handles HTML data without expected attributes', () => {
		const result = importStories(bareTestHtml);

		expect(result.length).toBe(1);
		expect(typeof result[0].id).toBe('string');
		expect(result[0]).toEqual(
			expect.objectContaining({
				name: 'Test',
				passages: [],
				script: '',
				stylesheet: '',
				tagColors: {}
			})
		);
	});

	it("allows setting the story's creation date manually", () => {
		const forceDate = new Date(Date.parse('January 1, 1987'));
		const result = importStories(testHtml, forceDate);

		expect(result[0].lastUpdate).toBe(forceDate);
	});
});
