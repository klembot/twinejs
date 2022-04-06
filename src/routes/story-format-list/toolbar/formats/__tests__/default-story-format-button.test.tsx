import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {useStoryFormatsContext} from '../../../../../store/story-formats';
import {
	fakeFailedStoryFormat,
	fakeLoadedStoryFormat,
	fakePendingStoryFormat,
	FakeStateProvider,
	FakeStateProviderProps,
	PrefInspector
} from '../../../../../test-util';
import {
	DefaultStoryFormatButton,
	DefaultStoryFormatButtonProps
} from '../default-story-format-button';

const TestDefaultStoryFormatButton: React.FC<DefaultStoryFormatButtonProps> = props => {
	const {formats} = useStoryFormatsContext();

	return <DefaultStoryFormatButton format={formats[0]} {...props} />;
};

describe('<DefaultStoryFormatButton>', () => {
	function renderComponent(
		props?: Partial<DefaultStoryFormatButtonProps>,
		contexts?: FakeStateProviderProps
	) {
		return render(
			<FakeStateProvider {...contexts}>
				<TestDefaultStoryFormatButton {...props} />
				<PrefInspector name="storyFormat" />
			</FakeStateProvider>
		);
	}

	it('is disabled if no format is specified', () => {
		renderComponent({format: undefined});
		expect(screen.getByRole('button')).toBeDisabled();
	});

	it('is disabled if the format is pending', () => {
		const format = fakePendingStoryFormat();

		renderComponent({format}, {storyFormats: [format]});
		expect(screen.getByRole('button')).toBeDisabled();
	});

	it('is disabled if the format failed to load', () => {
		const format = fakeFailedStoryFormat();

		renderComponent({format}, {storyFormats: [format]});
		expect(screen.getByRole('button')).toBeDisabled();
	});

	it('is disabled if the format is a proofing format', () => {
		const format = fakeLoadedStoryFormat();

		(format as any).properties.proofing = true;
		renderComponent({format}, {storyFormats: [format]});
		expect(screen.getByRole('button')).toBeDisabled();
	});

	it('is disabled if the format is already set as default', () => {
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

	it('is enabled is the format is not proofing and not default', () => {
		const format = fakeLoadedStoryFormat();

		renderComponent({format}, {storyFormats: [format]});
		expect(screen.getByRole('button')).toBeEnabled();
	});

	it('sets the story format preference when clicked', () => {
		const format = fakeLoadedStoryFormat();

		renderComponent({format}, {storyFormats: [format]});
		expect(
			JSON.parse(screen.getByTestId('pref-inspector-storyFormat').textContent!)
		).not.toEqual({
			name: format.name,
			version: format.version
		});
		fireEvent.click(
			screen.getByRole('button', {
				name: 'routes.storyFormatList.toolbar.useAsDefaultFormat'
			})
		);
		expect(
			JSON.parse(screen.getByTestId('pref-inspector-storyFormat').textContent!)
		).toEqual({
			name: format.name,
			version: format.version
		});
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
