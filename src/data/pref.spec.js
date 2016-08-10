const { expect } = require('chai');
const pref = require('./pref');

describe('pref data module', () => {
	it('provides default settings', () => {
		expect(pref.state.appTheme).to.equal('light');
		expect(pref.state.defaultFormat).to.equal('Harlowe');
		expect(pref.state.donateShown).to.be.false;
		expect(pref.state.firstRunTime).to.be.a('number');
		expect(pref.state.lastUpdateSeen).to.equal('');
		expect(pref.state.lastUpdateCheckTime).to.be.a('number');
		expect(pref.state.locale).to.be.a('string');
		expect(pref.state.proofingFormat).to.equal('Paperthin');
		expect(pref.state.welcomeSeen).to.be.false;
	});

	it('changes settings via a UPDATE_PREF mutation', () => {
		let state = {};

		pref.mutations.UPDATE_PREF(state, 'testing123', true);
		expect(state['testing123']).to.be.true;
	});
});
