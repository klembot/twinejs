import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {FakeStateProvider} from '../../../../../test-util';
import {ImportStoryButton} from '../import-story-button';

describe('<ImportStoryButton>', () => {
	function renderComponent() {
		return render(
			<FakeStateProvider>
				<ImportStoryButton />
			</FakeStateProvider>
		);
	}

	it('opens an import dialog when clicked', () => {
		renderComponent();
		expect(
			screen.queryByText('dialogs.storyImport.title')
		).not.toBeInTheDocument();
		fireEvent.click(screen.getByText('common.import'));
		expect(screen.getByText('dialogs.storyImport.title')).toBeInTheDocument();
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
