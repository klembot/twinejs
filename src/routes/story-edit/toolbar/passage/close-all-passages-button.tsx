import {IconX} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconButton} from '../../../../components/control/icon-button';
import {
	PassageEditStack,
	removePassageEditors,
	useDialogsContext
} from '../../../../dialogs';

export const CloseAllPassagesButton: React.FC = () => {
	const {dialogs, dispatch} = useDialogsContext();
	const {t} = useTranslation();

	const passageStack = React.useMemo(
		() => dialogs.find(({component}) => component === PassageEditStack),
		[dialogs]
	);

	const passageIds = React.useMemo(
		() => passageStack?.props?.passageIds ?? [],
		[passageStack]
	);

	function handleClick() {
		if (passageIds.length > 0) {
			dispatch(removePassageEditors(passageIds));
		}
	}

	return (
		<IconButton
			disabled={passageIds.length === 0}
			icon={<IconX />}
			label={t('dialogs.passageEdit.closeAll')}
			onClick={handleClick}
		/>
	);
};
