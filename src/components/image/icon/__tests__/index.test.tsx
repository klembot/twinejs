import {render} from '@testing-library/react';
import * as React from 'react';
import {IconEmpty} from '../empty';
import {IconLoading} from '../loading';
import {IconTagNub} from '../tag-nub';
import {IconTwine} from '../twine';
import {IconTypeSize} from '../type-size';
import {IconZoomOut} from '../zoom-out';

describe('Custom icons', () => {
	it.each([
		['empty', IconEmpty],
		['loading', IconLoading],
		['tag nub', IconTagNub],
		['tag nub', IconTagNub],
		['Twine', IconTwine],
		['type size', IconTypeSize],
		['zoom out', IconZoomOut]
	])('%s renders without error', (_, Icon) =>
		expect(() => render(<Icon />)).not.toThrow()
	);
});
