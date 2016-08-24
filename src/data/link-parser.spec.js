const { expect } = require('chai');
const linkParser = require('./link-parser');

describe('link-parser', () =>
	{
		it('parses [[simple links]]', () => {
			const links = linkParser('[[link]]');

			expect(links).to.have.lengthOf(1);
			expect(links[0]).to.equal('link');
		});

		it('parses [[pipe|links]]', () => {
			const links = linkParser('[[display|link]]');

			expect(links).to.have.lengthOf(1);
			expect(links[0]).to.equal('link');
		});

		it('parses [[arrow->links]]', () => {
			const links = linkParser('[[display->link]]');

			expect(links).to.have.lengthOf(1);
			expect(links[0]).to.equal('link');
		});

		it('parses [[backarrow<-links]]', () => {
			const links = linkParser('[[link<-display]]');

			expect(links).to.have.lengthOf(1);
			expect(links[0]).to.equal('link');
		});

		it('parses [[simple links][setter]] while ignoring setter component', () => {
			const links = linkParser('[[link][setter]]');

			expect(links).to.have.lengthOf(1);
			expect(links[0]).to.equal('link');
		});

		it('parses [[pipe|links][setter]] while ignoring setter component', () => {
			const links = linkParser('[[link][setter]]');

			expect(links).to.have.lengthOf(1);
			expect(links[0]).to.equal('link');
		});

		it('parses [[arrow->links][setter]] while ignoring setter component', () => {
			const links = linkParser('[[display->link][setter]]');

			expect(links).to.have.lengthOf(1);
			expect(links[0]).to.equal('link');
		});

		it('parses [[backarrow<-links][setter]] while ignoring setter component', () => {
			const links = linkParser('[[link<-display][setter]]');

			expect(links).to.have.lengthOf(1);
			expect(links[0]).to.equal('link');
		});

		it('parses [[simple links][]] while ignoring empty setter component', () => {
			const links = linkParser('[[link][]]');

			expect(links).to.have.lengthOf(1);
			expect(links[0]).to.equal('link');
		});

		it('parses [[pipe|links][]] while ignoring empty setter component', () => {
			const links = linkParser('[[display|link][]]');

			expect(links).to.have.lengthOf(1);
			expect(links[0]).to.equal('link');
		});

		it('parses [[arrow->links][]] while ignoring empty setter component', () => {
			const links = linkParser('[[display->link][]]');

			expect(links).to.have.lengthOf(1);
			expect(links[0]).to.equal('link');
		});

		it('parses [[backarrow<-links][]] while ignoring empty setter component', () => {
			const links = linkParser('[[link<-display][]]');

			expect(links).to.have.lengthOf(1);
			expect(links[0]).to.equal('link');
		});

		it('ignores [[]]', () => {
			const links = linkParser('[[]]');

			expect(links).to.have.lengthOf(0);
		});

		it('ignores [[][]]', () => {
			const links = linkParser('[[][]]');

			expect(links).to.have.lengthOf(0);
		});

		it('ignores [[][setter]]', () => {
			const links = linkParser('[[][setter]]');

			expect(links).to.have.lengthOf(0);
		});
	});
