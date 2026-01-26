import * as React from 'react';
import {
	PassageEditStack,
	removePassageEditors,
	useDialogsContext
} from '../../dialogs';

export function useCloseAllPassages() {
	const {dialogs, dispatch} = useDialogsContext();

	const passageStack = React.useMemo(
		() => dialogs.find(({component}) => component === PassageEditStack),
		[dialogs]
	);

	const passageIds = React.useMemo(
		() => passageStack?.props?.passageIds ?? [],
		[passageStack]
	);

	const handleCloseAllPassages = React.useCallback(() => {
		if (passageIds.length > 0) {
			dispatch(removePassageEditors(passageIds));
		}
	}, [dispatch, passageIds]);

	return {
		handleCloseAllPassages,
		passageIds,
		canClose: passageIds.length > 0
	};
}
