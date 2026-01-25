import {IconX} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconButton} from '../../../../components/control/icon-button';
import {
	PassageEditStack,
	removePassageEditors,
	useDialogsContext
} from '../../../../dialogs';

export interface CloseAllPassagesButtonProps {
	onClose?: () => void;
}

export const CloseAllPassagesButton: React.FC<CloseAllPassagesButtonProps> = ({onClose}) => {
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
		console.log('Closing all passages:', passageIds);
		if (passageIds.length > 0) {
			dispatch(removePassageEditors(passageIds));
		}
		onClose?.();
	}

	function handlePointerDown(e: React.PointerEvent) {
  // only left click
  if (e.button !== 0) return;

  e.preventDefault();
  e.stopPropagation();
  handleClick(); // your existing function
}

return (
  <div
    onPointerDown={handlePointerDown}
    onMouseDown={(e) => e.stopPropagation()} // belt + braces
    style={{ display: "inline-flex" }}
  >
    <IconButton
      disabled={passageIds.length === 0}
      icon={<IconX />}
      label={t("dialogs.passageEdit.closeAll")}
      onClick={handleClick} // keep it for toolbar usage
    />
  </div>
);
};
