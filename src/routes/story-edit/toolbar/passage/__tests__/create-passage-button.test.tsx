import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {
	FakeStateProvider,
	FakeStateProviderProps,
	fakeStory,
	StoryInspector
} from '../../../../../test-util';
import {
	CreatePassageButton,
	CreatePassageButtonProps
} from '../create-passage-button';

describe('<CreatePassageButton>', () => {
	function renderComponent(
		props?: Partial<CreatePassageButtonProps>,
		contexts?: FakeStateProviderProps
	) {
		return render(
			<FakeStateProvider {...contexts}>
				<CreatePassageButton
					getCenter={() => ({top: 0, left: 0})}
					story={fakeStory()}
					{...props}
				/>
				<StoryInspector />
			</FakeStateProvider>
		);
	}

	it('creates a new passage at the center of the view when clicked', () => {
		const getCenter = () => ({top: 100, left: 200});
		const story = fakeStory(0);

		renderComponent({getCenter, story}, {stories: [story]});
		fireEvent.click(screen.getByRole('button', {name: 'common.new'}));

		const passageDivs = screen
			.getByTestId('story-inspector-default')
			.querySelectorAll('div[data-testid^="passage"]');

		expect(passageDivs.length).toBe(1);
		expect((passageDivs[0] as HTMLElement).dataset.left).toBe('150');
		expect((passageDivs[0] as HTMLElement).dataset.top).toBe('50');
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
