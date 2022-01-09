import {render, screen} from '@testing-library/react';
import * as React from 'react';
import {Routes} from '..';
import {createHashHistory} from 'history';
import {PrefsContext, PrefsContextProps} from '../../store/prefs';
import {fakePrefs} from '../../test-util';

jest.mock('../story-edit/story-edit-route');
jest.mock('../story-format-list/story-format-list-route');
jest.mock('../story-list/story-list-route');
jest.mock('../story-play/story-play-route');
jest.mock('../story-proof/story-proof-route');
jest.mock('../story-test/story-test-route');
jest.mock('../welcome/welcome-route');

describe('<Routes>', () => {
	function renderAtRoute(route: string, context?: Partial<PrefsContextProps>) {
		const history = createHashHistory();

		history.push(route);
		return render(
			<PrefsContext.Provider
				value={{
					dispatch: jest.fn(),
					prefs: fakePrefs({welcomeSeen: true}),
					...context
				}}
			>
				<Routes />
			</PrefsContext.Provider>
		);
	}

	describe("when the user doesn't have a welcomeSeen pref", () => {
		it('shows the welcome route no matter the route', () => {
			renderAtRoute('/stories/123', {
				dispatch: jest.fn(),
				prefs: fakePrefs({welcomeSeen: false})
			});
			expect(screen.getByTestId('mock-welcome-route')).toBeInTheDocument();
		});
	});

	describe('when the user has a welcomeSeen pref', () => {
		it('renders the story edit route at /stories/:id', () => {
			renderAtRoute('/stories/123');
			expect(screen.getByTestId('mock-story-edit-route')).toBeInTheDocument();
		});

		it('renders the story format list route at /story-formats', () => {
			renderAtRoute('/story-formats');
			expect(
				screen.getByTestId('mock-story-format-list-route')
			).toBeInTheDocument();
		});

		it('renders the story list at /', () => {
			renderAtRoute('/');
			expect(screen.getByTestId('mock-story-list-route')).toBeInTheDocument();
		});

		it('renders the story play route at /stories/:id/play', () => {
			renderAtRoute('/stories/123/play');
			expect(screen.getByTestId('mock-story-play-route')).toBeInTheDocument();
		});

		it('renders the story proof route at /stories/:id/proof', () => {
			renderAtRoute('/stories/123/proof');
			expect(screen.getByTestId('mock-story-proof-route')).toBeInTheDocument();
		});

		it('renders the story test route at /stories/:id/test', () => {
			renderAtRoute('/stories/123/test');
			expect(screen.getByTestId('mock-story-test-route')).toBeInTheDocument();
		});

		it('renders the story test route at /stories/:storyId/test/:passageId', () => {
			renderAtRoute('/stories/123/test/456');
			expect(screen.getByTestId('mock-story-test-route')).toBeInTheDocument();
		});

		it('renders the welcome route at /welcome', () => {
			renderAtRoute('/welcome');
			expect(screen.getByTestId('mock-welcome-route')).toBeInTheDocument();
		});

		it('renders the story list route for unknown routes', () => {
			jest.spyOn(console, 'warn').mockReturnValue();
			renderAtRoute('/unknown-route');
			expect(screen.getByTestId('mock-story-list-route')).toBeInTheDocument();
		});
	});
});
