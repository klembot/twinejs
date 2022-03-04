import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {
	StoryFormat,
	useStoryFormatsContext
} from '../../../../../store/story-formats';
import {
	fakeLoadedStoryFormat,
	FakeStateProvider,
	FakeStateProviderProps,
	PrefInspector
} from '../../../../../test-util';
import {
	StoryFormatExtensionsButton,
	StoryFormatExtensionsButtonProps
} from '../story-format-extensions-button';

const TestStoryFormatExtensionsButton: React.FC<StoryFormatExtensionsButtonProps> = props => {
	const {formats} = useStoryFormatsContext();

	return <StoryFormatExtensionsButton format={formats[0]} {...props} />;
};

describe('<StoryFormatExtensionsButton>', () => {
	function renderComponent(
		props?: Partial<StoryFormatExtensionsButtonProps>,
		contexts?: FakeStateProviderProps
	) {
		return render(
			<FakeStateProvider {...contexts}>
				<TestStoryFormatExtensionsButton {...props} />
				<PrefInspector name="disabledStoryFormatEditorExtensions" />
			</FakeStateProvider>
		);
	}

	it('is disabled if no format is specified', () => {
		renderComponent({format: undefined});
		expect(screen.getByRole('button')).toBeDisabled();
	});

	describe('when the format extensions are not already disabled', () => {
		let format: StoryFormat;

		beforeEach(() => {
			format = fakeLoadedStoryFormat();
			renderComponent(
				{format},
				{
					prefs: {
						disabledStoryFormatEditorExtensions: [
							{name: 'existing', version: '1.2.3'}
						]
					}
				}
			);
		});

		it('is enabled', () => expect(screen.getByRole('button')).toBeEnabled());

		it('displays the correct label', () =>
			expect(
				screen.getByText(
					'routes.storyFormatList.toolbar.disableFormatExtensions'
				)
			).toBeEnabled());

		it('disables extensions when clicked', () => {
			fireEvent.click(
				screen.getByText(
					'routes.storyFormatList.toolbar.disableFormatExtensions'
				)
			);
			expect(
				JSON.parse(
					screen.getByTestId(
						'pref-inspector-disabledStoryFormatEditorExtensions'
					).textContent!
				)
			).toEqual([
				{name: 'existing', version: '1.2.3'},
				{name: format.name, version: format.version}
			]);
		});
	});

	describe('when the format extensions are already disabled', () => {
		let format: StoryFormat;

		beforeEach(() => {
			format = fakeLoadedStoryFormat();
			renderComponent(
				{format},
				{
					prefs: {
						disabledStoryFormatEditorExtensions: [
							{name: format.name, version: format.version},
							{name: 'existing', version: '1.2.3'}
						]
					}
				}
			);
		});

		it('is enabled', () => expect(screen.getByRole('button')).toBeEnabled());

		it('displays the correct label', () =>
			expect(
				screen.getByText(
					'routes.storyFormatList.toolbar.enableFormatExtensions'
				)
			).toBeEnabled());

		it('enables extensions when clicked', () => {
			fireEvent.click(
				screen.getByText(
					'routes.storyFormatList.toolbar.enableFormatExtensions'
				)
			);
			expect(
				JSON.parse(
					screen.getByTestId(
						'pref-inspector-disabledStoryFormatEditorExtensions'
					).textContent!
				)
			).toEqual([{name: 'existing', version: '1.2.3'}]);
		});
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
