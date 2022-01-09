import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {useStoriesContext} from '../../../../../store/stories';
import {
	FakeStateProvider,
	FakeStateProviderProps
} from '../../../../../test-util';
import {JavaScriptButton} from '../javascript-button';

const TestJavaScriptButton: React.FC = () => {
	const {stories} = useStoriesContext();

	return <JavaScriptButton story={stories[0]} />;
};

describe('<JavaScriptButton>', () => {
	function renderComponent(contexts?: FakeStateProviderProps) {
		return render(
			<FakeStateProvider {...contexts}>
				<TestJavaScriptButton />
			</FakeStateProvider>
		);
	}

	it('opens the JavaScript dialog when clicked', () => {
		renderComponent();
		fireEvent.click(screen.getByText('routes.storyEdit.toolbar.javaScript'));
		expect(
			screen.getByText('dialogs.storyJavaScript.title')
		).toBeInTheDocument();
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
