import {renderHook} from '@testing-library/react-hooks';
import {useStoryLaunch} from '../use-story-launch';
import {isElectronRenderer} from '../../util/is-electron';
import {usePublishing} from '../use-publishing';

jest.mock('../use-publishing');
jest.mock('../../util/is-electron');

describe('useStoryLaunch', () => {
	const isElectronRendererMock = isElectronRenderer as jest.Mock;
	const usePublishingMock = usePublishing as jest.Mock;
	let openSpy: jest.SpyInstance;

	beforeEach(() => {
		usePublishingMock.mockReturnValue({
			proofStory: (storyId: string) =>
				Promise.resolve(`mock-proofed-story-${storyId}`),
			publishStory: (storyId: string, options: any) =>
				Promise.resolve(
					`mock-published-story-${storyId}-${JSON.stringify(options)}`
				)
		});
	});

	describe('in a browser context', () => {
		beforeEach(() => {
			openSpy = jest.fn();
			isElectronRendererMock.mockReturnValue(false);
			(window as any).open = openSpy;
		});

		it('opens a new browser window when playing a story', () => {
			const {result} = renderHook(() => useStoryLaunch());

			expect(openSpy).not.toBeCalled();
			result.current.playStory('mock-story-id');
			expect(openSpy.mock.calls).toEqual([
				['#/stories/mock-story-id/play', '_blank']
			]);
		});

		it('opens a new browser window when proofing a story', () => {
			const {result} = renderHook(() => useStoryLaunch());

			expect(openSpy).not.toBeCalled();
			result.current.proofStory('mock-story-id');
			expect(openSpy.mock.calls).toEqual([
				['#/stories/mock-story-id/proof', '_blank']
			]);
		});

		it('opens a new browser window when testing a story', () => {
			const {result} = renderHook(() => useStoryLaunch());

			expect(openSpy).not.toBeCalled();
			result.current.testStory('mock-story-id');
			expect(openSpy.mock.calls).toEqual([
				['#/stories/mock-story-id/test', '_blank']
			]);
		});
	});

	describe('in an Electron context', () => {
		let openWithScratchFile: jest.SpyInstance;

		beforeEach(() => {
			openWithScratchFile = jest.fn();
			isElectronRendererMock.mockReturnValue(true);
			(window as any).twineElectron = {openWithScratchFile};
		});

		it('calls openWithScratchFile() on the twineElectron global when playing a story', async () => {
			const {result} = renderHook(() => useStoryLaunch());

			expect(openWithScratchFile).not.toBeCalled();
			await result.current.playStory('mock-story-id');
			expect(openWithScratchFile.mock.calls).toEqual([
				[
					'mock-published-story-mock-story-id-undefined',
					'play-mock-story-id.html'
				]
			]);
		});

		it('throws an error when playing a story if the twineElectron global is not present', () => {
			delete (window as any).twineElectron;

			const {result} = renderHook(() => useStoryLaunch());

			expect(() => result.current.playStory('mock-story-id')).toThrow();
		});

		it('calls openWithScratchFile() on the twineElectron global when proofing a story', async () => {
			const {result} = renderHook(() => useStoryLaunch());

			expect(openWithScratchFile).not.toBeCalled();
			await result.current.proofStory('mock-story-id');
			expect(openWithScratchFile.mock.calls).toEqual([
				['mock-proofed-story-mock-story-id', 'proof-mock-story-id.html']
			]);
		});

		it('throws an error when proofing a story if the twineElectron global is not present', () => {
			delete (window as any).twineElectron;

			const {result} = renderHook(() => useStoryLaunch());

			expect(() => result.current.proofStory('mock-story-id')).toThrow();
		});

		it('calls openWithScratchFile() on the twineElectron global when testing a story', async () => {
			const {result} = renderHook(() => useStoryLaunch());

			expect(openWithScratchFile).not.toBeCalled();
			await result.current.testStory('mock-story-id');
			expect(openWithScratchFile.mock.calls).toEqual([
				[
					'mock-published-story-mock-story-id-{"formatOptions":"debug"}',
					'test-mock-story-id.html'
				]
			]);
		});

		it('throws an error when testing a story if the twineElectron global is not present', () => {
			delete (window as any).twineElectron;

			const {result} = renderHook(() => useStoryLaunch());

			expect(() => result.current.testStory('mock-story-id')).toThrow();
		});
	});
});
