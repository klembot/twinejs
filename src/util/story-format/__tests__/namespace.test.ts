import {namespaceForFormat} from '../namespace';
import {fakePendingStoryFormat} from '../../../test-util';

describe('namespaceForFormat()', () => {
	it('removes whitespace from a format name', () => {
		const format = fakePendingStoryFormat({name: '\ta b'});

		expect(/\s/.test(namespaceForFormat(format))).toBe(false);
	});

	it('returns a value unique between two versions of the same format', () => {
		const format = fakePendingStoryFormat({version: '1.2.3'});
		const format2 = {...format, version: '1.2.4'};

		expect(namespaceForFormat(format)).not.toBe(namespaceForFormat(format2));
	});

	it('returns a value unique between formats thath have different names', () => {
		const format = fakePendingStoryFormat({name: 'foo'});
		const format2 = {...format, name: 'bar'};

		expect(namespaceForFormat(format)).not.toBe(namespaceForFormat(format2));
	});
});
