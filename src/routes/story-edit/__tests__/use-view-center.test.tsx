import {renderHook} from '@testing-library/react-hooks';
import {random} from 'faker';
import * as React from 'react';
import {DialogsContext} from '../../../dialogs';
import {Story} from '../../../store/stories';
import {FakeStateProvider, fakeStory} from '../../../test-util';
import {useViewCenter} from '../use-view-center';

describe('useViewCenter', () => {
	let story: Story;
	let el: any;

	beforeEach(() => {
		story = fakeStory();
		el = {
			clientHeight: random.number(),
			clientWidth: random.number(),
			getBoundingClientRect: () => ({
				height: 100,
				left: 20,
				top: 10,
				width: 200
			}),
			scrollLeft: random.number(),
			scrollTo: jest.fn(),
			scrollTop: random.number()
		};
	});

	describe('the getCenter() function it returns', () => {
		it('returns the center of a DOM element ref, adjusted for the story zoom', () => {
			const {result} = renderHook(() =>
				useViewCenter(story, {current: el as any})
			);

			expect(result.current.getCenter()).toEqual({
				left: (el.scrollLeft + el.clientWidth / 2) / story.zoom,
				top: (el.scrollTop + el.clientHeight / 2) / story.zoom
			});
		});

		it('throws an error if the element ref is currently null', () => {
			const {result} = renderHook(() => useViewCenter(story, {current: null}));

			expect(result.current.getCenter).toThrow();
		});
	});

	describe('the setCenter() function it returns', () => {
		it('scrolls the element ref to center a position, adjusted for the story zoom', () => {
			const {result} = renderHook(() =>
				useViewCenter(story, {current: el as any})
			);
			const left = random.number();
			const top = random.number();

			result.current.setCenter({left, top});
			expect(el.scrollTo.mock.calls).toEqual([
				[
					{
						left: (left - 200 / story.zoom / 2) * story.zoom,
						top: (top - 100 / story.zoom / 2) * story.zoom
					}
				]
			]);
		});

		it('adjusts the center if dialogs are open', () => {
			const dialogWidth = random.number();
			const {result} = renderHook(
				() => useViewCenter(story, {current: el as any}),
				{
					wrapper: ({children}) => (
						<FakeStateProvider prefs={{dialogWidth}}>
							<DialogsContext.Provider
								value={{
									dispatch: jest.fn(),
									dialogs: [
										{
											collapsed: false,
											component: () => null,
											highlighted: false,
											maximized: false
										}
									]
								}}
							>
								{children}
							</DialogsContext.Provider>
						</FakeStateProvider>
					)
				}
			);
			const left = random.number();
			const top = random.number();

			result.current.setCenter({left, top});
			expect(el.scrollTo.mock.calls).toEqual([
				[
					{
						left: (left - 200 / story.zoom / 2) * story.zoom + dialogWidth / 2,
						top: (top - 100 / story.zoom / 2) * story.zoom
					}
				]
			]);
		});

		it('throws an error if the element ref is currently null', () => {
			const {result} = renderHook(() => useViewCenter(story, {current: null}));

			expect(result.current.setCenter).toThrow();
		});
	});
});
