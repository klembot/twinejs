import * as React from 'react';
import {useTranslation} from 'react-i18next';
import classNames from 'classnames';
import {IconWriting, IconTrash} from '@tabler/icons';
import {colors, Color} from '../../util/color';
import {PromptButton, PromptValidationResponse} from '../control/prompt-button';
import {TextSelect} from '../control/text-select';
import {ConfirmPopover} from '../control/confirm-popover';
import './tag-editor.css';

export interface TagEditorProps {
	allTags: string[];
	color?: Color;
	name: string;
	onChangeColor: (color: Color) => void;
	onChangeName: (name: string) => void;
	onDelete?: () => void;
	deleteMessageKey?: string;
}

export const TagEditor: React.FC<TagEditorProps> = props => {
	const {allTags, color, name, onChangeColor, onChangeName} = props;
	const [newName, setNewName] = React.useState(name);
	const [showConfirm, setShowConfirm] = React.useState(false);
	const {t} = useTranslation();

	function validate(value: string): PromptValidationResponse {
		if (value !== name && allTags.includes(value)) {
			return {message: t('components.tagEditor.alreadyExists'), valid: false};
		}

		return {valid: true};
	}

	return (
		<div className="tag-editor">
			<span className={classNames('tag-name', `color-${props.color}`)}>
				{props.name}
			</span>
			<PromptButton
				icon={<IconWriting />}
				label={t('common.rename')}
				onChange={e => setNewName(e.target.value.replace(/\s/g, '-'))}
				onSubmit={() => onChangeName(newName)}
				prompt={t('common.renamePrompt', {name})}
				value={newName}
				validate={validate}
			/>
			<TextSelect
				onChange={e => onChangeColor(e.target.value)}
				options={colors.map(color => ({
					label: t(`colors.${color}`),
					value: color
				}))}
				value={color ?? ''}
			>
				{t('common.color')}
			</TextSelect>
			{props.onDelete && (
				<ConfirmPopover
					open={showConfirm}
					onChangeOpen={setShowConfirm}
					message={t(
						props.deleteMessageKey || 'components.tagEditor.deleteTag',
						{name}
					)}
					confirmLabel={t('common.delete')}
					cancelLabel={t('common.cancel')}
					confirmIcon={<IconTrash />}
					onConfirm={() => props.onDelete!()}
				/>
			)}
		</div>
	);
};
