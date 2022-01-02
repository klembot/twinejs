import {act, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {FormatActions, FormatActionsProps} from '../format-actions';

describe('<FormatActions>', () => {
	async function renderComponent(props?: Partial<FormatActionsProps>) {
		const result = render(<FormatActions selectedFormats={[]} {...props} />);

		// Need this because of <PromptButton>
		await act(async () => Promise.resolve());
		return result;
	}

	it('displays a button to add story formats', async () => {
		await renderComponent();
		expect(
			screen.getByRole('button', {name: 'common.add'})
		).toBeInTheDocument();
	});

	it('displays a button to remove story formats', async () => {
		await renderComponent();
		expect(
			screen.getByRole('button', {name: 'common.remove'})
		).toBeInTheDocument();
	});

	it('displays a button to manage story format extensions', async () => {
		await renderComponent();
		expect(
			screen.getByRole('button', {
				name: 'routes.storyFormatList.toolbar.disableFormatExtensions'
			})
		).toBeInTheDocument();
	});

	it('displays a button to set the default story format', async () => {
		await renderComponent();
		expect(
			screen.getByRole('button', {
				name: 'routes.storyFormatList.toolbar.useAsDefaultFormat'
			})
		).toBeInTheDocument();
	});

	it('displays a button to set the proofing format', async () => {
		await renderComponent();
		expect(
			screen.getByRole('button', {
				name: 'routes.storyFormatList.toolbar.useAsProofingFormat'
			})
		).toBeInTheDocument();
	});

	it('is accessible', async () => {
		const {container} = await renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
