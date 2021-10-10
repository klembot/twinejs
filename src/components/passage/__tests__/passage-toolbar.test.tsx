import * as React from 'react';
import {
	act,
	fireEvent,
	render,
	RenderResult,
	screen,
	waitFor
} from '@testing-library/react';
import {PassageToolbar, PassageToolbarProps} from '../passage-toolbar';
import {axe} from 'jest-axe';
import {fakePassage} from '../../../test-util';

describe('<PassageToolbar>', () => {
	async function renderComponent(props?: Partial<PassageToolbarProps>) {
		let result: RenderResult;

		await act(async () => {
			jest.useFakeTimers();
			result = render(
				<PassageToolbar
					onDelete={jest.fn()}
					onEdit={jest.fn()}
					onTest={jest.fn()}
					targets={[fakePassage()]}
					zoom={1}
					{...props}
				/>
			);
			jest.runAllTimers();
			jest.useRealTimers();
		});

		return result!;
	}

	it('renders nothing if there are no targets', async () => {
		await renderComponent({targets: []});
		expect(document.body.textContent).toBe('');
	});

	it('calls the onDelete prop when the delete button is clicked', async () => {
		const onDelete = jest.fn();

		await renderComponent({onDelete});
		expect(onDelete).not.toHaveBeenCalled();
		fireEvent.click(screen.getByText('common.delete'));
		expect(onDelete).toHaveBeenCalledTimes(1);
	});

	it('calls the onEdit prop when the edit button is clicked', async () => {
		const onEdit = jest.fn();

		await renderComponent({onEdit});
		expect(onEdit).not.toHaveBeenCalled();
		fireEvent.click(screen.getByText('common.edit'));
		expect(onEdit).toHaveBeenCalledTimes(1);
	});

	it('calls the onTest prop when the test button is clicked', async () => {
		const onTest = jest.fn();

		await renderComponent({onTest});
		expect(onTest).not.toHaveBeenCalled();
		fireEvent.click(screen.getByText('common.test'));
		expect(onTest).toHaveBeenCalledTimes(1);
	});

	describe('when there is more than one target', () => {
		beforeEach(
			async () =>
				await renderComponent({targets: [fakePassage(), fakePassage()]})
		);

		it('displays plural labels in buttons', () => {
			expect(screen.getByText('common.deleteCount')).toBeInTheDocument();
			expect(screen.getByText('common.editCount')).toBeInTheDocument();
		});

		it('disables the test button', () =>
			expect(screen.getByText('common.test')).toBeDisabled());
	});

	it.todo('repositions itself when targets change');

	it('repositions itself when the zoom prop changes', async () => {
		const targets = [fakePassage()];
		const {rerender} = await renderComponent({targets, zoom: 1});

		await act(async () => {
			rerender(
				<PassageToolbar
					onDelete={jest.fn()}
					onEdit={jest.fn()}
					onTest={jest.fn()}
					targets={targets}
					zoom={2}
				/>
			);
			await waitFor(() =>
				expect(screen.queryAllByRole('button').length).toBe(0)
			);
			await waitFor(() =>
				expect(screen.queryAllByRole('button').length).toBeGreaterThan(0)
			);
		});
	});

	it('is accessible', async () => {
		const {container} = await renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
