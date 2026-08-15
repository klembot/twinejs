import {KEYBINDINGS_SCOPE, scopeChain} from '../scope';

describe('scopeChain()', () => {
	afterEach(() => {
		document.body.innerHTML = '';
	});

	function build(html: string) {
		document.body.innerHTML = html;
		return document.querySelector('#target') as HTMLElement;
	}

	it('returns global when nothing is marked', () => {
		expect(scopeChain(build('<div id="target"></div>'))).toEqual(['global']);
	});

	it('returns scopes innermost first', () => {
		const target = build(
			`<div data-hotkey-scope="story-map">
				<div data-hotkey-scope="dialog">
					<span id="target"></span>
				</div>
			</div>`
		);

		expect(scopeChain(target)).toEqual(['dialog', 'story-map', 'global']);
	});

	it('includes a scope set on the element itself', () => {
		const target = build(
			'<div data-hotkey-scope="story-map" id="target"></div>'
		);

		expect(scopeChain(target)).toEqual(['story-map', 'global']);
	});

	it('does not repeat a scope that appears twice', () => {
		const target = build(
			`<div data-hotkey-scope="dialog">
				<div data-hotkey-scope="dialog"><span id="target"></span></div>
			</div>`
		);

		expect(scopeChain(target)).toEqual(['dialog', 'global']);
	});

	it('suppresses every other scope inside the keybindings scope', () => {
		const target = build(
			`<div data-hotkey-scope="story-map">
				<div data-hotkey-scope="${KEYBINDINGS_SCOPE}">
					<span id="target"></span>
				</div>
			</div>`
		);

		expect(scopeChain(target)).toEqual([KEYBINDINGS_SCOPE]);
	});

	it('handles a null element', () => {
		expect(scopeChain(null)).toEqual(['global']);
	});
});
