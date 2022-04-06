import {act, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {isElectronRenderer} from '../../../util/is-electron';
import {StorageQuota, StorageQuotaProps} from '../storage-quota';
import {
	localStorageFreeSpace,
	localStorageUsedSpace
} from '../../../util/local-storage-quota';

jest.mock('../../../util/is-electron');
jest.mock('../../../util/local-storage-quota');

describe('<StorageQuota>', () => {
	const isElectronRendererMock = isElectronRenderer as jest.Mock;
	const localStorageFreeSpaceMock = localStorageFreeSpace as jest.Mock;
	const localStorageUsedSpaceMock = localStorageUsedSpace as jest.Mock;

	function renderComponent(props?: Partial<StorageQuotaProps>) {
		return render(<StorageQuota watch="" {...props} />);
	}

	it('does not display if in an Electron context', () => {
		isElectronRendererMock.mockReturnValue(true);
		renderComponent();
		expect(document.body.textContent).toBe('');
	});

	it('displays the amount of free space available', async () => {
		renderComponent();
		await act(() => Promise.resolve());
		expect(
			screen.getByText('components.storageQuota.freeSpace')
		).toBeInTheDocument();
		expect(localStorageFreeSpaceMock).toBeCalledTimes(1);
		expect(localStorageUsedSpaceMock).toBeCalledTimes(1);
	});

	// Can't see the change because our translate prop only shows the string, not
	// params.
	it.todo('updates if the watch prop changes');

	it('is accessible', async () => {
		const {container} = renderComponent();

		await act(() => Promise.resolve());
		expect(await axe(container)).toHaveNoViolations();
	});
});
