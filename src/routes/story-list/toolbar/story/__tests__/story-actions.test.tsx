import {render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {FakeStateProvider, StoryInspector} from '../../../../../test-util';
import {StoryActions} from '../story-actions';

describe('<StoryActions>', () => {
	function renderComponent() {
		return render(
			<FakeStateProvider>
				<StoryActions />
				<StoryInspector />
			</FakeStateProvider>
		);
	}

	it('displays a button to create stories', () => {
		renderComponent();
		expect(screen.getByText('common.new')).toBeInTheDocument();
	});

	it('displays a button to edit stories', () => {
		renderComponent();
		expect(screen.getByText('common.edit')).toBeInTheDocument();
	});

	it('displays a button to rename stories', () => {
		renderComponent();
		expect(screen.getByText('common.rename')).toBeInTheDocument();
	});

	it.todo('renames a story when the rename story button is used');

	it('displays a button to tag stories', () => {
		renderComponent();
		expect(screen.getByText('common.tag')).toBeInTheDocument();
	});

	it('displays a button to duplicate stories', () => {
		renderComponent();
		expect(screen.getByText('common.duplicate')).toBeInTheDocument();
	});

	it('displays a button to delete stories', () => {
		renderComponent();
		expect(screen.getByText('common.delete')).toBeInTheDocument();
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
