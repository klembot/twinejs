const linkParser = require('./link-parser');

describe('link-parser', () => {
		test('parses [[simple links]]', () => {
			const links = linkParser('[[link]]');

			expect(links).toHaveLength(1);
			expect(links[0]).toBe('link');
		});

		test('parses [[pipe|links]]', () => {
			const links = linkParser('[[display|link]]');

			expect(links).toHaveLength(1);
			expect(links[0]).toBe('link');
		});

		test('parses [[arrow->links]]', () => {
			const links = linkParser('[[display->link]]');

			expect(links).toHaveLength(1);
			expect(links[0]).toBe('link');
		});

		test('parses [[backarrow<-links]]', () => {
			const links = linkParser('[[link<-display]]');

			expect(links).toHaveLength(1);
			expect(links[0]).toBe('link');
		});

		test('parses [[simple links][setter]] while ignoring setter component', () => {
			const links = linkParser('[[link][setter]]');

			expect(links).toHaveLength(1);
			expect(links[0]).toBe('link');
		});

		test('parses [[pipe|links][setter]] while ignoring setter component', () => {
			const links = linkParser('[[link][setter]]');

			expect(links).toHaveLength(1);
			expect(links[0]).toBe('link');
		});

		test('parses [[arrow->links][setter]] while ignoring setter component', () => {
			const links = linkParser('[[display->link][setter]]');

			expect(links).toHaveLength(1);
			expect(links[0]).toBe('link');
		});

		test(
            'parses [[backarrow<-links][setter]] while ignoring setter component',
            () => {
                const links = linkParser('[[link<-display][setter]]');

                expect(links).toHaveLength(1);
                expect(links[0]).toBe('link');
            }
        );

		test('parses [[simple links][]] while ignoring empty setter component', () => {
			const links = linkParser('[[link][]]');

			expect(links).toHaveLength(1);
			expect(links[0]).toBe('link');
		});

		test('parses [[pipe|links][]] while ignoring empty setter component', () => {
			const links = linkParser('[[display|link][]]');

			expect(links).toHaveLength(1);
			expect(links[0]).toBe('link');
		});

		test('parses [[arrow->links][]] while ignoring empty setter component', () => {
			const links = linkParser('[[display->link][]]');

			expect(links).toHaveLength(1);
			expect(links[0]).toBe('link');
		});

		test(
            'parses [[backarrow<-links][]] while ignoring empty setter component',
            () => {
                const links = linkParser('[[link<-display][]]');

                expect(links).toHaveLength(1);
                expect(links[0]).toBe('link');
            }
        );

		test('ignores [[]]', () => {
			const links = linkParser('[[]]');

			expect(links).toHaveLength(0);
		});

		test('ignores [[][]]', () => {
			const links = linkParser('[[][]]');

			expect(links).toHaveLength(0);
		});

		test('ignores [[][setter]]', () => {
			const links = linkParser('[[][setter]]');

			expect(links).toHaveLength(0);
		});
		
		test('parses [[ /regex with [ | ]/ ->link]]', () => {
			const links = linkParser('[[/regex with [ | ]/ ->link]]');

			expect(links).toHaveLength(1);
			expect(links[0]).toBe('link');
		});

		test('parses [[ /regex with [ | ]/ ->link][setter]]', () => {
			const links = linkParser('[[/regex with [ | ]/ ->link][setter]]');

			expect(links).toHaveLength(1);
			expect(links[0]).toBe('link');
		});

		test('parses [[simple link1]][[simple link 2]]', () => {
			const links = linkParser('[[link1]][[link2]]');

			expect(links).toHaveLength(2);
			expect(links[0]).toBe('link1');
			expect(links[1]).toBe('link2');
		});

		test('handles duplicate links', () => {
			const links = linkParser('[[a]] [[a]]');

			expect(links).toHaveLength(1);
			expect(links[0]).toBe('a');
		});

		test('ignores external links when requested', () => {
			const links = linkParser('[[http://twinery.org]]', true);

			expect(links).toHaveLength(0);
		});
	}
);
