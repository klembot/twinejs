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
	ProofingStoryFormatButton,
	ProofingStoryFormatButtonProps
} from '../proofing-story-format-button';

const TestProofingStoryFormatButton: React.FC<ProofingStoryFormatButtonProps> = props => {
	const {formats} = useStoryFormatsContext();

	return <ProofingStoryFormatButton format={formats[0]} {...props} />;
};

describe('<ProofingStoryFormatButton>', () => {
	function renderComponent(
		props?: Partial<ProofingStoryFormatButtonProps>,
		contexts?: FakeStateProviderProps
	) {
		return render(
			<FakeStateProvider {...contexts}>
				<TestProofingStoryFormatButton {...props} />
				<PrefInspector name="proofingFormat" />
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

	it("is disabled if the format isn't a proofing format", () => {
		const format = fakeLoadedStoryFormat();

		(format as any).properties.proofing = false;
		renderComponent({format}, {storyFormats: [format]});
		expect(screen.getByRole('button')).toBeDisabled();
	});

	it('is disabled if the format is already set as proofing', () => {
		const format = fakeLoadedStoryFormat();

		(format as any).properties.proofing = true;
		renderComponent(
			{format},
			{
				prefs: {proofingFormat: {name: format.name, version: format.version}},
				storyFormats: [format]
			}
		);
		expect(screen.getByRole('button')).toBeDisabled();
	});

	it('is enabled is the format is proofing and not default', () => {
		const format = fakeLoadedStoryFormat();

		(format as any).properties.proofing = true;
		renderComponent({format}, {storyFormats: [format]});
		expect(screen.getByRole('button')).toBeEnabled();
	});

	it('sets the story format preference when clicked', () => {
		const format = fakeLoadedStoryFormat();

		(format as any).properties.proofing = true;
		renderComponent({format}, {storyFormats: [format]});
		expect(
			JSON.parse(
				screen.getByTestId('pref-inspector-proofingFormat').textContent!
			)
		).not.toEqual({
			name: format.name,
			version: format.version
		});
		fireEvent.click(
			screen.getByRole('button', {
				name: 'routes.storyFormatList.toolbar.useAsProofingFormat'
			})
		);
		expect(
			JSON.parse(
				screen.getByTestId('pref-inspector-proofingFormat').textContent!
			)
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
