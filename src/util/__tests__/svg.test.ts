import {faker} from '@faker-js/faker';
import {arc} from '../svg';

describe('arc', () => {
	it('returns an SVG arc descriptor', () => {
		const end = {left: faker.number.int(), top: faker.number.int()};
		const largeArc = faker.datatype.boolean();
		const radius = {left: faker.number.int(), top: faker.number.int()};
		const rotation = faker.number.int();
		const start = {left: faker.number.int(), top: faker.number.int()};
		const sweep = faker.datatype.boolean();

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
