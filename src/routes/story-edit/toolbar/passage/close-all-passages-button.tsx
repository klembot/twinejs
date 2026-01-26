import {IconX} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconButton} from '../../../../components/control/icon-button';
import {useCloseAllPassages} from '../../use-close-all-passages';

export interface CloseAllPassagesButtonProps {
	onClose?: () => void;
}

export const CloseAllPassagesButton: React.FC<CloseAllPassagesButtonProps> = ({onClose}) => {
	const {handleCloseAllPassages, canClose} = useCloseAllPassages();
	const {t} = useTranslation();

	function handleClick() {
		handleCloseAllPassages();
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
      disabled={!canClose}
      icon={<IconX />}
      label={t("dialogs.passageEdit.closeAll")}
      onClick={handleClick} // keep it for toolbar usage
    />
  </div>
);
};
