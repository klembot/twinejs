import * as React from 'react';
import {
	PassageEditStack,
	removePassageEditors,
	useDialogsContext
} from '../../dialogs';
import {
	closeAllRelativeEditors,
	useRelativePassageEditorsContext
} from '../../store/relative-passage-editors';

export function useCloseAllPassages() {
	const {dialogs, dispatch: dialogsDispatch} = useDialogsContext();
	const {dispatch: relativeEditorsDispatch, state: relativeEditorsState} =
		useRelativePassageEditorsContext();

	const passageStack = React.useMemo(
		() => dialogs.find(({component}) => component === PassageEditStack),
		[dialogs]
	);

	const passageIds = React.useMemo(
		() => passageStack?.props?.passageIds ?? [],
		[passageStack]
	);

	const relativeEditorsCount = relativeEditorsState.editors.length;

	const handleCloseAllPassages = React.useCallback(() => {
		if (passageIds.length > 0) {
			dialogsDispatch(removePassageEditors(passageIds));
		}

		if (relativeEditorsCount > 0) {
			relativeEditorsDispatch(closeAllRelativeEditors());
		}
	}, [dialogsDispatch, relativeEditorsDispatch, passageIds, relativeEditorsCount]);

	return {
		handleCloseAllPassages,
		passageIds,
		canClose: passageIds.length > 0 || relativeEditorsCount > 0
	};
}
