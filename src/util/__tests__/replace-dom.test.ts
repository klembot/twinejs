import {replaceDom} from '../replace-dom';

describe('replaceDom', () => {
	it('replaces any existing HTML in the document with the argument passed', () => {
		document.body.innerHTML = '<p>This should be overwritten</p>';
		replaceDom('<p>test</p>');
		expect(document.body.innerHTML).toBe('<p>test</p>');
	});
});
