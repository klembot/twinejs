const {expect} = require('chai');
const {spy} = require('sinon');
const actions = require('./story-format');

describe('story format actions module', () => {
	const fakeId = 'not-a-real-id';
	const props = {fake: true};
	let store;

	beforeEach(() => {
		store = {dispatch: spy()};
	});

	it('dispatches a CREATE_FORMAT mutation with createFormat()', () => {
		actions.createFormat(store, props);
		expect(store.dispatch.calledOnce).to.be.true;
		expect(store.dispatch.calledWith('CREATE_FORMAT', props)).to.be.true;
	});

	it('dispatches an UPDATE_FORMAT mutation with createFormat()', () => {
		actions.updateFormat(store, fakeId, props);
		expect(store.dispatch.calledOnce).to.be.true;
		expect(store.dispatch.calledWith('UPDATE_FORMAT', fakeId, props)).to.be
			.true;
	});

	it('dispatches a DELETE_FORMAT mutation with deleteFormat()', () => {
		actions.deleteFormat(store, fakeId);
		expect(store.dispatch.calledOnce).to.be.true;
		expect(store.dispatch.calledWith('DELETE_FORMAT', fakeId)).to.be.true;
	});

	it('creates built-in formats with repairFormats()', () => {
		let formatsStore = {
			dispatch: spy(),
			state: {
				pref: {
					defaultFormat: {
						name: 'Default Format',
						version: '1.0.0'
					},
					proofingFormat: {
						name: 'Proofing Format',
						version: '1.0.0'
					}
				},
				storyFormat: {
					formats: []
				}
			}
		};

		actions.repairFormats(formatsStore);

		let created = {};

		for (let i = 0; i < formatsStore.dispatch.callCount; i++) {
			let call = formatsStore.dispatch.getCall(i);

			if (call.args[0] === 'CREATE_FORMAT') {
				created[call.args[1].name + '-' + call.args[1].version] =
					call.args[1];
			}
		}

		expect(created['chapbook-1.2.1']).to.exist;
		expect(created['chapbook-1.2.1'].url).to.equal(
			'story-formats/chapbook-1.2.1/format.js'
		);
		expect(created['chapbook-1.2.1'].userAdded).to.be.false;
		expect(created['Harlowe-2.1.0']).to.exist;
		expect(created['Harlowe-3.2.1']).to.exist;
		expect(created['Harlowe-3.2.1'].url).to.equal(
			'story-formats/harlowe-3.2.1/format.js'
		);
		expect(created['Harlowe-3.2.1'].userAdded).to.be.false;
		expect(created['Harlowe-2.1.0']).to.exist;
		expect(created['Harlowe-2.1.0'].url).to.equal(
			'story-formats/harlowe-2.1.0/format.js'
		);
		expect(created['Harlowe-2.1.0'].userAdded).to.be.false;
		expect(created['Harlowe-1.2.4']).to.exist;
		expect(created['Harlowe-1.2.4'].url).to.equal(
			'story-formats/harlowe-2.1.0/format.js'
		);
		expect(created['Harlowe-1.2.4'].userAdded).to.be.false;
		expect(created['Paperthin-1.0.0']).to.exist;
		expect(created['Paperthin-1.0.0'].url).to.equal(
			'story-formats/paperthin-1.0.0/format.js'
		);
		expect(created['Paperthin-1.0.0'].userAdded).to.be.false;
		expect(created['Snowman-1.4.0']).to.exist;
		expect(created['Snowman-1.4.0'].url).to.equal(
			'story-formats/snowman-1.4.0/format.js'
		);
		expect(created['Snowman-1.4.0'].userAdded).to.be.false;
		expect(created['Snowman-2.0.2']).to.exist;
		expect(created['Snowman-2.0.2'].url).to.equal(
			'story-formats/snowman-2.0.2/format.js'
		);
		expect(created['Snowman-2.0.2'].userAdded).to.be.false;
		expect(created['SugarCube-1.0.35']).to.exist;
		expect(created['SugarCube-1.0.35'].url).to.equal(
			'story-formats/sugarcube-1.0.35/format.js'
		);
		expect(created['SugarCube-1.0.35'].userAdded).to.be.false;
		expect(created['SugarCube-2.34.1']).to.exist;
		expect(created['SugarCube-2.34.1'].url).to.equal(
			'story-formats/sugarcube-2.34.1/format.js'
		);
		expect(created['SugarCube-2.34.1'].userAdded).to.be.false;
	});

	it('sets default formats with repairFormats()', () => {
		let formatsStore = {
			dispatch: spy().withArgs('UPDATE_PREF'),
			state: {
				pref: {},
				storyFormat: {
					formats: []
				}
			}
		};

		actions.repairFormats(formatsStore);

		expect(
			formatsStore.dispatch.calledWith('UPDATE_PREF', 'defaultFormat', {
				name: 'Harlowe',
				version: '2.1.0'
			})
		).to.be.true;
		expect(
			formatsStore.dispatch.calledWith('UPDATE_PREF', 'proofingFormat', {
				name: 'Paperthin',
				version: '1.0.0'
			})
		).to.be.true;
	});

	it('deletes unversioned formats with repairFormats()', () => {
		let formatsStore = {
			dispatch: spy(),
			state: {
				pref: {},
				storyFormat: {
					formats: [{id: fakeId, name: 'Test'}]
				}
			}
		};

		actions.repairFormats(formatsStore);
		expect(formatsStore.dispatch.calledWith('DELETE_FORMAT', fakeId)).to.be
			.true;
	});

	it('does not duplicate formats with repairFormats()', () => {
		let formatsStore = {
			dispatch: spy().withArgs('CREATE_FORMAT'),
			state: {
				pref: {},
				storyFormat: {
					formats: [
						{name: 'Harlowe', version: '2.0.1'},
						{name: 'Harlowe', version: '3.2.1'},
						{name: 'Paperthin', version: '1.0.0'},
						{name: 'Snowman', version: '1.4.0'},
						{name: 'Snowman', version: '2.0.2'},
						{name: 'SugarCube', version: '1.0.35'},
						{name: 'SugarCube', version: '2.34.1'}
					]
				}
			}
		};

		actions.repairFormats(formatsStore);
		expect(formatsStore.dispatch.calledOnce).to.be.false;
	});

	it('deletes outdated story format versions with repairFormats()', () => {
		let formatsStore = {
			dispatch: spy(),
			state: {
				pref: {},
				storyFormat: {
					formats: [
						{name: 'Custom', version: '1.2.3'},
						{id: fakeId, name: 'Custom', version: '1.2.1'},
						{name: 'Custom', version: '2.0.0'}
					]
				}
			}
		};

		formatsStore.dispatch.withArgs('DELETE_FORMAT', fakeId);
		actions.repairFormats(formatsStore);
		expect(
			formatsStore.dispatch.withArgs('DELETE_FORMAT', fakeId).calledOnce
		).to.be.true;
	});

	it('updates the default format version with repairFormats()', () => {
		let formatsStore = {
			dispatch: spy(),
			state: {
				pref: {
					defaultFormat: {
						name: 'Default Format',
						version: '1.0.0'
					},
					proofingFormat: {
						name: 'Proofing Format',
						version: '1.0.0'
					}
				},
				storyFormat: {
					formats: [
						{id: fakeId, name: 'Default Format', version: '1.0.1'},
						{id: fakeId, name: 'Default Format', version: '2.0.1'},
						{id: fakeId, name: 'Proofing Format', version: '1.0.0'}
					]
				}
			}
		};

		actions.repairFormats(formatsStore);
		expect(
			formatsStore.dispatch.calledWith('UPDATE_PREF', 'defaultFormat', {
				name: 'Default Format',
				version: '1.0.1'
			})
		).to.be.true;
	});

	it('updates the proofing version with repairFormats()', () => {
		let formatsStore = {
			dispatch: spy(),
			state: {
				pref: {
					defaultFormat: {
						name: 'Default Format',
						version: '1.0.0'
					},
					proofingFormat: {
						name: 'Proofing Format',
						version: '1.0.0'
					}
				},
				storyFormat: {
					formats: [
						{id: fakeId, name: 'Default Format', version: '1.0.0'},
						{id: fakeId, name: 'Proofing Format', version: '1.0.0'},
						{id: fakeId, name: 'Proofing Format', version: '1.0.1'},
						{id: fakeId, name: 'Proofing Format', version: '2.0.1'}
					]
				}
			}
		};

		actions.repairFormats(formatsStore);
		expect(
			formatsStore.dispatch.calledWith('UPDATE_PREF', 'proofingFormat', {
				name: 'Proofing Format',
				version: '1.0.1'
			})
		).to.be.true;
	});
});
