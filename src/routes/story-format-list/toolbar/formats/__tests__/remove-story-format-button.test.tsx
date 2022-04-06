import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {useStoryFormatsContext} from '../../../../../store/story-formats';
import {
	fakeLoadedStoryFormat,
	FakeStateProvider,
	FakeStateProviderProps,
	StoryFormatInspector
} from '../../../../../test-util';
import {
	RemoveStoryFormatButton,
	RemoveStoryFormatButtonProps
} from '../remove-story-format-button';

const TestDefaultStoryFormatButton: React.FC<RemoveStoryFormatButtonProps> = props => {
	const {formats} = useStoryFormatsContext();

	return <RemoveStoryFormatButton format={formats[0]} {...props} />;
};

describe('<RemoveStoryFormatButton>', () => {
	function renderComponent(
		props?: Partial<RemoveStoryFormatButtonProps>,
		contexts?: FakeStateProviderProps
	) {
		return render(
			<FakeStateProvider {...contexts}>
				<TestDefaultStoryFormatButton {...props} />
				<StoryFormatInspector />
			</FakeStateProvider>
		);
	}

	it('is disabled if no format is specified', () => {
		renderComponent({format: undefined});
		expect(screen.getByRole('button')).toBeDisabled();
	});

	it('is disabled if the format is not user-added', () => {
		const format = fakeLoadedStoryFormat({userAdded: false});

		renderComponent(
			{format},
			{
				prefs: {storyFormat: {name: format.name, version: format.version}},
				storyFormats: [format]
			}
		);
		expect(screen.getByRole('button')).toBeDisabled();
	});

	it('is disabled if the format is the default', () => {
		const format = fakeLoadedStoryFormat();

		renderComponent(
			{format},
			{
				prefs: {storyFormat: {name: format.name, version: format.version}},
				storyFormats: [format]
			}
		);
		expect(screen.getByRole('button')).toBeDisabled();
	});

	it('is disabled if the format is the proofing one', () => {
		const format = fakeLoadedStoryFormat();

		renderComponent(
			{format},
			{
				prefs: {proofingFormat: {name: format.name, version: format.version}},
				storyFormats: [format]
			}
		);
		expect(screen.getByRole('button')).toBeDisabled();
	});

	it('is enabled if the format is user-added, not proofing, and not default', () => {
		const format = fakeLoadedStoryFormat({userAdded: true});

		renderComponent({format}, {storyFormats: [format]});
		expect(screen.getByRole('button')).toBeEnabled();
	});

	it('removes the story format when clicked', () => {
		const format = fakeLoadedStoryFormat({userAdded: true});

		renderComponent({format}, {storyFormats: [format]});
		expect(
			screen.getByTestId('story-format-inspector-default')
		).toBeInTheDocument();
		fireEvent.click(screen.getByRole('button', {name: 'common.remove'}));
		expect(
			screen.queryByTestId('story-format-inspector-default')
		).not.toBeInTheDocument();
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
