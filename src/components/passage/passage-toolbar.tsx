import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {usePopper} from 'react-popper';
import {ButtonBar} from '../container/button-bar';
import {ButtonCard} from '../container/button-card';
import {IconButton} from '../control/icon-button';
import {Passage} from '../../store/stories';
import {boundingRect, Rect} from '../../util/geometry';
import './passage-toolbar.css';

export interface PassageToolbarProps {
	onDelete: () => void;
	onEdit: () => void;
	onTest: () => void;
	targets: Passage[];
}

export const PassageToolbar: React.FC<PassageToolbarProps> = React.memo(
	props => {
		const {onDelete, onEdit, onTest, targets} = props;
		const [forceInvisible, setForceInvisible] = React.useState(false);
		const [
			referenceElement,
			setReferenceElement
		] = React.useState<HTMLDivElement | null>(null);
		const [
			popperElement,
			setPopperElement
		] = React.useState<HTMLDivElement | null>(null);
		const {styles, attributes} = usePopper(
			referenceElement,
			popperElement,
			{
				modifiers: [
					{
						name: 'flip'
					}
				]
			}
		);
		const {t} = useTranslation();

		// Force the popper to reposition as needed. We need to wait until any
		// passage drag is complete.

		React.useEffect(() => {
			setForceInvisible(true);

			const resetter = () => {
				if (document.body.classList.contains('dragging-passages')) {
					window.setTimeout(resetter, 25);
					return;
				}

				setForceInvisible(false);
			};

			Promise.resolve().then(resetter);
		}, [targets]);

		let targetRect: Rect;

		if (forceInvisible || targets.length === 0) {
			return null;
		}

		if (targets.length === 1) {
			targetRect = {
				height: targets[0].height,
				top: targets[0].top,
				left: targets[0].left,
				width: targets[0].width
			};
		} else {
			targetRect = boundingRect(targets);
		}

		return (
			<>
				<div
					aria-hidden
					className="passage-toolbar-target"
					ref={setReferenceElement}
					style={{...targetRect, ...styles}}
				></div>
				<div
					className="passage-toolbar"
					ref={setPopperElement}
					style={styles.popper}
					{...attributes.popper}
				>
					<ButtonCard>
						<ButtonBar orientation="horizontal">
							<IconButton
								icon="edit"
								label={t('common.edit')}
								onClick={onEdit}
							/>
							<IconButton
								icon="tool"
								label={t('common.test')}
								onClick={onTest}
							/>
						</ButtonBar>
					</ButtonCard>
				</div>
			</>
		);
	}
);
