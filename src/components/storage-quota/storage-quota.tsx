import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {isElectronRenderer} from '../../util/is-electron';
import {
	localStorageFreeSpace,
	localStorageUsedSpace
} from '../../util/local-storage-quota';
import {IconLoading} from '../image/icon';
import './storage-quota.css';

export interface StorageQuotaProps {
	watch: any;
}

export const StorageQuota: React.FC<StorageQuotaProps> = props => {
	const {watch} = props;
	const [lastWatch, setLastWatch] = React.useState<any>();
	const [working, setWorking] = React.useState(false);

	// This is set to -1 so that we can hide the percentage while doing the
	// initial calculation. Later ones will show the same percentage but with a
	// loading icon beside it until finishes.

	const [freeSpace, setFreeSpace] = React.useState(-1);
	const [usedSpace, setUsedSpace] = React.useState(0);
	const {t} = useTranslation();

	const hide = isElectronRenderer();

	// When the watch prop changes, start calculating space.

	React.useEffect(() => {
		async function run() {
			setWorking(true);
			setUsedSpace(localStorageUsedSpace());
			setFreeSpace(await localStorageFreeSpace());
			setLastWatch(watch);
			setWorking(false);
		}

		if (!hide && !working && lastWatch !== watch) {
			run();
		}
	}, [hide, lastWatch, watch, working]);

	if (hide) {
		return null;
	}

	return (
		<span className="storage-quota">
			{working && <IconLoading />}
			{freeSpace !== -1 &&
				t('components.storageQuota.freeSpace', {
					percent: Math.round((freeSpace / (freeSpace + usedSpace)) * 100)
				})}
		</span>
	);
};
