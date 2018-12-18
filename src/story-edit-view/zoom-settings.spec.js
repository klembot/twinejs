const zoomSettings = require('./zoom-settings');

describe('zoom settings', () => {
	test('exports a big property', () => {
		expect(typeof zoomSettings.big).toBe('number');
	});

	test('exports a medium property', () => {
		expect(typeof zoomSettings.medium).toBe('number');
	});

	test('exports a small property', () => {
		expect(typeof zoomSettings.small).toBe('number');
	});
});
