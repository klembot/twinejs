import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {fakeStory} from '../../../test-util';
import {
	RenamePassageButton,
	RenamePassageButtonProps
} from '../rename-passage-button';

describe('<RenamePassageButton>', () => {
	function renderComponent(props?: Partial<RenamePassageButtonProps>) {
		const story = fakeStory(1);

		return render(
			<RenamePassageButton
				onRename={jest.fn()}
				passage={story.passages[0]}
				story={story}
				{...props}
			/>
		);
	}

	describe('When enabled', () => {
		it('renders an enabled button', async () => {
			renderComponent();
			expect(screen.getByRole('button')).toBeEnabled();
			await act(async () => Promise.resolve());
		});

		it('calls the onRename prop when a new name is entered', async () => {
			const onRename = jest.fn();

			renderComponent({onRename});
			fireEvent.click(screen.getByRole('button'));
			fireEvent.change(
				screen.getByRole('textbox', {name: 'common.renamePrompt'}),
				{
					target: {value: 'new-name'}
				}
			);
			await waitFor(() =>
				expect(screen.getByRole('button', {name: 'common.ok'})).toBeEnabled()
			);
			expect(onRename).not.toBeCalled();
			fireEvent.click(screen.getByRole('button', {name: 'common.ok'}));
			expect(onRename.mock.calls).toEqual([['new-name']]);
		});

		it("doesn't allow a passage to be renamed to a name that an existing one has", async () => {
			const story = fakeStory(2);

			renderComponent({passage: story.passages[0], story});
			fireEvent.click(screen.getByRole('button'));
			fireEvent.change(
				screen.getByRole('textbox', {name: 'common.renamePrompt'}),
				{
					target: {value: story.passages[1].name}
				}
			);
			await act(() => Promise.resolve());
			expect(screen.getByRole('button', {name: 'common.ok'})).not.toBeEnabled();
		});

		it('is accessible', async () => {
			const {container} = renderComponent();

			expect(await axe(container)).toHaveNoViolations();
		});
	});

	describe('When disabled', () => {
		it('renders a disabled button', () => {
			renderComponent({disabled: true});
			expect(screen.getByRole('button')).toBeDisabled();
		});

		it('is accessible', async () => {
			const {container} = renderComponent({disabled: true});

			expect(await axe(container)).toHaveNoViolations();
		});
	});
});
