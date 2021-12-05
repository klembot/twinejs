import {fireEvent, render, screen} from '@testing-library/react';
import {createMemoryHistory, MemoryHistory} from 'history';
import {axe} from 'jest-axe';
import * as React from 'react';
import {Router} from 'react-router-dom';
import {PrefsContext, PrefsContextProps} from '../../../../store/prefs';
import {StoriesContext, StoriesContextProps} from '../../../../store/stories';
import {fakePrefs} from '../../../../test-util';
import {CreateStoryButton} from '../create-story-button';

describe('<CreateStoryButton>', () => {
	function renderComponent(
		history?: MemoryHistory,
		storiesContext?: Partial<StoriesContextProps>,
		prefsContext?: Partial<PrefsContextProps>
	) {
		return render(
			<Router history={history ?? createMemoryHistory()}>
				<PrefsContext.Provider
					value={{dispatch: jest.fn(), prefs: fakePrefs(), ...prefsContext}}
				>
					<StoriesContext.Provider
						value={{dispatch: jest.fn(), stories: [], ...storiesContext}}
					>
						<CreateStoryButton />
					</StoriesContext.Provider>
				</PrefsContext.Provider>
			</Router>
		);
	}

	it("displays a button that creates an untitled story when clicked, then navigates to that story's edit route", () => {
		const dispatch = jest.fn();
		const history = createMemoryHistory();
		const prefs = fakePrefs();

		renderComponent(history, {dispatch}, {prefs});
		expect(dispatch).not.toHaveBeenCalled();
		fireEvent.click(screen.getByRole('button'));
		expect(dispatch.mock.calls).toEqual([
			[
				{
					type: 'createStory',
					props: {
						id: expect.any(String),
						name: 'store.storyDefaults.name',
						storyFormat: prefs.storyFormat.name,
						storyFormatVersion: prefs.storyFormat.version
					}
				}
			]
		]);
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
