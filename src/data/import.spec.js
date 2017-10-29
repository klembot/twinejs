const { expect } = require('chai');
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
	it('creates a JavaScript object representation of HTML data', () => {
		const result = importer(testHtml);

		expect(result).to.be.an('array');
		expect(result.length).to.equal(1);
		expect(result[0].startPassagePid).to.equal('1');
		expect(result[0].name).to.equal('Test');
		expect(result[0].ifid).to.equal('3AE380EE-4B34-4D0D-A8E2-BE624EB271C9');
		expect(result[0].zoom).to.equal(1.5);
		expect(result[0].lastUpdate).to.be.a('date');
		expect(result[0].script).to.equal('alert(\'hi\');\n');
		expect(result[0].stylesheet).to.equal('* { color: red }\n* { color: blue }\n');
		expect(result[0].tagColors['my-tag']).to.equal('purple');
		expect(result[0].passages).to.be.an('array');
		expect(result[0].passages.length).to.equal(3);
		expect(result[0].passages[0].pid).to.equal('1');
		expect(result[0].passages[0].left).to.equal(450);
		expect(result[0].passages[0].top).to.equal(250);
		expect(result[0].passages[0].width).to.equal(100);
		expect(result[0].passages[0].height).to.equal(100);
		expect(result[0].passages[0].selected).to.equal(false);		
		expect(result[0].passages[0].tags).to.be.an('array');
		expect(result[0].passages[0].tags.length).to.equal(2);
		expect(result[0].passages[0].tags[0]).to.equal('foo');
		expect(result[0].passages[0].tags[1]).to.equal('bar');
		expect(result[0].passages[0].name).to.equal('Untitled Passage');
		expect(result[0].passages[0].text).to.equal('This is some text.\n\n[[1]]');
		expect(result[0].passages[1].pid).to.equal('2');
		expect(result[0].passages[1].left).to.equal(600);
		expect(result[0].passages[1].top).to.equal(200);
		expect(result[0].passages[1].width).to.equal(200);
		expect(result[0].passages[1].height).to.equal(200);
		expect(result[0].passages[1].selected).to.equal(false);		
		expect(result[0].passages[1].tags).to.be.an('array');
		expect(result[0].passages[1].tags.length).to.equal(0);
		expect(result[0].passages[1].name).to.equal('1');
		expect(result[0].passages[1].text).to.equal('This is another <<passage>>.');
		expect(result[0].passages[2].left).to.equal(700);
		expect(result[0].passages[2].top).to.equal(300);
		expect(result[0].passages[2].width).to.equal(100);
		expect(result[0].passages[2].height).to.equal(100);
		expect(result[0].passages[2].tags).to.be.an('array');
		expect(result[0].passages[2].tags.length).to.equal(0);
		expect(result[0].passages[2].name).to.equal('<hi>');
		expect(result[0].passages[2].text).to.equal('Another passage.');
	});

	it('handles malformed HTML data', () => {
		let result = importer('');

		expect(result.length).to.equal(0);

		result = importer('<tw-storydata></tw-storydata>');
	});

	it('handles HTML data without expected attributes', () => {
		let result = importer(bareTestHtml);

		expect(result.length).to.equal(1);
		expect(result[0].name).to.equal('Test');
		expect(result[0].ifid).to.equal(null);
		expect(result[0].zoom).to.equal(1);
		expect(result[0].lastUpdate).to.be.a('date');
		expect(result[0].script).to.equal('');
		expect(result[0].stylesheet).to.equal('');
		expect(result[0].tagColors).to.be.a('object');
		expect(result[0].passages).to.be.an('array');
		expect(result[0].passages.length).to.equal(0);
	});

	it('allows setting the story\'s creation date manually', () => {
		const forceDate = new Date(Date.parse('January 1, 1987'));
		const result = importer(testHtml, forceDate);

		expect(result[0].lastUpdate).to.equal(forceDate);
	});
});
