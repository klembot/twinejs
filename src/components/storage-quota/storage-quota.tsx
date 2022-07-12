import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {isElectronRenderer} from '../../util/is-electron';
import './storage-quota.css';

export interface StorageQuotaProps {
	watch: any;
}

export const StorageQuota: React.FC<StorageQuotaProps> = props => {
	const {watch} = props;
	const [lastWatch, setLastWatch] = React.useState<any>();
	const [working, setWorking] = React.useState(false);
	const [percentFree, setPercentFree] = React.useState<string>();

	// This is set to -1 so that we can hide the percentage while doing the
	// initial calculation. Later ones will show the same percentage but with a
	// loading icon beside it until finishes.

	const {t} = useTranslation();

	const hide = isElectronRenderer() || !navigator.storage?.estimate;

	// When the watch prop changes, start calculating space.

	React.useEffect(() => {
		async function run() {
			setWorking(true);

			const {quota, usage} = await navigator.storage.estimate();

			if (quota !== undefined && usage !== undefined) {
				setPercentFree(((1 - usage / quota) * 100).toFixed(0));
			}

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
			{percentFree &&
				t('components.storageQuota.freeSpace', {
					percent: percentFree
				})}
		</span>
	);
};
