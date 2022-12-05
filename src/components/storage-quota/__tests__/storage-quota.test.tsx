import {cleanup, render, screen, waitFor} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {isElectronRenderer} from '../../../util/is-electron';
import {StorageQuota, StorageQuotaProps} from '../storage-quota';

jest.mock('../../../util/is-electron');

describe('<StorageQuota>', () => {
	const isElectronRendererMock = isElectronRenderer as jest.Mock;

	beforeEach(() => {
		(window.navigator as any).storage = {
			estimate: jest.fn(() => ({
				quota: 100,
				usage: 0
			}))
		};
	});

	afterAll(() => {
		delete (window.navigator as any).storage;
	});

	function renderComponent(props?: Partial<StorageQuotaProps>) {
		return render(<StorageQuota watch="" {...props} />);
	}

	it('does not display if in an Electron context', () => {
		isElectronRendererMock.mockReturnValue(true);
		renderComponent();
		expect(document.body.textContent).toBe('');
	});

	it('does not display if navigator.storage or navigator.storage.estimate is not available', async () => {
		delete (window.navigator as any).storage.estimate;
		renderComponent();
		expect(document.body.textContent).toBe('');
		delete (window.navigator as any).storage;
		cleanup();
		renderComponent();
		expect(document.body.textContent).toBe('');
	});

	it('displays the amount of free space available', async () => {
		renderComponent();
		await waitFor(() =>
			expect(
				screen.getByText('components.storageQuota.freeSpace')
			).toBeInTheDocument()
		);
	});

	// Can't see the change because our translate prop only shows the string, not
	// params.
	it.todo('updates if the watch prop changes');

	it('is accessible', async () => {
		const {container} = renderComponent();

		await waitFor(() =>
			expect(
				screen.getByText('components.storageQuota.freeSpace')
			).toBeInTheDocument()
		);
		expect(await axe(container)).toHaveNoViolations();
	});
});
