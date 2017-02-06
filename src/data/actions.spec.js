const { expect } = require('chai');
const { spy } = require('sinon');
const actions = require('./actions');

describe('actions data module', () => {
	const props = { fake: true };
	const fakeId = 'not-a-real-id';
	let store;
	
	beforeEach(() => {
		store = {
			dispatch: spy(),
			state: {
				pref: {
					defaultFormat: {
						name: 'My Default Format',
						version: '1.2.3'
					}
				}
			}
		};
	});
	
	it('dispatches an UPDATE_PREF mutation with setPref()', () => {
		actions.setPref(store, 'key', 42);
		expect(store.dispatch.calledOnce).to.be.true;
		expect(store.dispatch.calledWith('UPDATE_PREF', 'key', 42)).to.be.true;
	});
	
	it('dispatches a CREATE_STORY mutation with createStory()', () => {
		const props = {
			name: 'A New Story',
			storyFormat: 'Test Format',
			storyFormatVersion: '1.0.0'
		};

		actions.createStory(store, props);
		expect(store.dispatch.calledOnce).to.be.true;
		expect(store.dispatch.calledWith('CREATE_STORY', props)).to.be.true;
	});

	it('ensures a story created with createStory() always has a story format set', () => {
		actions.createStory(store, { name: 'A New Story' });
		expect(store.dispatch.calledOnce).to.be.true;
		expect(store.dispatch.calledWith(
			'CREATE_STORY',
			{ name: 'A New Story', storyFormat: 'My Default Format', storyFormatVersion: '1.2.3' }
		)).to.be.true;
	});

	it('dispatches a DELETE_STORY mutation with deleteStory()', () => {
		actions.deleteStory(store, fakeId);
		expect(store.dispatch.calledOnce).to.be.true;
		expect(store.dispatch.calledWith('DELETE_STORY', fakeId)).to.be.true;
	});
	
	it('dispatches a DUPLICATE_STORY mutation with deleteStory()', () => {
		actions.duplicateStory(store, fakeId, 'Another Name');
		expect(store.dispatch.calledOnce).to.be.true;
		expect(store.dispatch.calledWith('DUPLICATE_STORY', fakeId, 'Another Name')).to.be.true;
	});
	
	it('dispatches an IMPORT_STORY mutation with importStory()', () => {		
		actions.importStory(store, props);
		expect(store.dispatch.calledOnce).to.be.true;
		expect(store.dispatch.calledWith('IMPORT_STORY', props)).to.be.true;
	});
	
	it('dispatches an UPDATE_STORY mutation with updateStory()', () => {				
		actions.updateStory(store, fakeId, props);
		expect(store.dispatch.calledOnce).to.be.true;
		expect(store.dispatch.calledWith('UPDATE_STORY', fakeId, props)).to.be.true;
	});
	
	it('dispatches a CREATE_PASSAGE_IN_STORY mutation with createPassageInStory()', () => {				
		actions.createPassageInStory(store, fakeId, props);
		expect(store.dispatch.calledOnce).to.be.true;
		expect(store.dispatch.calledWith('CREATE_PASSAGE_IN_STORY', fakeId, props)).to.be.true;
	});	
	
	it('dispatches an UPDATE_PASSAGE_IN_STORY mutation with createPassageInStory()', () => {				
		actions.updatePassageInStory(store, fakeId, fakeId, props);
		expect(store.dispatch.calledOnce).to.be.true;
		expect(store.dispatch.calledWith('UPDATE_PASSAGE_IN_STORY', fakeId, fakeId, props)).to.be.true;
	});
	
	it('dispatches a DELETE_PASSAGE_IN_STORY mutation with deletePassageInStory()', () => {				
		actions.deletePassageInStory(store, fakeId, fakeId);
		expect(store.dispatch.calledOnce).to.be.true;
		expect(store.dispatch.calledWith('DELETE_PASSAGE_IN_STORY', fakeId, fakeId)).to.be.true;
	});
	
	it('dispatches a CREATE_FORMAT mutation with createFormat()', () => {				
		actions.createFormat(store, props);
		expect(store.dispatch.calledOnce).to.be.true;
		expect(store.dispatch.calledWith('CREATE_FORMAT', props)).to.be.true;
	});	
	
	it('dispatches an UPDATE_FORMAT mutation with createFormat()', () => {				
		actions.updateFormat(store, fakeId, props);
		expect(store.dispatch.calledOnce).to.be.true;
		expect(store.dispatch.calledWith('UPDATE_FORMAT', fakeId, props)).to.be.true;
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
				pref: {},
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
				created[call.args[1].name + '-' + call.args[1].version] = call.args[1];
			}
		}
		
		expect(created['Harlowe-1.2.3']).to.exist;
		expect(created['Harlowe-1.2.3'].url).to.equal('story-formats/harlowe-1.2.3/format.js');
		expect(created['Harlowe-1.2.3'].userAdded).to.be.false;
		expect(created['Harlowe-2.0.0']).to.exist;
		expect(created['Harlowe-2.0.0'].url).to.equal('story-formats/harlowe-2.0.0/format.js');
		expect(created['Harlowe-2.0.0'].userAdded).to.be.false;
		expect(created['Paperthin-1.0.0']).to.exist;
		expect(created['Paperthin-1.0.0'].url).to.equal('story-formats/paperthin-1.0.0/format.js');
		expect(created['Paperthin-1.0.0'].userAdded).to.be.false;
		expect(created['Snowman-1.3.0']).to.exist;
		expect(created['Snowman-1.3.0'].url).to.equal('story-formats/snowman-1.3.0/format.js');
		expect(created['Snowman-1.3.0'].userAdded).to.be.false;
		expect(created['SugarCube-1.0.35']).to.exist;
		expect(created['SugarCube-1.0.35'].url).to.equal('story-formats/sugarcube-1.0.35/format.js');
		expect(created['SugarCube-1.0.35'].userAdded).to.be.false;	
		expect(created['SugarCube-2.12.1']).to.exist;
		expect(created['SugarCube-2.12.1'].url).to.equal('story-formats/sugarcube-2.12.1/format.js');
		expect(created['SugarCube-2.12.1'].userAdded).to.be.false;	
	});
	
	it('sets default formats with repairFormats()', () => {
		let formatsStore = {
			dispatch: spy(),
			state: {
				pref: {},
				storyFormat: {
					formats: []
				}
			}
		};
		
		actions.repairFormats(formatsStore);
		
		expect(formatsStore.dispatch.calledWith(
			'UPDATE_PREF', 'defaultFormat', { name: 'Harlowe', version: '1.2.3' }
		)).to.be.true;
		expect(formatsStore.dispatch.calledWith(
			'UPDATE_PREF', 'proofingFormat', { name: 'Paperthin', version: '1.0.0' }
		)).to.be.true;
	});

	it('deletes unversioned formats with repairFormats()', () => {
		let formatsStore = {
			dispatch: spy(),
			state: {
				pref: {},
				storyFormat: {
					formats: [
						{ name: 'Test' }
					]
				}
			}
		};
		
		actions.repairFormats(formatsStore);		
		expect(formatsStore.dispatch.calledWith('DELETE_FORMAT')).to.be.true;
	});
	
	it('does not duplicate formats with repairFormats()', () => {
		let formatsStore = {
			dispatch: spy(),
			state: {
				pref: {},
				storyFormat: {
					formats: [
						{ name: 'Harlowe', version: '1.2.3' },
						{ name: 'Harlowe', version: '2.0.0' },
						{ name: 'Paperthin', version: '1.0.0' },
						{ name: 'Snowman', version: '1.3.0' },
						{ name: 'SugarCube', version: '1.0.35' },
						{ name: 'SugarCube', version: '2.12.1' }
					]
				}
			}
		};
		
		actions.repairFormats(formatsStore);		
		expect(formatsStore.dispatch.calledWith('CREATE_FORMAT')).to.be.false;
	});

	it('sets default formats on stories with repairStories()', () => {
		let storiesStore = {
			dispatch: spy(),
			state: {
				pref: {
					defaultFormat: { name: 'Default Format', version: '1.2.3' }
				},
				storyFormat: {
					formats: [
						{ name: 'Default Format', version: '1.2.3' }
					]
				},
				story: {
					stories: [
						{ id: 'not-a-real-id' }
					]
				}
			}
		};

		actions.repairStories(storiesStore);
		expect(storiesStore.dispatch.calledWith(
			'UPDATE_STORY',
			'not-a-real-id',
			{ storyFormat: 'Default Format' }
		)).to.be.true;
	});

	it('coerces old SugarCube references to their correct versions with repairStories()', () => {
		let storiesStore = {
			dispatch: spy(),
			state: {
				story: {
					stories: [
						{
							id: 'not-a-real-id',
							storyFormat: 'SugarCube 1 (local/offline)'
						},
						{
							id: 'also-not-a-real-id',
							storyFormat: 'SugarCube 2 (local/offline)'
						}
					]
				}
			}
		};

		actions.repairStories(storiesStore);
		expect(storiesStore.dispatch.calledWith(
			'UPDATE_STORY',
			'not-a-real-id',
			{ storyFormat: 'SugarCube', storyFormatVersion: '1.0.35' }
		)).to.be.true;
		expect(storiesStore.dispatch.calledWith(
			'UPDATE_STORY',
			'also-not-a-real-id',
			{ storyFormat: 'SugarCube', storyFormatVersion: '2.12.1' }
		)).to.be.true;
	});

	it('sets format versions on stories with repairStories()', () => {
		let storiesStore = {
			dispatch: spy(),
			state: {
				pref: {
					defaultFormat: { name: 'Default Format', version: '1.2.3' }
				},
				storyFormat: {
					formats: [
						{ name: 'Default Format', version: '1.2.3' },
						{ name: 'Default Format', version: '1.2.5' }
					]
				},
				story: {
					stories: [
						{
							id: 'not-a-real-id',
							storyFormat: 'Default Format'
						},
						{
							id: 'also-not-a-real-id',
							storyFormat: 'Default Format',
							storyFormatVersion: ''
						}
					]
				}
			}
		};

		actions.repairStories(storiesStore);
		expect(storiesStore.dispatch.calledWith(
			'UPDATE_STORY',
			'not-a-real-id',
			{ storyFormatVersion: '1.2.3' }
		)).to.be.true;
		expect(storiesStore.dispatch.calledWith(
			'UPDATE_STORY',
			'also-not-a-real-id',
			{ storyFormatVersion: '1.2.3' }
		)).to.be.true;
	});

	it('creates new links with createNewlyLinkedPassages()', () => {
		let storyStore = {
			dispatch: spy(),
			state: {
				story: {
					stories: [
						{
							id: fakeId,
							passages: [
								{
									id: fakeId,
									name: 'Test',
									text: '[[Test 2]]'
								}
							]
						}
					]
				}
			}
		};

		actions.createNewlyLinkedPassages(storyStore, fakeId, fakeId, '');
		expect(storyStore.dispatch.calledOnce).to.be.true;

		const firstCall = storyStore.dispatch.getCall(0);
		expect(firstCall.args[0]).to.equal('CREATE_PASSAGE_IN_STORY');
		expect(firstCall.args[1]).to.equal(fakeId);
		expect(firstCall.args[2].name).to.equal('Test 2');
	});

	it('skips old links with createNewlyLinkedPassages()', () => {
		let storyStore = {
			dispatch: spy(),
			state: {
				story: {
					stories: [
						{
							id: fakeId,
							passages: [
								{
									id: fakeId,
									name: 'Test',
									text: '[[Test 2]]'
								}
							]
						}
					]
				}
			}
		};

		actions.createNewlyLinkedPassages(storyStore, fakeId, fakeId, '[[Test 2]]');
		expect(storyStore.dispatch.called).to.be.false;
	});

	it('updates links with changeLinksInStory()', () => {
		let storyStore = {
			dispatch: spy(),
			state: {
				story: {
					stories: [
						{
							id: fakeId,
							passages: [
								{
									id: fakeId,
									name: 'Test',
									text: '[[Test 2]]'
								}
							]
						}
					]
				}
			}
		};

		actions.changeLinksInStory(storyStore, fakeId, 'Test 2', 'Test 2 Changed');

		const firstCall = storyStore.dispatch.getCall(0);
		expect(firstCall.args[0]).to.equal('UPDATE_PASSAGE_IN_STORY');
		expect(firstCall.args[1]).to.equal(fakeId);
		expect(firstCall.args[2]).to.equal(fakeId);
		expect(firstCall.args[3].text).to.equal('[[Test 2 Changed]]');
	});

	it('handles regular expression characters with changeLinksInStory()', () => {
		let storyStore = {
			dispatch: spy(),
			state: {
				story: {
					stories: [
						{
							id: fakeId,
							passages: [
								{
									id: fakeId,
									name: 'Test',
									text: '[[.]]'
								},
								{
									id: fakeId + '2',
									name: 'Test 2',
									text: '[[2]]'
								}
							]
						}
					]
				}
			}
		};

		actions.changeLinksInStory(storyStore, fakeId, '.', 'Changed');
		actions.changeLinksInStory(storyStore, fakeId, '2', '$');

		const firstCall = storyStore.dispatch.getCall(0);
		expect(firstCall.args[0]).to.equal('UPDATE_PASSAGE_IN_STORY');
		expect(firstCall.args[1]).to.equal(fakeId);
		expect(firstCall.args[2]).to.equal(fakeId);
		expect(firstCall.args[3].text).to.equal('[[Changed]]');

		const secondCall = storyStore.dispatch.getCall(1	);
		expect(secondCall.args[0]).to.equal('UPDATE_PASSAGE_IN_STORY');
		expect(secondCall.args[1]).to.equal(fakeId);
		expect(secondCall.args[2]).to.equal(fakeId + '2');
		expect(secondCall.args[3].text).to.equal('[[$]]');
	});
});
