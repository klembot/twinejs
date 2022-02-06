import * as React from 'react';
import {render} from '@testing-library/react';
import {DocumentTitle} from '../document-title';
import {Helmet} from 'react-helmet';

describe('<DocumentTitle>', () => {
	it('sets the document title', () => {
		render(<DocumentTitle title="mock-title" />);
		expect(Helmet.peek().title).toBe('mock-title');
	});
});
