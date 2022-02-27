import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {colors, Color} from '../../util/color';
import {IconPlus, IconX} from '@tabler/icons';
import {ButtonBar} from '../container/button-bar';
import {CardContent} from '../container/card';
import {CardButton} from '../control/card-button';
import {IconButton} from '../control/icon-button';
import {TextInput} from '../control/text-input';
import {TextSelect} from '../control/text-select';
import {isValidTagName} from '../../util/tag';
import './add-tag-button.css';

export interface AddTagButtonProps {
	/**
	 * Tags that have been assigned to this object.
	 */
	assignedTags: string[];
	/**
	 * Is the button disabled?
	 */
	disabled?: boolean;
	/**
	 * Other tags that have been assigned to this type of object.
	 */
	existingTags: string[];
	/**
	 * Icon for the button.
	 */
	icon?: React.ReactNode;
	/**
	 * Label for the button.
	 */
	label?: string;
	/**
	 * Called when the user chooses to add a tag. If they are adding a
	 * pre-existing tag, it will only send a name.
	 */
	onAdd: (name: string, color?: Color) => void;
}

export const AddTagButton: React.FC<AddTagButtonProps> = props => {
	const {assignedTags, disabled, existingTags, icon, label, onAdd} = props;
	const [creatingTag, setCreatingTag] = React.useState(true);
	const [newColor, setNewColor] = React.useState<Color>('none');
	const [newName, setNewName] = React.useState('');
	const [open, setOpen] = React.useState(false);
	const {t} = useTranslation();

	let validationMessage: string | undefined = undefined;
	let canAdd = isValidTagName(newName);

	if (!canAdd && newName !== '') {
		validationMessage = t('components.addTagButton.invalidName');
	}

	if (canAdd && creatingTag) {
		canAdd = !existingTags.includes(newName);

		if (!canAdd) {
			validationMessage = t('components.addTagButton.alreadyAdded');
		}
	}

	function handleAdd() {
		if (creatingTag) {
			onAdd(newName, newColor);
		} else {
			onAdd(newName);
		}

		setOpen(false);
	}

	function handleSelectChange(event: React.ChangeEvent<HTMLSelectElement>) {
		const tagName = event.target.value;

		setNewName(tagName);
		setCreatingTag(tagName === '');
	}

	return (
		<span className="add-tag-button">
			<CardButton
				ariaLabel={t('components.addTagButton.addLabel')}
				disabled={disabled}
				icon={icon ?? <IconPlus />}
				label={label ?? t('common.tag')}
				onChangeOpen={setOpen}
				open={open}
			>
				<CardContent>
					<TextSelect
						onChange={handleSelectChange}
						options={[
							{label: t('components.addTagButton.newTag'), value: ''},
							...existingTags.map(tag => ({
								disabled: assignedTags.includes(tag),
								label: tag,
								value: tag
							}))
						]}
						value={creatingTag ? '' : newName}
					>
						{t('components.addTagButton.addLabel')}
					</TextSelect>
					{creatingTag && (
						<>
							<TextInput
								onChange={e => setNewName(e.target.value.replace(/\s/g, '-'))}
								value={newName}
							>
								{t('components.addTagButton.tagNameLabel')}
							</TextInput>
							<TextSelect
								onChange={e => setNewColor(e.target.value)}
								options={colors.map(color => ({
									label: t(`colors.${color}`),
									value: color
								}))}
								value={newColor}
							>
								{t('components.addTagButton.tagColorLabel')}
							</TextSelect>
						</>
					)}
					{creatingTag && !!validationMessage && <p>{validationMessage}</p>}
				</CardContent>
				<ButtonBar>
					<IconButton
						disabled={!canAdd}
						icon={<IconPlus />}
						label={t('common.add')}
						onClick={handleAdd}
						variant="create"
					/>
					<IconButton
						icon={<IconX />}
						label={t('common.cancel')}
						onClick={() => setOpen(false)}
					/>
				</ButtonBar>
			</CardButton>
		</span>
	);
};
