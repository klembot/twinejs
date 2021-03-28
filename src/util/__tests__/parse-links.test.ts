import {parseLinks} from '../parse-links';

describe('link-parser', () => {
	it('parses [[simple links]]', () =>
		expect(parseLinks('[[link]]')).toEqual(['link']));

	it('parses [[pipe|links]]', () =>
		expect(parseLinks('[[display|link]]')).toEqual(['link']));

	it('parses [[arrow->links]]', () =>
		expect(parseLinks('[[display->link]]')).toEqual(['link']));

	it('parses [[backarrow<-links]]', () =>
		expect(parseLinks('[[link<-display]]')).toEqual(['link']));

	it('parses [[simple links][setter]] while ignoring setter component', () =>
		expect(parseLinks('[[link][setter]]')).toEqual(['link']));

	it('parses [[pipe|links][setter]] while ignoring setter component', () =>
		expect(parseLinks('[[display|link][setter]]')).toEqual(['link']));

	it('parses [[arrow->links][setter]] while ignoring setter component', () =>
		expect(parseLinks('[[display->link][setter]]')).toEqual(['link']));

	it('parses [[backarrow<-links][setter]] while ignoring setter component', () =>
		expect(parseLinks('[[link<-display][setter]]')).toEqual(['link']));

	it('parses [[simple links][]] while ignoring empty setter component', () =>
		expect(parseLinks('[[link][]]')).toEqual(['link']));

	it('parses [[pipe|links][]] while ignoring empty setter component', () =>
		expect(parseLinks('[[display|link][]]')).toEqual(['link']));

	it('parses [[arrow->links][]] while ignoring empty setter component', () =>
		expect(parseLinks('[[display->link][]]')).toEqual(['link']));

	it('parses [[backarrow<-links][]] while ignoring empty setter component', () =>
		expect(parseLinks('[[link<-display][]]')).toEqual(['link']));

	it('ignores [[]]', () => expect(parseLinks('[[]]')).toEqual([]));

	it('ignores [[][]]', () => expect(parseLinks('[[][]]')).toEqual([]));

	it('ignores [[][setter]]', () =>
		expect(parseLinks('[[][setter]]')).toEqual([]));

	it('parses [[ /regex with [ | ]/ ->link]]', () =>
		expect(parseLinks('[[/regex with [ | ]/ ->link]]')).toEqual(['link']));

	it('parses [[ /regex with [ | ]/ ->link][setter]]', () =>
		expect(parseLinks('[[/regex with [ | ]/ ->link][setter]]')).toEqual([
			'link'
		]));

	it('parses [[simple link1]][[simple link 2]]', () =>
		expect(parseLinks('[[link1]][[link2]]')).toEqual(['link1', 'link2']));

	it('removes duplicate links', () =>
		expect(parseLinks('[[a]] [[a]]')).toEqual(['a']));

	it('ignores external links when requested', () =>
		expect(parseLinks('[[http://twinery.org]]', true)).toEqual([]));
});
