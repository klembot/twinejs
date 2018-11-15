const { expect } = require('chai');
const zoomSettings = require('./zoom-settings');

describe('zoom settings', () => {
	it('exports a big property', () => {
		expect(zoomSettings.big).to.be.a('number');
	});

	it('exports a medium property', () => {
		expect(zoomSettings.medium).to.be.a('number');
	});

	it('exports a small property', () => {
		expect(zoomSettings.small).to.be.a('number');
	});
});
