const actions = require('./story-format');

describe('story format actions module', () => {
	const fakeId = 'not-a-real-id';
	const props = { fake: true };	
	let store;

	beforeEach(() => {
		store = { dispatch: jest.fn() };
	});

	it('dispatches a CREATE_FORMAT mutation with createFormat()', () => {
		actions.createFormat(store, props);
		expect(store.dispatch).toHaveBeenCalledTimes(1);
		expect(store.dispatch).toHaveBeenCalledWith('CREATE_FORMAT', props)
	});

	it('dispatches an UPDATE_FORMAT mutation with createFormat()', () => {
		actions.updateFormat(store, fakeId, props);
		expect(store.dispatch).toHaveBeenCalledTimes(1);
		expect(store.dispatch).toHaveBeenCalledWith('UPDATE_FORMAT', fakeId, props)
	});

	it('dispatches a DELETE_FORMAT mutation with deleteFormat()', () => {
		actions.deleteFormat(store, fakeId);
		expect(store.dispatch).toHaveBeenCalledTimes(1);
		expect(store.dispatch).toHaveBeenCalledWith('DELETE_FORMAT', fakeId)
	});

	it('creates built-in formats with repairFormats()', () => {
		let formatsStore = {
			dispatch: jest.fn(),
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

		for (let i = 0; i < formatsStore.dispatch.mock.calls.length; i++) {
			let call = formatsStore.dispatch.mock.calls[i];

			if (call[0] === 'CREATE_FORMAT') {
				created[call[1].name + '-' + call[1].version] = call[1];
			}
		}

		expect(created['Harlowe-3.0.2']).toBeTruthy();
		expect(created['Harlowe-3.0.2'].url).toEqual('story-formats/harlowe-3.0.2/format.js');
		expect(created['Harlowe-3.0.2'].userAdded).toBeFalsy();
		expect(created['Harlowe-2.1.0']).toBeTruthy();
		expect(created['Harlowe-2.1.0'].url).toEqual('story-formats/harlowe-2.1.0/format.js');
		expect(created['Harlowe-2.1.0'].userAdded).toBeFalsy();
		expect(created['Harlowe-1.2.4']).toBeTruthy();
		expect(created['Harlowe-1.2.4'].url).toEqual('story-formats/harlowe-1.2.4/format.js');
		expect(created['Harlowe-1.2.4'].userAdded).toBeFalsy();
		expect(created['Paperthin-1.0.0']).toBeTruthy();
		expect(created['Paperthin-1.0.0'].url).toEqual('story-formats/paperthin-1.0.0/format.js');
		expect(created['Paperthin-1.0.0'].userAdded).toBeFalsy();
		expect(created['Snowman-1.3.0']).toBeTruthy();
		expect(created['Snowman-1.3.0'].url).toEqual('story-formats/snowman-1.3.0/format.js');
		expect(created['Snowman-1.3.0'].userAdded).toBeFalsy();
		expect(created['SugarCube-1.0.35']).toBeTruthy();
		expect(created['SugarCube-1.0.35'].url).toEqual('story-formats/sugarcube-1.0.35/format.js');
		expect(created['SugarCube-1.0.35'].userAdded).toBeFalsy();
		expect(created['SugarCube-2.28.2']).toBeTruthy();
		expect(created['SugarCube-2.28.2'].url).toEqual('story-formats/sugarcube-2.28.2/format.js');
		expect(created['SugarCube-2.28.2'].userAdded).toBeFalsy();
	});

	it('sets default formats with repairFormats()', () => {
		let formatsStore = {
			dispatch: jest.fn(),
			state: {
				pref: {},
				storyFormat: {
					formats: []
				}
			}
		};

		actions.repairFormats(formatsStore);

		expect(formatsStore.dispatch).toHaveBeenCalledWith(
			'UPDATE_PREF', 'defaultFormat', { name: 'Harlowe', version: '3.0.2' }
		)
		expect(formatsStore.dispatch).toHaveBeenCalledWith(
			'UPDATE_PREF', 'proofingFormat', { name: 'Paperthin', version: '1.0.0' }
		)
	});

	it('deletes unversioned formats with repairFormats()', () => {
		let formatsStore = {
			dispatch: jest.fn(),
			state: {
				pref: {},
				storyFormat: {
					formats: [
						{ id: fakeId, name: 'Test' }
					]
				}
			}
		};

		actions.repairFormats(formatsStore);
		expect(formatsStore.dispatch).toHaveBeenCalledWith('DELETE_FORMAT', fakeId)
	});

	it('does not duplicate formats with repairFormats()', () => {
		let formatsStore = {
			dispatch: jest.fn(),
			state: {
				pref: {},
				storyFormat: {
					formats: [
						{ name: 'Harlowe', version: '2.0.1' },
						{ name: 'Harlowe', version: '3.0.2' },
						{ name: 'Paperthin', version: '1.0.0' },
						{ name: 'Snowman', version: '1.3.0' },
						{ name: 'SugarCube', version: '1.0.35' },
						{ name: 'SugarCube', version: '2.28.2' }
					]
				}
			}
		};

		actions.repairFormats(formatsStore);
		expect(formatsStore.dispatch).not.toHaveBeenCalledWith("CREATE_FORMAT");
	});

	it('deletes outdated story format versions with repairFormats()', () => {
		let formatsStore = {
			dispatch: jest.fn(),
			state: {
				pref: {},
				storyFormat: {
					formats: [
						{ name: 'Custom', version: '1.2.3' },
						{ id: fakeId, name: 'Custom', version: '1.2.1' },
						{ name: 'Custom', version: '2.0.0' }
					]
				}
			}
		};

		actions.repairFormats(formatsStore);
		expect(formatsStore.dispatch).toHaveBeenCalledWith('DELETE_FORMAT', fakeId)
	});

	it('updates the default format version with repairFormats()', () => {
		let formatsStore = {
			dispatch: jest.fn(),
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
						{ id: fakeId, name: 'Default Format', version: '1.0.1' },
						{ id: fakeId, name: 'Default Format', version: '2.0.1' },
						{ id: fakeId, name: 'Proofing Format', version: '1.0.0' }
					]
				}
			}
		};

		actions.repairFormats(formatsStore);
		expect(formatsStore.dispatch).toHaveBeenCalledWith(
			'UPDATE_PREF',
			'defaultFormat',
			{ name: 'Default Format', version: '1.0.1' }
		)
	});

	it('updates the proofing version with repairFormats()', () => {
		let formatsStore = {
			dispatch: jest.fn(),
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
						{ id: fakeId, name: 'Default Format', version: '1.0.0' },
						{ id: fakeId, name: 'Proofing Format', version: '1.0.0' },
						{ id: fakeId, name: 'Proofing Format', version: '1.0.1' },
						{ id: fakeId, name: 'Proofing Format', version: '2.0.1' }
					]
				}
			}
		};

		actions.repairFormats(formatsStore);
		expect(formatsStore.dispatch).toHaveBeenCalledWith(
			'UPDATE_PREF',
			'proofingFormat',
			{ name: 'Proofing Format', version: '1.0.1' }
		)
	});
});