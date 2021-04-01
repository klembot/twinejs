import {arc} from '../svg';
import {random} from 'faker';

describe('arc', () => {
	it('returns an SVG arc descriptor', () => {
		const end = {left: random.number(), top: random.number()};
		const largeArc = random.boolean();
		const radius = {left: random.number(), top: random.number()};
		const rotation = random.number();
		const start = {left: random.number(), top: random.number()};
		const sweep = random.boolean();

		expect(arc({end, largeArc, radius, rotation, start, sweep})).toBe(
			'M' +
				start.left +
				',' +
				start.top +
				' A' +
				radius.left +
				',' +
				radius.top +
				' ' +
				(rotation ?? '0') +
				(largeArc ? ' 1' : ' 0') +
				(sweep ? ' 1 ' : ' 0 ') +
				end.left +
				',' +
				end.top
		);
	});
});
