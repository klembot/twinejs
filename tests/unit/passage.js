'use strict';
var Passage = require('../../src/data/models/passage');
var Story = require('../../src/data/models/passage');
var assert = require('assert');

describe('Passage', function()
{
	var story;
	var p;

	beforeEach(function()
	{
		p = new Passage();
	});

	describe('excerpt()', function() {
		it('returns the passage text if it has under 101 characters', function() {
			var text = Array(101)+'';
			p.set('text', text);
			assert.equal(p.excerpt(), text);
		});
		it('HTML-escapes returned passage text', function() {
			var text = "<b>";
			p.set('text', text);
			assert.equal(p.excerpt(), "&lt;b&gt;");
		});
		it('returns 99 characters of passage text, plus &hellip;, if it has 101 or more characters', function() {
			var text = Array(102)+'';
			p.set('text', text);
			assert.equal(p.excerpt(), text.slice(0,99) + "&hellip;");
		})
	});

	describe('publish()', function() {
		it('outputs <tw-passagedata> HTML for the passage', function() {
			function expected(pid, name, tags, top, left, text) {
				return '<tw-passagedata pid="' + pid + '" name="' + name + '" tags="' + tags.join(' ')
					+ '" position="' + [left, top] + '">' + text + '</tw-passagedata>\n';
			}
			var props = {
				name: "Foo",
				tags: ['bar', 'baz', 'qux'],
				top: 0,
				left: 0,
				text: "grault garply corge"
			};
			p.set(props);
			assert.equal(p.publish(5), expected(5, props.name, props.tags, props.top, props.left, props.text));

			props = {
				name: "",
				tags: ['>','"'],
				top: 15385,
				left: 22408,
				text: "</tw-passagedata>"
			};
			p.set(props);
			assert.equal(p.publish(8), expected(8, props.name, ["&gt;","&quot;"], props.top, props.left,
				"&lt;/tw-passagedata&gt;"));
		});
	});

	describe('matches()', function() {
		beforeEach(function() {
			p.set('name', "foo bar baz qux");
			p.set('text', '<b>garply</b>')
		});
		it('returns true if the passage name matches the passed-in RegExp', function() {
			assert(p.matches(/r\s+b/));
			assert(!p.matches(/w/));
		});
		it('returns true if the passage text, unescaped, matches the passed-in RegExp', function() {
			assert(p.matches(/rp/));
			assert(p.matches(/<b>/));
			assert(!p.matches(/w/));
		});
	});

	describe('links()', function()
	{

		it('parses [[simple links]]', function()
		{
			p.set('text', '[[link]]');
			var links = p.links();
			assert.equal(links.length,1);
			assert.equal(links[0], 'link');
		});

		it('parses [[pipe|links]]', function()
		{
			p.set('text', '[[display|link]]');
			var links = p.links();
			assert.equal(links.length, 1);
			assert.equal(links[0], 'link');
		});

		it('parses [[arrow->links]]', function()
		{
			p.set('text', '[[display->link]]');
			var links = p.links();
			assert.equal(links.length, 1);
			assert.equal(links[0], 'link');
		});

		it('parses [[backarrow<-links]]', function()
		{
			p.set('text', '[[link<-display]]');
			var links = p.links();
			assert.equal(links.length, 1);
			assert.equal(links[0],'link');
		});

		it('parses [[simple links][setter]] while ignoring setter component', function()
		{
			p.set('text', '[[link][setter]]');
			var links = p.links();
			assert.equal(links.length, 1);
			assert.equal(links[0],'link');
		});

		it('parses [[pipe|links][setter]] while ignoring setter component', function()
		{
			p.set('text', '[[display|link][setter]]');
			var links = p.links();
			assert.equal(links.length, 1);
			assert.equal(links[0], 'link');
		});

		it('parses [[arrow->links][setter]] while ignoring setter component', function()
		{
			p.set('text', '[[display->link][setter]]');
			var links = p.links();
			assert.equal(links.length, 1);
			assert.equal(links[0], 'link');
		});

		it('parses [[backarrow<-links][setter]] while ignoring setter component', function()
		{
			p.set('text', '[[link<-display][setter]]');
			var links = p.links();
			assert.equal(links.length, 1);
			assert.equal(links[0], 'link');
		});

		it('parses [[simple links][]] while ignoring empty setter component', function()
		{
			p.set('text', '[[link][]]');
			var links = p.links();
			assert.equal(links.length, 1);
			assert.equal(links[0], 'link');
		});

		it('parses [[pipe|links][]] while ignoring empty setter component', function()
		{
			p.set('text', '[[display|link][]]');
			var links = p.links();
			assert.equal(links.length, 1);
			assert.equal(links[0], 'link');
		});

		it('parses [[arrow->links][]] while ignoring empty setter component', function()
		{
			p.set('text', '[[display->link][]]');
			var links = p.links();
			assert.equal(links.length, 1);
			assert.equal(links[0], 'link');
		});

		it('parses [[backarrow<-links][]] while ignoring empty setter component', function()
		{
			p.set('text', '[[link<-display][]]');
			var links = p.links();
			assert.equal(links.length, 1);
			assert.equal(links[0], 'link');
		});

		it('ignores [[]]', function()
		{
			p.set('text', '[[]]');
			assert.equal(p.links().length, 0);
		});

		it('ignores [[][]]', function()
		{
			p.set('text', '[[][]]');
			assert.equal(p.links().length, 0);
		});

		it('ignores [[][setter]]', function()
		{
			p.set('text', '[[][setter]]');
			assert.equal(p.links().length, 0);
		});
	});
});
