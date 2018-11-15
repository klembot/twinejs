const { expect } = require('chai');
const { stub } = require('sinon');
const storyFile = require('./story-file');
const saveQueue = require('./save-queue');

describe('SaveQueue', () => {
	let fakeStore = {
		state: {
			story: {
				stories: [
					{
						name: 'test',
						id: 'not-a-real-id'
					}
				]
			}
		}
	};

	beforeEach(() => {
		stub(storyFile, 'save');
	});

	afterEach(() => {
		storyFile.save.restore();
	});

	it('triggers a save action after its delay elapses', done => {
		storyFile.save.callsFake(story => {
			expect(story.name).to.equal('test');
			expect(story.id).to.equal('not-a-real-id');			
			done();
		});
		saveQueue.attachStore(fakeStore);
		saveQueue.delay = 100;
		saveQueue.queue('not-a-real-id');
	});

	it('immediately saves on flush()', () => {
		saveQueue.attachStore(fakeStore);
		saveQueue.delay = 10000;
		saveQueue.queue('not-a-real-id');
		saveQueue.flush();
		expect(storyFile.save.calledOnce);
		expect(storyFile.save.firstCall.calledWith('not-a-real-id'));		
	});
});