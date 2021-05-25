import * as React from 'react';
import classNames from 'classnames';
import {useTranslation} from 'react-i18next';
import {usePopper} from 'react-popper';
import {IconEdit, IconTool, IconTrash} from '@tabler/icons';
import {ButtonBar} from '../container/button-bar';
import {ButtonCard} from '../container/button-card';
import {IconButton} from '../control/icon-button';
import {Passage} from '../../store/stories';
import {boundingRect, rectCenter, Rect} from '../../util/geometry';
import './passage-toolbar.css';

export interface PassageToolbarProps {
	onDelete: () => void;
	onEdit: () => void;
	onTest: () => void;
	targets: Passage[];
	zoom: number;
}

export const PassageToolbar: React.FC<PassageToolbarProps> = React.memo(
	props => {
		const {onDelete, onEdit, onTest, targets, zoom} = props;
		const [forceInvisible, setForceInvisible] = React.useState(false);
		const [
			referenceElement,
			setReferenceElement
		] = React.useState<HTMLDivElement | null>(null);
		const [
			popperElement,
			setPopperElement
		] = React.useState<HTMLDivElement | null>(null);
		const {styles, attributes} = usePopper(referenceElement, popperElement, {
			modifiers: [
				{
					name: 'flip'
				},
				{
					name: 'offset',
					options: {offset: [0, targets.length > 1 ? 0 : 10]}
				}
			]
		});
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

		if (forceInvisible || targets.length === 0) {
			return null;
		}

		let targetRect: Rect = {height: 0, left: 0, top: 0, width: 0};

		if (targets.length === 1) {
			targetRect = {
				height: targets[0].height * zoom,
				left: targets[0].left * zoom,
				top: targets[0].top * zoom,
				width: targets[0].width * zoom
			};
		} else if (targets.length > 1) {
			// Position so that it's at the center of the selection.

			const center = rectCenter(boundingRect(targets));

			targetRect = {
				height: 1,
				left: center.left * zoom,
				top: center.top * zoom,
				width: 1
			};
		}

		const className = classNames('passage-toolbar', {
			multiple: targets.length > 1
		});

		return (
			<>
				<div
					aria-hidden
					className="passage-toolbar-target"
					ref={setReferenceElement}
					style={{...targetRect, ...styles}}
				></div>
				<div
					className={className}
					ref={setPopperElement}
					style={styles.popper}
					{...attributes.popper}
				>
					<ButtonCard floating>
						<ButtonBar>
							<IconButton
								icon={<IconTrash />}
								label={
									targets.length > 1
										? t('common.deleteCount', {count: targets.length})
										: t('common.delete')
								}
								onClick={onDelete}
								variant="danger"
							/>
							<IconButton
								icon={<IconEdit />}
								label={
									targets.length > 1
										? t('common.editCount', {count: targets.length})
										: t('common.edit')
								}
								onClick={onEdit}
							/>
							<IconButton
								disabled={targets.length > 1}
								icon={<IconTool />}
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
