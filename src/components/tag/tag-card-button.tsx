import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {CardButton} from '../control/card-button';
import {IconPlus, IconTag} from '@tabler/icons';
import {CardContent} from '../container/card';
import {AutocompleteTextInput} from '../control/autocomplete-text-input';
import {IconButton} from '../control/icon-button';
import {Color} from '../../util/color';
import {TagButton} from './tag-button';
import {isValidTagName} from '../../util/tag';
import './tag-card-button.css';

export interface TagCardButtonProps {
	disabled?: boolean;
	allTags: string[];
	id: string;
	onAdd: (value: string) => void;
	onChangeColor: (value: string, color: Color) => void;
	onRemove: (value: string) => void;
	tagColors: Record<string, Color>;
	tags: string[];
}

export const TagCardButton: React.FC<TagCardButtonProps> = props => {
	const {allTags, disabled, id, onAdd, onChangeColor, onRemove, tagColors, tags} =
		props;
	const [newTagName, setNewTagName] = React.useState('');
	const [open, setOpen] = React.useState(false);
	const isSelectingRef = React.useRef(false);
	const {t} = useTranslation();
	const tagCompletions = React.useMemo(
		() => allTags.filter(tag => !tags.includes(tag)),
		[allTags, tags]
	);
	const label =
		tags.length === 0
			? t('common.tags')
			: t('components.tagCardButton.tagsWithCount_plural', {
					count: tags.length
			  });
	let validationMessage: string | undefined = undefined;
	let canAdd = isValidTagName(newTagName);

	if (!canAdd && newTagName !== '') {
		validationMessage = t('components.tagCardButton.invalidName');
	}

	if (canAdd) {
		canAdd = !tags.includes(newTagName);

		if (!canAdd) {
			validationMessage = t('components.tagCardButton.alreadyAdded');
		}
	}

	function handleNewTagNameChange(event: React.ChangeEvent<HTMLInputElement>) {
		if (isSelectingRef.current) {
			isSelectingRef.current = false;
			return;
		}
		setNewTagName(event.target.value.replaceAll(' ', '-'));
	}

	function handleSelect(value: string) {
		const normalizedValue = value.replaceAll(' ', '-');
		const isValid = isValidTagName(normalizedValue);
		const canAddTag = isValid && !tags.includes(normalizedValue);

		if (canAddTag && normalizedValue.trim() !== '') {
			isSelectingRef.current = true;
			onAdd(normalizedValue);
			setNewTagName('');
		}
	}

	function handleSubmit(event: React.FormEvent) {
		event.preventDefault();

		if (canAdd && newTagName.trim() !== '') {
			onAdd(newTagName);
			setNewTagName('');
		}
	}

	function handleChangeOpen(value: boolean) {
		setOpen(value);

		if (!value) {
			setNewTagName('');
		}
	}

	return (
		<span className="tag-card-button">
			<CardButton
				ariaLabel={t('common.tags')}
				disabled={disabled}
				onChangeOpen={handleChangeOpen}
				open={open}
				icon={<IconTag />}
				label={label}
			>
				<CardContent>
					<form onSubmit={handleSubmit}>
						<AutocompleteTextInput
							completions={tagCompletions}
							id={id}
							onChange={handleNewTagNameChange}
							onSelect={handleSelect}
							value={newTagName}
						>
							{t('components.tagCardButton.tagNameLabel')}
						</AutocompleteTextInput>
						<IconButton
							buttonType="submit"
							disabled={!canAdd}
							icon={<IconPlus />}
							label={t('common.add')}
							variant="create"
						/>
						{validationMessage && <p>{validationMessage}</p>}
					</form>
					<div className="tags">
						{tags.map(tag => (
							<TagButton
								key={tag}
								name={tag}
								color={tagColors[tag]}
								onChangeColor={color => onChangeColor(tag, color)}
								onRemove={() => onRemove(tag)}
							/>
						))}
					</div>
				</CardContent>
			</CardButton>
		</span>
	);
};
