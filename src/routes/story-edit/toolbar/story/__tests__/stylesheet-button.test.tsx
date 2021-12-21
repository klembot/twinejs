import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {useStoriesContext} from '../../../../../store/stories';
import {
	FakeStateProvider,
	FakeStateProviderProps
} from '../../../../../test-util';
import {StylesheetButton} from '../stylesheet-button';

const TestStylesheetButton: React.FC = () => {
	const {stories} = useStoriesContext();

	return <StylesheetButton story={stories[0]} />;
};

describe('<StylesheetButton>', () => {
	function renderComponent(contexts?: FakeStateProviderProps) {
		return render(
			<FakeStateProvider {...contexts}>
				<TestStylesheetButton />
			</FakeStateProvider>
		);
	}

	it('opens the stylesheet dialog when clicked', () => {
		renderComponent();
		fireEvent.click(screen.getByText('routes.storyEdit.toolbar.stylesheet'));
		expect(
			screen.getByText('dialogs.storyStylesheet.title')
		).toBeInTheDocument();
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
