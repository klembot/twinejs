const importer = require('./import');

const testHtml = `
<tw-storydata name="Test" startnode="1" zoom="1.5" creator="Twine" creator-version="2.0.11" ifid="3AE380EE-4B34-4D0D-A8E2-BE624EB271C9" format="SugarCube" options="" hidden><tw-tag name="my-tag" color="purple" /><style role="stylesheet" id="twine-user-stylesheet" type="text/twine-css">* { color: red }
* { color: blue }</style><script role="script" id="twine-user-script" type="text/twine-javascript">alert('hi');</script><tw-passagedata pid="1" name="Untitled Passage" tags="foo bar" position="450,250">This is some text.

[[1]]</tw-passagedata>
<tw-passagedata pid="2" name="1" tags="" position="600,200" size="200,200">This is another &lt;&lt;passage&gt;&gt;.</tw-passagedata>
<tw-passagedata pid="3" name="&lt;hi&gt;" tags="" position="700,300">Another passage.</tw-passagedata>
</tw-storydata>
`;

const bareTestHtml = '<tw-storydata name="Test" hidden></tw-storydata>';

describe('import module', () => {
	test('creates a JavaScript object representation of HTML data', () => {
		const result = importer(testHtml);

		expect(Array.isArray(result)).toBe(true);
		expect(result.length).toBe(1);
		expect(result[0].startPassagePid).toBe('1');
		expect(result[0].name).toBe('Test');
		expect(result[0].ifid).toBe('3AE380EE-4B34-4D0D-A8E2-BE624EB271C9');
		expect(result[0].zoom).toBe(1.5);
		expect(result[0].lastUpdate instanceof Date).toBe(true);
		expect(result[0].script).toBe("alert('hi');");
		expect(result[0].stylesheet).toBe(
			'* { color: red }\n* { color: blue }'
		);
		expect(result[0].tagColors['my-tag']).toBe('purple');
		expect(Array.isArray(result[0].passages)).toBe(true);
		expect(result[0].passages.length).toBe(3);
		expect(result[0].passages[0].pid).toBe('1');
		expect(result[0].passages[0].left).toBe(450);
		expect(result[0].passages[0].top).toBe(250);
		expect(result[0].passages[0].width).toBe(100);
		expect(result[0].passages[0].height).toBe(100);
		expect(result[0].passages[0].selected).toBe(false);
		expect(Array.isArray(result[0].passages[0].tags)).toBe(true);
		expect(result[0].passages[0].tags.length).toBe(2);
		expect(result[0].passages[0].tags[0]).toBe('foo');
		expect(result[0].passages[0].tags[1]).toBe('bar');
		expect(result[0].passages[0].name).toBe('Untitled Passage');
		expect(result[0].passages[0].text).toBe('This is some text.\n\n[[1]]');
		expect(result[0].passages[1].pid).toBe('2');
		expect(result[0].passages[1].left).toBe(600);
		expect(result[0].passages[1].top).toBe(200);
		expect(result[0].passages[1].width).toBe(200);
		expect(result[0].passages[1].height).toBe(200);
		expect(result[0].passages[1].selected).toBe(false);
		expect(Array.isArray(result[0].passages[1].tags)).toBe(true);
		expect(result[0].passages[1].tags.length).toBe(0);
		expect(result[0].passages[1].name).toBe('1');
		expect(result[0].passages[1].text).toBe('This is another <<passage>>.');
		expect(result[0].passages[2].left).toBe(700);
		expect(result[0].passages[2].top).toBe(300);
		expect(result[0].passages[2].width).toBe(100);
		expect(result[0].passages[2].height).toBe(100);
		expect(Array.isArray(result[0].passages[2].tags)).toBe(true);
		expect(result[0].passages[2].tags.length).toBe(0);
		expect(result[0].passages[2].name).toBe('<hi>');
		expect(result[0].passages[2].text).toBe('Another passage.');
	});

	test('handles malformed HTML data', () => {
		let result = importer('');

		expect(result.length).toBe(0);

		result = importer('<tw-storydata></tw-storydata>');
	});

	test('handles HTML data without expected attributes', () => {
		let result = importer(bareTestHtml);

		expect(result.length).toBe(1);
		expect(result[0].name).toBe('Test');
		expect(result[0].ifid).toBeNull();
		expect(result[0].zoom).toBe(1);
		expect(result[0].lastUpdate instanceof Date).toBe(true);
		expect(result[0].script).toBe('');
		expect(result[0].stylesheet).toBe('');
		expect(typeof result[0].tagColors).toBe('object');
		expect(Array.isArray(result[0].passages)).toBe(true);
		expect(result[0].passages.length).toBe(0);
	});

	test("allows setting the story's creation date manually", () => {
		const forceDate = new Date(Date.parse('January 1, 1987'));
		const result = importer(testHtml, forceDate);

		expect(result[0].lastUpdate).toBe(forceDate);
	});
});
