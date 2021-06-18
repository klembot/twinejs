import * as React from 'react';
import {useTranslation} from 'react-i18next';
import classNames from 'classnames';
import {IconWriting} from '@tabler/icons';
import {colors, Color} from '../../util/color';
import {PromptButton} from '../control/prompt-button';
import {TextSelect} from '../control/text-select';
import './tag-editor.css';

export interface TagEditorProps {
	color?: Color;
	name: string;
	onChangeColor: (color: Color) => void;
	onChangeName: (name: string) => void;
}

export const TagEditor: React.FC<TagEditorProps> = props => {
	const {color, name, onChangeColor, onChangeName} = props;
	const [newName, setNewName] = React.useState(name);
	const {t} = useTranslation();

	return (
		<div className="tag-editor">
			<span className={classNames('tag-name', `color-${props.color}`)}>
				{props.name}
			</span>
			<PromptButton
				icon={<IconWriting />}
				label={t('common.rename')}
				onChange={e => setNewName(e.target.value)}
				onSubmit={() => onChangeName(newName)}
				prompt={t('common.renamePrompt', {name})}
				value={newName}
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
		</div>
	);
};
